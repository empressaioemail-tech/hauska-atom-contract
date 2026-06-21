/**
 * Severity axis (consequence) per Calibrated Spine F6.
 *
 * Asserted, audited, and derived from code risk classifications.
 * No invented severity scalar is stored — only classification inputs
 * and a discrete stratum identifier.
 */

import { z } from "zod";

/** ASCE 7 risk categories I–IV. */
export type Asce7RiskCategory = "I" | "II" | "III" | "IV";

export const ASCE7_RISK_CATEGORIES: ReadonlyArray<Asce7RiskCategory> = [
  "I",
  "II",
  "III",
  "IV",
];

/**
 * Discrete consequence stratum derived from code classifications at
 * read time. Not a continuous severity score.
 */
export type ConsequenceStratum =
  | "routine"
  | "elevated"
  | "critical"
  | "essential";

export const CONSEQUENCE_STRATA: ReadonlyArray<ConsequenceStratum> = [
  "routine",
  "elevated",
  "critical",
  "essential",
];

export type ConsequenceDerivationSource =
  | "asce7-risk-category"
  | "ibc-occupancy-importance"
  | "derived-composite";

export const CONSEQUENCE_DERIVATION_SOURCES: ReadonlyArray<ConsequenceDerivationSource> =
  ["asce7-risk-category", "ibc-occupancy-importance", "derived-composite"];

export const CONSEQUENCE_DERIVATION_SCHEMA = z
  .object({
    source: z.enum([
      "asce7-risk-category",
      "ibc-occupancy-importance",
      "derived-composite",
    ]),
    asce7RiskCategory: z.enum(["I", "II", "III", "IV"]),
    ibcOccupancyGroup: z.string().min(1).optional(),
    ibcImportanceFactor: z.number().positive().optional(),
    jurisdictionCode: z.string().min(1).optional(),
  })
  .readonly();

export type ConsequenceDerivation = z.infer<typeof CONSEQUENCE_DERIVATION_SCHEMA>;

/**
 * Severity axis: asserted-and-audited classification metadata with a
 * discrete stratum label. Commitment #2 does not govern this axis.
 */
export interface ConsequenceAxis {
  readonly derivation: ConsequenceDerivation;
  readonly stratum: ConsequenceStratum;
  /** ISO-8601 timestamp when the stratum was asserted. */
  readonly assertedAt: string;
  /** Optional audit trail reference (code section, AHJ schedule, etc.). */
  readonly auditRef?: string;
}

export const CONSEQUENCE_AXIS_SCHEMA = z
  .object({
    derivation: CONSEQUENCE_DERIVATION_SCHEMA,
    stratum: z.enum(["routine", "elevated", "critical", "essential"]),
    assertedAt: z.string().min(1),
    auditRef: z.string().min(1).optional(),
  })
  .readonly();

export function createConsequenceAxis(
  input: z.input<typeof CONSEQUENCE_AXIS_SCHEMA>,
): ConsequenceAxis {
  return CONSEQUENCE_AXIS_SCHEMA.parse(input) as ConsequenceAxis;
}
