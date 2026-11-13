/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Browsers probe /favicon.ico by default; serve the Glitch icon there.
      // Temporary redirect so a real .ico can replace it later without cache pain.
      {
        source: "/favicon.ico",
        destination: "/glitch-icon.png",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
