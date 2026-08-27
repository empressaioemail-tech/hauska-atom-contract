/**
 * Supersession as an edge — instrument contract item 2.8.
 *
 * No `supersededBy` column exists to write. SUPERSEDED_BY is an edge
 * type with `closedAt` on the prior window.
 */

import { parse, type NodeId } from "../identity/node-id.js";

export const SUPERSEDED_BY = "SUPERSEDED_BY" as const;

export type SupersessionEdge = {
  readonly link_type: typeof SUPERSEDED_BY;
  readonly from: NodeId;
  readonly to: NodeId;
  readonly closedAt: string;
};

export const SUPERSEDED_BY_COLUMN = "supersededBy" as const;

export type SupersededByColumn = typeof SUPERSEDED_BY_COLUMN;

/**
 * An atom record may not carry a supersededBy column. Assigning a type
 * with that key yields `never`.
 */
export type AssertNoSupersededByColumn<T> =
  Extract<keyof T, SupersededByColumn> extends never ? T : never;

export class SupersessionParseError extends Error {
  readonly code = "SUPERSESSION_EDGE" as const;

  constructor(
    message: string,
    readonly input: unknown,
  ) {
    super(message);
    this.name = "SupersessionParseError";
  }
}

export function parseSupersessionEdge(input: unknown): SupersessionEdge {
  if (!input || typeof input !== "object") {
    throw new SupersessionParseError("SUPERSEDED_BY edge required", input);
  }
  const row = input as Record<string, unknown>;
  if (row.link_type !== SUPERSEDED_BY) {
    throw new SupersessionParseError("link_type must be SUPERSEDED_BY", input);
  }
  if (typeof row.from !== "string" || typeof row.to !== "string") {
    throw new SupersessionParseError("SUPERSEDED_BY edge requires from and to", input);
  }
  if (typeof row.closedAt !== "string" || row.closedAt.length === 0) {
    throw new SupersessionParseError("SUPERSEDED_BY edge requires closedAt on the prior window", input);
  }
  return {
    link_type: SUPERSEDED_BY,
    from: parse(row.from),
    to: parse(row.to),
    closedAt: row.closedAt,
  };
}

export function acceptAtomWithoutSupersededBy<T extends Record<string, unknown>>(
  atom: AssertNoSupersededByColumn<T>,
): AssertNoSupersededByColumn<T> {
  return atom;
}

/** Runtime export so the Factory shim check observes `SupersessionEdge` on the module. */
export const SupersessionEdge = Object.freeze({
  linkType: SUPERSEDED_BY,
  parse: parseSupersessionEdge,
});
