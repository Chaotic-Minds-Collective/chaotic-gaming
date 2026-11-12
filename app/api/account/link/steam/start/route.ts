import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "cg_session";
const STATE_COOKIE = "cg_steam_link_state";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  if (!cookieStore.get(SESSION_COOKIE)?.value) {
    return NextResponse.redirect(new URL("/account/login?next=%2Faccount", request.url));
  }

  const callbackValue = process.env.STEAM_OPENID_RETURN_URL;
  if (!callbackValue) {
    return NextResponse.redirect(new URL("/account?steam=unavailable", request.url));
  }

  let callbackUrl: URL;
  try {
    callbackUrl = new URL(callbackValue);
  } catch {
    return NextResponse.redirect(new URL("/account?steam=misconfigured", request.url));
  }

  const requestOrigin = new URL(request.url).origin;
  if (callbackUrl.protocol !== "https:" || callbackUrl.origin !== requestOrigin || callbackUrl.search) {
    return NextResponse.redirect(new URL("/account?steam=misconfigured", request.url));
  }

  const state = randomBytes(32).toString("base64url");
  const returnTo = new URL(callbackUrl);
  returnTo.searchParams.set("state", state);

  const steamUrl = new URL("https://steamcommunity.com/openid/login");
  steamUrl.search = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo.toString(),
    "openid.realm": callbackUrl.origin + "/",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  }).toString();

  const response = NextResponse.redirect(steamUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/account/link/steam",
    maxAge: 600,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
