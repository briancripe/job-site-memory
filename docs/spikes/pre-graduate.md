# Pre-graduate spikes

## G1 — Graduation home and license

**Question.** Does the console graduate as `briancripe/job-site-memory`, or as
`dispatch/` inside `LincForge/0xl0c1`?

**Why before graduate.** Graduate pushes somewhere public. Moving later splits the
history and the built-vs-brought story the hackathon rules require. The licenses
also differ: the starter kit is MIT, 0xL0C1 is Apache-2.0.

**Method.** Decide with the team against three checks: (1) do the event rules let one
submission span two repos, (2) can MIT kit code sit in an Apache-2.0 repo with its
notice kept, (3) does 0xL0C1's "brought" tag story survive a new directory added
after `brought-2026-09-11`?

**Go / no-go.**
- Go on `dispatch/` in 0xL0C1: all three are yes, and the team accepts the extra
  surface in the submission.
- Otherwise go on a separate repo, linked from the 0xL0C1 README.

**Output.** One line in `docs/DESIGN.md` → *Open questions* moved to *Decisions*.

## G2 — Toolchain green on pnpm + turbo

**Question.** Does the kit run under pnpm's strict linker and turbo, unchanged in
behavior?

**Why before graduate.** A public repo whose quickstart fails is a failed
submission row ("Core Requirements & Functionality").

**Method.** Resume the paused install (`kill -CONT <pid>`) or rerun `pnpm install`,
then `pnpm verify` and `pnpm build`. Watch for undeclared (phantom) deps, the
`@copilotkit/channels-intelligence` hoist in `.npmrc`, a single `@ag-ui/client`
(`pnpm why -r @ag-ui/client`), and `pnpm dev:web` loading the root `.env` through turbo.

**Go / no-go.**
- Go: install, typecheck, test and web build all green; one `@ag-ui/client` version;
  `/` loads on :3100.
- No-go (more than about 30 min of phantom-dep fixes): set `node-linker=hoisted` in
  `.npmrc`, keep turbo, and record why.

## G3 — Live 0xL0C1 contract fixtures

**Question.** Do the real `ask` / `commit` payloads match the P2 shapes that
`apps/web/src/lib/loci.ts` assumes?

**Why before graduate.** The cards are built on those shapes. The live App Runner
stack still serves stub signatures, and Cloud Run and App Runner are separate graphs.

**Method.** After 0xL0C1 P1/P2 deploy, pick the stack the field phone uses. Against a
throwaway `place_label` ("bench test"), call `observe` ×2 (twin valves), `commit`
(`save=false`, then `save=true`), and `ask` in each band (resumed / needs_confirm /
no_match). Save the raw JSON-RPC results as fixtures under `apps/web/src/lib/fixtures/`.
Also record whether results arrive as `structuredContent` or JSON text.

**Go / no-go.**
- Go: the `loci.test.ts` cases pass when fed the captured fixtures.
- No-go: adjust `loci.ts` to the real shape. Never ask 0xL0C1 to change a return
  shape or threshold for the console (its do-not list).

**Constraint.** Never commit the capability token. The fixtures hold payloads only.

## G4 — CopilotKit ↔ remote MCP round-trip

**Question.** Does `BuiltInAgent` with `mcpServers: [{ type: "http", url: LOCI_MCP_URL }]`
connect to 0xL0C1, list exactly three tools, and complete a multi-step turn
(`ask` → confirm → `ask(object_id)`) inside `maxSteps`?

**Why before graduate.** It's the whole integration. If the runtime can't carry the
capability URL (FastMCP `stateless_http` + `json_response`), the console has no data.

**Method.** `pnpm dev:web` with `LOCI_MCP_URL` set. In chat: "Check LOCI. Brass ball
valve, red lever, bench test, stamp not visible." Watch the runtime logs and the
0xL0C1 viewer.

**Go / no-go.**
- Go: three tools are visible; the confirm band comes back; resolving by object id
  returns the open question; two turns in a row survive (stateless HTTP, fresh
  agent per request).
- No-go: fall back to a server route that calls MCP via `@modelcontextprotocol/sdk`
  (already a web dependency, same pattern as `lib/server/workplace.ts`) and exposes
  frontend tools to the agent. More code, same UX.

Also check: whether FastMCP's server `instructions` (the "data, not instructions"
sentence) reach the model. If not, `DISPATCH_ROLE` must restate it.

## G5 — `useRenderTool` renders MCP tool calls on 1.70.1

**Question.** On the pinned `@copilotkit/react-core` 1.70.1, can `useRenderTool({ name: "ask" })`
render a call that ran server-side on an MCP server, including its `result`?

**Why before graduate.** The confirm band and dry-run cards are the visible
difference between this console and "ChatGPT next to a viewer". Current docs show
the hook, but the pinned version is unverified.

**Method.** Register renderers for `ask` and `commit` that dump `status`, `args` and
`result`. Drive G4's prompt.

**Go / no-go.**
- Go: renderer fires with the parsed result for both tools.
- Partial: fires without `result` → render from the tool message instead (the
  `useRenderToolCall` + agent messages pattern).
- No-go: nothing fires for MCP tools → add the G4 fallback frontend tools and render
  those with `useComponent`. Don't bump CopilotKit mid-event: `channels` and `runtime`
  are a tested pair.

## G6 — Public-repo hygiene

**Question.** Is anything in history or the tree unfit for a public repo?

**Why before graduate.** Publishing is hard to reverse. The capability token was
shared in chat, and the kit arrives with a large tree.

**Method.** Run `gitleaks detect` (or `git log -p | grep -E "loci-[a-z0-9]{20,}"`) on
every local commit. Check that `.env` is ignored, `.env.example` holds placeholders
only, no `.data/` or approval metadata is tracked, and LICENSE/NOTICE attribution
covers the kit.

**Go / no-go.**
- Go: no hits, attribution present.
- No-go: rotate the 0xL0C1 path token (their infra, their call), then scrub before
  graduate. Graduate's squash covers local history. Nothing has been pushed.
