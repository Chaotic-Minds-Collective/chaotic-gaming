"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, ...(email ? { email } : {}), password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || "Account creation failed.");
      router.replace("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account services are temporarily unavailable.");
      setBusy(false);
    }
  }

  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-xl card">
        <p className="kicker">Join the network</p>
        <h1 className="section-title mt-3">Create your account</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">One player identity for the website, Discord and supported game servers.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm">Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required minLength={3} maxLength={32} pattern="[A-Za-z0-9_]+" className="mt-2 w-full border border-[var(--line)] bg-black/40 px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--pulse)]" />
            <span className="mt-1 block text-xs text-[var(--muted)]">3–32 characters; letters, numbers and underscores.</span>
          </label>
          <label className="block text-sm">Email <span className="text-[var(--muted)]">(optional)</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} className="mt-2 w-full border border-[var(--line)] bg-black/40 px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--pulse)]" />
          </label>
          <label className="block text-sm">Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required minLength={12} maxLength={128} className="mt-2 w-full border border-[var(--line)] bg-black/40 px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--pulse)]" />
            <span className="mt-1 block text-xs text-[var(--muted)]">At least 12 characters.</span>
          </label>
          {error && <p role="alert" className="border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
          <button type="submit" disabled={busy} className="btn-cta w-full disabled:opacity-50">{busy ? "Creating account…" : "Create account"}</button>
        </form>
        <p className="mt-6 text-sm text-[var(--muted)]">Already registered? <Link href="/account/login" className="text-[var(--pulse)] hover:underline">Sign in</Link>.</p>
      </div>
    </section>
  );
}
