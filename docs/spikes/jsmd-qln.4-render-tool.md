# G5: CopilotKit MCP tool rendering

## Question

Can pinned `@copilotkit/react-core` 1.70.1 render server-side MCP `ask` and
`commit` calls with their status, arguments, and result?

## Method

The installed 1.70.1 v2 type declarations and implementation for
`useRenderTool` and `useRenderToolCall` were inspected. The code path that maps a
tool call and its matching tool message into renderer properties was traced for
in-progress, executing, and complete states. The planned live G4 prompt could
not be driven because G4 ended NO-GO before a functional MCP result reached the
agent.

## Evidence

- `@copilotkit/react-core/v2` 1.70.1 exports both `useRenderTool` and
  `useRenderToolCall`.
- A named `useRenderTool` registration matches `toolCall.function.name`, so
  `ask` and `commit` can have dedicated renderers without becoming frontend
  tools.
- Tool arguments are parsed from `toolCall.function.arguments` and exposed as
  typed `parameters`; status is exposed as `inProgress`, `executing`, or
  `complete`.
- On completion, 1.70.1 passes `toolMessage.content` as `result`. Its public type
  is `string`, and the implementation does not JSON-parse it. A renderer must
  parse the JSON text locally before drawing a structured confirm or dry-run
  card.
- G3 shows the current MCP transport supplies JSON text as well as
  `structuredContent`, but G4 never produced an agent tool message. It is
  therefore unverified whether a server-side MCP call is retained in the
  CopilotKit message stream in exactly the form this hook expects.
- No renderer or other product UI was added by this spike, and no CopilotKit
  package was bumped.

## Verdict

**NO-GO for the live rendering claim.** The pinned API has the necessary named
renderer surface and includes a raw result string, but the upstream MCP flow did
not produce a live `ask` or `commit` tool message to prove that the renderer
fires.

## Recommendation

After G4 is green, register `useRenderTool` for `ask` and `commit`, validate the
parameters with Zod, and parse the completed result string with a small guarded
JSON helper. This is the smallest viable path and requires neither a CopilotKit
upgrade nor frontend-tool duplication. Use `useRenderToolCall` plus agent
messages only if the live replay loses the matching tool message; use frontend
tools only if named MCP renderers do not fire at all.
