import Link from "next/link";
import { cookies } from "next/headers";
import { coreApiFetch, parseCoreResponse } from "@/lib/core-api";
import EntitlementClaimButton from "@/components/EntitlementClaimButton";

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
  quantity: number;
  deliveryTargets?: Array<{
    gameKey: string;
    serverId: string;
    serverName: string;
    rewardStatus: string | null;
  }>;
};

type PurchaseOrder = {
  id: string;
  status: string;
  currency: string;
  totalMinor: string;
  createdAt: string;
  paymentStatus: string | null;
  items: Array<{ name: string; sku: string; quantity: number; unitAmountMinor: string }>;
};

function isPurchaseOrder(value: unknown): value is PurchaseOrder {
  if (!value || typeof value !== "object") return false;
  const order = value as Record<string, unknown>;
  return typeof order.id === "string"
    && typeof order.status === "string"
    && typeof order.currency === "string" && /^[A-Za-z]{3}$/.test(order.currency)
    && typeof order.totalMinor === "string" && /^\d+$/.test(order.totalMinor) && Number.isFinite(Number(order.totalMinor))
    && typeof order.createdAt === "string" && Number.isFinite(Date.parse(order.createdAt))
    && (order.paymentStatus === null || typeof order.paymentStatus === "string")
    && Array.isArray(order.items) && order.items.every((item: unknown) => {
      if (!item || typeof item !== "object") return false;
      const entry = item as Record<string, unknown>;
      return typeof entry.name === "string" && typeof entry.sku === "string"
        && typeof entry.quantity === "number" && Number.isFinite(entry.quantity)
        && typeof entry.unitAmountMinor === "string";
    });
}

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
  const discordResult = typeof params.discord === "string" ? params.discord : undefined;
  const token = (await cookies()).get("cg_session")?.value;
  let player: Player | null = null;
  let entitlements: Entitlement[] = [];
  let linkedAccounts: LinkedAccount[] = [];
  let orders: PurchaseOrder[] = [];
  let ordersUnavailable = false;
  let accountUnavailable = false;
  let profileUnauthenticated = false;
  let linkedAccountsUnavailable = false;

  if (token) {
    try {
      const [profileResponse, entitlementResponse, linkedResponse, ordersResponse] = await Promise.all([
        coreApiFetch("/auth/me", {}, token),
        coreApiFetch("/account/entitlements", {}, token),
        coreApiFetch("/auth/linked-accounts", {}, token),
        coreApiFetch("/account/orders", {}, token).catch(() => null),
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
      if (ordersResponse?.ok) {
        const payload = await parseCoreResponse(ordersResponse).catch(() => null) as { data?: unknown } | null;
        if (Array.isArray(payload?.data) && payload.data.every(isPurchaseOrder)) orders = payload.data;
        else ordersUnavailable = true;
      } else {
        ordersUnavailable = true;
      }
    } catch {
      accountUnavailable = true;
      linkedAccountsUnavailable = true;
    }
  }

  const steamAccount = linkedAccounts.find((account) => account.provider === "steam");
  const discordAccount = linkedAccounts.find((account) => account.provider === "discord");

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Chaotic Minds Gaming</p>
      <h1 className="mt-3 text-4xl font-bold">Player account</h1>
      {params.logout === "unconfirmed" && <p role="status" className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">You signed out of this browser, but the account service could not confirm session revocation. Your session may still be active elsewhere.</p>}
      {steamResult === "linked" && <p className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-200">Your Steam account was verified and linked successfully.</p>}
      {steamResult === "state-error" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">The Steam verification session expired or did not match. Please try again.</p>}
      {steamResult === "cancelled" && <p className="mt-4 text-sm text-white/70">Steam linking was cancelled. You can try again.</p>}
      {steamResult === "failed" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">The link request expired, the Steam account may already be linked elsewhere, or verification failed. No account was changed.</p>}
      {steamResult === "unavailable" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">Steam linking is temporarily unavailable. Try again later.</p>}
      {steamResult === "misconfigured" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">Steam linking is not configured for this website yet.</p>}
      {discordResult === "linked" && player && !profileUnauthenticated && !linkedAccountsUnavailable && typeof discordAccount?.verifiedAt === "string" && discordAccount.verifiedAt.length > 0 && <p role="status" className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-200">Your Discord account was verified and linked successfully.</p>}
      {discordResult === "cancelled" && <p className="mt-4 text-sm text-white/70">Discord linking was cancelled. You can try again.</p>}
      {discordResult === "state-error" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">The Discord verification session expired or did not match. Please try again.</p>}
      {discordResult === "failed" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">Discord verification failed or this account is already linked elsewhere. No account was changed.</p>}
      {discordResult === "unavailable" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">Discord linking is temporarily unavailable. Try again later.</p>}
      {discordResult === "misconfigured" && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">Discord linking is not configured for this website yet.</p>}
      {player ? (
        <>
          <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">{player.displayName || player.username}</h2>
            <p className="mt-2 text-sm text-white/60">@{player.username}</p>
            <p className="mt-2 break-all font-mono text-xs text-white/40">Account ID: {player.id}</p>
            <p className="mt-4 text-sm text-white/70">Account status: {player.status}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-lg border border-cyan-400 px-4 py-2 font-semibold text-cyan-300" href="/store">Player store</Link>
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Connected accounts</h2>
            <p className="mt-2 text-sm text-white/60">Link verified game and community identities to connect your website, Discord and game characters.</p>
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
            {!linkedAccountsUnavailable && (discordAccount ? (
              <div className="mt-3 rounded-lg border border-white/10 p-4">
                <p className="font-semibold">Discord <span className="ml-2 text-xs text-cyan-300">{discordAccount.verifiedAt !== null ? "VERIFIED" : "PENDING"}</span></p>
                <p className="mt-1 break-all text-sm text-white/65">{discordAccount.externalUsername || discordAccount.externalId}</p>
              </div>
            ) : (
              <div className="mt-3">
                <a className="inline-flex rounded-lg border border-cyan-400 px-4 py-2 font-semibold text-cyan-300" href="/api/account/link/discord/start">Link Discord account</a>
                <p className="mt-2 text-xs text-white/45">Verify your Discord identity using the official Discord authorization page.</p>
              </div>
            ))}
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Purchase history</h2>
            {ordersUnavailable ? (
              <p className="mt-3 text-sm text-white/60">Purchase history is temporarily unavailable.</p>
            ) : orders.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">You do not have any orders yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <article key={order.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                        <p className="mt-1 text-xs text-white/55">{new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{(Number(order.totalMinor) / 100).toLocaleString("en-US", { style: "currency", currency: order.currency })}</p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-cyan-300">{order.status.replaceAll("_", " ")}</p>
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm text-white/65">
                      {order.items.map((item, index) => (
                        <li key={order.id + "-" + index}>{item.name} × {item.quantity}</li>
                      ))}
                    </ul>
                    {order.paymentStatus && <p className="mt-3 text-xs text-white/45">Payment: {order.paymentStatus.replaceAll("_", " ")}</p>}
                  </article>
                ))}
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
                    <p className="mt-1 text-xs text-white/55">{item.productType.replaceAll("_", " ")} · Qty {item.quantity} · {item.status}</p>
                    {(item.deliveryTargets ?? []).length > 0 ? (
                      <div className="mt-3 border-t border-white/10 pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">In-game delivery</p>
                        <ul className="mt-2 space-y-1 text-xs text-white/60">
                          {(item.deliveryTargets ?? []).map((target) => (
                            <li key={target.gameKey}>
                              {target.gameKey.toUpperCase()} · {target.serverName} · {target.rewardStatus ?? "Not queued"}
                            </li>
                          ))}
                        </ul>
                        {(item.deliveryTargets ?? []).some((target) => target.rewardStatus === null) && (
                          steamAccount?.verifiedAt ? (
                            <EntitlementClaimButton entitlementId={item.id} />
                          ) : (
                            <Link className="mt-3 inline-block text-xs text-cyan-300 underline" href="/api/account/link/steam/start">
                              Link and verify Steam to claim
                            </Link>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-white/40">No in-game delivery target is configured for this item yet.</p>
                    )}
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
