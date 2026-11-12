import Link from "next/link";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

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

export default async function StorePage() {
  let products: Product[] = [];
  let unavailable = false;

  try {
    const response = await coreApiFetch("/catalog/products?currency=USD");
    if (response.ok) {
      const payload = await parseCoreResponse(response) as { data?: Product[] };
      products = payload.data ?? [];
    } else {
      unavailable = true;
    }
  } catch {
    unavailable = true;
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Chaotic Gaming</p>
      <h1 className="mt-3 text-4xl font-bold">Player store</h1>
      <p className="mt-3 max-w-2xl text-white/65">
        Digital items and game entitlements will be managed through your shared player account.
      </p>

      {unavailable ? (
        <section className="mt-8 rounded-xl border border-amber-400/30 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Store service unavailable</h2>
          <p className="mt-2 text-white/65">The player store is not connected to the Core service yet.</p>
        </section>
      ) : products.length === 0 ? (
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">The catalog is being prepared</h2>
          <p className="mt-2 text-white/65">No products are currently listed. No purchases or charges are available yet.</p>
        </section>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-wider text-cyan-300">{product.productType.replaceAll("_", " ")}</p>
              <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
              {product.description && <p className="mt-2 text-sm text-white/65">{product.description}</p>}
              <p className="mt-5 text-lg font-bold">{(Number(product.amountMinor) / 100).toLocaleString("en-US", { style: "currency", currency: product.currency })}</p>
              <p className="mt-2 text-xs text-white/45">Checkout is not enabled yet.</p>
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
