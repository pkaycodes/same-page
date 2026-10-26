import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SAME PAGE — Intention-first dating",
    template: "%s · SAME PAGE",
  },
  description:
    "A private, intention-first dating experience for women seeking men and men seeking women in Ghana. No public photo feed. No endless swiping.",
  applicationName: "SAME PAGE",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12362a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
