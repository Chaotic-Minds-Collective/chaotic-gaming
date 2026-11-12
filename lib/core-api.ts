import "server-only";

const TIMEOUT_MS = 8_000;

function getCoreOrigin(): string {
  const value = process.env.CORE_API_BASE_URL?.trim();
  if (!value) throw new Error("Core API is not configured.");

  const parsed = new URL(value);
  const localHttp = parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" && !localHttp) {
    throw new Error("Core API must use HTTPS outside localhost.");
  }
  return parsed.origin;
}

export async function coreApiFetch(
  path: string,
  init: RequestInit = {},
  sessionToken?: string
): Promise<Response> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Invalid Core API path.");
  }

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (sessionToken) headers.set("Authorization", `Bearer ${sessionToken}`);

  return fetch(new URL(path, getCoreOrigin()), {
    ...init,
    headers,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

export async function parseCoreResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: { code: "INVALID_CORE_RESPONSE", message: "The account service returned an invalid response." } };
  }
}

export function isInvalidCoreResponse(payload: unknown): boolean {
  return typeof payload === "object" && payload !== null
    && "error" in payload && typeof payload.error === "object" && payload.error !== null
    && "code" in payload.error && payload.error.code === "INVALID_CORE_RESPONSE";
}

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

export async function getCoreServerCatalog(): Promise<CoreServerCatalogResult> {
  if (!process.env.CORE_API_BASE_URL?.trim()) {
    return { configured: false, available: false, servers: [] };
  }

  try {
    const response = await coreApiFetch("/servers");
    if (!response.ok) return { configured: true, available: false, servers: [] };
    const payload = await parseCoreResponse(response) as { data?: unknown } | null;
    if (!payload || !Array.isArray(payload.data)) {
      return { configured: true, available: false, servers: [] };
    }

    const servers = payload.data.flatMap((item): CoreServerStatus[] => {
      if (!item || typeof item !== "object") return [];
      const server = item as Record<string, unknown>;
      if (typeof server.id !== "string" || typeof server.name !== "string"
        || typeof server.gameKey !== "string" || typeof server.online !== "boolean") return [];
      return [{
        id: server.id,
        name: server.name,
        gameKey: server.gameKey,
        clusterName: typeof server.clusterName === "string" ? server.clusterName : null,
        online: server.online,
        playerCount: Number.isInteger(server.playerCount) ? server.playerCount as number : null,
        maxPlayers: Number.isInteger(server.maxPlayers) ? server.maxPlayers as number : null,
        mapName: typeof server.mapName === "string" ? server.mapName : null,
        publicHostname: typeof server.publicHostname === "string" ? server.publicHostname : null,
        gamePort: Number.isInteger(server.gamePort) ? server.gamePort as number : null,
        lastHeartbeat: typeof server.lastHeartbeat === "string" ? server.lastHeartbeat : null
      }];
    });

    if (payload.data.length > 0 && servers.length === 0) {
      return { configured: true, available: false, servers: [] };
    }
    return { configured: true, available: true, servers };
  } catch {
    return { configured: true, available: false, servers: [] };
  }
}
