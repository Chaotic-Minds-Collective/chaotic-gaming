import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { coreApiFetch } from "@/lib/core-api";

const SESSION_COOKIE = "cg_session";
const STATE_COOKIE = "cg_steam_link_state";

function redirectToAccount(request: NextRequest, result: string) {
  const response = NextResponse.redirect(new URL("/account?steam=" + encodeURIComponent(result), request.url));
  response.cookies.set(STATE_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/account/link/steam",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const callbackUrl = process.env.STEAM_OPENID_RETURN_URL;
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE)?.value;
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const [storedState, storedSessionBinding] = stateCookie?.split(".") ?? [];

  if (!state || !storedState || !storedSessionBinding || state.length !== storedState.length || storedSessionBinding.length !== 64) {
    return redirectToAccount(request, "state-error");
  }
  if (!sessionToken) {
    const response = NextResponse.redirect(new URL("/account/login?next=%2Faccount", request.url));
    response.cookies.set(STATE_COOKIE, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/account/link/steam",
      maxAge: 0,
    });
    return response;
  }
  const sessionBinding = createHash("sha256").update(sessionToken).digest("hex");
  if (
    !timingSafeEqual(Buffer.from(state), Buffer.from(storedState))
    || !timingSafeEqual(Buffer.from(sessionBinding), Buffer.from(storedSessionBinding))
  ) {
    return redirectToAccount(request, "state-error");
  }
  if (!callbackUrl) return redirectToAccount(request, "unavailable");

  const assertion = Object.fromEntries(
    [...url.searchParams.entries()].filter(([key]) => key.startsWith("openid."))
  );
  const returnToValue = assertion["openid.return_to"];
  try {
    const expected = new URL(callbackUrl);
    const returnTo = new URL(returnToValue);
    if (
      returnTo.origin !== expected.origin
      || returnTo.pathname !== expected.pathname
      || returnTo.searchParams.size !== 1
      || returnTo.searchParams.get("state") !== state
    ) {
      return redirectToAccount(request, "state-error");
    }
  } catch {
    return redirectToAccount(request, "state-error");
  }

  try {
    const response = await coreApiFetch("/auth/linked-accounts/steam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, assertion }),
    }, sessionToken);
    return redirectToAccount(request, response.ok ? "linked" : "failed");
  } catch {
    return redirectToAccount(request, "unavailable");
  }
}
