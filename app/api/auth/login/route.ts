import { NextResponse } from "next/server";
import {
  callCoreApi,
  isRecord,
  requestHasSameOrigin,
  setSessionCookie,
} from "@/lib/server/core-api";

export async function POST(request: Request) {
  if (!requestHasSameOrigin(request)) {
    return NextResponse.json({ error: { code: "ORIGIN_FORBIDDEN", message: "Request origin is not allowed." } }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body)) {
    return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Enter your username and password." } }, { status: 400 });
  }

  const result = await callCoreApi("/auth/login", { method: "POST", body });
  if (result.status >= 400) {
    const { forwardCoreResponse } = await import("@/lib/server/core-api");
    return forwardCoreResponse(result);
  }

  const envelope = isRecord(result.body) ? result.body : {};
  const data = isRecord(envelope.data) ? envelope.data : {};
  const session = isRecord(data.session) ? data.session : {};
  if (typeof session.token !== "string" || typeof session.expiresAt !== "string") {
    return NextResponse.json({ error: { code: "INVALID_CORE_SESSION", message: "Account services returned an invalid session." } }, { status: 502 });
  }

  try {
    await setSessionCookie(session.token, session.expiresAt);
  } catch {
    return NextResponse.json({ error: { code: "SESSION_SETUP_FAILED", message: "Sign-in could not be completed. Please try again." } }, { status: 502 });
  }

  return NextResponse.json({
    data: {
      playerId: typeof data.playerId === "string" ? data.playerId : null,
      username: typeof data.username === "string" ? data.username : null,
    },
    requestId: typeof envelope.requestId === "string" ? envelope.requestId : undefined,
  }, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
