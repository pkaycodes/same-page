import Link from "next/link";

export function Brand({
  href = "/",
  light = false,
  sub = "Intention-first dating",
}: {
  href?: string;
  light?: boolean;
  sub?: string;
}) {
  return (
    <Link className="brand" href={href} aria-label="SAME PAGE home">
      <span className={light ? "brand-mark light" : "brand-mark"} aria-hidden="true">
        S
      </span>
      <span>
        <span className="brand-name">SAME PAGE</span>
        <span className="brand-sub">{sub}</span>
      </span>
    </Link>
  );
}
