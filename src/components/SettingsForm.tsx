"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, LoaderCircle, Save } from "lucide-react";

type SettingsState = {
  allowRequests: "everyone" | "compatible_only";
  showAge: boolean;
  showLocation: boolean;
  showIntentions: boolean;
  aiTextMatching: boolean;
  isPaused: boolean;
};

export function SettingsForm({ initial }: { initial: SettingsState }) {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsState>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "We could not save your settings.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <section className="settings-card">
        <h2>Discovery</h2>
        <p>Choose whether your profile is visible and who can reach you.</p>

        <div className="toggle-row">
          <div>
            <h3>Pause discovery</h3>
            <p>
              Your profile disappears from discovery and you stop seeing new people. Your
              existing conversations stay open.
            </p>
          </div>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={settings.isPaused}
            aria-label="Pause discovery"
            onClick={() => update("isPaused", !settings.isPaused)}
          />
        </div>

        <div className="toggle-row">
          <div>
            <h3>Who can send you a request</h3>
            <p>
              Everyone you see has already passed the mutual eligibility checks. This
              controls whether compatible-only is stricter than the baseline.
            </p>
          </div>
          <select
            className="select"
            style={{ width: 170, minHeight: 40 }}
            value={settings.allowRequests}
            onChange={(event) =>
              update("allowRequests", event.target.value as SettingsState["allowRequests"])
            }
            aria-label="Who can send you a request"
          >
            <option value="compatible_only">Compatible only</option>
            <option value="everyone">Everyone eligible</option>
          </select>
        </div>
      </section>

      <section className="settings-card">
        <h2>What others can see</h2>
        <p>Your phone, exact location and private answers are never public.</p>

        <div className="toggle-row">
          <div>
            <h3>Show my age</h3>
            <p>If off, your age is hidden. Matching still uses your age range.</p>
          </div>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={settings.showAge}
            aria-label="Show my age"
            onClick={() => update("showAge", !settings.showAge)}
          />
        </div>

        <div className="toggle-row">
          <div>
            <h3>Show my broad area</h3>
            <p>Only a city or neighbourhood, never an exact location.</p>
          </div>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={settings.showLocation}
            aria-label="Show my broad area"
            onClick={() => update("showLocation", !settings.showLocation)}
          />
        </div>

        <div className="toggle-row">
          <div>
            <h3>Show my intentions</h3>
            <p>Whether people can see what you are looking for.</p>
          </div>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={settings.showIntentions}
            aria-label="Show my intentions"
            onClick={() => update("showIntentions", !settings.showIntentions)}
          />
        </div>
      </section>

      <section className="settings-card">
        <h2>AI and matching</h2>
        <p>
          The current build uses the deterministic baseline only. AI re-ranking is behind a
          feature flag and is not active.
        </p>

        <div className="toggle-row">
          <div>
            <h3>Optional AI text matching</h3>
            <p>
              If enabled in a future release, AI may read your written profile answers to
              improve ranking and explanations. It will never override blocks, consent,
              eligibility, dealbreakers or account state. Your phone, email, legal name,
              date of birth, exact location and messages are always excluded.
            </p>
          </div>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={settings.aiTextMatching}
            aria-label="Optional AI text matching"
            onClick={() => update("aiTextMatching", !settings.aiTextMatching)}
          />
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}
      {saved ? (
        <div className="banner">
          <Check size={16} /> Settings saved.
        </div>
      ) : null}

      <div className="settings-actions">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? <LoaderCircle size={16} className="spin" /> : <Save size={15} />}
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
