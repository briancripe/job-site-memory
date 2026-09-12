"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { LociDemo } from "@/components/loci-demo";

export default function Home() {
  useConfigureSuggestions(
    {
      suggestions: [
        {
          title: "Recall a tagged object",
          message: "I am in the upstairs bathroom looking at tag DEMO-SINK. What do we know about it?",
        },
        {
          title: "Record an observation",
          message: "Help me record a chrome shutoff valve under the upstairs bathroom sink.",
        },
      ],
      available: "before-first-message",
    },
    [],
  );

  return (
      <main className="ck-workspace loci-workspace">
        <header className="ck-workspace-header">
          <div>
            <p className="ck-eyebrow">0xL0C1 × Ambiguous AI × CopilotKit</p>
            <h1>Job-site memory</h1>
            <p className="ck-intro">
              Leave the knowledge on the object, not in somebody&apos;s head.
            </p>
          </div>
          <span className="ck-tag">Live Ambiguous ledger</span>
        </header>
        <LociDemo />
        <div className="loci-chat-row">
          <section
            className="ck-panel ck-assistant"
            aria-labelledby="assistant-title"
          >
            <header className="ck-assistant-header">
              <h2 id="assistant-title">Talk to the field assistant</h2>
              <p>The same observe, commit, and ask tools are available conversationally.</p>
            </header>
            <CopilotChat
              className="ck-chat"
              labels={{
                welcomeMessageText: "What are you looking at? Tell me the room, visible tag, and what you see.",
                chatInputPlaceholder: "Ask about a physical object…",
              }}
            />
          </section>
          <aside className="ck-panel loci-story">
            <p className="ck-eyebrow">Judge view</p>
            <h2>The handoff</h2>
            <ol>
              <li><strong>Tech A observes.</strong> 0xL0C1 appends an immutable object event.</li>
              <li><strong>Tech A leaves a lesson.</strong> The claim and open question are attached to that object.</li>
              <li><strong>Tech B returns.</strong> A tag lookup rebuilds the memory from Ambiguous.</li>
            </ol>
            <p>No browser database is used for the memory. Refresh the ledger or open it beside this page to show the records moving.</p>
          </aside>
        </div>
      </main>
  );
}
