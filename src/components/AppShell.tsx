"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Inbox,
  LogOut,
  MessageCircle,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { Avatar } from "./Avatar";
import { Brand } from "./Brand";

const navItems = [
  { href: "/discover", label: "Discover", icon: Compass, key: "discover" },
  { href: "/requests", label: "Requests", icon: Inbox, key: "requests" },
  { href: "/messages", label: "Messages", icon: MessageCircle, key: "messages" },
  { href: "/safety", label: "Safety", icon: Shield, key: "safety" },
  { href: "/matching", label: "How matching works", icon: Sparkles, key: "matching" },
  { href: "/settings", label: "Settings", icon: Settings, key: "settings" },
] as const;

function isActive(pathname: string, key: string) {
  return pathname === `/${key}` || pathname.startsWith(`/${key}/`);
}

export function AppShell({
  user,
  unreadCount,
  pendingCount,
  children,
}: {
  user: SessionUser;
  unreadCount: number;
  pendingCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Brand href="/discover" light sub="Private beta · Accra" />

        <nav className="side-nav" aria-label="App navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.key);
            const count =
              item.key === "messages" ? unreadCount : item.key === "requests" ? pendingCount : 0;
            return (
              <Link
                key={item.href}
                className={active ? "side-link active" : "side-link"}
                href={item.href}
              >
                <Icon />
                <span>{item.label}</span>
                {count > 0 ? <span className="nav-count">{count > 9 ? "9+" : count}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <h3>Text-only beta</h3>
          <p>
            No photo browsing, voice, video or payments. A considered introduction starts
            with words.
          </p>
        </div>

        <div className="sidebar-user">
          <Avatar alias={user.alias} />
          <div className="grow">
            <div className="sidebar-user-name">{user.alias ?? "Your profile"}</div>
            <div className="sidebar-user-meta">
              {user.isDemo ? "Demo account" : user.isPaused ? "Discovery paused" : "Active"}
            </div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="signout-button" type="submit" aria-label="Sign out" title="Sign out">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>

      <div className="app-main">
        <header className="mobile-header">
          <Brand href="/discover" sub="Private beta" />
          <div className="mobile-header-actions">
            {user.isDemo ? <span className="badge badge-gold">Demo</span> : null}
            <Avatar alias={user.alias} />
            <form action="/api/auth/logout" method="post">
              <button className="signout-button" type="submit" aria-label="Sign out" title="Sign out">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems
          .filter((item) => ["discover", "requests", "messages", "safety", "settings"].includes(item.key))
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.key);
            return (
              <Link key={item.href} className={active ? "active" : ""} href={item.href}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
