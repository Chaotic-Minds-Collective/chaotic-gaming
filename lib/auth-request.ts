import { NextRequest, NextResponse } from "next/server";

export function validateAuthRequest(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site"
    || (origin !== null && origin !== new URL(request.url).origin)) {
    return NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "A same-origin request is required." } }, { status: 403 });
  }
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return NextResponse.json({ error: { code: "INVALID_CONTENT_TYPE", message: "A JSON request is required." } }, { status: 415 });
  }
  return null;
}
