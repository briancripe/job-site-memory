import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JOB_SITE_BRIDGE_PROMPT } from "./prompt";

const root = new URL("../../..", import.meta.url);
const read = (path: string) =>
  readFileSync(new URL(path, root), "utf8");

test("job-site bridge uses Loci identity before one exact CRM deal and both routes enable it", () => {
  for (const phrase of [
    "QR or tag may be a recall hint, never the required demo path",
    "do not continue on needs_confirm or\n  no_match",
    "object_id exactly",
    "Only after that approved commit may you update CRM",
    "list_deals",
    "update_deal, log_activity, and\n  create_task",
    "If no deal\n  or multiple deals match, say so and stop; never guess a deal",
    "return task due the next day",
  ]) {
    assert.ok(JOB_SITE_BRIDGE_PROMPT.includes(phrase), phrase);
  }

  for (const route of [
    "apps/web/src/app/api/copilotkit/[[...path]]/route.ts",
    "apps/web/src/app/api/mobile-copilotkit/[[...path]]/route.ts",
  ]) {
    const source = read(route);
    assert.match(source, /JOB_SITE_BRIDGE_PROMPT/);
    assert.doesNotMatch(source, /workplace:\s*false/);
  }
});
