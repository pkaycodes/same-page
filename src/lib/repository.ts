import { randomUUID } from "node:crypto";
import { query, withTransaction } from "./db";
import { ageFromBirthYear, matchProfileFromBundle, scoreProfiles } from "./matching";
import type {
  ConversationSummary,
  Intention,
  MatchProfile,
  MatchResult,
  MessageRow,
  PrivacySettings,
  ProfileBundle,
  PublicProfile,
  RequestSummary,
  SessionUser,
  UserRow,
} from "./types";

type RequestRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  note: string;
  status: RequestSummary["status"];
  created_at: string;
  responded_at: string | null;
};

function nowIso() {
  return new Date().toISOString();
}

function defaultPrivacy(): PrivacySettings {
  return {
    allow_requests: "compatible_only",
    show_age: 1,
    show_location: 1,
    show_intentions: 1,
    ai_text_matching: 0,
    updated_at: nowIso(),
  };
}

export async function getUserById(id: string) {
  const result = await query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
}

export async function getUserByPhone(phone: string) {
  const result = await query<UserRow>("SELECT * FROM users WHERE phone = $1", [phone]);
  return result.rows[0];
}

export async function findOrCreateUserByPhone(phone: string) {
  const existing = await getUserByPhone(phone);
  if (existing) return existing;

  const id = `usr_${randomUUID()}`;
  const timestamp = nowIso();
  await query(
    `INSERT INTO users (
      id, phone, phone_verified_at, onboarding_complete, account_state,
      age_min, age_max, created_at, updated_at
    ) VALUES ($1, $2, $3, 0, 'active', 25, 40, $4, $5)`,
    [id, phone, timestamp, timestamp, timestamp],
  );

  return (await getUserById(id))!;
}

export function toSessionUser(user: UserRow): SessionUser {
  return {
    id: user.id,
    phone: user.phone,
    alias: user.alias,
    onboardingComplete: user.onboarding_complete === 1,
    isDemo: user.is_demo === 1,
    gender: user.gender,
    seekingGender: user.seeking_gender,
    accountState: user.account_state,
    isPaused: user.is_paused === 1,
  };
}

export async function getProfileBundle(userId: string): Promise<ProfileBundle | null> {
  const [userResult, intentionsResult, interestsResult, circumstancesResult, boundariesResult, privacyResult] =
    await Promise.all([
      query<UserRow>("SELECT * FROM users WHERE id = $1", [userId]),
      query<Intention>(
        "SELECT code, is_primary, rank FROM user_intentions WHERE user_id = $1 ORDER BY rank, code",
        [userId],
      ),
      query<{ code: string }>(
        "SELECT code FROM user_interests WHERE user_id = $1 ORDER BY code",
        [userId],
      ),
      query<{ code: string }>(
        "SELECT code FROM user_circumstances WHERE user_id = $1 ORDER BY code",
        [userId],
      ),
      query<{ code: string }>(
        "SELECT code FROM user_boundaries WHERE user_id = $1 ORDER BY code",
        [userId],
      ),
      query<PrivacySettings>("SELECT * FROM privacy_settings WHERE user_id = $1", [userId]),
    ]);

  const user = userResult.rows[0];
  if (!user) return null;

  return {
    user,
    intentions: intentionsResult.rows,
    interests: interestsResult.rows.map((row) => row.code),
    circumstances: circumstancesResult.rows.map((row) => row.code),
    boundaries: boundariesResult.rows.map((row) => row.code),
    privacy: privacyResult.rows[0] ?? defaultPrivacy(),
  };
}

export async function getMatchProfile(userId: string): Promise<MatchProfile | null> {
  const bundle = await getProfileBundle(userId);
  if (!bundle) return null;
  return matchProfileFromBundle(bundle);
}

async function blockedIds(userId: string) {
  const result = await query<{ id: string }>(
    `SELECT blocked_id AS id FROM blocks WHERE blocker_id = $1
     UNION
     SELECT blocker_id AS id FROM blocks WHERE blocked_id = $1`,
    [userId],
  );
  return new Set(result.rows.map((row) => row.id));
}

export async function getDiscovery(userId: string): Promise<PublicProfile[]> {
  const account = await getUserById(userId);
  if (!account || account.is_paused === 1 || account.account_state !== "active") return [];

  const viewer = await getMatchProfile(userId);
  if (!viewer) return [];

  const blocked = await blockedIds(userId);
  const candidatesResult = await query<UserRow>(
    `SELECT * FROM users
     WHERE id <> $1
       AND account_state = 'active'
       AND onboarding_complete = 1
       AND is_paused = 0
       AND gender = $2
       AND seeking_gender = $3`,
    [userId, viewer.seekingGender, viewer.gender],
  );

  const profiles: PublicProfile[] = [];
  for (const candidate of candidatesResult.rows) {
    if (blocked.has(candidate.id)) continue;
    const bundle = await getProfileBundle(candidate.id);
    if (!bundle) continue;
    const candidateProfile = matchProfileFromBundle(bundle);
    if (!candidateProfile) continue;
    const match = scoreProfiles(viewer, candidateProfile);
    if (!match) continue;

    profiles.push({
      user: candidate,
      age: bundle.privacy.show_age === 1 ? (ageFromBirthYear(candidate.birth_year) ?? 0) : 0,
      city: bundle.privacy.show_location === 1 ? candidate.city : null,
      intentions: bundle.privacy.show_intentions
        ? bundle.intentions.map((item) => item.code)
        : [],
      interests: bundle.interests,
      match,
    });
  }

  return profiles.sort((a, b) => {
    if (b.match.score !== a.match.score) return b.match.score - a.match.score;
    return (b.user.last_active_at ?? "").localeCompare(a.user.last_active_at ?? "");
  });
}

export async function getProfileForViewer(viewerId: string, targetId: string) {
  const [viewer, bundle] = await Promise.all([
    getMatchProfile(viewerId),
    getProfileBundle(targetId),
  ]);
  if (!viewer || !bundle) return null;
  const candidate = matchProfileFromBundle(bundle);
  if (!candidate) return null;
  const match = scoreProfiles(viewer, candidate);
  if (!match) return null;

  return {
    bundle,
    profile: {
      user: bundle.user,
      age: bundle.privacy.show_age === 1 ? (ageFromBirthYear(bundle.user.birth_year) ?? 0) : 0,
      city: bundle.privacy.show_location === 1 ? bundle.user.city : null,
      intentions: bundle.privacy.show_intentions
        ? bundle.intentions.map((item) => item.code)
        : [],
      interests: bundle.interests,
      match,
    } satisfies PublicProfile,
  };
}

export async function getMatchBetween(
  viewerId: string,
  targetId: string,
): Promise<MatchResult | null> {
  const [viewer, target] = await Promise.all([
    getMatchProfile(viewerId),
    getMatchProfile(targetId),
  ]);
  if (!viewer || !target) return null;
  return scoreProfiles(viewer, target);
}

export async function checkAlias(alias: string, excludeUserId?: string) {
  const result = await query<{ id: string }>(
    "SELECT id FROM users WHERE lower(alias) = lower($1) AND id <> $2",
    [alias, excludeUserId ?? ""],
  );
  return result.rows.length === 0;
}

export async function saveOnboarding(input: {
  userId: string;
  alias: string;
  birthYear: number;
  gender: "woman" | "man";
  city: string;
  region: string;
  bio: string;
  relationshipStatus: string;
  childrenStatus: string;
  wantsChildren: string;
  partnerKnowledge: string;
  exclusivity: string;
  communicationStyle: string;
  meetingFrequency: string;
  emotionalCloseness: string;
  timeline: string;
  openness: string;
  publicVisibility: string;
  faith: string;
  occupation: string;
  smoking: string;
  drinking: string;
  willingToTravel: boolean;
  ageMin: number;
  ageMax: number;
  intentions: { code: string; isPrimary: boolean; rank: number }[];
  interests: string[];
  circumstances: string[];
  boundaries: string[];
  showAge: boolean;
  showLocation: boolean;
  showIntentions: boolean;
  aiTextMatching: boolean;
}) {
  const seekingGender = input.gender === "woman" ? "man" : "woman";
  const timestamp = nowIso();

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE users SET
        alias = $1, birth_year = $2, gender = $3, seeking_gender = $4,
        city = $5, region = $6, bio = $7, relationship_status = $8, children_status = $9,
        wants_children = $10, partner_knowledge = $11, exclusivity = $12,
        communication_style = $13, meeting_frequency = $14, emotional_closeness = $15,
        timeline = $16, openness = $17, public_visibility = $18, faith = $19, occupation = $20,
        smoking = $21, drinking = $22, willing_to_travel = $23, age_min = $24, age_max = $25,
        onboarding_complete = 1, is_paused = 0, account_state = 'active',
        last_active_at = $26, updated_at = $27
      WHERE id = $28`,
      [
        input.alias,
        input.birthYear,
        input.gender,
        seekingGender,
        input.city,
        input.region,
        input.bio,
        input.relationshipStatus,
        input.childrenStatus,
        input.wantsChildren,
        input.partnerKnowledge,
        input.exclusivity,
        input.communicationStyle,
        input.meetingFrequency,
        input.emotionalCloseness,
        input.timeline,
        input.openness,
        input.publicVisibility,
        input.faith,
        input.occupation,
        input.smoking,
        input.drinking,
        input.willingToTravel ? 1 : 0,
        input.ageMin,
        input.ageMax,
        timestamp,
        timestamp,
        input.userId,
      ],
    );

    await client.query("DELETE FROM user_intentions WHERE user_id = $1", [input.userId]);
    for (const intention of input.intentions) {
      await client.query(
        "INSERT INTO user_intentions (user_id, code, is_primary, rank) VALUES ($1, $2, $3, $4)",
        [input.userId, intention.code, intention.isPrimary ? 1 : 0, intention.rank],
      );
    }

    await client.query("DELETE FROM user_interests WHERE user_id = $1", [input.userId]);
    for (const code of input.interests) {
      await client.query("INSERT INTO user_interests (user_id, code) VALUES ($1, $2)", [
        input.userId,
        code,
      ]);
    }

    await client.query("DELETE FROM user_circumstances WHERE user_id = $1", [input.userId]);
    for (const code of input.circumstances) {
      await client.query("INSERT INTO user_circumstances (user_id, code) VALUES ($1, $2)", [
        input.userId,
        code,
      ]);
    }

    await client.query("DELETE FROM user_boundaries WHERE user_id = $1", [input.userId]);
    for (const code of input.boundaries) {
      await client.query("INSERT INTO user_boundaries (user_id, code) VALUES ($1, $2)", [
        input.userId,
        code,
      ]);
    }

    await client.query(
      `INSERT INTO privacy_settings (
        user_id, allow_requests, show_age, show_location, show_intentions,
        ai_text_matching, updated_at
      ) VALUES ($1, 'compatible_only', $2, $3, $4, $5, $6)
      ON CONFLICT(user_id) DO UPDATE SET
        show_age = EXCLUDED.show_age,
        show_location = EXCLUDED.show_location,
        show_intentions = EXCLUDED.show_intentions,
        ai_text_matching = EXCLUDED.ai_text_matching,
        updated_at = EXCLUDED.updated_at`,
      [
        input.userId,
        input.showAge ? 1 : 0,
        input.showLocation ? 1 : 0,
        input.showIntentions ? 1 : 0,
        input.aiTextMatching ? 1 : 0,
        timestamp,
      ],
    );

    for (const policy of ["terms", "privacy", "community_rules", "ai_matching"]) {
      await client.query(
        `INSERT INTO consents (user_id, policy_type, version, accepted_at)
         VALUES ($1, $2, '1.0', $3) ON CONFLICT DO NOTHING`,
        [input.userId, policy, timestamp],
      );
    }
    if (input.aiTextMatching) {
      await client.query(
        `INSERT INTO consents (user_id, policy_type, version, accepted_at)
         VALUES ($1, 'ai_text_matching', '1.0', $2) ON CONFLICT DO NOTHING`,
        [input.userId, timestamp],
      );
    } else {
      await client.query(
        "DELETE FROM consents WHERE user_id = $1 AND policy_type = 'ai_text_matching'",
        [input.userId],
      );
    }
  });
}

async function mapRequest(row: RequestRow, viewerId: string): Promise<RequestSummary | null> {
  const otherId = row.sender_id === viewerId ? row.receiver_id : row.sender_id;
  const bundle = await getProfileBundle(otherId);
  if (!bundle) return null;
  const score = await getMatchBetween(viewerId, otherId);
  const conversation = await query<{ id: string }>(
    "SELECT id FROM conversations WHERE request_id = $1",
    [row.id],
  );

  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
    otherAlias: bundle.user.alias ?? "Member",
    otherId,
    otherAge: ageFromBirthYear(bundle.user.birth_year),
    otherCity: bundle.privacy.show_location ? bundle.user.city : null,
    score: score?.score ?? null,
    conversationId: conversation.rows[0]?.id ?? null,
  };
}

export async function getIncomingRequests(userId: string) {
  const rows = await query<RequestRow>(
    "SELECT * FROM connection_requests WHERE receiver_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  const mapped = await Promise.all(rows.rows.map((row) => mapRequest(row, userId)));
  return mapped.filter(Boolean) as RequestSummary[];
}

export async function getOutgoingRequests(userId: string) {
  const rows = await query<RequestRow>(
    "SELECT * FROM connection_requests WHERE sender_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  const mapped = await Promise.all(rows.rows.map((row) => mapRequest(row, userId)));
  return mapped.filter(Boolean) as RequestSummary[];
}

export async function getRequestById(requestId: string, viewerId: string) {
  const result = await query<RequestRow>(
    "SELECT * FROM connection_requests WHERE id = $1",
    [requestId],
  );
  const row = result.rows[0];
  if (!row) return null;
  if (row.sender_id !== viewerId && row.receiver_id !== viewerId) return null;
  return mapRequest(row, viewerId);
}

export async function hasBlocked(blockerId: string, blockedId: string) {
  const result = await query<{ found: number }>(
    "SELECT 1 AS found FROM blocks WHERE blocker_id = $1 AND blocked_id = $2",
    [blockerId, blockedId],
  );
  return result.rows.length > 0;
}

export async function createConnectionRequest(input: {
  senderId: string;
  receiverId: string;
  note: string;
}) {
  if (input.senderId === input.receiverId) {
    return { error: "You cannot send a request to yourself." } as const;
  }
  if (
    (await hasBlocked(input.senderId, input.receiverId)) ||
    (await hasBlocked(input.receiverId, input.senderId))
  ) {
    return { error: "You cannot send a request to this person." } as const;
  }
  const match = await getMatchBetween(input.senderId, input.receiverId);
  if (!match) {
    return { error: "This profile is not currently available to you." } as const;
  }
  const receiver = await getUserById(input.receiverId);
  if (!receiver || receiver.account_state !== "active" || receiver.is_paused === 1) {
    return { error: "This profile is not currently available." } as const;
  }

  const existing = await query<{ id: string; status: string; sender_id: string }>(
    `SELECT id, status, sender_id FROM connection_requests
     WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1))
       AND status IN ('pending', 'accepted')
     ORDER BY created_at DESC LIMIT 1`,
    [input.senderId, input.receiverId],
  );
  if (existing.rows[0]) {
    return {
      error:
        existing.rows[0].sender_id === input.senderId
          ? "You already sent a request."
          : "They have already sent you a request.",
      requestId: existing.rows[0].id,
    } as const;
  }

  const id = `req_${randomUUID()}`;
  await query(
    `INSERT INTO connection_requests (id, sender_id, receiver_id, note, status, created_at)
     VALUES ($1, $2, $3, $4, 'pending', $5)`,
    [id, input.senderId, input.receiverId, input.note, nowIso()],
  );

  return { requestId: id } as const;
}

export async function respondToRequest(input: {
  requestId: string;
  receiverId: string;
  action: "accept" | "decline";
}) {
  const result = await query<{
    id: string;
    sender_id: string;
    receiver_id: string;
    status: string;
  }>("SELECT * FROM connection_requests WHERE id = $1", [input.requestId]);
  const row = result.rows[0];
  if (!row) return { error: "Request not found." } as const;
  if (row.receiver_id !== input.receiverId) return { error: "Request not found." } as const;
  if (row.status !== "pending") return { error: "This request has already been handled." } as const;

  const timestamp = nowIso();
  if (input.action === "decline") {
    await query(
      "UPDATE connection_requests SET status = 'declined', responded_at = $1 WHERE id = $2",
      [timestamp, input.requestId],
    );
    return { ok: true } as const;
  }

  const conversationId = `conv_${randomUUID()}`;
  await withTransaction(async (client) => {
    await client.query(
      "UPDATE connection_requests SET status = 'accepted', responded_at = $1 WHERE id = $2",
      [timestamp, input.requestId],
    );
    await client.query(
      `INSERT INTO conversations (id, request_id, user_a, user_b, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [conversationId, input.requestId, row.sender_id, row.receiver_id, timestamp],
    );
  });

  return { ok: true, conversationId } as const;
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const rows = await query<{
    id: string;
    user_a: string;
    user_b: string;
    created_at: string;
  }>(
    `SELECT * FROM conversations
     WHERE user_a = $1 OR user_b = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  const summaries = await Promise.all(
    rows.rows.map(async (conversation) => {
      const otherId = conversation.user_a === userId ? conversation.user_b : conversation.user_a;
      const other = await getUserById(otherId);
      if (!other) return null;
      const lastMessage = await query<MessageRow>(
        `SELECT * FROM messages WHERE conversation_id = $1
         ORDER BY created_at DESC LIMIT 1`,
        [conversation.id],
      );
      const unread = await query<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM messages
         WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL`,
        [conversation.id, userId],
      );

      return {
        id: conversation.id,
        otherId,
        otherAlias: other.alias ?? "Member",
        otherCity: other.city,
        otherAge: ageFromBirthYear(other.birth_year),
        lastMessage: lastMessage.rows[0]?.body ?? null,
        lastMessageAt: lastMessage.rows[0]?.created_at ?? conversation.created_at,
        lastSenderId: lastMessage.rows[0]?.sender_id ?? null,
        unreadCount: unread.rows[0].count,
        createdAt: conversation.created_at,
      } satisfies ConversationSummary;
    }),
  );

  return summaries.filter(Boolean) as ConversationSummary[];
}

export async function getConversation(conversationId: string, userId: string) {
  const result = await query<{
    id: string;
    request_id: string;
    user_a: string;
    user_b: string;
    created_at: string;
  }>("SELECT * FROM conversations WHERE id = $1", [conversationId]);
  const conversation = result.rows[0];
  if (!conversation) return null;
  if (conversation.user_a !== userId && conversation.user_b !== userId) return null;

  const otherId = conversation.user_a === userId ? conversation.user_b : conversation.user_a;
  const other = await getUserById(otherId);
  if (!other) return null;

  const messages = await query<MessageRow>(
    "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
    [conversationId],
  );

  await query(
    `UPDATE messages SET read_at = $1
     WHERE conversation_id = $2 AND sender_id <> $3 AND read_at IS NULL`,
    [nowIso(), conversationId, userId],
  );

  return { conversation, other, messages: messages.rows };
}

export async function getConversationPeer(conversationId: string, userId: string) {
  const result = await query<{ user_a: string; user_b: string }>(
    "SELECT user_a, user_b FROM conversations WHERE id = $1",
    [conversationId],
  );
  const conversation = result.rows[0];
  if (!conversation) return null;
  if (conversation.user_a !== userId && conversation.user_b !== userId) return null;
  return conversation.user_a === userId ? conversation.user_b : conversation.user_a;
}

export async function createMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}) {
  const peer = await getConversationPeer(input.conversationId, input.senderId);
  if (!peer) return { error: "Conversation not found." } as const;
  if ((await hasBlocked(input.senderId, peer)) || (await hasBlocked(peer, input.senderId))) {
    return { error: "This conversation is no longer available." } as const;
  }
  if (input.body.trim().length < 1 || input.body.length > 2000) {
    return { error: "Message must be between 1 and 2,000 characters." } as const;
  }

  const id = `msg_${randomUUID()}`;
  await query(
    "INSERT INTO messages (id, conversation_id, sender_id, body, created_at) VALUES ($1, $2, $3, $4, $5)",
    [id, input.conversationId, input.senderId, input.body.trim(), nowIso()],
  );

  return { id } as const;
}

export async function getMessagesAfter(
  conversationId: string,
  userId: string,
  after: string | null,
) {
  const peer = await getConversationPeer(conversationId, userId);
  if (!peer) return null;
  await query(
    `UPDATE messages SET read_at = $1
     WHERE conversation_id = $2 AND sender_id <> $3 AND read_at IS NULL`,
    [nowIso(), conversationId, userId],
  );
  if (after) {
    return (
      await query<MessageRow>(
        "SELECT * FROM messages WHERE conversation_id = $1 AND created_at > $2 ORDER BY created_at ASC",
        [conversationId, after],
      )
    ).rows;
  }
  return (
    await query<MessageRow>(
      "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [conversationId],
    )
  ).rows;
}

export async function getSafetySummary(userId: string) {
  const blocked = await query<{
    id: string;
    alias: string | null;
    city: string | null;
    created_at: string;
  }>(
    `SELECT u.id, u.alias, u.city, b.created_at
     FROM blocks b JOIN users u ON u.id = b.blocked_id
     WHERE b.blocker_id = $1 ORDER BY b.created_at DESC`,
    [userId],
  );
  const reports = await query<{
    id: string;
    category: string;
    status: string;
    created_at: string;
    alias: string | null;
  }>(
    `SELECT r.id, r.category, r.status, r.created_at, u.alias
     FROM reports r JOIN users u ON u.id = r.reported_id
     WHERE r.reporter_id = $1 ORDER BY r.created_at DESC`,
    [userId],
  );
  return { blocked: blocked.rows, reports: reports.rows };
}

export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) return { error: "You cannot block yourself." } as const;
  await withTransaction(async (client) => {
    await client.query(
      "INSERT INTO blocks (blocker_id, blocked_id, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [blockerId, blockedId, nowIso()],
    );
    await client.query(
      `UPDATE connection_requests SET status = 'declined', responded_at = $1
       WHERE status = 'pending'
         AND ((sender_id = $2 AND receiver_id = $3) OR (sender_id = $3 AND receiver_id = $2))`,
      [nowIso(), blockerId, blockedId],
    );
  });
  return { ok: true } as const;
}

export async function reportUser(input: {
  reporterId: string;
  reportedId: string;
  category: string;
  details: string;
}) {
  if (input.reporterId === input.reportedId) {
    return { error: "You cannot report yourself." } as const;
  }
  await query(
    `INSERT INTO reports (id, reporter_id, reported_id, category, details, status, created_at)
     VALUES ($1, $2, $3, $4, $5, 'open', $6)`,
    [
      `rep_${randomUUID()}`,
      input.reporterId,
      input.reportedId,
      input.category,
      input.details.slice(0, 2000),
      nowIso(),
    ],
  );
  return { ok: true } as const;
}

export async function updateSettings(input: {
  userId: string;
  allowRequests: "everyone" | "compatible_only";
  showAge: boolean;
  showLocation: boolean;
  showIntentions: boolean;
  aiTextMatching: boolean;
  isPaused: boolean;
}) {
  const timestamp = nowIso();
  await withTransaction(async (client) => {
    await client.query("UPDATE users SET is_paused = $1, updated_at = $2 WHERE id = $3", [
      input.isPaused ? 1 : 0,
      timestamp,
      input.userId,
    ]);
    await client.query(
      `UPDATE privacy_settings SET
        allow_requests = $1, show_age = $2, show_location = $3, show_intentions = $4,
        ai_text_matching = $5, updated_at = $6
       WHERE user_id = $7`,
      [
        input.allowRequests,
        input.showAge ? 1 : 0,
        input.showLocation ? 1 : 0,
        input.showIntentions ? 1 : 0,
        input.aiTextMatching ? 1 : 0,
        timestamp,
        input.userId,
      ],
    );
    if (input.aiTextMatching) {
      await client.query(
        `INSERT INTO consents (user_id, policy_type, version, accepted_at)
         VALUES ($1, 'ai_text_matching', '1.0', $2) ON CONFLICT DO NOTHING`,
        [input.userId, timestamp],
      );
    } else {
      await client.query(
        "DELETE FROM consents WHERE user_id = $1 AND policy_type = 'ai_text_matching'",
        [input.userId],
      );
    }
  });
}

export async function getRelationshipState(viewerId: string, targetId: string) {
  const result = await query<{
    id: string;
    status: RequestSummary["status"];
    sender_id: string;
    receiver_id: string;
    conversation_id: string | null;
  }>(
    `SELECT r.id, r.status, r.sender_id, r.receiver_id, c.id AS conversation_id
     FROM connection_requests r
     LEFT JOIN conversations c ON c.request_id = r.id
     WHERE (r.sender_id = $1 AND r.receiver_id = $2)
        OR (r.sender_id = $2 AND r.receiver_id = $1)
     ORDER BY r.created_at DESC LIMIT 1`,
    [viewerId, targetId],
  );
  return result.rows[0] ?? null;
}

export async function getPendingIncomingCount(userId: string) {
  const result = await query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM connection_requests WHERE receiver_id = $1 AND status = 'pending'",
    [userId],
  );
  return result.rows[0].count;
}

export async function getUnreadTotal(userId: string) {
  const result = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM messages m
     JOIN conversations c ON c.id = m.conversation_id
     WHERE (c.user_a = $1 OR c.user_b = $1)
       AND m.sender_id <> $1
       AND m.read_at IS NULL`,
    [userId],
  );
  return result.rows[0].count;
}

export async function updateLastActive(userId: string) {
  await query("UPDATE users SET last_active_at = $1 WHERE id = $2", [nowIso(), userId]);
}

export async function countUsers() {
  const result = await query<{ count: number }>("SELECT COUNT(*)::int AS count FROM users");
  return result.rows[0].count;
}
