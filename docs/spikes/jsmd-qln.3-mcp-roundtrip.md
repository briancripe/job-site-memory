# G4: CopilotKit remote MCP round-trip

## Question

Can the pinned CopilotKit `BuiltInAgent` connect to 0xL0C1, expose exactly its
three tools, and complete the ask/confirm/object-id flow across fresh stateless
HTTP turns?

## Method

The web runtime and shared agent factory were inspected at their pinned versions.
The current 0xL0C1 server revision was then run over the same stateless
Streamable HTTP transport used in deployment. Independent FastMCP client
processes listed and called its tools to verify discovery and fresh-client
transport behavior.

The intended chat prompt was not sent through `pnpm dev:web`: this environment
has neither a model-provider key nor the protected `LOCI_MCP_URL`, and G3 proved
that the current server revision cannot return the required confirm or resumed
responses even if those credentials are supplied.

## Evidence

- `packages/agent-core/src/capabilities/loci.ts` maps a configured
  `LOCI_MCP_URL` directly to `{ type: "http", url }` with no invented headers.
- `makeAgent` creates a fresh `BuiltInAgent`, includes the LOCI server, and sets
  `maxSteps: 10`, which is enough for a multi-tool turn by construction.
- Remote discovery over Streamable HTTP listed exactly `observe`, `ask`, and
  `commit`.
- Multiple fresh FastMCP client processes completed calls against the stateless
  endpoint with HTTP 200 responses, proving that the server transport itself
  does not depend on a retained client session.
- The current tool bodies always return `status: "not_implemented"`. A confirm
  band, an `ask(object_id)` open question, and two successful model turns
  therefore cannot be observed.
- The FastMCP server declares instructions that explicitly classify lessons and
  claims as data, never instructions. Without a runnable model turn, whether
  CopilotKit delivers those server instructions to the model remains unverified.
- No capability URL or token was written to the repository.

## Verdict

**NO-GO.** The direct MCP configuration and stateless transport are plausible and
tool discovery is correct, but the integration's required behavior cannot occur
until 0xL0C1 implements its tools. Missing local runtime credentials also prevent
claiming a model-level round-trip.

## Recommendation

Deploy functional 0xL0C1 tools and rerun the prompt against the protected App
Runner URL with a configured model key. Keep the existing direct
`BuiltInAgent.mcpServers` path as the first choice. Only if that live rerun shows
a CopilotKit transport failure should implementation use the already-declared
`@modelcontextprotocol/sdk` server-route fallback.
