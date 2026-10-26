import { initials } from "@/lib/ui";

export function Avatar({
  alias,
  size,
  className = "",
}: {
  alias: string | null | undefined;
  size?: "lg" | "xl";
  className?: string;
}) {
  const tone = avatarTone(alias);
  return (
    <span
      className={["avatar", tone, size ?? "", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      {initials(alias)}
    </span>
  );
}

function avatarTone(alias: string | null | undefined) {
  const value = alias ?? "SAME PAGE";
  const sum = Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
  return ["sage", "clay", "sand"][sum % 3];
}
