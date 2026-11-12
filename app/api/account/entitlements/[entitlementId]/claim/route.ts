import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

export async function POST(
  _request: Request,
  context: { params: Promise<{ entitlementId: string }> }
) {
  const { entitlementId } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entitlementId)) {
    return NextResponse.json({ error: { code: "INVALID_ENTITLEMENT_ID", message: "The entitlement ID is invalid." } }, { status: 400 });
  }

  const token = (await cookies()).get("cg_session")?.value;
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Sign in to claim this item." } }, { status: 401 });
  }

  try {
    const response = await coreApiFetch(
      "/account/entitlements/" + encodeURIComponent(entitlementId) + "/claim",
      { method: "POST" },
      token
    );
    const payload = await parseCoreResponse(response);
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: { code: "CORE_UNAVAILABLE", message: "The delivery service is temporarily unavailable." } }, { status: 503 });
  }
}
