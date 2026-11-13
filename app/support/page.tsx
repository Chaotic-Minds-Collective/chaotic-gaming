export default function Support() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-3xl">
        <p className="kicker reveal">Fuel for the chaos</p>
        <h1 className="section-title reveal d1 mt-3">Support Chaotic Minds Gaming</h1>
        <div className="section-rule reveal d1" />
        <p className="reveal d2 mt-7 text-lg text-[var(--text)]">
          Chaotic Minds Gaming is community-funded. Supporter options are being prepared and will launch here once approved -
          nothing is for sale yet.
        </p>
        <div className="card cut reveal d3 mt-10">
          <span className="kicker">In the forge</span>
          <h2 className="mt-3 text-xl font-bold uppercase tracking-wide">Coming soon</h2>
          <ul className="mt-5 space-y-3">
            {["Optional supporter role and perks", "Donation link", "Community merch with the Chaotic Minds Gaming crest"].map((s) => (
              <li key={s} className="flex items-start gap-4 text-sm text-[var(--muted)]">
                <span className="mt-1 h-2 w-2 shrink-0 bg-[var(--pulse)] shadow-[0_0_10px_var(--pulse)]" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
