import Link from "next/link";
import { BADGE } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden px-6 py-28 text-center md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-xl">
        <div className="reveal crest-ring mx-auto h-24 w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BADGE} alt="Chaotic Minds Gaming crest" className="h-full w-full rounded-full" />
        </div>
        <p className="kicker reveal d1 mt-10">Lost in the chaos</p>
        <h1 className="reveal d2 mt-4 text-[clamp(40px,8vw,72px)] font-extrabold uppercase leading-none">
          <span className="grad-text">404</span>
        </h1>
        <p className="reveal d3 mt-6 text-[var(--muted)]">
          This page does not exist yet - or it never did. Even chaos has its limits.
        </p>
        <div className="reveal d4 mt-10 flex flex-wrap justify-center gap-5">
          <Link href="/" className="btn-cta">Back to base</Link>
          <Link href="/games" className="btn-ghost">See the games</Link>
        </div>
      </div>
    </section>
  );
}
