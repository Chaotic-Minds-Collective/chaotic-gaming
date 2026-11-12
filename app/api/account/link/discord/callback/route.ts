import { createHash, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

function getCoreOrigin(): string {
  const raw = process.env.CORE_API_BASE_URL?.trim();
  if (!raw) throw new Error("Core API is not configured.");
  const url = new URL(raw);
  const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if ((url.protocol !== "https:" && !localHttp) || url.username || url.password) {
    throw new Error("Core API URL is invalid.");
  }
  return url.origin;
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

  if (!stateCookie || stateCookie.length > 2048 || !state || !code || code.length > 2048
    || !/^[A-Za-z0-9_-]{43}$/.test(state)
    || (issuer && issuer !== "https://discord.com")) {
    return redirectToAccount(request, "state-error");
  }

  let binding: {
    state?: string;
    cookieName?: string;
    bindingValue?: string;
    sessionBinding?: string;
  };
  try {
    binding = JSON.parse(Buffer.from(stateCookie, "base64url").toString("utf8"));
  } catch {
    return redirectToAccount(request, "state-error");
  }

  if (
    binding.cookieName !== "__Host-discord-link" && binding.cookieName !== "discord-link"
    || typeof binding.bindingValue !== "string"
    || !/^[A-Za-z0-9_-]{43}$/.test(binding.bindingValue)
    || typeof binding.sessionBinding !== "string"
    || !/^[a-f0-9]{64}$/.test(binding.sessionBinding)
    || typeof binding.state !== "string"
    || Buffer.byteLength(state) !== Buffer.byteLength(binding.state)
  ) {
    return redirectToAccount(request, "state-error");
  }

  const sessionBinding = createHash("sha256").update(sessionToken).digest("hex");
  if (
    !timingSafeEqual(Buffer.from(state), Buffer.from(binding.state))
    || !timingSafeEqual(Buffer.from(sessionBinding), Buffer.from(binding.sessionBinding))
  ) {
    return redirectToAccount(request, "state-error");
  }

  try {
    const coreUrl = new URL("/auth/discord-link/callback", getCoreOrigin());
    coreUrl.searchParams.set("code", code);
    coreUrl.searchParams.set("state", state);
    const coreResponse = await fetch(coreUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: `${binding.cookieName}=${binding.bindingValue}`,
      },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(8_000),
    });

    const location = coreResponse.headers.get("location");
    if (coreResponse.status >= 300 && coreResponse.status < 400 && location) {
      const target = new URL(location, request.url);
      const currentOrigin = new URL(request.url).origin;
      const canonicalHosts = ["www.chaoticmindsgaming.com", "chaoticmindsgaming.com"];
      const sameSite = target.origin === currentOrigin
        || (target.protocol === "https:" && canonicalHosts.includes(target.hostname));
      if (sameSite && target.pathname.startsWith("/account")) {
        const response = NextResponse.redirect(target);
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
      return redirectToAccount(request, "linked");
    }

    if (coreResponse.ok) return redirectToAccount(request, "linked");
    if (coreResponse.status >= 500) return redirectToAccount(request, "unavailable");
    return redirectToAccount(request, "failed");
  } catch {
    return redirectToAccount(request, "unavailable");
  }
}
