import { NextResponse } from "next/server";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

export async function GET() {
  try {
    const upstream = await coreApiFetch("/servers");
    const payload = await parseCoreResponse(upstream);
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: { code: "SERVER_STATUS_UNAVAILABLE", message: "Server status is temporarily unavailable." } }, { status: 503 });
  }
}
