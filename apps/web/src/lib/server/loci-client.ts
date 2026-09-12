import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

export class LociError extends Error {}

function configuredUrl() {
  const value = process.env.LOCI_MCP_URL?.trim();
  if (!value) throw new LociError("LOCI_MCP_URL is not configured.");
  return new URL(value);
}

function payload(result: unknown): Record<string, unknown> {
  const parsed = CallToolResultSchema.parse(result);
  if (parsed.isError)
    throw new LociError("0xL0C1 rejected the operation. Check its server logs.");
  if (parsed.structuredContent) return parsed.structuredContent;
  const text = parsed.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");
  try {
    const value = JSON.parse(text);
    if (value && typeof value === "object") return value;
  } catch {
    // Controlled error below.
  }
  throw new LociError("0xL0C1 returned an unreadable response.");
}

export async function callLoci(
  name: "observe" | "commit" | "ask",
  args: Record<string, unknown>,
) {
  const client = new Client({ name: "job-site-memory-web", version: "0.1.0" });
  try {
    await client.connect(new StreamableHTTPClientTransport(configuredUrl()), {
      timeout: 15_000,
    });
    return payload(
      await client.callTool(
        { name, arguments: args },
        CallToolResultSchema,
        { timeout: 20_000 },
      ),
    );
  } finally {
    await client.close().catch(() => {});
  }
}

export async function readLociState() {
  const mcpUrl = configuredUrl();
  mcpUrl.pathname = mcpUrl.pathname.replace(/\/mcp\/?$/, "/api/state");
  const response = await fetch(mcpUrl, { cache: "no-store" });
  if (!response.ok) throw new LociError(`0xL0C1 state returned HTTP ${response.status}.`);
  const state = await response.json();
  const viewerUrl = new URL(mcpUrl);
  viewerUrl.pathname = viewerUrl.pathname.replace(/\/api\/state$/, "/");
  return { state, viewerUrl: viewerUrl.toString() };
}
