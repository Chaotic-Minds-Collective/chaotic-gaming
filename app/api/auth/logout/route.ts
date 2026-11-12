import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { coreApiFetch } from "@/lib/core-api";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cg_session")?.value;

  if (token) {
    try {
      await coreApiFetch("/auth/logout", { method: "POST" }, token);
    } catch {
      // Clear the browser session even if Core is temporarily unreachable.
    }
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set("cg_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
