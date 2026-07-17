# Koyeb deployment result

Date: 2026-07-17 (Asia/Riyadh)

## Result

**BLOCKED BEFORE RESOURCE CREATION.** No Koyeb application, service, paid resource, or public URL was created.

## Repository readiness

- Repository: `https://github.com/yazeedsaleh09-lang/dass`
- Branch: `main`
- Deployment commit: `67b95fac3c63aedf379cb56011a13b975a7025d8`
- Node engine pinned to `20.x`.
- `npm run dassbuild`: passed.
- `npm run typecheck:dasstv`: passed.
- `npm run typecheck:dassplayer`: passed.
- `npm run dassnetcheck`: passed 7/7, including the secret-action leak test.
- `npm run dassqacheck`: passed 5/5.
- Local `/`, `/play`, and `/health`: returned HTTP 200 and served the Dass build.

## Intended Koyeb configuration

- Source: GitHub repository above, branch `main`.
- Builder: Buildpack (explicitly **not** Dockerfile).
- Work directory: repository root.
- Build command: `npm install --include=dev && npm run dassbuild`
- Run command: `npm run dassserver`
- Environment: `NODE_VERSION=20`, `NPM_CONFIG_PRODUCTION=false`, `PORT=8000`.
- Public HTTP port: `8000`, route `/`.
- Health check: `/health`.
- Instance: free tier only.

## Blocking evidence

1. GitHub sign-in and Koyeb onboarding completed successfully.
2. The authenticated Koyeb home page only displayed: `Koyeb is joining Mistral! Stay tuned for a revamped Agentic experience.`
3. `https://app.koyeb.com/apps` returned Koyeb's own `404 - ERROR / That page is gone!` page.
4. The documented deploy URL redirected to `/services/deploy`, but the control panel again showed only the Mistral announcement and no service form.
5. The documented API settings path loaded no usable controls.
6. Koyeb CLI v5.10.2 was installed at `C:\Users\yazed\.koyeb\bin\koyeb.exe`.
7. CLI interactive login was launched, but it exited without creating `C:\Users\yazed\.koyeb.yaml`; `koyeb whoami` therefore cannot authenticate.

## Prior Render root cause (confirmed)

The stale Council deployment was caused by the repository-root Dockerfile, not the Dass source:

- Build command: `npm install --include=dev && node apps/v2web/build.mjs`
- Entrypoint: `npm run v2server`

Koyeb was intentionally configured for Buildpack to avoid that Dockerfile, but deployment could not reach resource creation due to the account/control-panel authentication blocker above.

## Required unblock

One of the following is required before deployment can continue:

1. A working Koyeb control panel with access to Web Service creation; or
2. A Koyeb API token created by the account owner and stored in the CLI config/environment.

After authentication is available, run the free-tier Buildpack deployment and verify `/`, `/play`, `/health`, same-origin WebSocket room creation/join, and reconnection before marking deployment complete.
