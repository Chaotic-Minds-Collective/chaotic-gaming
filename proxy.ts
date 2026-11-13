import { NextResponse, type NextRequest } from "next/server";
import { buildCsp } from "./lib/csp";

export function proxy(request: NextRequest) {
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));
  const contentSecurityPolicy = buildCsp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static(?:/|$)|_next/image(?:/|$)|favicon\\.ico$|.*\\.(?:avif|bmp|css|csv|eot|gif|html?|ico|jpe?g|js|json|map|mp[34]|pdf|png|svg|txt|wasm|webmanifest|webm|webp|woff2?|ttf|xml|zip)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
