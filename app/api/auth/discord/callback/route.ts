import { NextResponse } from "next/server";
import {
  callCoreApi,
  forwardCoreResponse,
  getSessionToken,
  isRecord,
  requestHasSameOrigin,
} from "@/lib/server/core-api";

export async function POST(request: Request) {
  if (!requestHasSameOrigin(request)) {
    return NextResponse.json({ error: { code: "ORIGIN_FORBIDDEN", message: "Request origin is not allowed." } }, { status: 403 });
  }
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Sign in before linking Discord." } }, { status: 401 });
  }
  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body)) {
    return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "The Discord callback is invalid." } }, { status: 400 });
  }
  const result = await callCoreApi("/auth/linked-accounts/discord", { method: "POST", token, body });
  return forwardCoreResponse(result);
}
