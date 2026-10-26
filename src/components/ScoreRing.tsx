import type { CSSProperties } from "react";

export function ScoreRing({
  score,
  light = false,
  label = "fit",
}: {
  score: number;
  light?: boolean;
  label?: string;
}) {
  return (
    <span
      className={light ? "score-ring light" : "score-ring"}
      style={{ "--pct": Math.max(0, Math.min(100, score)) } as CSSProperties}
      aria-label={`${score}% ${label}`}
    >
      <strong>{score}</strong>
      <small>{label}</small>
    </span>
  );
}
