import { getCoreServerCatalog } from "@/lib/core-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Server Status | Chaotic Gaming",
  description: "Live status for listed Chaotic Gaming community servers."
};

export default async function ServersPage() {
  const catalog = await getCoreServerCatalog();

  return (
    <section className="relative min-h-[65vh] overflow-hidden px-6 py-20 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-6xl">
        <p className="kicker reveal">The network</p>
        <h1 className="section-title reveal d1 mt-3">Server status</h1>
        <div className="section-rule reveal d1" />
        <p className="reveal d2 mt-6 max-w-2xl text-[var(--muted)]">
          Server listings and heartbeat status come from the Chaotic Gaming Core.
          A server is shown online only while its adapter heartbeat is fresh.
        </p>

        {!catalog.configured && (
          <div className="card cut mt-12">
            <h2 className="text-lg font-bold uppercase tracking-wide">Live status is being connected</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              The public server catalog has not been configured yet. Game launch plans and community updates remain on the Games page and in Discord.
            </p>
          </div>
        )}

        {catalog.configured && !catalog.available && (
          <div className="card cut mt-12">
            <h2 className="text-lg font-bold uppercase tracking-wide">Status temporarily unavailable</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              The server-status service could not be reached. This does not necessarily mean the game servers are offline.
            </p>
          </div>
        )}

        {catalog.configured && catalog.available && catalog.servers.length === 0 && (
          <div className="card cut mt-12">
            <h2 className="text-lg font-bold uppercase tracking-wide">No public servers listed yet</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Server listings will appear here when a community server is approved for public listing and begins reporting its status.
            </p>
          </div>
        )}

        {catalog.configured && catalog.available && catalog.servers.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {catalog.servers.map((server) => (
              <article key={server.id} className="card cut">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="kicker">{server.gameKey}</p>
                    <h2 className="mt-2 text-xl font-bold uppercase tracking-wide">{server.name}</h2>
                    {server.clusterName && (
                      <p className="mt-1 text-sm text-[var(--muted)]">{server.clusterName}</p>
                    )}
                  </div>
                  <span className="pill">{server.online ? "SERVER ONLINE" : "SERVER OFFLINE"}</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="kicker">Players</p>
                    <p className="mt-1 text-lg font-semibold">
                      {server.online && server.playerCount !== null ? server.playerCount : "—"}
                      {server.maxPlayers !== null ? ` / ${server.maxPlayers}` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="kicker">Map</p>
                    <p className="mt-1 font-semibold">{server.mapName || "Not reported"}</p>
                  </div>
                </div>
                {server.online && server.lastHeartbeat && (
                  <p className="mt-5 text-xs text-[var(--muted)]">
                    Last heartbeat: {new Date(server.lastHeartbeat).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
