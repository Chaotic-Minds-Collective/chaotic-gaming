# Chaotic Minds Gaming

The official gaming community website for **Chaotic Minds Gaming (CMG)**, a gaming division of Chaotic Minds Collective.


Community built by gamers, for gamers.

Chaotic Gaming is a division of Chaotic Minds Collective. The website is the community's public front door and Discord is the primary community space.

## Stack

- Next.js App Router, React and TypeScript
- Tailwind CSS
- Vercel hosting (existing public site)
- Chaotic Gaming Core API for player accounts, entitlements, public servers and plugin catalogue
- Server-side API calls; no Core service credential is exposed to browser bundles

## Site structure

| Route | Purpose |
| --- | --- |
| `/` | Community front page and game catalogue |
| `/games` | Game catalogue |
| `/discord` | Discord invite and onboarding |
| `/account` | Player profile, entitlements and linked game accounts |
| `/account/login` | Player sign-in |
| `/account/register` | Player registration |
| `/store` | Product catalogue; checkout remains disabled until payment integration is approved |
| `/servers` | Public production server status and connection details |
| `/mods` | Plugin/mod catalogue; installation is not performed by the website |

## Local development

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env.local`.
3. Set `CORE_API_BASE_URL` to a reachable Core API instance.
4. Set `STEAM_OPENID_RETURN_URL` to the exact callback URL configured in Core.
5. Run `npm install`.
6. Run `npm run dev`.
7. Run `npm run build` to verify a production build.

## Steam account linking

The player account page supports Steam OpenID linking. The start route creates a short-lived, HTTP-only state cookie; the callback validates that state and sends the signed Steam assertion to Core for server-side verification.

The following server-only environment variables must be configured in both the website and Core:

- `CORE_API_BASE_URL` — Core API origin.
- `STEAM_OPENID_RETURN_URL` — exact callback URL, for example `https://www.chaoticmindsgaming.com/api/account/link/steam/callback`.

Do not add either variable with a `NEXT_PUBLIC_` prefix. The website does not need a Steam Web API key for OpenID ownership verification. The Core API rejects replayed assertions and prevents one Steam account from being actively linked to multiple player accounts.

## Deployment and release status

The existing public site remains on its current production branch. The player portal and Core integration are developed on a separate branch and must pass preview/review checks before any merge or production release. No production deployment or environment-variable change is performed by this repository work.

## Security

- Keep Core API calls server-side.
- Never expose service credentials in client-side bundles.
- Do not store Steam passwords.
- Never link game identities by username alone; use verified ownership.
- Store no payment credentials in this repository.

## Discord account linking

The account page can link a Discord identity through the Core API's OAuth2 authorization-code flow. The website creates a short-lived state challenge, binds it to the signed-in session, and validates the callback issuer before forwarding the code to Core. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:a06184e9d19211fbdcd3d98d62a4e27a7b25e097aae9eb66c64b5791f4bc4c0f -->

The browser never receives the Discord client secret. The website sends the Core session token to the browser in an HttpOnly cookie, which browser JavaScript cannot read.

<!-- /coderabbit-ai-generated:v1 -->

Configure `DISCORD_OAUTH_CLIENT_ID`, `DISCORD_OAUTH_CLIENT_SECRET` and `DISCORD_OAUTH_REDIRECT_URI` in the Core API environment. Register this exact redirect URI in the Discord Developer Portal:

`https://www.chaoticmindsgaming.com/api/account/link/discord/callback`

The requested scope is `identify` only. Discord access tokens are used server-side for identity verification and are not stored.
