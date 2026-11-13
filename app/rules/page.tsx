import Link from "next/link";

const sections = [
  {
    title: "Respect the people behind the players",
    points: [
      "Harassment, hate speech, threats, bullying, targeted abuse, and discriminatory slurs are not allowed.",
      "Do not stalk, groom, exploit, or pressure other members. Sexual exploitation or sexualized conduct involving anyone under 18 is prohibited and will be escalated.",
      "Do not share another person's private information, screenshots, or identifying details without their permission.",
    ],
  },
  {
    title: "Keep the community playable",
    points: [
      "Use the appropriate game hubs and channels. Keep spam, scams, malicious links, and unsolicited advertising out of the community.",
      "Self-promotion, recruiting, and commercial posts require staff approval.",
      "Follow channel descriptions and content labels. Mature language may occur, but explicit adult content is prohibited.",
      "Do not disrupt voice channels, events, or gameplay to target or intimidate others.",
    ],
  },
  {
    title: "Age and access",
    points: [
      "Chaotic Minds Gaming is for members aged 13 and older. Anyone under 13 may not join.",
      "Members aged 13–17 must have permission from a parent or legal guardian. Staff confirmation through the separate consent process is required before access is approved.",
      "Members aged 18 and older may use general community spaces. Any adult-only spaces are restricted to adults and are not available to minors.",
      "Never pretend to be older, bypass age restrictions, or ask another member to do so.",
    ],
  },
  {
    title: "Safety, privacy, and staff",
    points: [
      "Do not post passwords, home addresses, phone numbers, financial details, identity documents, or other sensitive personal information.",
      "Do not ask minors for private contact details, photos, personal documents, or conversations outside approved community spaces.",
      "Report concerns privately to staff. Do not start public callouts, retaliate, or investigate another member yourself.",
      "Staff may remove content, restrict access, mute, suspend, or ban accounts based on the seriousness and pattern of behavior.",
      "If you disagree with a moderation decision, use the support process to request a review. Do not argue with staff in public channels.",
    ],
  },
];

/**
 * Renders the community standards for member conduct, age eligibility, safety, and moderation.
 */
export default function Rules() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-10">
      <div className="aurora" />
      <div className="relative mx-auto max-w-3xl">
        <p className="kicker reveal d1 text-center">The community code</p>
        <h1 className="section-title reveal d1 mt-3 text-center">Community Rules</h1>
        <div className="section-rule reveal d1 mx-auto" />
        <p className="reveal d2 mt-8 text-center text-[var(--muted)]">
          Chaotic Minds Gaming is built by gamers, for gamers. Everyone deserves a place to play without being harassed,
          pressured, or put at risk. Joining the community means following these rules.
        </p>

        <div className="card cut reveal d2 mt-8">
          <h2 className="text-lg font-bold uppercase tracking-wide">Mature community, clear boundaries</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            This is a gaming community where mature language may be used. That does not make harassment,
            discrimination, sexual exploitation, or explicit adult content acceptable. Keep content appropriate
            for the people allowed in each channel.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {sections.map((section, index) => (
            <section className="card cut reveal" key={section.title}>
              <span className="kicker">Rule set {String(index + 1).padStart(2, "0")}</span>
              <h2 className="mt-3 text-xl font-bold uppercase tracking-wide">{section.title}</h2>
              <ul className="mt-5 space-y-3">
                {section.points.map((point) => (
                  <li key={point} className="flex items-start gap-4 text-sm text-[var(--muted)]">
                    <span className="mt-1 h-2 w-2 shrink-0 bg-[var(--riot)] shadow-[0_0_10px_var(--riot)]" />
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="card cut reveal mt-8 text-center">
          <h2 className="text-xl font-bold uppercase tracking-wide">Need help or want to report something?</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Contact the staff team privately. For general support questions, email{" "}
            <a className="text-[var(--pulse)] underline" href="mailto:support@chaoticmindsgaming.com">
              support@chaoticmindsgaming.com
            </a>.
            Do not email identity documents or sensitive personal information.
          </p>
          <Link href="/parental-consent" className="btn-cta mt-6 inline-block">
            Parent and Guardian Information
          </Link>
        </div>
      </div>
    </section>
  );
}
