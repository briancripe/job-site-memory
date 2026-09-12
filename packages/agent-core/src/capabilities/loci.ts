/**
 * 0xL0C1 — object-anchored memory over MCP (observe / ask / commit).
 *
 * LOCI_MCP_URL is a capability URL (`https://<host>/loci-<token>/mcp`): the path
 * token IS the credential, so no auth header and never commit the value.
 * Unset contributes nothing, same as the workplace capability.
 */
import type { MCPClientConfig } from "@copilotkit/runtime/v2";

export function lociMcpServers(): MCPClientConfig[] {
  const url = process.env.LOCI_MCP_URL?.trim();
  return url ? [{ type: "http", url }] : [];
}
