import Link from "next/link";
import { DISCORD_INVITE, BADGE } from "@/lib/site";

const rules = [
  "Be decent. No harassment, hate speech, bullying, or targeting.",
  "No spam, scams, or self-promotion without staff approval.",
  "Keep game talk in the right hubs and follow channel content labels.",
  "Members must be 13 or older; ages 13–17 need parent/guardian permission confirmed by staff before access.",
  "Mature language may occur, but explicit adult content and sexual exploitation are prohibited.",
];

/**
 * Renders the Discord landing page, including the server widget, joining guidance, and community rules summary.
 */
export default function Discord() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-3xl text-center">
        <div className="reveal crest-ring mx-auto h-24 w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BADGE} alt="Chaotic Gaming crest" className="h-full w-full rounded-full" />
        </div>
        <p className="kicker reveal d1 mt-8">The gates are open</p>
        <h1 className="section-title reveal d1 mt-3">Join the Discord</h1>
        <div className="section-rule reveal d1 mx-auto" />
        <p className="reveal d2 mt-7 text-[var(--muted)]">
          The Discord is where the community lives: game hubs, LFG channels, events, and direct support from staff.
        </p>
        <div className="reveal d3 mt-9">
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="btn-cta">Join Our Discord</a>
        </div>

        <div className="card cut reveal d3 mt-14 text-left">
          <span className="kicker">Live from the server</span>
          <h2 className="mt-3 text-xl font-bold uppercase tracking-wide">Who is online right now</h2>
          <div className="mx-auto mt-6 w-full max-w-[350px]">
            <iframe
              src="https://discord.com/widget?id=1565121939448533223&theme=dark"
              className="block h-[500px] w-full"
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              style={{ border: 0 }}
              title="Chaotic Gaming Discord widget"
              loading="lazy"
            />
          </div>
          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            Live member count straight from the Discord. Hit Join to hop in.
          </p>
        </div>

        <div className="card cut reveal d3 mt-6 text-left">
          <span className="kicker">Onboarding</span>
          <h2 className="mt-3 text-xl font-bold uppercase tracking-wide">How joining works</h2>
          <ol className="mt-5 space-y-3">
            {[
              "Click the invite and pass the rules check.",
              "If you are 13–17, read the Parent and Guardian Information and wait until the separate consent process is available before attempting to join. Other eligible visitors can complete the server's verification.",
              "Pick your games in #pick-your-world, say hi, and jump into the appropriate channels.",
            ].map((s, i) => (
              <li key={s} className="flex items-start gap-4 text-sm text-[var(--muted)]">
                <span className="font-display font-bold grad-text">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        <div className="card cut reveal d4 mt-6 text-left">
          <span className="kicker">The code</span>
          <h2 className="mt-3 text-xl font-bold uppercase tracking-wide">Rules, short version</h2>
          <ul className="mt-5 space-y-3">
            {rules.map((r) => (
              <li key={r} className="flex items-start gap-4 text-sm text-[var(--muted)]">
                <span className="mt-1 h-2 w-2 shrink-0 bg-[var(--riot)] shadow-[0_0_10px_var(--riot)]" />
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/rules" className="text-sm text-[var(--pulse)] underline">Read the full Community Rules</Link>
            <Link href="/parental-consent" className="text-sm text-[var(--pulse)] underline">Parent and Guardian Information</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
