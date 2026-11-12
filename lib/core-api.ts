export interface CoreServerStatus {
  id: string;
  name: string;
  gameKey: string;
  clusterName: string | null;
  online: boolean;
  playerCount: number | null;
  maxPlayers: number | null;
  mapName: string | null;
  publicHostname: string | null;
  gamePort: number | null;
  lastHeartbeat: string | null;
}

export type CoreServerCatalogResult =
  | { configured: false; available: false; servers: [] }
  | { configured: true; available: false; servers: [] }
  | { configured: true; available: true; servers: CoreServerStatus[] };

/**
 * Fetch the public, read-only server catalog from Core.
 * This module is server-only: CORE_API_URL is never exposed to browser bundles.
 */
export async function getCoreServerCatalog(): Promise<CoreServerCatalogResult> {
  const baseUrl = process.env.CORE_API_URL?.trim();
  if (!baseUrl) return { configured: false, available: false, servers: [] };

  try {
    const parsed = new URL(baseUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { configured: true, available: false, servers: [] };
    }

    const response = await fetch(new URL("/servers", parsed), {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return { configured: true, available: false, servers: [] };

    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("data" in body) || !Array.isArray(body.data)) {
      return { configured: true, available: false, servers: [] };
    }

    const servers = body.data.filter((item): item is CoreServerStatus => {
      if (!item || typeof item !== "object") return false;
      const server = item as Record<string, unknown>;
      return typeof server.id === "string" &&
        typeof server.name === "string" &&
        typeof server.gameKey === "string" &&
        typeof server.online === "boolean";
    }).map((server) => ({
      id: server.id,
      name: server.name,
      gameKey: server.gameKey,
      clusterName: typeof server.clusterName === "string" ? server.clusterName : null,
      online: server.online,
      playerCount: Number.isInteger(server.playerCount) ? server.playerCount : null,
      maxPlayers: Number.isInteger(server.maxPlayers) ? server.maxPlayers : null,
      mapName: typeof server.mapName === "string" ? server.mapName : null,
      publicHostname: typeof server.publicHostname === "string" ? server.publicHostname : null,
      gamePort: Number.isInteger(server.gamePort) ? server.gamePort : null,
      lastHeartbeat: typeof server.lastHeartbeat === "string" ? server.lastHeartbeat : null
    }));

    return { configured: true, available: true, servers };
  } catch {
    return { configured: true, available: false, servers: [] };
  }
}
