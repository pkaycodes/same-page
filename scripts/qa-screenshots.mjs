import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const out = process.env.QA_OUT ?? "/tmp/samepage-qa";
const base = "http://localhost:3000";
const conversationId = "conv_c30b2fff-a8dd-4210-b4b1-f09e3e745a68";

await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });

async function shot(page, name, fullPage = true) {
  await page.screenshot({ path: `${out}/${name}.png`, fullPage });
  console.log(`captured ${name}`);
}

async function demoLogin(context, kind) {
  const response = await context.request.post(`${base}/api/auth/demo`, {
    data: { kind },
  });
  if (!response.ok()) throw new Error(`Demo login failed: ${response.status()}`);
}

const anonymous = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const anonPage = await anonymous.newPage();
await anonPage.goto(`${base}/`, { waitUntil: "networkidle" });
await shot(anonPage, "01-landing-desktop");
await anonPage.goto(`${base}/join`, { waitUntil: "networkidle" });
await shot(anonPage, "02-join-desktop");
await anonymous.close();

const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await demoLogin(desktop, "ama");
const desktopPage = await desktop.newPage();
await desktopPage.goto(`${base}/discover`, { waitUntil: "networkidle" });
await shot(desktopPage, "03-discover-desktop");
await desktopPage.goto(`${base}/people/usr_kwame`, { waitUntil: "networkidle" });
await shot(desktopPage, "04-profile-desktop");
await desktopPage.goto(`${base}/requests`, { waitUntil: "networkidle" });
await shot(desktopPage, "05-requests-desktop");
await desktopPage.goto(`${base}/messages/${conversationId}`, { waitUntil: "networkidle" });
await shot(desktopPage, "06-chat-desktop", false);
await desktopPage.goto(`${base}/settings`, { waitUntil: "networkidle" });
await shot(desktopPage, "07-settings-desktop");
await desktopPage.goto(`${base}/matching`, { waitUntil: "networkidle" });
await shot(desktopPage, "08-matching-desktop");
await desktopPage.goto(`${base}/onboarding?edit=1`, { waitUntil: "networkidle" });
await shot(desktopPage, "09-onboarding-desktop");
await desktop.close();

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
await demoLogin(mobile, "ama");
const mobilePage = await mobile.newPage();
await mobilePage.goto(`${base}/discover`, { waitUntil: "networkidle" });
await shot(mobilePage, "10-discover-mobile");
await mobilePage.goto(`${base}/people/usr_kwame`, { waitUntil: "networkidle" });
await shot(mobilePage, "11-profile-mobile");
await mobilePage.goto(`${base}/messages/${conversationId}`, { waitUntil: "networkidle" });
await shot(mobilePage, "12-chat-mobile", false);
await mobilePage.goto(`${base}/requests`, { waitUntil: "networkidle" });
await shot(mobilePage, "13-requests-mobile");
await mobilePage.goto(`${base}/settings`, { waitUntil: "networkidle" });
await shot(mobilePage, "14-settings-mobile");
await mobilePage.goto(`${base}/safety`, { waitUntil: "networkidle" });
await shot(mobilePage, "15-safety-mobile");
await mobilePage.goto(`${base}/messages`, { waitUntil: "networkidle" });
await shot(mobilePage, "17-messages-mobile");
await mobilePage.goto(`${base}/onboarding?edit=1`, { waitUntil: "networkidle" });
await shot(mobilePage, "18-onboarding-mobile", false);
await mobile.close();

const anonymousMobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const anonMobilePage = await anonymousMobile.newPage();
await anonMobilePage.goto(`${base}/`, { waitUntil: "networkidle" });
await shot(anonMobilePage, "16-landing-mobile");
await anonymousMobile.close();

await browser.close();
console.log(`done: ${out}`);
