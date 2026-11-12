"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Account = {
  id: string;
  username: string;
  email: string | null;
  displayName: string | null;
  status: string;
  createdAt: string;
};

type LinkedAccount = {
  provider: string;
  externalId: string;
  externalUsername: string | null;
  verifiedAt: string | null;
  linkedAt: string;
};

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [linked, setLinked] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [accountResponse, linkedResponse] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch("/api/auth/linked-accounts", { cache: "no-store" }),
      ]);
      if (accountResponse.status === 401 || linkedResponse.status === 401) {
        window.location.replace("/account/login");
        return;
      }
      const accountPayload = await accountResponse.json();
      const linkedPayload = await linkedResponse.json();
      if (!accountResponse.ok) throw new Error(accountPayload?.error?.message || "Unable to load your account.");
      if (!linkedResponse.ok) throw new Error(linkedPayload?.error?.message || "Unable to load linked accounts.");
      setAccount(accountPayload.data);
      setLinked(Array.isArray(linkedPayload.data) ? linkedPayload.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account services are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadAccount(); }, [loadAccount]);

  async function linkDiscord() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/discord/challenge", { method: "POST" });
      const payload = await response.json();
      if (!response.ok || typeof payload?.data?.authorizationUrl !== "string") {
        throw new Error(payload?.error?.message || "Discord linking is not available yet.");
      }
      window.location.assign(payload.data.authorizationUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Discord linking could not be started.");
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.replace("/account/login");
  }

  const discord = linked.find((item) => item.provider === "discord");

  if (loading) {
    return <section className="px-6 py-20"><div className="mx-auto max-w-3xl card"><p className="kicker">Player account</p><p className="mt-5 text-[var(--muted)]">Loading your account…</p></div></section>;
  }

  if (!account) {
    return <section className="px-6 py-20"><div className="mx-auto max-w-3xl card"><p className="kicker">Player account</p><h1 className="section-title mt-3">Account unavailable</h1><p className="mt-4 text-[var(--muted)]">{error || "Sign in to view your player account."}</p><Link href="/account/login" className="btn-cta mt-8">Sign in</Link></div></section>;
  }

  return (
    <section className="relative overflow-hidden px-6 py-16 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-4xl">
        <p className="kicker">Chaotic Gaming identity</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="section-title">Player account</h1>
            <p className="mt-3 text-[var(--muted)]">One account connecting your community and game identities.</p>
          </div>
          <button type="button" onClick={signOut} disabled={busy} className="btn-ghost disabled:opacity-50">Sign out</button>
        </div>
        {error && <p role="alert" className="mt-6 border border-red-400/40 bg-red-950/30 p-4 text-sm text-red-200">{error}</p>}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card">
            <p className="kicker">Your profile</p>
            <h2 className="mt-4 text-2xl font-bold">{account.displayName || account.username}</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div><dt className="text-[var(--muted)]">Username</dt><dd className="mt-1">{account.username}</dd></div>
              <div><dt className="text-[var(--muted)]">Email</dt><dd className="mt-1">{account.email || "Not added"}</dd></div>
              <div><dt className="text-[var(--muted)]">Account status</dt><dd className="mt-1 capitalize">{account.status}</dd></div>
              <div><dt className="text-[var(--muted)]">Player ID</dt><dd className="mt-1 break-all font-mono2 text-xs">{account.id}</dd></div>
            </dl>
          </div>

          <div className="card">
            <p className="kicker">Connected identities</p>
            <h2 className="mt-4 text-2xl font-bold">Linked accounts</h2>
            {linked.length === 0 ? (
              <p className="mt-5 text-sm text-[var(--muted)]">No external accounts are linked yet.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {linked.map((item) => (
                  <li key={item.provider} className="border border-[var(--line)] bg-black/20 p-3">
                    <p className="font-semibold capitalize">{item.provider}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.externalUsername || item.externalId}</p>
                  </li>
                ))}
              </ul>
            )}
            {discord ? (
              <p className="mt-6 text-sm text-[var(--pulse)]">Discord is connected to this player account.</p>
            ) : (
              <button type="button" onClick={linkDiscord} disabled={busy} className="btn-cta mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? "Connecting…" : "Link Discord"}
              </button>
            )}
            <p className="mt-4 text-xs leading-6 text-[var(--muted)]">Linking verifies ownership through Discord OAuth2. Your Discord password is never shared with Chaotic Gaming.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
