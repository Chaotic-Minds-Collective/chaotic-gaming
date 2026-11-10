import Link from "next/link";

export default function ParentalConsent() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-3xl">
        <p className="kicker reveal d1 text-center">Information for families</p>
        <h1 className="section-title reveal d1 mt-3 text-center">Parent &amp; Guardian Consent</h1>
        <div className="section-rule reveal d1 mx-auto" />

        <p className="reveal d2 mt-8 text-center text-[var(--muted)]">
          We want younger gamers to have a welcoming community while making sure parents and guardians understand
          the environment and have a meaningful say in their child's participation.
        </p>

        <div className="card cut reveal d2 mt-8">
          <h2 className="text-xl font-bold uppercase tracking-wide">Who can join?</h2>
          <ul className="mt-5 space-y-3 text-sm text-[var(--muted)]">
            <li>• Anyone under 13 is not permitted to join Chaotic Gaming.</li>
            <li>• Members aged 13–17 need permission from a parent or legal guardian, with staff confirmation before Discord access is approved.</li>
            <li>• Members aged 18 and older may join the general community. Adult-only spaces, if offered, are restricted to adults.</li>
          </ul>
        </div>

        <div className="card cut reveal d3 mt-6">
          <h2 className="text-xl font-bold uppercase tracking-wide">How consent will work</h2>
          <ol className="mt-5 space-y-4 text-sm text-[var(--muted)]">
            <li><strong className="text-[var(--text)]">1. Parent or guardian involvement.</strong> A parent or legal guardian—not the teen acting alone—must provide permission through a separate consent process.</li>
            <li><strong className="text-[var(--text)]">2. Staff confirmation.</strong> Staff must confirm the consent before the teen receives access to the Discord community.</li>
            <li><strong className="text-[var(--text)]">3. Age-appropriate access.</strong> Members under 18 are kept out of adult-only spaces and remain subject to the community's safety and moderation rules.</li>
            <li><strong className="text-[var(--text)]">4. Questions or withdrawal.</strong> A parent or guardian may contact the team to ask questions or request that permission be withdrawn.</li>
          </ol>
        </div>

        <div className="card cut reveal d3 mt-6">
          <h2 className="text-xl font-bold uppercase tracking-wide">Consent intake is not open yet</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            This page explains the planned process; it is not a consent form and does not collect or verify permission.
            The separate intake and staff-review process must be put in place before minor access can be approved.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            For now, a parent or guardian may email{" "}
            <a className="text-[var(--pulse)] underline" href="mailto:support@chaoticmindsgaming.com?subject=Parent%20or%20guardian%20consent%20question">
              support@chaoticmindsgaming.com
            </a>{" "}
            with general questions only. Please do not send a child's full date of birth, home address, identity
            documents, school details, or other sensitive information by email or Discord.
          </p>
        </div>

        <p className="reveal d4 mt-8 text-center text-sm text-[var(--muted)]">
          Please read the <Link href="/rules" className="text-[var(--pulse)] underline">Community Rules</Link> before joining.
        </p>
      </div>
    </section>
  );
}
