import { games } from "@/lib/games";
import { notFound } from "next/navigation";
import { DISCORD_INVITE } from "@/lib/site";
import { getCoreServers, type CoreGameKey } from "@/lib/core-api";

export const revalidate = 60;

const CORE_GAME_KEYS: Record<string, CoreGameKey> = {
  atlas: "atlas",
  "7-days-to-die": "7dtd",
  ark: "ark",
};

export function generateStaticParams() {
  return games.map((g) => ({ game: g.slug }));
}

/**
 * Renders a catalog game's details, using Core's live server registry when
 * configured and available, and the existing static copy otherwise.
 */
export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game: gameSlug } = await params;
  const game = games.find((g) => g.slug === gameSlug);
  if (!game) notFound();

  const gameKey = CORE_GAME_KEYS[gameSlug];
  const coreServers = gameKey ? await getCoreServers() : null;
  const liveServers = coreServers?.filter((server) => server.gameKey === gameKey) ?? [];

  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-3xl">
        <p className="kicker reveal">{game.genre}</p>
        <h1 className="reveal d1 mt-3 text-[clamp(34px,5vw,52px)] font-extrabold uppercase leading-tight">
          <span className="glitch" data-text={game.name}>{game.name}</span>
        </h1>
        <div className="section-rule reveal d1" />
        <p className="reveal d2 mt-7 text-lg text-[var(--text)]">{game.blurb}</p>

        <h2 className="reveal d2 mt-12 text-xl font-bold uppercase tracking-wide text-[var(--pulse)]">Current status</h2>
        {liveServers.length > 0 ? (
          <ul className="reveal d3 mt-5 space-y-3">
            {liveServers.map((server) => (
              <li key={server.id} className="card cut-sm flex items-start gap-4 !p-4">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 ${server.online ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" : "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)]"}`}
                  aria-label={server.online ? "Online" : "Offline"}
                />
                <div className="min-w-0">
                  <p className="font-bold uppercase tracking-wide">{server.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {server.online ? "ONLINE" : "OFFLINE"} · {server.playerCount ?? "—"}/{server.maxPlayers ?? "—"} players
                    {server.mapName ? ` · ${server.mapName}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{server.clusterName}</p>
                  {server.online && server.publicHostname && server.gamePort ? (
                    <p className="mt-2 break-all font-mono text-xs text-[var(--pulse)]">
                      {server.publicHostname}:{server.gamePort}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="reveal d3 mt-5 space-y-3">
            {game.serverInfo.map((s) => (
              <li key={s} className="card cut-sm flex items-start gap-4 !p-4">
                <span className="mt-1 h-2 w-2 shrink-0 bg-[var(--pulse)] shadow-[0_0_10px_var(--pulse)]" />
                <span className="text-sm text-[var(--muted)]">{s}</span>
              </li>
            ))}
          </ul>
        )}

        <h2 className="reveal d3 mt-12 text-xl font-bold uppercase tracking-wide text-[var(--pulse)]">In-game items</h2>
        <p className="reveal d4 mt-4 text-[var(--muted)]">
          Item guides and reference pages are coming as the hub grows. Founding members write the first ones - bring your knowledge.
        </p>

        <div className="reveal d4 mt-12">
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="btn-cta">
            Join the {game.name} hub
          </a>
        </div>
      </div>
    </section>
  );
}
