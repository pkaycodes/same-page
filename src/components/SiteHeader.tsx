import Link from "next/link";
import { Brand } from "./Brand";

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="site-header">
      <Brand />
      <nav className="site-nav" aria-label="Main navigation">
        <a href="#how">How it works</a>
        <a href="#principles">Our approach</a>
        <a href="#safety">Safety</a>
      </nav>
      <div className="site-actions">
        <Link className="btn btn-ghost" href={signedIn ? "/discover" : "/join"}>
          {signedIn ? "Open app" : "Sign in"}
        </Link>
        <Link className="btn btn-primary btn-sm" href={signedIn ? "/discover" : "/join"}>
          {signedIn ? "Go to discover" : "Join the beta"}
        </Link>
      </div>
    </header>
  );
}
