import { randomUUID } from "node:crypto";
import {
  CopilotRuntime,
  createCopilotHonoHandler,
} from "@copilotkit/runtime/v2";
import { JOB_SITE_BRIDGE_PROMPT, makeAgent } from "agent-core";

const runtime = new CopilotRuntime({
  agents: () => ({
    default: makeAgent(randomUUID(), {
      prompt: JOB_SITE_BRIDGE_PROMPT,
    }),
  }),
});

const app = createCopilotHonoHandler({
  runtime,
  basePath: "/api/mobile-copilotkit",
});

export const GET = app.fetch;
export const POST = app.fetch;
export const OPTIONS = app.fetch;
