export type CoreGameKey = "atlas" | "7dtd" | "ark";

export interface CoreServer {
  id: string;
  name: string;
  gameKey: CoreGameKey;
  clusterName: string;
  online: boolean;
  playerCount: number | null;
  maxPlayers: number | null;
  publicHostname: string | null;
  gamePort: number | null;
  mapName: string | null;
  lastHeartbeat: string | null;
}

interface CoreServerResponse {
  data?: unknown;
}

function isCoreServer(value: unknown): value is CoreServer {
  if (typeof value !== "object" || value === null) return false;
  const server = value as Record<string, unknown>;
  return typeof server.id === "string"
    && typeof server.name === "string"
    && (server.gameKey === "atlas" || server.gameKey === "7dtd" || server.gameKey === "ark")
    && typeof server.clusterName === "string"
    && typeof server.online === "boolean";
}

/**
 * Reads the public Core server registry. Returns null when Core is not
 * configured or unavailable so the website can retain its static fallback.
 */
export async function getCoreServers(): Promise<CoreServer[] | null> {
  const configuredUrl = process.env.CORE_API_URL?.trim();
  if (!configuredUrl) return null;

  try {
    const base = new URL(configuredUrl);
    const localHttp = base.protocol === "http:" && ["localhost", "127.0.0.1"].includes(base.hostname);
    if (base.protocol !== "https:" && !localHttp) return null;

    const response = await fetch(new URL("/servers", base), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return null;

    const payload = await response.json() as CoreServerResponse;
    if (!Array.isArray(payload.data)) return null;
    return payload.data.filter(isCoreServer);
  } catch {
    return null;
  }
}
