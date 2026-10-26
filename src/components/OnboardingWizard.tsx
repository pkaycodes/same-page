"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Info, LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";
import {
  BOUNDARIES,
  CHILDREN_STATUSES,
  CITIES,
  CIRCUMSTANCE_OPTIONS,
  COMMUNICATION_STYLES,
  CURRENT_YEAR,
  DRINKING,
  EMOTIONAL_CLOSENESS,
  EXCLUSIVITY,
  FAITHS,
  INTERESTS,
  INTENTIONS,
  MEETING_FREQUENCIES,
  OPENNESS,
  PARTNER_KNOWLEDGE,
  PUBLIC_VISIBILITY,
  RELATIONSHIP_STATUSES,
  SMOKING,
  TIMELINES,
  WANTS_CHILDREN,
} from "@/lib/constants";

export type OnboardingInitial = {
  alias?: string;
  birthYear?: number;
  gender?: "woman" | "man" | "";
  city?: string;
  bio?: string;
  occupation?: string;
  relationshipStatus?: string;
  childrenStatus?: string;
  wantsChildren?: string;
  partnerKnowledge?: string;
  exclusivity?: string;
  communicationStyle?: string;
  meetingFrequency?: string;
  emotionalCloseness?: string;
  timeline?: string;
  openness?: string;
  publicVisibility?: string;
  faith?: string;
  smoking?: string;
  drinking?: string;
  willingToTravel?: boolean;
  ageMin?: number;
  ageMax?: number;
  intentions?: { code: string; isPrimary: boolean }[];
  interests?: string[];
  circumstances?: string[];
  boundaries?: string[];
  showAge?: boolean;
  showLocation?: boolean;
  showIntentions?: boolean;
  aiTextMatching?: boolean;
};

type FormState = {
  alias: string;
  birthYear: number;
  gender: "woman" | "man" | "";
  city: string;
  bio: string;
  occupation: string;
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
  smoking: string;
  drinking: string;
  willingToTravel: boolean;
  ageMin: number;
  ageMax: number;
  intentions: { code: string; isPrimary: boolean }[];
  interests: string[];
  circumstances: string[];
  boundaries: string[];
  showAge: boolean;
  showLocation: boolean;
  showIntentions: boolean;
  aiTextMatching: boolean;
  acceptTerms: boolean;
  ageConfirm: boolean;
};

function initialForm(initial: OnboardingInitial): FormState {
  return {
    alias: initial.alias ?? "",
    birthYear: initial.birthYear ?? 1995,
    gender: initial.gender ?? "",
    city: initial.city ?? "Osu, Accra",
    bio: initial.bio ?? "",
    occupation: initial.occupation ?? "",
    relationshipStatus: initial.relationshipStatus ?? "single",
    childrenStatus: initial.childrenStatus ?? "none",
    wantsChildren: initial.wantsChildren ?? "open",
    partnerKnowledge: initial.partnerKnowledge ?? "open",
    exclusivity: initial.exclusivity ?? "monogamous",
    communicationStyle: initial.communicationStyle ?? "direct",
    meetingFrequency: initial.meetingFrequency ?? "balanced",
    emotionalCloseness: initial.emotionalCloseness ?? "balanced",
    timeline: initial.timeline ?? "no_timeline",
    openness: initial.openness ?? "balanced",
    publicVisibility: initial.publicVisibility ?? "discreet",
    faith: initial.faith ?? "prefer_not_to_say",
    smoking: initial.smoking ?? "never",
    drinking: initial.drinking ?? "socially",
    willingToTravel: initial.willingToTravel ?? true,
    ageMin: initial.ageMin ?? 26,
    ageMax: initial.ageMax ?? 40,
    intentions: initial.intentions?.length
      ? initial.intentions
      : [{ code: "serious_relationship", isPrimary: true }],
    interests: initial.interests?.length ? initial.interests : ["food", "travel", "live_music"],
    circumstances: initial.circumstances?.length
      ? initial.circumstances
      : ["relationship:single", "children:none"],
    boundaries: initial.boundaries ?? ["monogamy"],
    showAge: initial.showAge ?? true,
    showLocation: initial.showLocation ?? true,
    showIntentions: initial.showIntentions ?? true,
    aiTextMatching: initial.aiTextMatching ?? false,
    acceptTerms: false,
    ageConfirm: false,
  };
}

export function OnboardingWizard({
  initial,
  editing = false,
}: {
  initial?: OnboardingInitial;
  editing?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => {
    const values = initialForm(initial ?? {});
    return editing ? { ...values, acceptTerms: true, ageConfirm: true } : values;
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [aliasState, setAliasState] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");

  const progress = useMemo(() => {
    const checks = [
      form.alias.trim().length >= 3,
      form.birthYear > 0 && CURRENT_YEAR - form.birthYear >= 18,
      Boolean(form.gender),
      Boolean(form.city),
      form.intentions.length > 0,
      form.interests.length >= 3,
      form.circumstances.length >= 1,
      form.acceptTerms,
      form.ageConfirm,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleIntention(code: string) {
    setForm((current) => {
      const existing = current.intentions.find((item) => item.code === code);
      if (existing) {
        const next = current.intentions.filter((item) => item.code !== code);
        if (next.length > 0 && !next.some((item) => item.isPrimary)) {
          next[0] = { ...next[0], isPrimary: true };
        }
        return { ...current, intentions: next };
      }
      if (current.intentions.length >= 3) return current;
      return {
        ...current,
        intentions: [
          ...current.intentions,
          { code, isPrimary: current.intentions.length === 0 },
        ],
      };
    });
  }

  function setPrimary(code: string) {
    setForm((current) => ({
      ...current,
      intentions: current.intentions.map((item) => ({
        ...item,
        isPrimary: item.code === code,
      })),
    }));
  }

  function toggleList(key: "interests" | "circumstances" | "boundaries", code: string, max = 99) {
    setForm((current) => {
      const values = current[key];
      if (values.includes(code)) {
        return { ...current, [key]: values.filter((item) => item !== code) };
      }
      if (values.length >= max) return current;
      return { ...current, [key]: [...values, code] };
    });
  }

  async function checkAlias() {
    const alias = form.alias.trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(alias)) {
      setAliasState(alias.length === 0 ? "idle" : "invalid");
      return;
    }
    setAliasState("checking");
    try {
      const response = await fetch(`/api/alias-check?alias=${encodeURIComponent(alias)}`);
      const data = (await response.json()) as { available?: boolean };
      setAliasState(data.available ? "available" : "taken");
    } catch {
      setAliasState("idle");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          birthYear: Number(form.birthYear),
          ageMin: Number(form.ageMin),
          ageMax: Number(form.ageMax),
        }),
      });
      const data = (await response.json()) as {
        redirectTo?: string;
        error?: string;
        issues?: { path: string; message: string }[];
      };
      if (!response.ok) {
        setError(data.error ?? "We could not save your profile.");
        setFieldErrors(
          Object.fromEntries((data.issues ?? []).map((issue) => [issue.path, issue.message])),
        );
        return;
      }
      router.push(editing ? "/settings?updated=1" : (data.redirectTo ?? "/discover"));
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const age = form.birthYear ? CURRENT_YEAR - form.birthYear : null;

  return (
    <form onSubmit={submit} noValidate>
      <div className="onboarding-shell">
        <div className="onboarding-main">
          <p className="eyebrow">{editing ? "Edit your profile" : "Your private profile"}</p>
          <h1>{editing ? "Keep your answers current." : "Tell us what matters."}</h1>
          <p className="muted">
            This is not a performance. Clear answers help us avoid introductions that were
            never going to fit. You can change everything later.
          </p>

          {error ? <p className="form-error mb-2">{error}</p> : null}

          <section className="form-section">
            <h2>01 · The basics</h2>
            <p>Only your alias, age, city and what you choose to share are public.</p>

            <div className="form-row">
              <div className="field">
                <label className="label" htmlFor="alias">
                  Alias
                </label>
                <input
                  id="alias"
                  className="input"
                  value={form.alias}
                  onChange={(event) => {
                    update("alias", event.target.value.replace(/[^A-Za-z0-9_]/g, "").slice(0, 20));
                    setAliasState("idle");
                  }}
                  onBlur={checkAlias}
                  aria-invalid={Boolean(fieldErrors.alias) || aliasState === "taken"}
                  placeholder="e.g. Ama_K"
                  autoComplete="nickname"
                />
                {aliasState === "checking" ? (
                  <p className="hint">Checking availability…</p>
                ) : aliasState === "available" ? (
                  <p className="hint" style={{ color: "var(--forest)", fontWeight: 700 }}>
                    <Check size={12} /> Available
                  </p>
                ) : aliasState === "taken" || fieldErrors.alias ? (
                  <p className="error-text">
                    {fieldErrors.alias ?? "That alias is already taken."}
                  </p>
                ) : (
                  <p className="hint">3–20 letters, numbers or underscores. No real name needed.</p>
                )}
              </div>

              <div className="field">
                <label className="label" htmlFor="birthYear">
                  Birth year
                </label>
                <input
                  id="birthYear"
                  className="input"
                  type="number"
                  min={CURRENT_YEAR - 100}
                  max={CURRENT_YEAR - 18}
                  value={form.birthYear || ""}
                  onChange={(event) => update("birthYear", Number(event.target.value))}
                  aria-invalid={Boolean(fieldErrors.birthYear)}
                />
                <p className="hint">
                  {age && age >= 18 ? `You will appear as ${age}.` : "You must be 18 or older."}
                </p>
              </div>
            </div>

            <div className="field">
              <span className="label">I am a</span>
              <div className="option-grid">
                {[
                  { code: "woman" as const, label: "Woman", seeking: "men" },
                  { code: "man" as const, label: "Man", seeking: "women" },
                ].map((option) => (
                  <label className="option" key={option.code}>
                    <input
                      type="radio"
                      name="gender"
                      value={option.code}
                      checked={form.gender === option.code}
                      onChange={() => update("gender", option.code)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {form.gender ? (
                <div className="derived-card" style={{ marginTop: 10, marginBottom: 0 }}>
                  <Info size={16} />
                  <span>
                    <strong>Seeking {form.gender === "woman" ? "men" : "women"}</strong>
                    <span>
                      SAME PAGE is binary in this beta: women seeking men and men seeking
                      women. This is derived on the server and is not an editable field.
                    </span>
                  </span>
                </div>
              ) : (
                <p className="hint" style={{ marginTop: 6 }}>
                  Your seeking preference is derived from this. The beta supports women
                  seeking men and men seeking women.
                </p>
              )}
              {fieldErrors.gender ? <p className="error-text">{fieldErrors.gender}</p> : null}
            </div>

            <div className="form-row">
              <div className="field">
                <label className="label" htmlFor="city">
                  City / area
                </label>
                <select
                  id="city"
                  className="select"
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                >
                  {CITIES.map((city) => (
                    <option key={city.city} value={city.city}>
                      {city.city}
                    </option>
                  ))}
                </select>
                <p className="hint">We show a broad area, never an exact location.</p>
              </div>
              <div className="field">
                <label className="label" htmlFor="occupation">
                  What you do <span style={{ color: "var(--soft)", fontWeight: 500 }}>(optional)</span>
                </label>
                <input
                  id="occupation"
                  className="input"
                  value={form.occupation}
                  onChange={(event) => update("occupation", event.target.value)}
                  maxLength={80}
                  placeholder="e.g. Architect"
                />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="bio">
                In your own words <span style={{ color: "var(--soft)", fontWeight: 500 }}>(optional)</span>
              </label>
              <textarea
                id="bio"
                className="textarea"
                value={form.bio}
                onChange={(event) => update("bio", event.target.value)}
                maxLength={1000}
                placeholder="A few sentences about how you spend your time, what you care about, and what you are looking for."
              />
              <p className="hint">{form.bio.length}/1000 characters. Keep identifying details out.</p>
            </div>
          </section>

          <section className="form-section">
            <h2>02 · What you are looking for</h2>
            <p>Choose up to three. Mark one as your primary intention.</p>
            <div className="stack-sm">
              {INTENTIONS.map((intention) => {
                const selected = form.intentions.find((item) => item.code === intention.code);
                return (
                  <div
                    className="option"
                    key={intention.code}
                    style={{ justifyContent: "space-between", alignItems: "center" }}
                  >
                    <label className="row" style={{ alignItems: "flex-start", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(selected)}
                        onChange={() => toggleIntention(intention.code)}
                      />
                      <span>
                        <strong style={{ fontSize: "0.85rem" }}>{intention.label}</strong>
                        <span className="hint" style={{ display: "block" }}>
                          {intention.description}
                        </span>
                      </span>
                    </label>
                    {selected ? (
                      <label
                        className={selected.isPrimary ? "badge badge-green" : "badge"}
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="radio"
                          name="primaryIntention"
                          checked={selected.isPrimary}
                          onChange={() => setPrimary(intention.code)}
                          style={{ width: 13, height: 13, accentColor: "var(--forest)" }}
                        />
                        {selected.isPrimary ? "Primary" : "Make primary"}
                      </label>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {fieldErrors.intentions ? <p className="error-text">{fieldErrors.intentions}</p> : null}
          </section>

          <section className="form-section">
            <h2>03 · Life and circumstances</h2>
            <p>These are used to check that both people can comfortably meet.</p>
            <div className="form-row">
              <SelectField
                id="relationshipStatus"
                label="Relationship status"
                value={form.relationshipStatus}
                onChange={(value) => update("relationshipStatus", value)}
                options={RELATIONSHIP_STATUSES}
              />
              <SelectField
                id="childrenStatus"
                label="Children"
                value={form.childrenStatus}
                onChange={(value) => update("childrenStatus", value)}
                options={CHILDREN_STATUSES}
              />
            </div>
            <div className="form-row">
              <SelectField
                id="wantsChildren"
                label="Children in the future"
                value={form.wantsChildren}
                onChange={(value) => update("wantsChildren", value)}
                options={WANTS_CHILDREN}
              />
              <SelectField
                id="partnerKnowledge"
                label="A partner knowing your situation"
                value={form.partnerKnowledge}
                onChange={(value) => update("partnerKnowledge", value)}
                options={PARTNER_KNOWLEDGE}
              />
            </div>
            <div className="form-row">
              <SelectField
                id="faith"
                label="Faith"
                value={form.faith}
                onChange={(value) => update("faith", value)}
                options={FAITHS}
              />
              <SelectField
                id="smoking"
                label="Smoking"
                value={form.smoking}
                onChange={(value) => update("smoking", value)}
                options={SMOKING}
              />
            </div>
            <div className="form-row">
              <SelectField
                id="drinking"
                label="Drinking"
                value={form.drinking}
                onChange={(value) => update("drinking", value)}
                options={DRINKING}
              />
              <div className="field">
                <span className="label">Willing to travel to meet</span>
                <ToggleRow
                  checked={form.willingToTravel}
                  onChange={(value) => update("willingToTravel", value)}
                  label="Open to meeting outside my area"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>04 · How you build a relationship</h2>
            <p>There are no right answers here — only useful ones.</p>
            <div className="form-row">
              <SelectField
                id="exclusivity"
                label="Relationship style"
                value={form.exclusivity}
                onChange={(value) => update("exclusivity", value)}
                options={EXCLUSIVITY}
              />
              <SelectField
                id="communicationStyle"
                label="Communication style"
                value={form.communicationStyle}
                onChange={(value) => update("communicationStyle", value)}
                options={COMMUNICATION_STYLES}
              />
            </div>
            <div className="form-row">
              <SelectField
                id="meetingFrequency"
                label="Time together"
                value={form.meetingFrequency}
                onChange={(value) => update("meetingFrequency", value)}
                options={MEETING_FREQUENCIES}
              />
              <SelectField
                id="emotionalCloseness"
                label="Emotional closeness"
                value={form.emotionalCloseness}
                onChange={(value) => update("emotionalCloseness", value)}
                options={EMOTIONAL_CLOSENESS}
              />
            </div>
            <div className="form-row">
              <SelectField
                id="timeline"
                label="Timeline"
                value={form.timeline}
                onChange={(value) => update("timeline", value)}
                options={TIMELINES}
              />
              <SelectField
                id="openness"
                label="How open you are at first"
                value={form.openness}
                onChange={(value) => update("openness", value)}
                options={OPENNESS}
              />
            </div>
            <SelectField
              id="publicVisibility"
              label="How visible you want to be"
              value={form.publicVisibility}
              onChange={(value) => update("publicVisibility", value)}
              options={PUBLIC_VISIBILITY}
            />
          </section>

          <section className="form-section">
            <h2>05 · Compatibility details</h2>
            <p>
              These power the deterministic checks. The more honest you are, the fewer
              mismatched introductions.
            </p>

            <div className="field">
              <span className="label">Interests</span>
              <div className="option-grid">
                {INTERESTS.map((interest) => (
                  <label className="option" key={interest.code}>
                    <input
                      type="checkbox"
                      checked={form.interests.includes(interest.code)}
                      onChange={() => toggleList("interests", interest.code, 12)}
                    />
                    <span>{interest.label}</span>
                  </label>
                ))}
              </div>
              <p className="hint">Choose 3–12. Selected: {form.interests.length}</p>
              {fieldErrors.interests ? <p className="error-text">{fieldErrors.interests}</p> : null}
            </div>

            <div className="field">
              <span className="label">Circumstances you accept</span>
              <p className="hint" style={{ marginTop: -2 }}>
                Choose the circumstances you are open to. We check both people&apos;s lists,
                and they are not shown as a checklist on your profile.
              </p>
              <div className="option-grid">
                {CIRCUMSTANCE_OPTIONS.map((option) => (
                  <label className="option" key={option.code}>
                    <input
                      type="checkbox"
                      checked={form.circumstances.includes(option.code)}
                      onChange={() => toggleList("circumstances", option.code)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.circumstances ? (
                <p className="error-text">{fieldErrors.circumstances}</p>
              ) : null}
            </div>

            <div className="field">
              <span className="label">Dealbreakers</span>
              <p className="hint" style={{ marginTop: -2 }}>
                These are hard filters. We will not introduce someone who crosses them.
              </p>
              <div className="option-grid">
                {BOUNDARIES.map((option) => (
                  <label className="option" key={option.code}>
                    <input
                      type="checkbox"
                      checked={form.boundaries.includes(option.code)}
                      onChange={() => toggleList("boundaries", option.code)}
                    />
                    <span>
                      {option.label}
                      <span className="hint" style={{ display: "block" }}>
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="label">Age range you are open to</span>
              <div className="form-row">
                <label className="field" style={{ marginBottom: 0 }}>
                  <span className="hint">Youngest</span>
                  <input
                    className="input"
                    type="number"
                    min={18}
                    max={99}
                    value={form.ageMin}
                    onChange={(event) => update("ageMin", Number(event.target.value))}
                  />
                </label>
                <label className="field" style={{ marginBottom: 0 }}>
                  <span className="hint">Oldest</span>
                  <input
                    className="input"
                    type="number"
                    min={18}
                    max={99}
                    value={form.ageMax}
                    onChange={(event) => update("ageMax", Number(event.target.value))}
                  />
                </label>
              </div>
              {fieldErrors.ageMax ? <p className="error-text">{fieldErrors.ageMax}</p> : null}
            </div>
          </section>

          <section className="form-section">
            <h2>06 · Privacy and consent</h2>
            <p>You decide what other members can see.</p>

            <div className="stack-sm mb-2">
              <ToggleRow
                checked={form.showAge}
                onChange={(value) => update("showAge", value)}
                label="Show my age"
                description="If off, your age is hidden from other members. Matching still uses your age range."
              />
              <ToggleRow
                checked={form.showLocation}
                onChange={(value) => update("showLocation", value)}
                label="Show my broad city / area"
                description="Never an exact location. If off, your area is hidden from your profile."
              />
              <ToggleRow
                checked={form.showIntentions}
                onChange={(value) => update("showIntentions", value)}
                label="Show my intentions"
                description="Your intentions help people understand you. You can keep them private."
              />
            </div>

            <div className="card card-soft" style={{ marginBottom: 17 }}>
              <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                <Sparkles size={17} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: "0.82rem" }}>
                    Optional: use my written answers for AI-assisted matching
                  </p>
                  <p className="hint" style={{ marginBottom: 9 }}>
                    AI re-ranking is feature-flagged off in this beta. If enabled later, it
                    may read your profile text and interests to improve explanations. It
                    will never override blocks, consent, eligibility, dealbreakers or
                    account state. Your phone, email, legal name, date of birth, exact
                    location and messages are always excluded.
                  </p>
                  <ToggleRow
                    checked={form.aiTextMatching}
                    onChange={(value) => update("aiTextMatching", value)}
                    label="I consent to AI text matching"
                    description="You can turn this off at any time in Settings."
                  />
                </div>
              </div>
            </div>

            <div className="stack-sm">
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.ageConfirm}
                  onChange={(event) => update("ageConfirm", event.target.checked)}
                />
                <span>I confirm I am 18 or older.</span>
              </label>
              {fieldErrors.ageConfirm ? <p className="error-text">{fieldErrors.ageConfirm}</p> : null}
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(event) => update("acceptTerms", event.target.checked)}
                />
                <span>
                  I agree to the community rules and privacy notice, including the
                  automated matching disclosure.
                </span>
              </label>
              {fieldErrors.acceptTerms ? <p className="error-text">{fieldErrors.acceptTerms}</p> : null}
            </div>
          </section>

          <div className="onboarding-nav">
            <div className="step-dots" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <span key={index} className={index < Math.ceil(progress / 17) ? "step-dot active" : "step-dot"} />
              ))}
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? <LoaderCircle size={16} className="spin" /> : <ArrowRight size={16} />}
              {busy ? "Saving…" : editing ? "Save profile" : "Create my profile"}
            </button>
          </div>
        </div>

        <aside className="onboarding-aside">
          <div className="card">
            <p className="eyebrow">Your progress</p>
            <h2>{progress}% complete</h2>
            <div className="onboarding-progress" style={{ width: "100%", marginBottom: 14 }}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <p>
              You can save and come back. The essentials are your alias, age, gender,
              intentions, interests and consent.
            </p>

            <hr className="divider" />

            <div className="row" style={{ alignItems: "flex-start", gap: 9 }}>
              <LockKeyhole size={16} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: "0.78rem" }}>
                  Never used for matching
                </p>
                <p className="hint">
                  Your phone number, legal name, email, date of birth, exact location and
                  private messages.
                </p>
              </div>
            </div>

            <hr className="divider" />

            <p className="tiny" style={{ margin: 0 }}>
              {editing
                ? "Saving updates your existing profile. Your alias can be changed, but it must stay unique."
                : "After this, you will see people whose intentions and dealbreakers are compatible with yours."}
            </p>
          </div>
        </aside>
      </div>

    </form>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ code: string; label: string }>;
}) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="toggle-row">
      <div>
        <h3>{label}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <button
        className="switch"
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}
