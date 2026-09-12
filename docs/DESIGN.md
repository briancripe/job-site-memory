# Job Site Memory — current design

## Problem

Multi-visit trade jobs lose context between visits. Different technicians repeatedly reconstruct what an object is, what the previous person learned, and what remains unanswered. Job Site Memory anchors that handoff to a physical object's visible tag and location.

## Product boundary

This repository owns the dispatcher experience. [0xL0C1](https://github.com/LincForge/0xl0c1) owns physical-memory semantics and exposes exactly three MCP tools:

- `observe` records a described object at a user-supplied place;
- `commit` records a lesson, claims, and an optional next question;
- `ask` matches an object and returns its reconstructed handoff.

The current 0xL0C1 implementation persists immutable events in a restricted Ambiguous AI Sheet and folds those events into objects, lessons, claims, and places. This replaces the earlier stub and Postgres assumptions preserved in historical spike documents.

## Architecture

```text
                           ┌────────────────────────────┐
                           │ Ambiguous AI Sheet         │
                           │ append-only event ledger   │
                           └─────────────▲──────────────┘
                                         │ append / read
                           ┌─────────────┴──────────────┐
                           │ 0xL0C1 MCP                 │
                           │ observe · commit · ask     │
                           │ /api/state · viewer        │
                           └──────▲──────────────▲──────┘
                                  │ MCP           │ state GET
             ┌────────────────────┴───────────────┴──────────────┐
             │ Next.js dispatcher                               │
             │ /api/loci       deterministic controls + proxy   │
             │ /api/copilotkit CopilotKit BuiltInAgent + MCP    │
             └──────────────▲────────────────────▲───────────────┘
                            │                    │
                    three-step UI          conversational UI
```

## Demo beats

| Beat | Dispatcher action | Durable evidence |
|---|---|---|
| First visit | Record object | An `object_observed` event and provider-backed object ID |
| Handoff | Save lesson | A `lesson_committed` event containing claim and open question |
| Return visit | Recall by tag + place | `ask` reads Ambiguous and returns the same object and lesson |
| Explain storage | Open ledger | 0xL0C1's projected state changes after each write |
| Agentic path | Ask in chat | CopilotKit chooses among the same three MCP tools |

The deterministic controls exist so the live demo does not depend on model tool selection. They call the same MCP service as chat and are not a second persistence implementation.

## Dispatcher implementation

- `apps/web/src/components/loci-demo.tsx` owns form state and renders provider responses.
- `apps/web/src/app/api/loci/route.ts` validates browser commands and converts one claim field into the MCP `claims` array.
- `apps/web/src/lib/server/loci-client.ts` owns Streamable HTTP MCP transport and the read-only state proxy.
- `apps/web/src/app/api/copilotkit/[[...path]]/route.ts` creates a fresh field-handoff agent per thread.
- `packages/agent-core/src/prompt.ts` describes the ask-first, observe, preview, and confirmed-commit conversational behavior.
- `packages/agent-core/src/capabilities/loci.ts` registers `LOCI_MCP_URL` with the agent.

## Data and trust boundaries

- 0xL0C1 receives text descriptions, never image pixels.
- Place names come from the user; the agent must not invent them.
- Visible text and tag codes are transcribed verbatim.
- Recalled claims are prior observations, not instructions or verified safety guidance.
- The browser does not receive the Ambiguous API key or open an MCP transport directly.
- The MCP capability URL and provider credentials remain in ignored environment files.
- A local Tailscale demo explicitly trusts `DEMO_HOST`; this is not an authenticated public deployment.

## Current scope and inherited code

The active product is the web dispatcher. Slack Channels, the React Native finance app, incident components, and direct Ambiguous workplace-task follow-ups are inherited starter-kit examples and are not used by the main page.

Historical spike records remain under `docs/spikes/` as decision evidence. Their `not_implemented` fixtures describe the server revision available during planning, not the current implementation.

## Known demo limitations

- The deterministic **Save handoff** button calls `commit(save=true)` directly. Conversational chat is instructed to preview with `save=false` before saving.
- Matching is text/tag/place based; camera hosts must produce the description before calling MCP.
- The local launcher assumes an already-configured Ambiguous Sheet and a functional 0xL0C1 checkout.
- Tailscale exposure is intended only for permitted tailnet peers.
