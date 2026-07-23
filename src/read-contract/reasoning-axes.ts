/**
 * Alternate read-contract axes for property / envelope / non-life-safety
 * reasoning atoms (Gate B §2.5.2).
 *
 * Life-safety surfaces keep {@link ThreeAxisConfidence} with required
 * ASCE7/IBC {@link ConsequenceAxis}. Property reasoning uses honest
 * property-risk strata or explicit not-applicable — never stuffed ASCE7.
 */

import { z } from "zod";

import {
  WIDTHED_CONFIDENCE_SCHEMA,
  createWidthedConfidence,
  type WidthedConfidence,
} from "./common.js";
import {
  MODEL_ATTRIBUTION_STAMP_SCHEMA,
  type ModelAttributionStamp,
} from "./model-attribution.js";

/** Property-risk stratum — no "essential" invent (life-safety only). */
export type PropertyRiskStratum = "routine" | "elevated" | "critical";

export const PROPERTY_RISK_STRATA: ReadonlyArray<PropertyRiskStratum> = [
  "routine",
  "elevated",
  "critical",
];

export type PropertyConsequence =
  | {
      kind: "property-risk";
      stratum: PropertyRiskStratum;
      /** Honest basis: e.g. "flood-sfha", "no-buildable-area", "setback-constrained". */
      basis: string;
      assertedAt: string;
      auditRef?: string;
    }
  | {
      kind: "not-applicable";
      reason: string;
      assertedAt: string;
    };

export const PROPERTY_CONSEQUENCE_PROPERTY_RISK_SCHEMA = z.object({
  kind: z.literal("property-risk"),
  stratum: z.enum(PROPERTY_RISK_STRATA as [PropertyRiskStratum, ...PropertyRiskStratum[]]),
  basis: z.string().min(1),
  assertedAt: z.string().min(1),
  auditRef: z.string().min(1).optional(),
});

export const PROPERTY_CONSEQUENCE_NOT_APPLICABLE_SCHEMA = z.object({
  kind: z.literal("not-applicable"),
  reason: z.string().min(1),
  assertedAt: z.string().min(1),
});

export const PROPERTY_CONSEQUENCE_SCHEMA = z.discriminatedUnion("kind", [
  PROPERTY_CONSEQUENCE_PROPERTY_RISK_SCHEMA,
  PROPERTY_CONSEQUENCE_NOT_APPLICABLE_SCHEMA,
]);

export interface ReasoningThreeAxisConfidence {
  readonly calibratedConfidence: WidthedConfidence;
  readonly assertedConfidence: WidthedConfidence;
  readonly consequence: PropertyConsequence;
}

export const REASONING_THREE_AXIS_CONFIDENCE_SCHEMA = z
  .object({
    calibratedConfidence: WIDTHED_CONFIDENCE_SCHEMA,
    assertedConfidence: WIDTHED_CONFIDENCE_SCHEMA,
    consequence: PROPERTY_CONSEQUENCE_SCHEMA,
  })
  .readonly();

/**
 * Read-contract for property / envelope reasoning emitters.
 * Life-safety / ICC code-risk surfaces keep {@link ReadContract}.
 */
export interface ReasoningReadContract {
  readonly axes: ReasoningThreeAxisConfidence;
  readonly assembledAt: string;
  readonly modelAttribution?: ModelAttributionStamp;
}

export const REASONING_READ_CONTRACT_SCHEMA = z
  .object({
    axes: REASONING_THREE_AXIS_CONFIDENCE_SCHEMA,
    assembledAt: z.string().min(1),
    modelAttribution: MODEL_ATTRIBUTION_STAMP_SCHEMA.optional(),
  })
  .readonly();

export function createPropertyConsequence(
  input: z.input<typeof PROPERTY_CONSEQUENCE_SCHEMA>,
): PropertyConsequence {
  return PROPERTY_CONSEQUENCE_SCHEMA.parse(input) as PropertyConsequence;
}

export interface CreateReasoningThreeAxisConfidenceInput {
  calibratedConfidence: z.input<typeof WIDTHED_CONFIDENCE_SCHEMA>;
  assertedConfidence: z.input<typeof WIDTHED_CONFIDENCE_SCHEMA>;
  consequence: z.input<typeof PROPERTY_CONSEQUENCE_SCHEMA>;
}

export function createReasoningThreeAxisConfidence(
  input: CreateReasoningThreeAxisConfidenceInput,
): ReasoningThreeAxisConfidence {
  const parsed = REASONING_THREE_AXIS_CONFIDENCE_SCHEMA.parse(input);
  return {
    calibratedConfidence: createWidthedConfidence(parsed.calibratedConfidence),
    assertedConfidence: createWidthedConfidence(parsed.assertedConfidence),
    consequence: createPropertyConsequence(parsed.consequence),
  };
}

export interface CreateReasoningReadContractInput {
  axes: CreateReasoningThreeAxisConfidenceInput;
  assembledAt: string;
  modelAttribution?: z.input<typeof MODEL_ATTRIBUTION_STAMP_SCHEMA>;
}

export function createReasoningReadContract(
  input: CreateReasoningReadContractInput,
): ReasoningReadContract {
  const parsed = REASONING_READ_CONTRACT_SCHEMA.parse({
    axes: input.axes,
    assembledAt: input.assembledAt,
    modelAttribution: input.modelAttribution,
  });
  return {
    axes: createReasoningThreeAxisConfidence(parsed.axes),
    assembledAt: parsed.assembledAt,
    modelAttribution: parsed.modelAttribution,
  };
}

/** Runtime validator for property reasoning read-contract emitters. */
export function validateReasoningReadContract(value: unknown): ReasoningReadContract {
  const parsed = REASONING_READ_CONTRACT_SCHEMA.parse(value);
  return createReasoningReadContract(parsed);
}
