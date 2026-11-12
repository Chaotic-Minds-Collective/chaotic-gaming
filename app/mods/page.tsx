import Link from "next/link";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

type Plugin = {
  id: string;
  name: string;
  game: string;
  latestVersion: string;
  status: string;
  capabilities: string[];
};

const gameNames: Record<string, string> = {
  platform: "Platform",
  atlas: "ATLAS",
  "7dtd": "7 Days to Die",
  ark: "ARK: Survival Evolved",
};

export const dynamic = "force-dynamic";

export default async function ModsPage() {
  let plugins: Plugin[] = [];
  let unavailable = false;

  try {
    const response = await coreApiFetch("/plugins");
    if (response.ok) {
      const payload = await parseCoreResponse(response) as { data?: Plugin[] };
      plugins = payload.data ?? [];
    } else {
      unavailable = true;
    }
  } catch {
    unavailable = true;
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Chaotic Gaming</p>
      <h1 className="mt-3 text-4xl font-bold">Mods & server plugins</h1>
      <p className="mt-3 max-w-2xl text-white/65">
        Discover server-side features across the game network. Compatibility and installation status will appear as each integration is validated.
      </p>

      {unavailable ? (
        <section className="mt-8 rounded-xl border border-amber-400/30 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Plugin catalogue unavailable</h2>
          <p className="mt-2 text-white/65">The plugin registry is not connected yet.</p>
        </section>
      ) : plugins.length === 0 ? (
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">The catalogue is being built</h2>
          <p className="mt-2 text-white/65">No validated plugins are published yet. Features will appear after compatibility and safety checks.</p>
        </section>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plugins.map((plugin) => (
            <article key={plugin.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wider text-cyan-300">{gameNames[plugin.game] || plugin.game}</p>
                <span className="text-xs text-white/50">{plugin.status}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold">{plugin.name}</h2>
              <p className="mt-2 text-xs text-white/45">{plugin.id} · v{plugin.latestVersion}</p>
              {plugin.capabilities?.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {plugin.capabilities.map((capability) => (
                    <li key={capability} className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/65">{capability}</li>
                  ))}
                </ul>
              )}
              <p className="mt-5 text-xs text-white/45">Catalogue entry only. Installation and downloads are not enabled.</p>
            </article>
          ))}
        </div>
      )}

      <p className="mt-8 text-sm text-white/60"><Link className="text-cyan-300 underline" href="/servers">View game servers</Link></p>
    </main>
  );
}
