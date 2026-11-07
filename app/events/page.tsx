import { DISCORD_INVITE } from "@/lib/site";

/**
 * Events page.
 *
 * Shows the community calendar placeholder while the server is brand-new:
 * explains that first events are voted on in Discord, invites visitors to the
 * events channel, and previews the future Discord events sync.
 */
export default function Events() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-4xl">
        <p className="kicker reveal">Calendar</p>
        <h1 className="section-title reveal d1 mt-3">Events</h1>
        <div className="section-rule reveal d1" />
        <p className="reveal d2 mt-7 text-lg text-[var(--text)]">
          We are brand-new, so the first events have not been scheduled yet - they will be voted on and announced in Discord.
        </p>
        <div className="card cut reveal d3 mt-10">
          <span className="kicker">Coming soon</span>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-wide">The first game night</h2>
          <p className="mt-4 text-[var(--muted)]">
            Want a say in what we play first? Join the Discord, drop your ideas in the events channel, and rally the crew.
            Founding members pick what we launch with.
          </p>
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="btn-cta mt-7">Join the Discord</a>
        </div>
        <p className="reveal d4 mt-10 text-sm text-[var(--muted)]">
          This page will fill with a real calendar as events are scheduled, and will sync with Discord events once
          Glitch, our community bot, is live.
        </p>
      </div>
    </section>
  );
}
