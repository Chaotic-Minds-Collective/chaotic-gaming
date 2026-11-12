import { validateAuthRequest } from "@/lib/auth-request";
import { NextRequest, NextResponse } from "next/server";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

const COOKIE_NAME = "cg_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  const invalidRequest = validateAuthRequest(request);
  if (invalidRequest) return invalidRequest;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_JSON", message: "A valid JSON request is required." } }, { status: 400 });
  }

  try {
    const upstream = await coreApiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await parseCoreResponse(upstream) as {
      data?: { playerId?: string; username?: string; session?: { token?: string; expiresAt?: string } };
      error?: unknown;
    };

    if (!upstream.ok) return NextResponse.json(payload, { status: upstream.status });
    const token = payload.data?.session?.token;
    if (!token) return NextResponse.json({ error: { code: "INVALID_CORE_RESPONSE", message: "The account service did not issue a session." } }, { status: 502 });

    const response = NextResponse.json({
      data: {
        playerId: payload.data?.playerId,
        username: payload.data?.username,
        expiresAt: payload.data?.session?.expiresAt,
      },
    }, { status: upstream.status });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ error: { code: "ACCOUNT_SERVICE_UNAVAILABLE", message: "Account registration is temporarily unavailable." } }, { status: 503 });
  }
}
