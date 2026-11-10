import Link from "next/link";
import { Unbounded, Pirata_One, Sora, JetBrains_Mono } from "next/font/google";
import { DISCORD_INVITE, BADGE, FAVICON, OG_IMAGE } from "@/lib/site";
import "./globals.css";
import MobileNav from "@/components/MobileNav";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const display = Unbounded({ subsets: ["latin"], variable: "--font-display" });
const gothic = Pirata_One({ subsets: ["latin"], weight: "400", variable: "--font-gothic" });
const body = Sora({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Chaotic Gaming - Community built by gamers, for gamers",
  description:
    "Chaotic Gaming: a brand-new gaming community forming now. 7 Days to Die, ARK, Atlas hubs are open - founding members shape our servers, rules, and events.",
  icons: { icon: FAVICON },
  metadataBase: new URL("https://chaoticmindsgaming.com"),
  openGraph: {
    title: "Chaotic Gaming - Community built by gamers, for gamers",
    description:
      "A brand-new gaming community forming now. 7 Days to Die, ARK, and Atlas hubs are open - founding members shape our servers, rules, and events.",
    url: "https://chaoticmindsgaming.com",
    siteName: "Chaotic Gaming",
    images: [{ url: OG_IMAGE, width: 1920, height: 1080, alt: "Chaotic Gaming - Community built by gamers" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chaotic Gaming - Community built by gamers, for gamers",
    description:
      "A brand-new gaming community forming now. 7 Days to Die, ARK, and Atlas hubs are open.",
    images: [OG_IMAGE],
  },
};

const nav = [
  { href: "/games", label: "Games" },
  { href: "/events", label: "Events" },
  { href: "/discord", label: "Discord" },
  { href: "/rules", label: "Rules" },
  { href: "/parental-consent", label: "Parent Info" },
  { href: "/support", label: "Support" },
  { href: "/about", label: "About" },
];

/**
 * Root layout.
 *
 * Loads the official brand fonts, sets site-wide metadata and social share
 * images, and renders the sticky nav, page body, and footer around every route.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${gothic.variable} ${body.variable} ${mono.variable}`}>
      <body className="grain">
        <nav className="sticky top-0 z-40 border-b border-[rgba(160,32,240,0.22)] bg-[rgba(7,7,10,0.82)] px-6 py-3 backdrop-blur-xl md:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BADGE} alt="Chaotic Gaming crest" className="h-11 w-11 rounded-full shadow-[0_0_18px_rgba(0,229,255,0.45)]" />
              <span className="font-display text-base font-extrabold uppercase tracking-[0.18em] grad-text">
                Chaotic<span className="font-gothic text-2xl tracking-normal"> Gaming</span>
              </span>
            </Link>
            <ul className="hidden items-center gap-8 md:flex">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="font-mono2 text-[11px] uppercase tracking-[0.25em] text-[var(--muted)] transition hover:text-[var(--pulse)]">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer"
               className="font-mono2 hidden rounded-none border border-[rgba(0,229,255,0.5)] px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-[var(--pulse)] transition hover:bg-[rgba(0,229,255,0.08)] sm:block">
              Join Discord
            </a>
            <MobileNav />
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-[rgba(160,32,240,0.22)] bg-[var(--coal)] px-6 py-14 text-center">
          <div className="mx-auto max-w-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BADGE} alt="Chaotic Gaming crest" className="mx-auto mb-6 h-20 w-20 rounded-full shadow-[0_0_30px_rgba(160,32,240,0.5)]" />
            <p className="font-display text-sm font-extrabold uppercase tracking-[0.25em] grad-text">Chaotic Gaming</p>
            <p className="font-gothic mt-3 text-2xl text-[var(--text)]">Community built by gamers, for gamers.</p>
            <p className="font-mono2 mt-5 text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]">
              A Chaotic Minds Collective division
            </p>
            <p className="font-mono2 mt-2 text-[11px] tracking-[0.2em] text-[var(--muted)]">chaoticmindsgaming.com</p>
          </div>
        </footer>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
