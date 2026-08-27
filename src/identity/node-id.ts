/**
 * Branded opaque {@link NodeId} — instrument contract item 2.1 (T1.2).
 *
 * Constructible only via {@link mint} or validating {@link parse}. A bare
 * string does not satisfy write-boundary signatures that require `NodeId`.
 * Salvaged from unpublished PR #22; grammar matches the Factory shim.
 */

import { randomBytes } from "node:crypto";

/** Opaque node identity minted by the substrate; not a natural key alias. */
export type NodeId = string & { readonly __brand: "NodeId" };

/** Typed refusal when {@link parse} rejects malformed input. */
export class NodeIdParseError extends Error {
  readonly code = "malformed_node_id" as const;

  constructor(
    message: string,
    readonly input: string,
  ) {
    super(message);
    this.name = "NodeIdParseError";
  }
}

/** Canonical `nid_` + 32 lowercase hex chars (128-bit opaque payload). */
export const NODE_ID_PATTERN = /^nid_[0-9a-f]{32}$/;

/**
 * County-prop natural key `{fips}:{propId}`. An alias key, never a NodeId.
 * `parse` refuses this grammar; {@link isCountyPropAliasKey} accepts it.
 */
export const COUNTY_PROP_ALIAS_KEY = /^[0-9]{5}:.+$/;

const NODE_ID_PREFIX = "nid_";
const NODE_ID_HEX_LENGTH = 32;

function brandNodeId(value: string): NodeId {
  return value as NodeId;
}

/**
 * Mint a fresh opaque node id. The only runtime constructor for new writes.
 */
export function mint(): NodeId {
  const hex = randomBytes(NODE_ID_HEX_LENGTH / 2).toString("hex");
  return brandNodeId(`${NODE_ID_PREFIX}${hex}`);
}

/**
 * Validate and brand an existing id string. Refuses malformed input; no coercion.
 * Refuses `{fips}:{propId}` — that grammar is an alias key, not a node id.
 */
export function parse(input: string): NodeId {
  if (typeof input !== "string" || input.length === 0) {
    throw new NodeIdParseError(
      "NodeId must be a non-empty string",
      String(input),
    );
  }
  if (isCountyPropAliasKey(input)) {
    throw new NodeIdParseError(
      `NodeId refuses county-prop alias key "${input}"; use it as an alias key only`,
      input,
    );
  }
  if (!NODE_ID_PATTERN.test(input)) {
    throw new NodeIdParseError(
      `NodeId must match ${NODE_ID_PATTERN}; got "${input}"`,
      input,
    );
  }
  return brandNodeId(input);
}

/** True when `value` is a county-prop alias key, not a node id. */
export function isCountyPropAliasKey(value: string): boolean {
  return typeof value === "string" && COUNTY_PROP_ALIAS_KEY.test(value);
}

/** Runtime narrow for values that already passed {@link parse}. */
export function isNodeId(value: unknown): value is NodeId {
  return typeof value === "string" && NODE_ID_PATTERN.test(value);
}

/**
 * Write-boundary signature: accepts only a branded {@link NodeId}.
 * Property/engine adapters call this (or take `NodeId` directly) so bare
 * natural keys fail at compile time.
 */
export function bindNodeIdForWrite(nodeId: NodeId): { readonly nodeId: NodeId } {
  return { nodeId };
}

/** String form for persistence layers that store plain text. */
export function nodeIdToString(nodeId: NodeId): string {
  return nodeId;
}

/** Runtime export so the Factory shim check observes `NodeId` on the module. */
export const NodeId = Object.freeze({
  brand: "NodeId" as const,
  pattern: NODE_ID_PATTERN,
  mint,
  parse,
  is: isNodeId,
});
