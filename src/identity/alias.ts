/**
 * Alias as an atom and lineage as edges — instrument contract item 2.10.
 *
 * An alias is claim type `identity.alias` with a validity era. Lineage is
 * an edge (`mergedInto`, `dividedInto`, `unmerged`). No lineage column
 * exists on the node.
 */

import { parse, type NodeId } from "./node-id.js";

export type AliasEntityType = "identity.alias";

export type AliasAtom = {
  readonly entityType: AliasEntityType;
  readonly aliasKey: string;
  readonly nodeId: NodeId;
  readonly authority: string;
  readonly validFrom: string;
  readonly validTo: string | null;
  readonly knowledgeAt: string;
};

export type LineageEdgeKind = "mergedInto" | "dividedInto" | "unmerged";

export type LineageEdge = {
  readonly kind: LineageEdgeKind;
  readonly from: NodeId;
  readonly to: NodeId;
};

export const LINEAGE_NODE_COLUMNS = [
  "mergedInto",
  "dividedInto",
  "unmerged",
] as const;

export type LineageNodeColumn = (typeof LINEAGE_NODE_COLUMNS)[number];

/**
 * A node identity record may not carry lineage columns. Those relations
 * are edges. Assigning a type with any of those keys yields `never`.
 */
export type AssertNoLineageColumn<T> =
  Extract<keyof T, LineageNodeColumn> extends never ? T : never;

export class AliasParseError extends Error {
  readonly code = "ALIAS_ERA" as const;

  constructor(
    message: string,
    readonly input: unknown,
  ) {
    super(message);
    this.name = "AliasParseError";
  }
}

export class LineageParseError extends Error {
  readonly code = "LINEAGE_EDGE" as const;

  constructor(
    message: string,
    readonly input: unknown,
  ) {
    super(message);
    this.name = "LineageParseError";
  }
}

export function parseAliasKey(input: string): string {
  if (typeof input !== "string" || input.length === 0) {
    throw new AliasParseError("alias key must be a non-empty string", input);
  }
  return input;
}

export function parseAliasAtom(input: unknown): AliasAtom {
  if (!input || typeof input !== "object") {
    throw new AliasParseError("alias atom required", input);
  }
  const row = input as Record<string, unknown>;
  if (row.entityType !== "identity.alias") {
    throw new AliasParseError("alias atom entityType must be identity.alias", input);
  }
  if (typeof row.aliasKey !== "string" || row.aliasKey.length === 0) {
    throw new AliasParseError("alias atom requires aliasKey", input);
  }
  if (typeof row.nodeId !== "string") {
    throw new AliasParseError("alias atom requires nodeId", input);
  }
  if (typeof row.authority !== "string" || row.authority.length === 0) {
    throw new AliasParseError("alias atom requires authority, validFrom, knowledgeAt", input);
  }
  if (typeof row.validFrom !== "string" || row.validFrom.length === 0) {
    throw new AliasParseError("alias atom requires a validity era (validFrom)", input);
  }
  if (typeof row.knowledgeAt !== "string" || row.knowledgeAt.length === 0) {
    throw new AliasParseError("alias atom requires authority, validFrom, knowledgeAt", input);
  }
  if (row.validTo != null && typeof row.validTo !== "string") {
    throw new AliasParseError("alias atom validTo must be a string or null", input);
  }
  return {
    entityType: "identity.alias",
    aliasKey: parseAliasKey(row.aliasKey),
    nodeId: parse(row.nodeId),
    authority: row.authority,
    validFrom: row.validFrom,
    validTo: row.validTo ?? null,
    knowledgeAt: row.knowledgeAt,
  };
}

export function parseLineageEdge(input: unknown): LineageEdge {
  if (!input || typeof input !== "object") {
    throw new LineageParseError("lineage edge required", input);
  }
  const row = input as Record<string, unknown>;
  if (
    row.kind !== "mergedInto" &&
    row.kind !== "dividedInto" &&
    row.kind !== "unmerged"
  ) {
    throw new LineageParseError("lineage kind must be mergedInto, dividedInto, or unmerged", input);
  }
  if (typeof row.from !== "string" || typeof row.to !== "string") {
    throw new LineageParseError("lineage edge requires from and to node ids", input);
  }
  return { kind: row.kind, from: parse(row.from), to: parse(row.to) };
}

export function acceptNodeWithoutLineage<T extends Record<string, unknown>>(
  node: AssertNoLineageColumn<T>,
): AssertNoLineageColumn<T> {
  return node;
}

/** Runtime export so the Factory shim check observes `AliasAtom` on the module. */
export const AliasAtom = Object.freeze({
  entityType: "identity.alias" as const,
  parse: parseAliasAtom,
  parseKey: parseAliasKey,
  parseLineage: parseLineageEdge,
});
