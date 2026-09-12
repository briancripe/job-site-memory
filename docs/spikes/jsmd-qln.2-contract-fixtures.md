# G3: live 0xL0C1 contract fixtures

## Question

Do the current 0xL0C1 `observe`, `commit`, and `ask` responses provide the live
payload shapes assumed by `apps/web/src/lib/loci.ts`?

## Method

The documented selected stack is AWS App Runner with PostgreSQL. Its public
`/health` endpoint was checked, the clean sibling checkout at `origin/main` was
inspected, and the same server revision was run over stateless Streamable HTTP
against a disposable SQLite database. FastMCP listed the tools and called:

- `observe` for two brass valves under the throwaway place `bench test`;
- `commit` with `save=false` and `save=true`;
- `ask` inputs intended to produce resumed, needs-confirm, and no-match bands.

The capability URL was not available in this workspace, so no protected deployed
route was called. The public deployment and local probe revision nevertheless
agree on the current server surface: the public health endpoint is live while
`origin/main` contains stub tool bodies.

## Evidence

- `https://loci.lincspace.ai/health` returned
  `{"ok":true,"backend":"postgres","db":"ok"}`.
- The sibling checkout was clean at the same commit as `origin/main`. Its
  `server.py` routes all three tools through `stub(...)`; history contains no
  functional implementation commit for that file.
- Tool discovery returned exactly `observe`, `ask`, and `commit`.
- Both observe calls returned `status: "not_implemented"`, null object/place
  identifiers, and `created: false`.
- The dry-run commit returned only `would_have_written`. The `save=true` call
  returned a null lesson id, zero persisted claims, and an inactive cursor.
- All three ask probes returned the same `not_implemented` payload, so resumed,
  needs-confirm, and no-match fixtures cannot be captured from this revision.
- FastMCP supplied each result in both a text content item containing JSON and a
  parsed `structuredContent` object. Sanitized raw call results are stored in
  `apps/web/src/lib/fixtures/g3-observe.json`, `g3-commit.json`, and
  `g3-ask.json`; they contain no capability token.
- `loci.ts` already maps unknown/stub statuses to `band: "not_live"`, so it does
  not misrepresent these responses as memory.

## Verdict

**NO-GO.** The existing `loci.ts` shapes are suitable only for the planned live
contract. The current 0xL0C1 revision cannot produce any of those shapes because
the tool implementations are still explicit stubs.

## Recommendation

Do not build the hackathon console around a fictional live contract. Land and
deploy functional 0xL0C1 persistence/matching first, then rerun this exact fixture
matrix against the protected App Runner MCP URL. Keep the console's existing
`not_live` handling until live resumed, needs-confirm, and no-match fixtures pass.
