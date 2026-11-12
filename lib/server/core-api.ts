import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "cg_session";
const REQUEST_TIMEOUT_MS = 8_000;

export interface CoreApiResult {
  status: number;
  body: unknown;
}

interface CoreApiOptions {
  method?: "GET" | "POST";
  token?: string | null;
  body?: unknown;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requestHasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function callCoreApi(
  path: string,
  options: CoreApiOptions = {},
): Promise<CoreApiResult> {
  const rawBaseUrl = process.env.CORE_API_BASE_URL?.trim();
  if (!rawBaseUrl) {
    return {
      status: 503,
      body: { error: { code: "CORE_API_NOT_CONFIGURED", message: "Account services are not connected yet." } },
    };
  }

  try {
    const base = new URL(rawBaseUrl);
    const localHttp = base.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(base.hostname);
    if ((base.protocol !== "https:" && !localHttp) || base.username || base.password) {
      return {
        status: 503,
        body: { error: { code: "CORE_API_CONFIGURATION_INVALID", message: "Account services are temporarily unavailable." } },
      };
    }
    if (!path.startsWith("/") || path.startsWith("//")) {
      return {
        status: 400,
        body: { error: { code: "INVALID_CORE_PATH", message: "The account request is invalid." } },
      };
    }

    const url = new URL(path, base.origin);
    if (url.origin !== base.origin) {
      return {
        status: 400,
        body: { error: { code: "INVALID_CORE_PATH", message: "The account request is invalid." } },
      };
    }

    const headers = new Headers({ Accept: "application/json" });
    if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
    let body: string | undefined;
    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      ...(body === undefined ? {} : { body }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 204) return { status: 204, body: null };
    const text = await response.text();
    if (!text) return { status: response.status, body: null };

    try {
      return { status: response.status, body: JSON.parse(text) as unknown };
    } catch {
      return {
        status: 502,
        body: { error: { code: "INVALID_CORE_RESPONSE", message: "Account services returned an invalid response." } },
      };
    }
  } catch {
    return {
      status: 503,
      body: { error: { code: "CORE_API_UNAVAILABLE", message: "Account services are temporarily unavailable." } },
    };
  }
}

export function forwardCoreResponse(result: CoreApiResult): NextResponse {
  if (result.status === 204) {
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  if (result.status >= 400) {
    const body = isRecord(result.body) ? result.body : {};
    const error = isRecord(body.error) ? body.error : {};
    return NextResponse.json({
      error: {
        code: typeof error.code === "string" ? error.code : "CORE_API_ERROR",
        message: typeof error.message === "string" ? error.message : "Account services are temporarily unavailable.",
      },
    }, { status: result.status, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token && /^[A-Za-z0-9_-]{40,128}$/.test(token) ? token : null;
}

export async function setSessionCookie(token: string, expiresAt: string): Promise<void> {
  if (!/^[A-Za-z0-9_-]{40,128}$/.test(token)) {
    throw new Error("Core returned an invalid session token.");
  }
  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
    throw new Error("Core returned an invalid session expiry.");
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}
