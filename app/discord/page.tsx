import { DISCORD_INVITE, BADGE } from "@/lib/site";

const rules = [
  "Be decent. No harassment, hate speech, or targeting.",
  "No spam, ads, or self-promotion without staff approval.",
  "Keep game talk in the right hubs.",
  "Staff decisions are final - appeal in a support ticket.",
];

/**
 * Discord community page.
 *
 * Renders the public /discord landing page: the join call-to-action, the live
 * Discord server widget (who is online right now), the onboarding walkthrough,
 * and the short version of the server rules.
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
            {["Click the invite and pass the rules check.", "Tap the verify button in #verify to unlock the server.", "Pick your games in #pick-your-world, say hi, and jump into voice."].map((s, i) => (
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
        </div>
      </div>
    </section>
  );
}
