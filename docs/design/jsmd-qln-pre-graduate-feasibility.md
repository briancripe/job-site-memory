# Decision: pre-graduate toolchain and integration feasibility

- Status: decided
- Molecule: `jsmd-qln`
- Decision: **NO-GO**

## Context

The hackathon console needs a green local toolchain and a real 0xL0C1 MCP path.
Graduation-home and license work was intentionally excluded because it does not
add hackathon functionality.

## Evidence

- [G2 (`jsmd-qln.1`)](../spikes/jsmd-qln.1-toolchain.md) is GO: strict pnpm,
  deduplication, checks, production build, and the port-3100 page load pass.
- [G3 (`jsmd-qln.2`)](../spikes/jsmd-qln.2-contract-fixtures.md) is NO-GO: the
  public deployment is healthy, but the current clean `origin/main` tool bodies
  are explicit `not_implemented` stubs and cannot produce live payload bands.
- [G4 (`jsmd-qln.3`)](../spikes/jsmd-qln.3-mcp-roundtrip.md) is NO-GO: exactly
  three tools are discoverable and stateless HTTP works, but no confirm/resume
  round-trip can occur and no model credential is configured locally.
- [G5 (`jsmd-qln.4`)](../spikes/jsmd-qln.4-render-tool.md) is NO-GO for the live
  claim: the pinned renderer API is suitable with guarded JSON parsing, but no
  functional MCP tool message exists to exercise it.

## Decision

Do not publish or build speculative console behavior against the claimed live
0xL0C1 contract. Keep the green toolchain work and `not_live` handling, but stop
the integration path at this evidence gate.

## Consequences

0xL0C1 must first land and deploy functional persistence and matching. Then rerun
G3 against the protected App Runner capability URL, followed by G4 and G5 with a
configured model key. If those probes turn green, re-enter planning with
`bh replan jsmd-qln`; this decision does not create implementation beads on its
own.
