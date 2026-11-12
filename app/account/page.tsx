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

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const token = (await cookies()).get("cg_session")?.value;
  let player: Player | null = null;

  if (token) {
    try {
      const response = await coreApiFetch("/auth/me", {}, token);
      if (response.ok) {
        const payload = await parseCoreResponse(response) as { data?: Player };
        player = payload.data ?? null;
      }
    } catch {
      // The account page remains available when Core is offline.
    }
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Chaotic Gaming</p>
      <h1 className="mt-3 text-4xl font-bold">Player account</h1>
      {player ? (
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">{player.displayName || player.username}</h2>
          <p className="mt-2 text-sm text-white/60">@{player.username}</p>
          <p className="mt-4 text-sm text-white/70">Account status: {player.status}</p>
          <form action="/api/auth/logout" method="post" className="mt-6">
            <button className="rounded-lg border border-cyan-400 px-4 py-2 font-semibold text-cyan-300" type="submit">
              Sign out
            </button>
          </form>
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
    </main>
  );
}
