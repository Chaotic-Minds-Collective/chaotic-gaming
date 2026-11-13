import Link from "next/link";
import { cookies } from "next/headers";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";
import StorePurchaseButton from "@/components/StorePurchaseButton";

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  productType: string;
  currency: string;
  amountMinor: string;
};

export const dynamic = "force-dynamic";

export default async function StorePage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  let products: Product[] = [];
  let unavailable = false;
  let checkoutEnabled = false;
  const signedIn = Boolean((await cookies()).get("cg_session")?.value);
  const params = await searchParams;
  const checkoutCancelled = params.checkout === "cancelled";

  try {
    const response = await coreApiFetch("/catalog/products?currency=USD");
    if (response.ok) {
      const payload = await parseCoreResponse(response) as { data?: Product[] };
      if (Array.isArray(payload?.data)) products = payload.data;
      else unavailable = true;
    } else {
      unavailable = true;
    }
  } catch {
    unavailable = true;
  }

  if (!unavailable) {
    try {
      const statusResponse = await coreApiFetch("/commerce/checkout/status");
      if (statusResponse.ok) {
        const statusPayload = await parseCoreResponse(statusResponse) as { data?: { enabled?: boolean; mode?: string } };
        checkoutEnabled = statusPayload?.data?.enabled === true && statusPayload.data.mode === "test";
      }
    } catch {
      checkoutEnabled = false;
    }
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Chaotic Minds Gaming</p>
      <h1 className="mt-3 text-4xl font-bold">Player store</h1>
      <p className="mt-3 max-w-2xl text-white/65">
        Digital items and game entitlements are managed through your shared player account.
      </p>

      {checkoutCancelled && (
        <p role="status" className="mt-5 rounded-lg border border-white/15 bg-white/5 p-4 text-sm text-white/70">Checkout was cancelled.</p>
      )}

      {checkoutEnabled ? (
        <p className="mt-5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-100">
          Test checkout is enabled. Purchases use Stripe test mode only; no live payments are accepted.
        </p>
      ) : (
        <p className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          Checkout is not configured yet. You can browse the catalog, but no purchases or charges are available.
        </p>
      )}

      {unavailable ? (
        <section className="mt-8 rounded-xl border border-amber-400/30 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Store service unavailable</h2>
          <p className="mt-2 text-white/65">The player store is not connected to the Core service yet.</p>
        </section>
      ) : products.length === 0 ? (
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">The catalog is being prepared</h2>
          <p className="mt-2 text-white/65">No products are currently listed.</p>
        </section>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-wider text-cyan-300">{product.productType.replaceAll("_", " ")}</p>
              <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
              {product.description && <p className="mt-2 text-sm text-white/65">{product.description}</p>}
              <p className="mt-5 text-lg font-bold">{(Number(product.amountMinor) / 100).toLocaleString("en-US", { style: "currency", currency: product.currency })}</p>
              {checkoutEnabled && signedIn ? (
                <StorePurchaseButton productId={product.id} />
              ) : checkoutEnabled ? (
                <Link className="mt-5 inline-flex rounded-lg border border-cyan-400 px-4 py-2 font-semibold text-cyan-300" href="/account/login">
                  Sign in to purchase
                </Link>
              ) : (
                <p className="mt-5 text-xs text-white/45">Purchases are not enabled.</p>
              )}
            </article>
          ))}
        </div>
      )}

      <p className="mt-8 text-sm text-white/60">
        <Link className="text-cyan-300 underline" href="/account">View your player account</Link>
      </p>
    </main>
  );
}
