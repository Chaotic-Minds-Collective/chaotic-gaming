import { NextResponse } from "next/server";
import {
  callCoreApi,
  clearSessionCookie,
  getSessionToken,
  requestHasSameOrigin,
} from "@/lib/server/core-api";

export async function POST(request: Request) {
  if (!requestHasSameOrigin(request)) {
    return NextResponse.json({ error: { code: "ORIGIN_FORBIDDEN", message: "Request origin is not allowed." } }, { status: 403 });
  }

  const token = await getSessionToken();
  if (token) await callCoreApi("/auth/logout", { method: "POST", token });
  await clearSessionCookie();
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
