# Job Site Memory demo script

The deterministic dispatcher controls are the primary demo. CopilotKit chat is a second route through the same 0xL0C1 tools.

## Before recording

```bash
just demo-check
```

Open the dispatcher and use **Open ledger** to place the 0xL0C1 state viewer beside it. Start with a newly generated tag.

## Reliable two-minute flow

1. Explain the problem: a different technician returns days later and should not need the homeowner or previous technician to reconstruct the job.
2. Show the visible tag, room, object label, visible text, and description already filled in.
3. Click **Record object**. Point out the real object ID and increased object count.
4. Click **Save handoff**. Point out the lesson and claim counts and the open question.
5. Click **Recall from Ambiguous**. Explain that this lookup sends tag + place + description and deliberately does not reuse the browser's object ID.
6. Read the returned claim and open question. Refresh the ledger to show that the data is persisted outside the page.
7. Name the integrations: CopilotKit provides the in-app agent experience; 0xL0C1 provides physical-object memory over MCP; Ambiguous AI is the durable event ledger; OpenRouter or OpenAI supplies the model.

## Conversational prompts

Replace the example tag with the tag shown on the page.

### Recall

> I am in the upstairs bathroom looking at tag JS-123ABC. What did the previous technician learn, and what question is still open?

Expected: the agent calls `ask` and clearly labels returned claims as recalled notes.

### Observe

> I am looking at a chrome quarter-turn shutoff valve beneath the upstairs bathroom sink. Its visible tag is JS-123ABC and it says “1/2 IN COLD.” Record it as the sink shutoff.

Expected: the agent calls `ask` first. If there is no match, it calls `observe`. It must not invent a room.

### Commit with preview

> We verified that turning it clockwise one quarter-turn isolates the sink supply. The open question is whether this branch also supplies the exterior hose bib. Prepare that handoff, but show me the preview before saving.

Expected: `commit(save=false)`, followed by a preview. After the user explicitly says “Save it,” the agent calls `commit(save=true)`.

## Failure recovery

- If counts do not load, run `just demo-check` and inspect the 0xL0C1 terminal.
- If recall says `no_match`, copy the exact generated tag and place from the first step.
- If recall says `needs_confirm`, use the returned candidate's exact object ID in chat.
- If chat fails while buttons work, check `/api/copilotkit/info` and the model-provider key.
- If buttons fail while MCP health is green, check `/api/loci` and the Ambiguous Sheet settings owned by 0xL0C1.

Inherited Slack incident and React Native finance prompts are template references, not part of the Job Site Memory submission flow.
