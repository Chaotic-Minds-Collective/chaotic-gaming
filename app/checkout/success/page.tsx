import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto min-h-[60vh] max-w-3xl px-6 py-20">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Chaotic Minds Gaming</p>
      <h1 className="mt-3 text-4xl font-bold">Checkout submitted</h1>
      <p className="mt-5 text-white/70">
        Stripe returned you to Chaotic Minds Gaming. Core verifies the signed payment notification before marking an order paid or granting any items. Your account may take a short moment to update.
      </p>
      <p className="mt-3 text-sm text-white/55">
        The return page itself does not confirm payment and cannot grant entitlements.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950" href="/account">
          View my account
        </Link>
        <Link className="rounded-lg border border-white/20 px-5 py-3 font-semibold" href="/store">
          Return to store
        </Link>
      </div>
    </main>
  );
}
