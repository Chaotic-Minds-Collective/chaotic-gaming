# Chaotic Gaming

Community built by gamers, for gamers.

Chaotic Gaming is a division of Chaotic Minds Collective. The website is live at https://www.chaoticmindsgaming.com and is the community's public front door. Discord is the primary community space.

## Stack

- Next.js 16.4.5 (App Router), React 18.3.1, TypeScript
- Tailwind CSS 3
- Vercel deployment from the `main` branch
- Static game catalog data in `lib/games.ts`; shared site constants in `lib/site.ts`
- Player accounts use the Chaotic Gaming Core API; the website stores no database state.

## Player accounts

The account portal uses a same-origin Next.js backend-for-frontend (BFF):

- The browser calls `/api/auth/*` on this site.
- Server route handlers forward requests to Core using `CORE_API_BASE_URL`.
- Core session tokens are stored only in an HttpOnly, SameSite=Lax cookie; they are never exposed to browser JavaScript or localStorage.
- The website proxies login, registration, session lookup, logout, linked-account listing and Discord account linking.
- Discord OAuth2 client secrets remain in Core only.

Set `CORE_API_BASE_URL` in the Vercel server environment to the HTTPS origin of the deployed Core API. Do not use a `NEXT_PUBLIC_` variable for this value. For local development, copy `.env.example` to `.env.local` and point it to a loopback Core instance.

The Core API and Discord OAuth2 application must be configured before registration or linking can succeed. Register the exact Discord redirect URI `https://www.chaoticmindsgaming.com/account/link/discord/callback` in the Discord Developer Portal and configure the matching redirect URI and OAuth credentials in Core.

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
| `/account` | Player profile and linked identities |
| `/account/login` | Player sign-in |
| `/account/register` | Player registration |

## Local development

1. Install Node.js 20.9.0 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set `CORE_API_BASE_URL` when Core is available.
4. Run `npm run dev` for local development.
5. Run `npm run build` for a production build check.

Never add Core session tokens, Discord OAuth secrets, or database credentials to the website repository.

## Deployment

Vercel deploys the site from `main`. Configure `CORE_API_BASE_URL` as a server-only Vercel environment variable before enabling account functionality. No production environment variables or deployments are changed by this repository branch.

## Community servers

Game-server launches are community-voted. Members decide which games launch first, as well as rates and rules, in Discord. The website currently lists these game hubs: 7 Days to Die, ARK: Survival Evolved, ATLAS, Soulmask, Space Engineers, Palworld, Icarus, Valheim, Minecraft, and Conan Exiles. Listing a game does not mean its dedicated server is online; its status is shown on the site.

## Discord

The website's shared invite is maintained in `lib/site.ts`. Keep any docs or other public invite references aligned with that constant.

## Related

- Parent organization: Chaotic Minds Collective
- Discord invite: https://discord.gg/jY5efCnk6f
