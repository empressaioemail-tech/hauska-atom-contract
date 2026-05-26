import { z } from "zod";

import { ENCUMBRANCE_ACCESS_POLICY_SCHEMA, type LegalWeight } from "./common.js";

/** Basis atom cited in a resolved rule entry (ADR-021). */
export type ResolutionBasis =
  | "code-section"
  | "code-amendment"
  | "constraint-overlay"
  | "restriction-clause"
  | "administrative-rule";

export const RESOLUTION_BASES: ReadonlyArray<ResolutionBasis> = [
  "code-section",
  "code-amendment",
  "constraint-overlay",
  "restriction-clause",
  "administrative-rule",
];

export type ConflictStatus = "unresolved" | "resolved";

export const CONFLICT_STATUSES: ReadonlyArray<ConflictStatus> = [
  "unresolved",
  "resolved",
];

export interface ResolvedRuleEntry {
  basis: ResolutionBasis;
  basisCid: string;
  ruleSummary: string;
  precedenceRank: number;
  confidence: number;
  legalWeight: LegalWeight;
  precedenceReason: string;
  evaluatedAt: string;
}

export interface ConstraintConflictEntry {
  topic: string;
  competingBasisCids: ReadonlyArray<string>;
  status: ConflictStatus;
  resolutionNote?: string;
}

export interface ConstraintResolutionAtomInstance {
  entityType: "constraint-resolution";
  /** Stable id for this resolution run (ADR-011 pattern). */
  resolutionDid: string;
  parcelDid: string;
  resolvedAt: string;
  rules: ReadonlyArray<ResolvedRuleEntry>;
  conflicts: ReadonlyArray<ConstraintConflictEntry>;
  procedureExecutionCid?: string;
  accessPolicy?: "tenant-private" | "tenant-shared";
}

const RESOLVED_RULE_SCHEMA = z.object({
  basis: z.enum(
    RESOLUTION_BASES as [ResolutionBasis, ...ResolutionBasis[]],
  ),
  basisCid: z.string().min(1),
  ruleSummary: z.string().min(1),
  precedenceRank: z.number().int(),
  confidence: z.number().min(0).max(1),
  legalWeight: z.enum(["recorded", "advisory"]),
  precedenceReason: z.string().min(1),
  evaluatedAt: z.string().min(1),
});

const CONFLICT_SCHEMA = z.object({
  topic: z.string().min(1),
  competingBasisCids: z.array(z.string().min(1)).min(1),
  status: z.enum(CONFLICT_STATUSES as [ConflictStatus, ...ConflictStatus[]]),
  resolutionNote: z.string().min(1).optional(),
});

export const CONSTRAINT_RESOLUTION_SCHEMA = z.object({
  entityType: z.literal("constraint-resolution"),
  resolutionDid: z.string().min(1),
  parcelDid: z.string().min(1),
  resolvedAt: z.string().min(1),
  rules: z.array(RESOLVED_RULE_SCHEMA),
  conflicts: z.array(CONFLICT_SCHEMA),
  procedureExecutionCid: z.string().min(1).optional(),
  accessPolicy: ENCUMBRANCE_ACCESS_POLICY_SCHEMA.optional(),
});
