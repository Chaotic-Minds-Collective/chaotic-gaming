import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { coreApiFetch, parseCoreResponse, isInvalidCoreResponse } from "@/lib/core-api";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cg_session")?.value;
  if (!token) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Sign in to view your account." } }, { status: 401 });

  try {
    const upstream = await coreApiFetch("/auth/me", {}, token);
    const payload = await parseCoreResponse(upstream);
    return NextResponse.json(payload, { status: isInvalidCoreResponse(payload) ? 502 : upstream.status });
  } catch {
    return NextResponse.json({ error: { code: "ACCOUNT_SERVICE_UNAVAILABLE", message: "Account information is temporarily unavailable." } }, { status: 503 });
  }
}
