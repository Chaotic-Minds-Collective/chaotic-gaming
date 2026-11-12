import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

export async function GET() {
  const token = (await cookies()).get("cg_session")?.value;
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Sign in to view your items." } }, { status: 401 });
  }

  try {
    const upstream = await coreApiFetch("/account/entitlements", {}, token);
    const payload = await parseCoreResponse(upstream);
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: { code: "ACCOUNT_SERVICE_UNAVAILABLE", message: "Your items are temporarily unavailable." } }, { status: 503 });
  }
}
