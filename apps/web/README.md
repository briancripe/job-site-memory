# Job Site Memory dispatcher

This Next.js app is the primary hackathon surface. It provides a deterministic three-step dispatcher workflow and a CopilotKit chat backed by the same 0xL0C1 MCP server.

Run it from the repository root; the canonical setup is in the [root README](../../README.md#run-the-demo-locally).

```bash
just demo       # local 0xL0C1 + dispatcher
just demo-web   # dispatcher only; use configured LOCI_MCP_URL
just demo-check # verify live endpoints
```

## User flow

1. **Record object** calls `observe` and displays the provider-backed object ID.
2. **Save handoff** calls `commit(save=true)` with one claim and an optional open question.
3. **Recall from Ambiguous** calls `ask` using tag, place, and description. It deliberately omits the locally captured object ID so the return demonstrates persisted lookup.
4. **Open ledger** opens 0xL0C1's read-only projected state.

The counters are loaded through the server-side state proxy. They are not browser-local data.

## Request paths

| Path | Role |
|---|---|
| `/` | Dispatcher controls and CopilotKit chat |
| `/api/loci` GET | Proxy 0xL0C1 projected state for counts and ledger link |
| `/api/loci` POST | Validate deterministic UI commands and call `observe`, `commit`, or `ask` over MCP |
| `/api/copilotkit` | CopilotKit runtime with the field-handoff prompt and LOCI MCP tools |
| `/api/copilotkit/info` | Runtime readiness check |

## Important files

| Concern | File |
|---|---|
| Page composition | [`src/app/page.tsx`](src/app/page.tsx) |
| Observe / handoff / recall interface | [`src/components/loci-demo.tsx`](src/components/loci-demo.tsx) |
| Deterministic API route | [`src/app/api/loci/route.ts`](src/app/api/loci/route.ts) |
| MCP transport and state proxy | [`src/lib/server/loci-client.ts`](src/lib/server/loci-client.ts) |
| CopilotKit endpoint | [`src/app/api/copilotkit/[[...path]]/route.ts`](src/app/api/copilotkit/[[...path]]/route.ts) |
| Shared agent and prompt | [`../../packages/agent-core/src/agent.ts`](../../packages/agent-core/src/agent.ts), [`../../packages/agent-core/src/prompt.ts`](../../packages/agent-core/src/prompt.ts) |

## Runtime configuration

The app reads root `.env` and `.env.local`. Required variables are:

- one model key: `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GOOGLE_API_KEY`;
- `LOCI_MCP_URL`, including the 0xL0C1 capability path;
- `DEMO_HOST` when binding beyond loopback.

`AMBIGUOUS_API_KEY` and `LOCI_AMBIGUOUS_SHEET_ID` are consumed by a locally launched 0xL0C1 process. A deployed 0xL0C1 instance owns its own provider configuration.

The direct Ambiguous workplace-task code under `src/lib/server/followups.ts` is inherited reference code and is not rendered by the current dispatcher page.

## Verification

```bash
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build
```

These checks do not prove provider persistence. For that, run the demo and complete an observe → handoff → recall cycle, or use `just demo-check` for endpoint readiness.
