# Job Site Memory

Job Site Memory is a dispatcher console for [0xL0C1](https://github.com/LincForge/0xl0c1). It lets one technician record a physical object and leave a lesson, then lets a later technician recover that handoff using the object's visible tag and location.

The demo is intentionally concrete:

1. **Observe on site** appends an object event.
2. **Leave a handoff** appends a lesson, claim, and open question to that object.
3. **Return visit** asks by tag and place and rebuilds the memory from persisted events.

The dispatcher uses CopilotKit for conversational access, 0xL0C1 for the `observe` / `commit` / `ask` memory contract, and an Ambiguous AI Sheet as the append-only event ledger.

## Run the demo locally

### Prerequisites

- Node.js 22+
- pnpm 9.12+
- [just](https://github.com/casey/just)
- A model-provider key for chat (OpenRouter or OpenAI)
- An Ambiguous API key and restricted Sheet configured for 0xL0C1
- For the complete local stack: a functional 0xL0C1 checkout with `uv` available

Install the JavaScript workspace:

```bash
just install
```

Create `.env` for credentials:

```dotenv
MODEL_PROVIDER=openrouter
OPENROUTER_API_KEY=replace-me
MODEL=openai/gpt-5.6-sol
AMBIGUOUS_API_KEY=replace-me
```

Create `.env.local` for machine-specific demo settings:

```dotenv
DEMO_HOST=127.0.0.1
LOCI_SERVER_DIR=/absolute/path/to/0xl0c1
LOCI_MCP_URL=http://127.0.0.1:8130/loci-localdemo/mcp
LOCI_AMBIGUOUS_SHEET_ID=replace-me
LOCI_AMBIGUOUS_RANGE=Events!A1:M1
LOCI_AMBIGUOUS_TAB=Events
```

Both files are ignored by Git. `LOCI_SERVER_DIR` must point to the checkout containing the functional Ambiguous event store, not an older stub revision.

Start the complete local stack:

```bash
just demo
```

This keeps Next.js and 0xL0C1 attached to one terminal. Open <http://127.0.0.1:3100>; Ctrl-C stops both processes.

If 0xL0C1 is already running or deployed, set `LOCI_MCP_URL` to that endpoint and run only the dispatcher:

```bash
just demo-web
```

Verify the running stack from another terminal:

```bash
just demo-check
```

The check covers the page, CopilotKit runtime, browser-to-LOCI bridge, and MCP health endpoint.

### Tailscale access

Use this machine's Tailscale IPv4 address for both `DEMO_HOST` and the local MCP URL:

```dotenv
DEMO_HOST=100.x.y.z
LOCI_MCP_URL=http://100.x.y.z:8130/loci-localdemo/mcp
```

Then run `just demo`. The dispatcher is available to permitted tailnet peers at `http://100.x.y.z:3100`. The approval-session handler trusts the explicit `DEMO_HOST` in addition to loopback.

## Rehearse the judge flow

Open the dispatcher and keep the 0xL0C1 ledger in a second window using **Open ledger**.

1. Note the generated tag and click **Record object**. The object count increases and a provider-backed object ID appears.
2. Click **Save handoff**. The lesson and claim counts increase.
3. Click **Recall from Ambiguous**. The dispatcher sends only tag, place, and description—not the browser's object ID—and renders the returned object, lesson, claim, and open question.
4. Refresh the dispatcher and use the same tag to explain the return-visit story. The memory is reconstructed from Ambiguous rather than browser storage.
5. Use chat to show the same contract conversationally. For example: “I am in the upstairs bathroom looking at tag JS-123ABC. What did the previous technician learn?”

The deterministic controls are the dependable demonstration path. Chat uses the same MCP tools but lets the model decide which tool to call.

## How the dispatcher is built

```text
Browser controls ──POST /api/loci──────────────┐
                                                │ MCP
CopilotKit chat ──POST /api/copilotkit─────────┼──► 0xL0C1
                                                │      │
Ledger counters ──GET /api/loci ──GET state────┘      │ append/read
                                                       ▼
                                                Ambiguous Sheet
```

| Area | Implementation |
|---|---|
| Three-step dispatcher UI | [`apps/web/src/components/loci-demo.tsx`](apps/web/src/components/loci-demo.tsx) |
| Same-origin browser API | [`apps/web/src/app/api/loci/route.ts`](apps/web/src/app/api/loci/route.ts) |
| MCP client and state proxy | [`apps/web/src/lib/server/loci-client.ts`](apps/web/src/lib/server/loci-client.ts) |
| CopilotKit runtime | [`apps/web/src/app/api/copilotkit/[[...path]]/route.ts`](apps/web/src/app/api/copilotkit/[[...path]]/route.ts) |
| Field-handoff agent prompt | [`packages/agent-core/src/prompt.ts`](packages/agent-core/src/prompt.ts) |
| MCP capability configuration | [`packages/agent-core/src/capabilities/loci.ts`](packages/agent-core/src/capabilities/loci.ts) |
| Local operator commands | [`justfile`](justfile) |

The browser never calls the MCP endpoint directly. The Next.js route speaks MCP server-side, normalizes tool results, and proxies the read-only graph state. Images are not sent to 0xL0C1; a camera-capable host must turn what it sees into text before calling the tools.

## Commands

| Command | Purpose |
|---|---|
| `just install` | Install the pinned pnpm workspace |
| `just demo` | Run local 0xL0C1 and the dispatcher together |
| `just demo-loci` | Run only local 0xL0C1 |
| `just demo-web` | Run only the dispatcher against `LOCI_MCP_URL` |
| `just demo-check` | Check all live demo endpoints |
| `just check` | Run TypeScript checks and offline tests |
| `just test` | Run offline tests |
| `just build` | Build the workspace |

## Current scope

The web dispatcher is the hackathon product. The inherited Slack channel, React Native finance sample, incident components, and workplace follow-up implementation remain in the repository as starter-kit reference code; they are not part of the primary Job Site Memory demo.

Historical feasibility work is retained under [`docs/spikes/`](docs/spikes/README.md). Those documents record what was true when 0xL0C1 still returned stubs and should not be read as current runtime status. The current architecture is in [`docs/DESIGN.md`](docs/DESIGN.md).

## Onboarding Prompt

For web onboarding, use the official prompt as written:

```text
Help me get started with CopilotKit. Run this command and follow the instructions:

npx --yes copilotkit@latest onboard start
```

Channels and mobile setup remain documented in [`apps/channel/README.md`](apps/channel/README.md) and [`apps/mobile/README.md`](apps/mobile/README.md), respectively.

## Verification and provenance

Before publishing a change, run:

```bash
just check
just build
```

Live provider verification is separate: run `just demo-check`, then complete observe → handoff → recall with a disposable tag.

This repository began from CopilotKit's MIT-licensed `agents-everywhere-starter-kit` at commit `5c8bf4c`. The Job Site Memory workflow, LOCI bridge, field prompt, dispatcher interface, local recipes, and Ambiguous-backed round-trip were built during the hackathon. See [`SUBMISSION.md`](SUBMISSION.md) for the submission narrative and [`hackathon-rules.md`](hackathon-rules.md) for event rules.
