"use client";

import { useState } from "react";

export default function EntitlementClaimButton({ entitlementId }: { entitlementId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/account/entitlements/" + encodeURIComponent(entitlementId) + "/claim", {
        method: "POST"
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(typeof payload?.error?.message === "string" ? payload.error.message : "The delivery request could not be queued.");
        return;
      }
      window.location.reload();
    } catch {
      setError("The delivery service is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={claim}
        disabled={loading}
        className="rounded-lg border border-cyan-400 px-3 py-2 text-xs font-semibold text-cyan-300 disabled:opacity-60"
      >
        {loading ? "Queueing delivery…" : "Claim in game"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-amber-200">{error}</p>}
    </div>
  );
}
