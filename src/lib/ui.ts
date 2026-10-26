export function initials(alias: string | null | undefined) {
  if (!alias) return "SP";
  const parts = alias.replace(/[^A-Za-z0-9]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

const dayFormat = new Intl.DateTimeFormat("en-GH", {
  day: "numeric",
  month: "short",
});

const fullDateFormat = new Intl.DateTimeFormat("en-GH", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-GH", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDate(iso: string | null | undefined, withYear = false) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return (withYear ? fullDateFormat : dayFormat).format(date);
}

export function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return timeFormat.format(date);
}

export function formatRelative(iso: string | null | undefined) {
  if (!iso) return "Recently";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function firstName(alias: string | null | undefined) {
  return alias?.split(/[_\s]/)[0] || "there";
}
