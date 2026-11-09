# Chaotic Gaming

Community built by gamers, for gamers.

Chaotic Gaming is a division of Chaotic Minds Collective. The website is live at https://www.chaoticmindsgaming.com and is the community's public front door. Discord is the primary community space.

## Stack

- Next.js 16.4.5 (App Router), React 18.3.1, TypeScript
- Tailwind CSS 3
- Vercel deployment from the `main` branch
- Static game catalog data in `lib/games.ts`; shared site constants in `lib/site.ts`
- No database or server-side application state is currently used

## Site structure

| Route | Purpose |
| --- | --- |
| `/` | Founding-member pitch and game community catalog |
| `/about` | Chaotic Gaming's relationship to Chaotic Minds Collective |
| `/games` | Game catalog |
| `/games/[game]` | Static details page for each catalog game |
| `/discord` | Discord invite, widget, onboarding walkthrough, and short rules |
| `/events` | Events announcement and future calendar placeholder |
| `/support` | Future supporter options; nothing is currently for sale |

## Key files

- `lib/site.ts` - shared invite and public asset paths
- `lib/games.ts` - game catalog, statuses, and server-planning copy
- `app/games/[game]/page.tsx` - generated game details pages
- `public/sitemap.xml` and `public/robots.txt` - search crawler files
- `app/layout.tsx` - shared navigation, metadata, and footer
- `next.config.mjs` - security headers and favicon redirect

## Local development

1. Install Node.js 20.9.0 or newer (production runtime is configured in Vercel; verify compatibility before changing the version).
2. Run `npm install`.
3. Run `npm run dev` for local development.
4. Run `npm run build` for a production build check.

## Deployment

Vercel deploys the site from `main`. The website does not currently require environment variables or a database. Do not add secrets to the repository.

## Community servers

Game-server launches are community-voted. Members decide which games launch first, as well as rates and rules, in Discord. The website currently lists these game hubs: 7 Days to Die, ARK: Survival Evolved, ATLAS, Soulmask, Space Engineers, Palworld, Icarus, Valheim, Minecraft, and Conan Exiles. Listing a game does not mean its dedicated server is online; its status is shown on the site.

## Discord

The website's shared invite is maintained in `lib/site.ts`. Keep any docs or other public invite references aligned with that constant.

## Related

- Parent organization: Chaotic Minds Collective
- Discord invite: https://discord.gg/jY5efCnk6f
