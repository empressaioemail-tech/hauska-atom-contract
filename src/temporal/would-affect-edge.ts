/**
 * Structural would_affect edges — event node to subject node.
 *
 * Carries existence only (effective date + anchor). Effect-probability
 * is a derived atom re-estimated over time and is NOT stored on this edge.
 *
 * `immutable: true` is a TypeScript discriminated-union tag communicating
 * the contract. Backend write paths MUST reject updates to deposited
 * would_affect edges; supersession is via a new edge deposit.
 */

import { z } from "zod";

import { detectNodeTypePrefix, isIsoDate } from "./common.js";
import { isEvtNodeId } from "./node-id.js";

/** Literal true tag — structural, never updated after deposit. */
export type WouldAffectImmutableTag = true;

/**
 * Structural edge from an event node to a subject node.
 *
 * - `sourceNodeId` MUST carry the `evt_` prefix.
 * - `targetSubjectId` carries a subject prefix (`parcel_`, `jurisdiction_`, etc.).
 * - `effectiveDate` is the ISO 8601 calendar date the event takes effect.
 */
export interface WouldAffectEdge {
  readonly type: "would_affect";
  readonly sourceNodeId: string;
  readonly targetSubjectId: string;
  readonly effectiveDate: string;
  readonly immutable: WouldAffectImmutableTag;
}

export const WOULD_AFFECT_EDGE_SCHEMA = z
  .object({
    type: z.literal("would_affect"),
    sourceNodeId: z.string().min(1),
    targetSubjectId: z.string().min(1),
    effectiveDate: z.string().min(1),
    immutable: z.literal(true),
  })
  .readonly();

export type WouldAffectEdgeValidationCode =
  | "invalid-source-prefix"
  | "invalid-target-prefix"
  | "missing-effective-date"
  | "invalid-effective-date"
  | "invalid-immutable-tag";

export interface WouldAffectEdgeValidationIssue {
  readonly code: WouldAffectEdgeValidationCode;
  readonly path: string;
  readonly message: string;
}

export interface WouldAffectEdgeValidationResult {
  readonly ok: boolean;
  readonly edge?: WouldAffectEdge;
  readonly issues: ReadonlyArray<WouldAffectEdgeValidationIssue>;
}

const SUBJECT_PREFIXES = ["parcel_", "jurisdiction_", "code-section_", "security_"] as const;

function hasSubjectPrefix(nodeId: string): boolean {
  return SUBJECT_PREFIXES.some((p) => nodeId.startsWith(p));
}

/**
 * Validate a would_affect edge. Rejects missing/non-ISO effectiveDate and
 * sourceNodeId values that do not carry the evt_ prefix.
 */
export function validateWouldAffectEdge(input: unknown): WouldAffectEdgeValidationResult {
  const issues: WouldAffectEdgeValidationIssue[] = [];

  const parsed = WOULD_AFFECT_EDGE_SCHEMA.safeParse(input);
  if (!parsed.success) {
    const missingDate =
      typeof input === "object" &&
      input !== null &&
      !("effectiveDate" in input);

    if (missingDate) {
      return {
        ok: false,
        issues: [
          {
            code: "missing-effective-date",
            path: "effectiveDate",
            message: "effectiveDate is required on would_affect edges",
          },
        ],
      };
    }

    return {
      ok: false,
      issues: [
        {
          code: "invalid-effective-date",
          path: "",
          message: parsed.error.message,
        },
      ],
    };
  }

  const data = parsed.data;

  if (!isEvtNodeId(data.sourceNodeId)) {
    issues.push({
      code: "invalid-source-prefix",
      path: "sourceNodeId",
      message: `sourceNodeId must carry evt_ prefix; got "${data.sourceNodeId}"`,
    });
  }

  if (!hasSubjectPrefix(data.targetSubjectId)) {
    const detected = detectNodeTypePrefix(data.targetSubjectId);
    issues.push({
      code: "invalid-target-prefix",
      path: "targetSubjectId",
      message: detected
        ? `targetSubjectId must be a subject node (parcel_, jurisdiction_, etc.); got prefix "${detected}"`
        : `targetSubjectId must carry a known subject prefix; got "${data.targetSubjectId}"`,
    });
  }

  if (!data.effectiveDate || data.effectiveDate.trim() === "") {
    issues.push({
      code: "missing-effective-date",
      path: "effectiveDate",
      message: "effectiveDate is required on would_affect edges",
    });
  } else if (!isIsoDate(data.effectiveDate)) {
    issues.push({
      code: "invalid-effective-date",
      path: "effectiveDate",
      message: `effectiveDate must be a valid ISO 8601 date (YYYY-MM-DD); got "${data.effectiveDate}"`,
    });
  }

  if (data.immutable !== true) {
    issues.push({
      code: "invalid-immutable-tag",
      path: "immutable",
      message: 'would_affect edges require immutable: true',
    });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return { ok: true, edge: data as WouldAffectEdge, issues: [] };
}

/** Edge union for the TCE graph write surface (v1.6.0). */
export type EdgeType = WouldAffectEdge;

export function createWouldAffectEdge(
  input: Omit<WouldAffectEdge, "type" | "immutable">,
): WouldAffectEdge {
  const candidate = { ...input, type: "would_affect" as const, immutable: true as const };
  const result = validateWouldAffectEdge(candidate);
  if (!result.ok || !result.edge) {
    throw new Error(
      result.issues.map((i) => i.message).join("; ") || "invalid would_affect edge",
    );
  }
  return result.edge;
}
