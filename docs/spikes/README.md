# Spikes

A spike is a timeboxed question with a go/no-go answer. It produces a finding (a
note, a captured fixture, a tiny throwaway check), not shipped code. The answer
decides what the next build round does.

**Graduate** = `prototype-graduate`: squash, push, go public. Spikes land before
it when their answer could change what gets published, where it's published, or
whether the dispatch console works on stage. Everything else waits.

## Before graduate

Order matters. Each one unblocks the next. Details in [pre-graduate.md](pre-graduate.md).

| # | Spike | Timebox | Blocks |
|---|---|---|---|
| G1 | Graduation home and license | 15 min | Where graduate pushes |
| G2 | Toolchain green on pnpm + turbo | 30 min | Every later spike that runs code |
| G3 | Live 0xL0C1 contract fixtures | 30 min | `lib/loci.ts` shapes, cards |
| G4 | CopilotKit ↔ remote MCP round-trip | 45 min | Round 3 agent wiring |
| G5 | `useRenderTool` renders MCP tool calls on 1.70.1 | 30 min | Confirm-band and dry-run cards |
| G6 | Public-repo hygiene | 15 min | Going public |

## After graduate

These don't change the first public cut. Details in [post-graduate.md](post-graduate.md).

| # | Spike | Trigger to start it |
|---|---|---|
| P1 | Server-enforced write gate | Console used outside a rehearsed demo |
| P2 | Restoration job over four tables | Multi-visit job (days since loss, readings) needed beyond the valve demo |
| P3 | Client status report / insurance export sink | Someone outside the crew needs the record |
| P4 | Tech-2 live video → `ask` reliability | Return visits done hands-free on camera, not scripted |
| P5 | Real identity instead of a capability URL | More than one crew or customer on one graph |
| P6 | Prune the inherited kit | Graduate has landed and the demo is over |

Not spiked: pnpm for `apps/mobile` (Expo needs a hoisted linker, and the app is
unused). Revisit only if mobile becomes a surface.

## State as of 2026-09-12 (graduated, private)

- **G2 migrated, unverified.** Manifests, `turbo.json`, `pnpm-workspace.yaml`, `.npmrc` and docs are
  on pnpm + turbo. No `pnpm-lock.yaml` yet: the install on the laptop was stopped for network, so
  the first install on a better-connected host generates it.
- **G3 partly known.** App Runner `tools/list` still serves the brought stub signatures
  (`ask` lacks P2's `visible_verbatim_text` / `material` / `mounting`).
- **G6 done.** Local history and tree scanned before the first push: no capability token, no
  common key patterns, `.env` ignored.
- G1, G4, G5 not started.

## Resume on another host

```bash
git workspace update                       # picks up github/briancripe/job-site-memory
cd "$GIT_WORKSPACE/github/briancripe/job-site-memory"
pnpm install                               # writes pnpm-lock.yaml — commit it
pnpm verify && pnpm --filter web build     # G2 go/no-go
cp .env.example .env                       # model key + LOCI_MCP_URL from the team, never committed
```

Then G3 → G4 → G5 in order. G1 is a team decision and can run in parallel.
