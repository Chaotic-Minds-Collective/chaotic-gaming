import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { coreApiFetch } from "@/lib/core-api";

export const runtime = "nodejs";

const SESSION_COOKIE = "cg_session";
const STATE_COOKIE = "cg_discord_link_state";

function redirectToAccount(request: NextRequest, result: string) {
  const response = NextResponse.redirect(new URL("/account?discord=" + encodeURIComponent(result), request.url));
  response.cookies.set(STATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/account/link/discord",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  if (url.searchParams.has("error")) return redirectToAccount(request, "cancelled");

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE)?.value;
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const issuer = url.searchParams.get("iss");
  const [storedState, storedSessionBinding] = stateCookie?.split(".") ?? [];

  if (
    !state || !code || !issuer
    || !/^[A-Za-z0-9_-]{43}$/.test(state)
    || code.length > 2048
    || !storedState || !storedSessionBinding
    || Buffer.byteLength(state) !== Buffer.byteLength(storedState)
    || Buffer.byteLength(storedSessionBinding) !== 64
  ) {
    return redirectToAccount(request, "state-error");
  }

  if (!sessionToken) {
    const response = NextResponse.redirect(new URL("/account/login?next=%2Faccount", request.url));
    response.cookies.set(STATE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/account/link/discord",
      maxAge: 0,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const sessionBinding = createHash("sha256").update(sessionToken).digest("hex");
  if (
    issuer !== "https://discord.com"
    || !timingSafeEqual(Buffer.from(state), Buffer.from(storedState))
    || !timingSafeEqual(Buffer.from(sessionBinding), Buffer.from(storedSessionBinding))
  ) {
    return redirectToAccount(request, "state-error");
  }

  try {
    const upstream = await coreApiFetch("/auth/linked-accounts/discord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state, iss: issuer }),
    }, sessionToken);
    if (upstream.ok) return redirectToAccount(request, "linked");
    if (upstream.status === 503) return redirectToAccount(request, "unavailable");
    return redirectToAccount(request, "failed");
  } catch {
    return redirectToAccount(request, "unavailable");
  }
}
