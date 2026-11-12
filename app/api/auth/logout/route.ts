import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { coreApiFetch } from "@/lib/core-api";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("cg_session")?.value;

  let revocationUnconfirmed = false;

  if (token) {
    try {
      const upstream = await coreApiFetch("/auth/logout", { method: "POST" }, token);
      if (!upstream.ok && upstream.status !== 401) {
        return NextResponse.json({ error: { code: "LOGOUT_FAILED", message: "Sign out could not be confirmed. Please try again." } }, { status: 503 });
      }
    } catch {
      // Preserve local sign-out while reporting that Core revocation is unknown.
      revocationUnconfirmed = true;
    }
  }

  const response = NextResponse.redirect(new URL(revocationUnconfirmed ? "/account?logout=unconfirmed" : "/account", request.url), 303);
  response.cookies.set("cg_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
