import { NextResponse } from "next/server";
import {
  callCoreApi,
  forwardCoreResponse,
  getSessionToken,
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
  const result = await callCoreApi("/auth/discord-link/challenge", { method: "POST", token });
  return forwardCoreResponse(result);
}
