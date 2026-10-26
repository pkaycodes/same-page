"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Check, LoaderCircle } from "lucide-react";

const CATEGORIES = [
  { value: "harassment", label: "Harassment or pressure" },
  { value: "impersonation", label: "Impersonation or fake identity" },
  { value: "fraud", label: "Fraud, money request or scam" },
  { value: "sexual_content", label: "Unwanted sexual content" },
  { value: "hate", label: "Hate or discrimination" },
  { value: "underage", label: "Someone appears to be under 18" },
  { value: "other", label: "Something else" },
];

export function ReportForm({ reportedId, alias }: { reportedId: string; alias: string }) {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedId, category, details }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "We could not submit this report.");
        return;
      }
      router.push("/safety?reported=1");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="banner warn">
        <AlertCircle size={16} />
        <span>
          Reports are not a live emergency service. If someone is in immediate danger,
          contact local emergency services.
        </span>
      </div>

      <div className="field">
        <label className="label" htmlFor="report-category">
          What happened?
        </label>
        <select
          id="report-category"
          className="select"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
        >
          <option value="">Choose a reason</option>
          {CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="report-details">
          Anything we should know? <span className="muted" style={{ fontWeight: 500 }}>(optional)</span>
        </label>
        <textarea
          id="report-details"
          className="textarea"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          maxLength={2000}
          placeholder="Describe what happened. Do not include passwords, bank details or other people's private information."
        />
        <p className="hint">{details.length}/2000</p>
      </div>

      {error ? <p className="form-error mb-2">{error}</p> : null}

      <button className="btn btn-primary" type="submit" disabled={busy || !category}>
        {busy ? <LoaderCircle size={16} className="spin" /> : <Check size={16} />}
        {busy ? "Submitting…" : `Report ${alias}`}
      </button>

      <p className="tiny" style={{ marginTop: 12, marginBottom: 0 }}>
        Your report is private. We may review relevant account activity, but we do not
        reveal your identity to the reported member.
      </p>
    </form>
  );
}
