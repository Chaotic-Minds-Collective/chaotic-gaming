import { NextResponse } from "next/server";
import {
  callCoreApi,
  clearSessionCookie,
  forwardCoreResponse,
  getSessionToken,
} from "@/lib/server/core-api";

export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Sign in to continue." } }, { status: 401 });
  }
  const result = await callCoreApi("/auth/linked-accounts", { token });
  if (result.status === 401) await clearSessionCookie();
  return forwardCoreResponse(result);
}
