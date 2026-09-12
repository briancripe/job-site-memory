# G2: pnpm and Turbo toolchain

## Question

Can the repository be installed and exercised with pnpm, including the full
verification suite, production build, and the web development server on port
3100, without adding product functionality or a 0xL0C1 capability token?

## Method

1. Installed the frozen workspace lockfile with pnpm.
2. Inspected every workspace dependency path for `@ag-ui/client`.
3. Ran `pnpm verify` and `pnpm build`.
4. Started `pnpm dev:web`, requested `/` over loopback, and inspected the
   returned document title.
5. When the first page request exposed a strict-pnpm runtime resolution warning,
   added the already-locked `shiki@3.23.0` package as a direct web dependency and
   repeated the install and page-load test.

The batch worktree lives on an inode-limited `/tmp` filesystem, so its pnpm
virtual store was placed under `/home/bees/.beadhive/wt`. Because Turbopack does
not support that external virtual-store layout, the development-server proof was
repeated at the same commit in a disposable worktree on the persistent
filesystem using pnpm's normal `node_modules/.pnpm` layout.

## Evidence

- `pnpm install --frozen-lockfile` completed for all four workspace projects.
- `pnpm why -r @ag-ui/client` reported only version `0.0.59` across `channel`,
  `web`, and `agent-core`.
- `pnpm verify` passed all six Turbo tasks: typecheck and test for each of the
  three packages. The web suite passed 7 tests, Channels passed 5 tests, and
  agent-core passed 1 test.
- `pnpm build` completed successfully after the dependency correction with a
  cold web build in 2m51s and emitted all expected Next.js routes.
- `pnpm dev:web` reported ready on `http://127.0.0.1:3100`; `GET /` returned
  HTTP 200 with 60,420 bytes and the title `Incident assistant — Agents,
  Everywhere`.
- The initial runtime request warned that `streamdown` could not resolve its
  externalized `shiki` package from the web project. Declaring the existing
  `shiki@3.23.0` package directly in `apps/web` removed the warning and allowed
  the request to complete.
- No capability token, external service credential, graduation-home behavior,
  license flow, or other product functionality was added.

## Verdict

**GO.** Installation, dependency deduplication, typechecks, tests, production
build, development-server startup, and a real page load are green after the
minimal direct-dependency correction.

## Recommendation

Proceed to the live 0xL0C1 contract fixture spike. Keep `shiki` direct in the web
package while `streamdown` is externalized, retain the exact `@ag-ui/client`
override, and allow at least four minutes for an uncached production build in
this environment.
