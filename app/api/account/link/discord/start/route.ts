import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

export const runtime = "nodejs";

const SESSION_COOKIE = "cg_session";
const STATE_COOKIE = "cg_discord_link_state";

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
    if (!challengeResponse.ok) {
      return NextResponse.redirect(new URL("/account?discord=unavailable", request.url));
    }

    const payload = await parseCoreResponse(challengeResponse) as {
      data?: { state?: string; authorizationUrl?: string };
    };
    const state = payload.data?.state;
    const authorizationUrl = payload.data?.authorizationUrl;
    if (!state || !/^[A-Za-z0-9_-]{43}$/.test(state) || !authorizationUrl) {
      return NextResponse.redirect(new URL("/account?discord=unavailable", request.url));
    }

    const discordUrl = new URL(authorizationUrl);
    if (
      discordUrl.origin !== "https://discord.com"
      || discordUrl.pathname !== "/oauth2/authorize"
      || discordUrl.searchParams.get("state") !== state
      || discordUrl.searchParams.get("scope") !== "identify"
      || discordUrl.searchParams.get("response_type") !== "code"
    ) {
      return NextResponse.redirect(new URL("/account?discord=misconfigured", request.url));
    }

    const response = NextResponse.redirect(discordUrl);
    const sessionBinding = createHash("sha256").update(sessionToken).digest("hex");
    response.cookies.set(STATE_COOKIE, state + "." + sessionBinding, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/account/link/discord",
      maxAge: 600,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/account?discord=unavailable", request.url));
  }
}
