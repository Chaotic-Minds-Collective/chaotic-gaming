import Link from "next/link";
import { games, statusLabel } from "@/lib/games";

export default function Games() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-6xl">
        <p className="kicker reveal">The roster</p>
        <h1 className="section-title reveal d1 mt-3">Game communities</h1>
        <div className="section-rule reveal d1" />
        <p className="reveal d2 mt-6 max-w-xl text-[var(--muted)]">
          Every game runs its own Discord hub with LFG, tips, and plans for a dedicated server.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {games.map((g, i) => (
            <Link key={g.slug} href={`/games/${g.slug}`} className={`card cut block reveal d${i + 2}`}>
              <div className="game-card-art mb-5 flex h-28 items-center justify-center overflow-hidden border border-[rgba(160,32,240,0.25)]">
                <span className="font-gothic text-5xl">{g.name.charAt(0)}</span>
              </div>
              <span className="kicker">{g.genre}</span>
              <h3 className="mt-2 text-xl font-bold uppercase tracking-wide">{g.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{g.blurb}</p>
              <span className="pill mt-5">{statusLabel[g.status]}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
