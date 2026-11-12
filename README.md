# Chaotic Gaming

Community built by gamers, for gamers.

Chaotic Gaming is a division of Chaotic Minds Collective. The website is live at https://www.chaoticmindsgaming.com and is the community's public front door. Discord is the primary community space.

## Stack

- Next.js 16.4.5 (App Router), React 18.3.1, TypeScript
- Tailwind CSS 3
- Vercel deployment from the `main` branch
- Static game catalog data in `lib/games.ts`; shared site constants in `lib/site.ts`
- Optional read-only server status from Chaotic Gaming Core (`CORE_API_URL`)

## Core server status

Set `CORE_API_URL` to the public base URL of the Chaotic Gaming Core API to show live server registry information on ATLAS, 7 Days to Die and ARK game pages. The website calls the public `GET /servers` endpoint with a 60-second revalidation window. If Core is not configured or unavailable, the existing static status copy remains in use.

No Core credentials are required for this public read-only endpoint. Do not add service tokens or database credentials to website environment variables.

## Site structure

| Route | Purpose |
| --- | --- |
| `/` | Founding-member pitch and game community catalog |
| `/about` | Chaotic Minds Collective relationship |
| `/games` | Game catalog |
| `/games/[game]` | Game details and optional Core server status |
| `/discord` | Discord invite, widget, onboarding walkthrough, and short rules |
| `/events` | Events announcement and future calendar placeholder |
| `/support` | Future supporter options; nothing is currently for sale |

## Local development

1. Install Node.js 20.9.0 or newer (production runtime is configured in Vercel; verify compatibility before changing the version).
2. Run `npm install`.
3. Copy `.env.example` to `.env` and optionally set `CORE_API_URL`.
4. Run `npm run dev` for local development.
5. Run `npm run build` for a production build check.

## Deployment

Vercel deploys the site from the `main` branch. The website does not require a database. Do not add secrets to the repository. The Core API integration is read-only and optional.

## Community servers

Game-server launches are community-voted. Members decide which games launch first, as well as rates and rules, in Discord. The website lists game hubs; listing a game does not mean its dedicated server is online. Core server status is shown only when a matching public server record is available.

## Discord

The website's shared invite is maintained in `lib/site.ts`. Keep any docs or other public invite references aligned with that constant.

## Related

- Parent organization: Chaotic Minds Collective
- Discord invite: https://discord.gg/jY5efCnk6f
