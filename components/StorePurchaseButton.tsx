"use client";

import { useState } from "react";

export default function StorePurchaseButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  async function beginCheckout() {
    if (loading) return;
    setLoading(true);
    setError(null);
    const key = idempotencyKey ?? crypto.randomUUID();
    setIdempotencyKey(key);

    try {
      const response = await fetch("/api/commerce/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": key
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || typeof payload?.checkoutUrl !== "string") {
        setError(typeof payload?.error?.message === "string" ? payload.error.message : "Checkout could not be started. Please try again.");
        return;
      }

      const checkoutUrl = new URL(payload.checkoutUrl);
      if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname !== "checkout.stripe.com") {
        setError("The checkout service returned an invalid destination.");
        return;
      }
      window.location.assign(checkoutUrl.toString());
    } catch {
      setError("The checkout service is temporarily unavailable. Your account has not been charged.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={beginCheckout}
        disabled={loading}
        className="inline-flex rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Preparing checkout…" : "Purchase"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-amber-200">{error}</p>}
    </div>
  );
}
