/**
 * Stable evt_ node ID derivation and anchor validation.
 *
 * Resolver contract: every `evt_` ID is derived from `(source, external_id)`
 * using the same stable-ID discipline as the rest of the node-type registry.
 * A manually constructed `evt_` ID that is not anchored to a real
 * source/external_id pair is rejected by {@link validateEvtNodeAnchor}.
 */

import { createHash } from "node:crypto";

import { hasNodeTypePrefix } from "./common.js";

export interface EvtNodeAnchor {
  readonly source: string;
  readonly externalId: string;
}

/**
 * Derive the canonical evt_ node ID for a source/external_id pair.
 * Deterministic across runtimes — SHA-256 digest truncated to 16 hex chars.
 */
export function deriveEvtNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `evt_${digest}`;
}

/** True when `nodeId` carries the evt_ prefix. */
export function isEvtNodeId(nodeId: string): boolean {
  return hasNodeTypePrefix(nodeId, "evt_");
}

/**
 * Verify that `nodeId` matches the canonical derivation for the anchor.
 * Rejects manually constructed IDs not anchored to the pair.
 */
export function validateEvtNodeAnchor(
  nodeId: string,
  anchor: EvtNodeAnchor,
): boolean {
  if (!isEvtNodeId(nodeId)) return false;
  return nodeId === deriveEvtNodeId(anchor.source, anchor.externalId);
}
