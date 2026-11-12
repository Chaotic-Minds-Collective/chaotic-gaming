"use client";

import { useState } from "react";
import Link from "next/link";
import { DISCORD_INVITE } from "@/lib/site";

const links = [
  { href: "/games", label: "Games" },
  { href: "/servers", label: "Servers" },
  { href: "/mods", label: "Mods" },
  { href: "/store", label: "Store" },
  { href: "/account", label: "Account" },
  { href: "/events", label: "Events" },
  { href: "/discord", label: "Discord" },
  { href: "/rules", label: "Rules" },
  { href: "/parental-consent", label: "Parent Info" },
  { href: "/support", label: "Support" },
  { href: "/about", label: "About" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-[rgba(160,32,240,0.4)]"
      >
        <span className={`block h-[2px] w-5 bg-[var(--pulse)] transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
        <span className={`block h-[2px] w-5 bg-[var(--pulse)] transition-opacity ${open ? "opacity-0" : ""}`} />
        <span className={`block h-[2px] w-5 bg-[var(--pulse)] transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain border-b border-[rgba(160,32,240,0.3)] bg-[rgba(7,7,10,0.97)] px-6 py-5 backdrop-blur-xl">
          <ul className="space-y-1">
            {links.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)}
                      className="font-mono2 block py-3 text-sm uppercase tracking-[0.25em] text-[var(--text)] transition hover:text-[var(--pulse)]">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
             className="btn-cta mt-4 block w-full text-center">
            Join Discord
          </a>
        </div>
      )}
    </div>
  );
}
