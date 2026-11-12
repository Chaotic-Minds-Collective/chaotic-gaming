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
