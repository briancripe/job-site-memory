# Post-graduate spikes

None of these change the first public cut. Start one only when its trigger shows
up. Every one stays inside 0xL0C1's constraints: three tools, zero pixels on the
server, no threshold tuning.

## P1 — Server-enforced write gate

**Trigger.** The console is used outside a rehearsed demo.

**Question.** Can the agent's MCP tool list be filtered so it never holds
`commit(save=true)`, with the save done by a server route after the dispatcher clicks?

**Method.** Filter tools on the runtime side (per-agent tool allowlist, or wrap the
MCP client) and reuse the kit's `/api/followups` approval-record pattern for the
click → `commit(save=true)` → read-back.

**Go / no-go.** Go when the agent can only reach `save=false`, and a forged chat
"approved" writes nothing. No-go keeps the conversational gate, documented as such.

## P2 — Restoration job over four tables

**Trigger.** A multi-visit restoration job (days since loss, moisture readings per
room, what's left to verify) is needed beyond the valve demo.

**Question.** Can a job be represented with only `place` / `object` / `lesson` /
`claim`? For example: a dotted place path per job (`job0712.laundry`), meter
readings as claims with a naming convention, and the open question as the day's
verification.

**Method.** Model the washing-machine job by hand through the real tools. Then ask
for a briefing: cause, day N, what to verify, what to tell the client, what
insurance still needs.

**Go / no-go.** Go if the briefing comes out right from `ask` payloads alone. No-go
means it needs a schema change. That's a proposal to the 0xL0C1 team, not a change
made from this repo.

## P3 — Client status report / insurance export sink

**Trigger.** Someone outside the crew (homeowner, carrier) needs the record.

**Question.** What's the smallest outbound sink? Ambiguous project updates and docs
(round 1's idea, now as an export target rather than the store), email, or a
read-only link.

**Method.** Generate one status report from a resumed `ask`, and deliver it through
the cheapest channel the recipient already uses.

**Go / no-go.** Go when the homeowner can read progress without calling dispatch. The
sink must hold no data that isn't also in 0xL0C1.

## P4 — Tech-2 live video → `ask` reliability

**Trigger.** Return visits are done hands-free on camera, not scripted.

**Question.** How often does a phone assistant with live video (ChatGPT voice + video,
Claude mobile) put the stamp into `visible_verbatim_text` and the place into
`place_label`, and call `ask` at all?

**Method.** Run 20 trials across the two valves, stamp visible and hidden. Record
which band each lands in against ground truth.

**Go / no-go.** Go if wrong auto-resumes are 0 and a missed call can be recovered by
voice. Otherwise the fix is prompt or prop changes on the host side, never thresholds.

## P5 — Real identity instead of a capability URL

**Trigger.** More than one crew or customer on one graph.

**Question.** Can MCP OAuth (supported by Claude connectors) or Auth0 at a gateway in
front of 0xL0C1 replace the shared path token without breaking ChatGPT Developer
Mode's "no authentication" path?

**Method.** Put a proxy in front of a throwaway 0xL0C1 instance. Test each host's
connector flow.

**Go / no-go.** Go when all three seats (Claude mobile, ChatGPT, this console)
authenticate as distinct principals. 0xL0C1's "No OAuth" was a Saturday decision,
so this is a team conversation first.

## P6 — Prune the inherited kit

**Trigger.** Graduate has landed and the demo is over.

**Question.** Can `apps/channel`, `apps/mobile`, `dev-docs/` and the incident sample
go without breaking `pnpm verify` or the built-vs-brought record?

**Method.** Delete in one commit, then run verify. Keep a pointer to the upstream kit
commit in the README.

**Go / no-go.** Go when verify is green and the README's provenance line still names
the kit commit.
