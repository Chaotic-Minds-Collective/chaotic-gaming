import Link from "next/link";
import { games, statusLabel } from "@/lib/games";
import { DISCORD_INVITE, BADGE } from "@/lib/site";

const steps = [
  { n: "01", title: "Join the Discord", text: "Grab the invite, agree to the rules, pick your games." },
  { n: "02", title: "Shape the servers", text: "Vote on which game servers launch first, the rates, and the rules." },
  { n: "03", title: "Build the events", text: "Game nights, contests, and traditions start with the founding crew." },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-20 pt-24 text-center md:pt-32">
        <div className="grid-bg absolute inset-0" />
        <div className="aurora" />
        <div className="relative mx-auto max-w-4xl">
          <div className="reveal crest-ring mx-auto mb-10 h-28 w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BADGE} alt="Chaotic Minds Gaming crest" className="h-full w-full rounded-full" />
          </div>
          <p className="kicker reveal d1">A brand-new gaming community - founding members wanted</p>
          <h1 className="reveal d2 mt-6 text-[clamp(38px,7vw,76px)] font-extrabold leading-[1.02] uppercase">
            <span className="glitch" data-text="Forged in">Forged in</span>
            <br />
            <span className="grad-text glitch" data-text="Chaos">Chaos</span>
          </h1>
          <p className="reveal d3 mx-auto mt-7 max-w-xl text-lg text-[var(--muted)]">
            Servers, events, and a community built <span className="font-gothic text-2xl text-[var(--text)]">by gamers, for gamers</span>.
            Nothing here is set in stone yet - and that is the point.
          </p>
          <div className="reveal d4 mt-10 flex flex-wrap justify-center gap-5">
            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="btn-cta">Join the Discord</a>
            <Link href="/games" className="btn-ghost">See the games</Link>
          </div>
        </div>
      </section>

      <div className="marquee reveal d5">
        <div className="marquee-track">
          {[...Array(2)].flatMap((_, rep) =>
            games.concat(games).map((g, i) => (
              <span key={`${rep}-${g.slug}-${i}`}>
                {g.name} <span className="spark">✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10">
        <p className="kicker">The roster</p>
        <h2 className="section-title mt-3">Game communities</h2>
        <div className="section-rule" />
        <p className="mt-6 max-w-xl text-[var(--muted)]">
          Every game gets its own Discord hub. Game servers launch as each community grows - members vote on what comes first.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {games.map((g, i) => (
            <Link key={g.slug} href={`/games/${g.slug}`} className={`card cut block reveal d${i + 1}`}>
              <div className="game-card-art mb-5 flex h-28 items-center justify-center overflow-hidden border border-[rgba(160,32,240,0.25)]">
                <span className="font-gothic text-5xl text-[var(--text)]">{g.name.charAt(0)}</span>
              </div>
              <span className="kicker">{g.genre}</span>
              <h3 className="mt-2 text-xl font-bold uppercase tracking-wide">{g.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{g.blurb}</p>
              <span className="pill mt-5">{statusLabel[g.status]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-28 md:px-10">
        <p className="kicker">Early days</p>
        <h2 className="section-title mt-3">Be a founding member</h2>
        <div className="section-rule" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className={`card cut reveal d${i + 1}`}>
              <span className="font-display text-4xl font-extrabold grad-text">{s.n}</span>
              <h3 className="mt-4 text-lg font-bold uppercase tracking-wide text-[var(--pulse)]">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="reveal d4 mt-12 text-center">
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="btn-cta">Claim your spot</a>
        </div>
      </section>
    </>
  );
}
