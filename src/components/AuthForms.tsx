"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LoaderCircle, RotateCcw } from "lucide-react";

type StartResponse = {
  ok?: boolean;
  phone?: string;
  devCode?: string | null;
  error?: string;
};

export function PhoneAuthForm({ demoEnabled }: { demoEnabled: boolean }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState<"ama" | "kwame" | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await response.json()) as StartResponse;
      if (!response.ok || !data.phone) {
        setError(data.error ?? "We could not send a code. Try again.");
        return;
      }
      const query = new URLSearchParams({ phone: data.phone });
      if (data.devCode) query.set("dev", data.devCode);
      router.push(`/join/verify?${query.toString()}`);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function demo(kind: "ama" | "kwame") {
    setDemoBusy(kind);
    setError(null);
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = (await response.json()) as { redirectTo?: string; error?: string };
      if (!response.ok || !data.redirectTo) {
        setError(data.error ?? "Demo access is not available.");
        return;
      }
      router.push(data.redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setDemoBusy(null);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="field">
        <label className="label" htmlFor="phone">
          Phone number
        </label>
        <input
          id="phone"
          className="input"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          autoFocus
          placeholder="024 123 4567"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          aria-describedby="phone-hint"
        />
        <p className="hint" id="phone-hint">
          We use your number only to verify your account. It is never shown to matches.
        </p>
      </div>

      {error ? <p className="form-error mb-2">{error}</p> : null}

      <button className="btn btn-primary btn-block" type="submit" disabled={busy || !phone.trim()}>
        {busy ? <LoaderCircle size={16} className="spin" /> : <ArrowRight size={16} />}
        {busy ? "Sending code…" : "Continue with phone"}
      </button>

      <p className="auth-note">
        By continuing, you confirm you are 18 or older and agree to our community rules.
        SAME PAGE is for women seeking men and men seeking women.
      </p>

      {demoEnabled ? (
        <div style={{ marginTop: 17 }}>
          <p className="tiny center mb-1">Local review access</p>
          <div className="auth-demo">
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => demo("ama")}
              disabled={demoBusy !== null}
            >
              {demoBusy === "ama" ? "Opening…" : "Enter as Ama"}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => demo("kwame")}
              disabled={demoBusy !== null}
            >
              {demoBusy === "kwame" ? "Opening…" : "Enter as Kwame"}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}

export function VerifyForm({
  phone,
  devCode,
}: {
  phone: string;
  devCode: string | null;
}) {
  const router = useRouter();
  const [code, setCode] = useState(devCode ?? "");
  const [currentDevCode, setCurrentDevCode] = useState(devCode);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = (await response.json()) as { redirectTo?: string; error?: string };
      if (!response.ok || !data.redirectTo) {
        setError(data.error ?? "That code did not work.");
        return;
      }
      router.replace(data.redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setResending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await response.json()) as StartResponse;
      if (!response.ok) {
        setError(data.error ?? "Could not send a new code.");
        return;
      }
      if (data.devCode) {
        setCurrentDevCode(data.devCode);
        setCode(data.devCode);
      }
    } catch {
      setError("Could not send a new code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <p className="small muted" style={{ marginBottom: 20 }}>
        We sent a six-digit code to <strong style={{ color: "var(--ink)" }}>{phone}</strong>.
      </p>

      {currentDevCode ? (
        <div className="otp-preview">
          <span>
            Development code
            <br />
            <span className="tiny">Shown locally because SMS is not connected.</span>
          </span>
          <strong>{currentDevCode}</strong>
        </div>
      ) : null}

      <div className="field">
        <label className="label" htmlFor="code">
          Six-digit code
        </label>
        <input
          id="code"
          className="input"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          placeholder="000000"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", letterSpacing: "0.28em" }}
        />
      </div>

      {error ? <p className="form-error mb-2">{error}</p> : null}

      <button className="btn btn-primary btn-block" type="submit" disabled={busy || code.length !== 6}>
        {busy ? "Verifying…" : "Verify and continue"}
        {!busy ? <ArrowRight size={16} /> : null}
      </button>

      <div className="row" style={{ justifyContent: "space-between", marginTop: 15 }}>
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={resend}
          disabled={resending}
        >
          <RotateCcw size={13} /> {resending ? "Sending…" : "Send a new code"}
        </button>
        <a className="tiny" href={`/join`} style={{ color: "var(--forest)", fontWeight: 700 }}>
          Change number
        </a>
      </div>
    </form>
  );
}
