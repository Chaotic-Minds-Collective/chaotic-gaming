"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function DiscordCallbackPage() {
  const router = useRouter();
  const started = useRef(false);
  const [message, setMessage] = useState("Verifying your Discord account…");
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function finishLink() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const issuer = params.get("iss");
      const denied = params.get("error");

      // Remove the short-lived authorization code from the visible URL/history.
      window.history.replaceState(null, "", window.location.pathname);

      if (denied) {
        setError("Discord authorization was cancelled or denied.");
        return;
      }
      if (!code || !state || !issuer) {
        setError("The Discord callback is incomplete. Start the linking process again.");
        return;
      }

      try {
        const response = await fetch("/api/auth/discord/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state, iss: issuer }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message || "Discord could not be linked.");
        setMessage("Discord is linked. Returning to your player account…");
        router.replace("/account");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Discord linking could not be completed.");
      }
    }

    void finishLink();
  }, [router]);

  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-xl card">
        <p className="kicker">Identity verification</p>
        <h1 className="section-title mt-3">Discord account link</h1>
        {error ? (
          <>
            <p role="alert" className="mt-6 border border-red-400/40 bg-red-950/30 p-4 text-sm text-red-200">{error}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/account" className="btn-cta">Back to account</Link>
              <Link href="/account/login" className="btn-ghost">Sign in</Link>
            </div>
          </>
        ) : (
          <p aria-live="polite" className="mt-6 text-[var(--muted)]">{message}</p>
        )}
      </div>
    </section>
  );
}
