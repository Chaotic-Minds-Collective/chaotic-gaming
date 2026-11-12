import Link from "next/link";
import { cookies } from "next/headers";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";

type Player = {
  id: string;
  username: string;
  displayName: string | null;
  status: string;
  createdAt: string;
};

type Entitlement = {
  id: string;
  status: string;
  grantedAt: string;
  expiresAt: string | null;
  sku: string;
  name: string;
  productType: string;
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const token = (await cookies()).get("cg_session")?.value;
  let player: Player | null = null;
  let entitlements: Entitlement[] = [];
  let accountUnavailable = false;

  if (token) {
    try {
      const [profileResponse, entitlementResponse] = await Promise.all([
        coreApiFetch("/auth/me", {}, token),
        coreApiFetch("/account/entitlements", {}, token),
      ]);
      if (profileResponse.ok) {
        const payload = await parseCoreResponse(profileResponse) as { data?: Player };
        player = payload.data ?? null;
      }
      if (entitlementResponse.ok) {
        const payload = await parseCoreResponse(entitlementResponse) as { data?: Entitlement[] };
        entitlements = payload.data ?? [];
      } else {
        accountUnavailable = true;
      }
    } catch {
      accountUnavailable = true;
    }
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Chaotic Gaming</p>
      <h1 className="mt-3 text-4xl font-bold">Player account</h1>
      {player ? (
        <>
          <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">{player.displayName || player.username}</h2>
            <p className="mt-2 text-sm text-white/60">@{player.username}</p>
            <p className="mt-4 text-sm text-white/70">Account status: {player.status}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-lg border border-cyan-400 px-4 py-2 font-semibold text-cyan-300" href="/store">Player store</Link>
              <form action="/api/auth/logout" method="post">
                <button className="rounded-lg border border-white/20 px-4 py-2 font-semibold" type="submit">Sign out</button>
              </form>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">My items and entitlements</h2>
            {accountUnavailable ? (
              <p className="mt-3 text-sm text-white/60">Your entitlements are temporarily unavailable.</p>
            ) : entitlements.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">You do not have any active items yet.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {entitlements.map((item) => (
                  <article key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="mt-1 text-xs text-white/55">{item.productType.replaceAll("_", " ")} · {item.status}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/70">Sign in or create an account to access player features.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950" href="/account/login">Sign in</Link>
            <Link className="rounded-lg border border-white/20 px-5 py-3 font-semibold" href="/account/register">Create account</Link>
          </div>
        </section>
      )}
    </main>
  );
}
