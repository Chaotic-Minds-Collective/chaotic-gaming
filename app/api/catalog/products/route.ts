import { NextRequest, NextResponse } from "next/server";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

export async function GET(request: NextRequest) {
  const currency = (request.nextUrl.searchParams.get("currency") || "USD").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    return NextResponse.json({ error: { code: "INVALID_CURRENCY", message: "Currency must be a three-letter code." } }, { status: 400 });
  }

  try {
    const upstream = await coreApiFetch(`/catalog/products?currency=${encodeURIComponent(currency)}`);
    const payload = await parseCoreResponse(upstream);
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: { code: "CATALOG_UNAVAILABLE", message: "The store catalog is temporarily unavailable." } }, { status: 503 });
  }
}
