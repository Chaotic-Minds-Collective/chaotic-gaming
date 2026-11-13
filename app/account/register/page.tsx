"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmPassword") || "");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          email: form.get("email") || undefined,
          password,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || "Unable to create account.");
      router.push("/account");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-lg px-6 py-16">
      <h1 className="text-3xl font-bold">Create your player account</h1>
      <p className="mt-2 text-white/65">One account for the Chaotic Minds Gaming network.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm">Username
          <input name="username" autoComplete="username" required minLength={3} maxLength={32} pattern="[A-Za-z0-9_]+" className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3" />
        </label>
        <label className="block text-sm">Email (optional)
          <input name="email" type="email" autoComplete="email" maxLength={254} className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3" />
        </label>
        <label className="block text-sm">Password
          <input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3" />
          <span className="mt-1 block text-xs text-white/50">Use at least 12 characters.</span>
        </label>
        <label className="block text-sm">Confirm password
          <input name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3" />
        </label>
        {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-white/65">Already registered? <Link className="text-cyan-300 underline" href="/account/login">Sign in</Link>.</p>
    </main>
  );
}
