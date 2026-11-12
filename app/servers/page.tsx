import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

type Server = {
  id: string;
  name: string;
  gameKey: string;
  clusterName: string;
  online: boolean;
  playerCount: number | null;
  serverVersion: string | null;
  lastHeartbeat: string | null;
};

const gameNames: Record<string, string> = {
  atlas: "ATLAS",
  "7dtd": "7 Days to Die",
  ark: "ARK: Survival Evolved",
};

export const dynamic = "force-dynamic";

export default async function ServersPage() {
  let servers: Server[] = [];
  let unavailable = false;

  try {
    const response = await coreApiFetch("/servers");
    if (response.ok) {
      const payload = await parseCoreResponse(response) as { data?: Server[] };
      servers = payload.data ?? [];
    } else {
      unavailable = true;
    }
  } catch {
    unavailable = true;
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Chaotic Gaming</p>
      <h1 className="mt-3 text-4xl font-bold">Game servers</h1>
      <p className="mt-3 max-w-2xl text-white/65">
        Live status for the Chaotic Gaming network. Status is refreshed by connected server monitors.
      </p>

      {unavailable ? (
        <section className="mt-8 rounded-xl border border-amber-400/30 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Server status unavailable</h2>
          <p className="mt-2 text-white/65">The server status service is not connected yet.</p>
        </section>
      ) : servers.length === 0 ? (
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">No public servers registered yet</h2>
          <p className="mt-2 text-white/65">Game servers will appear here when their production registrations and monitoring are ready.</p>
        </section>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <article key={server.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wider text-cyan-300">{gameNames[server.gameKey] || server.gameKey}</p>
                <span className={server.online ? "text-xs font-semibold text-cyan-300" : "text-xs font-semibold text-rose-400"}>
                  {server.online ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold">{server.name}</h2>
              <p className="mt-1 text-sm text-white/55">{server.clusterName}</p>
              {server.online && server.playerCount !== null && (
                <p className="mt-4 text-sm text-white/75">{server.playerCount} players online</p>
              )}
              <p className="mt-4 text-xs text-white/40">
                {server.lastHeartbeat ? `Last heartbeat: ${new Date(server.lastHeartbeat).toLocaleString()}` : "Waiting for first heartbeat"}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
