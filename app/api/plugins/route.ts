import { NextResponse } from "next/server";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

export async function GET() {
  try {
    const upstream = await coreApiFetch("/plugins");
    const payload = await parseCoreResponse(upstream);
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: { code: "PLUGIN_CATALOG_UNAVAILABLE", message: "The mod catalogue is temporarily unavailable." } }, { status: 503 });
  }
}
