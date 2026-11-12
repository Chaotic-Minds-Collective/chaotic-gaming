"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || "Unable to sign in.");
      router.push("/account");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-lg px-6 py-16">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-white/65">Access your Chaotic Gaming player account.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm">Username
          <input name="username" autoComplete="username" required minLength={3} maxLength={32} className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3" />
        </label>
        <label className="block text-sm">Password
          <input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3" />
        </label>
        {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-white/65">New here? <Link className="text-cyan-300 underline" href="/account/register">Create an account</Link>.</p>
    </main>
  );
}
