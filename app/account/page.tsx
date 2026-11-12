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

type LinkedAccount = {
  provider: string;
  externalId: string;
  externalUsername: string | null;
  verifiedAt: string | null;
  linkedAt: string;
};

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const steamResult = typeof params.steam === "string" ? params.steam : undefined;
  const token = (await cookies()).get("cg_session")?.value;
  let player: Player | null = null;
  let entitlements: Entitlement[] = [];
  let linkedAccounts: LinkedAccount[] = [];
  let accountUnavailable = false;
  let profileUnauthenticated = false;
  let linkedAccountsUnavailable = false;

  if (token) {
    try {
      const [profileResponse, entitlementResponse, linkedResponse] = await Promise.all([
        coreApiFetch("/auth/me", {}, token),
        coreApiFetch("/account/entitlements", {}, token),
        coreApiFetch("/auth/linked-accounts", {}, token),
      ]);
      if (profileResponse.ok) {
        const payload = await parseCoreResponse(profileResponse) as { data?: Player };
        player = payload?.data ?? null;
        if (!player) accountUnavailable = true;
      } else if (profileResponse.status === 401) {
        profileUnauthenticated = true;
      } else {
        accountUnavailable = true;
      }
      if (entitlementResponse.ok) {
        const payload = await parseCoreResponse(entitlementResponse) as { data?: Entitlement[] };
        if (Array.isArray(payload?.data)) entitlements = payload.data;
        else accountUnavailable = true;
      } else {
        accountUnavailable = true;
      }
      if (linkedResponse.ok) {
        const payload = await parseCoreResponse(linkedResponse) as { data?: LinkedAccount[] };
        if (Array.isArray(payload?.data)) linkedAccounts = payload.data;
        else linkedAccountsUnavailable = true;
      } else {
        linkedAccountsUnavailable = true;
      }
    } catch {
      accountUnavailable = true;
      linkedAccountsUnavailable = true;
    }
  }

  const steamAccount = linkedAccounts.find((account) => account.provider === "steam");

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Chaotic Gaming</p>
      <h1 className="mt-3 text-4xl font-bold">Player account</h1>
      {steamResult === "linked" && <p className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-200">Your Steam account was verified and linked successfully.</p>}
      {steamResult === "state-error" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">The Steam verification session expired or did not match. Please try again.</p>}
      {steamResult === "cancelled" && <p className="mt-4 text-sm text-white/70">Steam linking was cancelled. You can try again.</p>}
      {steamResult === "failed" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">The link request expired, the Steam account may already be linked elsewhere, or verification failed. No account was changed.</p>}
      {steamResult === "unavailable" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">Steam linking is temporarily unavailable. Try again later.</p>}
      {steamResult === "misconfigured" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">Steam linking is not configured for this website yet.</p>}
      {player ? (
        <>
          <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">{player.displayName || player.username}</h2>
            <p className="mt-2 text-sm text-white/60">@{player.username}</p>
            <p className="mt-4 text-sm text-white/70">Account status: {player.status}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-lg border border-cyan-400 px-4 py-2 font-semibold text-cyan-300" href="/store">Player store</Link>
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Linked game accounts</h2>
            <p className="mt-2 text-sm text-white/60">Link verified game identities to connect your website, Discord and game characters.</p>
            {linkedAccountsUnavailable ? (
              <p className="mt-4 text-sm text-white/60">Linked account information is temporarily unavailable.</p>
            ) : steamAccount ? (
              <div className="mt-4 rounded-lg border border-white/10 p-4">
                <p className="font-semibold">Steam <span className="ml-2 text-xs text-cyan-300">{steamAccount.verifiedAt !== null ? "VERIFIED" : "PENDING"}</span></p>
                <p className="mt-1 break-all font-mono text-sm text-white/65">{steamAccount.externalId}</p>
              </div>
            ) : (
              <div className="mt-4">
                <a className="inline-flex rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950" href="/api/account/link/steam/start">Link Steam account</a>
                <p className="mt-2 text-xs text-white/45">You'll verify ownership on Steam before the account is linked.</p>
              </div>
            )}
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
      ) : profileUnauthenticated ? (
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/70">Your session has expired. Sign in again to access player features.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950" href="/account/login">Sign in</Link>
            <Link className="rounded-lg border border-white/20 px-5 py-3 font-semibold" href="/account/register">Create account</Link>
          </div>
        </section>
      ) : accountUnavailable ? (
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/70">Account information is temporarily unavailable.</p>
          <a className="mt-4 inline-block text-cyan-300 underline" href="/account">Retry</a>
        </section>
      ) : (
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/70">Sign in or create an account to access player features.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950" href="/account/login">Sign in</Link>
            <Link className="rounded-lg border border-white/20 px-5 py-3 font-semibold" href="/account/register">Create account</Link>
          </div>
        </section>
      )}
      {token && (
        <form className="mt-6" action="/api/auth/logout" method="post">
          <button className="rounded-lg border border-white/20 px-4 py-2 font-semibold" type="submit">Sign out</button>
        </form>
      )}
    </main>
  );
}
