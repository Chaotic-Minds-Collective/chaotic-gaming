import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

export const runtime = "nodejs";

const SESSION_COOKIE = "cg_session";
const STATE_COOKIE = "cg_discord_link_state";
const CALLBACK_PATH = "/api/account/link/discord/callback";

function redirectToAccount(request: NextRequest, result: string) {
  return NextResponse.redirect(new URL("/account?discord=" + encodeURIComponent(result), request.url));
}

function getSetCookieHeaders(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/account/login?next=%2Faccount", request.url));
  }

  try {
    const challengeResponse = await coreApiFetch("/auth/discord-link/challenge", {
      method: "POST",
    }, sessionToken);
    if (!challengeResponse.ok) return redirectToAccount(request, "unavailable");

    const payload = await parseCoreResponse(challengeResponse) as {
      data?: { authorizationUrl?: string };
    };
    const authorizationUrl = payload.data?.authorizationUrl;
    if (!authorizationUrl) return redirectToAccount(request, "misconfigured");

    const discordUrl = new URL(authorizationUrl);
    const state = discordUrl.searchParams.get("state");
    const redirectUri = discordUrl.searchParams.get("redirect_uri");
    if (
      discordUrl.origin !== "https://discord.com"
      || discordUrl.pathname !== "/oauth2/authorize"
      || discordUrl.searchParams.get("scope") !== "identify"
      || discordUrl.searchParams.get("response_type") !== "code"
      || !state
      || !/^[A-Za-z0-9_-]{43}$/.test(state)
      || !redirectUri
    ) {
      return redirectToAccount(request, "misconfigured");
    }

    const callback = new URL(redirectUri);
    const allowedHosts = ["www.chaoticmindsgaming.com", "chaoticmindsgaming.com"];
    const localHosts = ["localhost", "127.0.0.1", "::1"];
    const callbackIsSecure = callback.protocol === "https:" && allowedHosts.includes(callback.hostname);
    const callbackIsLocal = callback.protocol === "http:" && localHosts.includes(callback.hostname);
    if (callback.pathname !== CALLBACK_PATH || (!callbackIsSecure && !callbackIsLocal)) {
      return redirectToAccount(request, "misconfigured");
    }

    const setCookieHeaders = getSetCookieHeaders(challengeResponse);
    const expectedCookieName = setCookieHeaders
      .map((value) => value.split(";", 1)[0])
      .map((pair) => pair.slice(0, pair.indexOf("=")))
      .find((name) => name === "__Host-discord-link" || name === "discord-link");
    const cookiePair = setCookieHeaders
      .map((value) => value.split(";", 1)[0])
      .find((pair) => pair.startsWith((expectedCookieName || "") + "="));
    if (!expectedCookieName || !cookiePair) return redirectToAccount(request, "unavailable");

    const bindingValue = cookiePair.slice(cookiePair.indexOf("=") + 1);
    if (!/^[A-Za-z0-9_-]{43}$/.test(bindingValue)) return redirectToAccount(request, "unavailable");

    const sessionBinding = createHash("sha256").update(sessionToken).digest("hex");
    const stateCookieValue = Buffer.from(JSON.stringify({
      state,
      cookieName: expectedCookieName,
      bindingValue,
      sessionBinding,
    })).toString("base64url");

    const response = NextResponse.redirect(discordUrl);
    response.cookies.set(STATE_COOKIE, stateCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/account/link/discord",
      maxAge: 600,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return redirectToAccount(request, "unavailable");
  }
}
