/**
 * Read-contract object (F4) and three-axis confidence contract (F6).
 *
 * Returned at read time; derived quantities are not stored. Calibration
 * provenance (K6) rides on each {@link WidthedConfidence} on the
 * accuracy and source-quality axes.
 */

import { z } from "zod";

import {
  WIDTHED_CONFIDENCE_SCHEMA,
  createWidthedConfidence,
  type WidthedConfidence,
} from "./common.js";
import {
  CONSEQUENCE_AXIS_SCHEMA,
  createConsequenceAxis,
  type ConsequenceAxis,
} from "./consequence.js";
import {
  MODEL_ATTRIBUTION_STAMP_SCHEMA,
  type ModelAttributionStamp,
} from "./model-attribution.js";

/**
 * Three distinct confidence axes per the calibration architecture addendum.
 *
 * - {@link ThreeAxisConfidence.calibratedConfidence} — accuracy, earned
 *   (commitment #2 governs only this axis).
 * - {@link ThreeAxisConfidence.assertedConfidence} — source-quality,
 *   asserted with provenance on every write.
 * - {@link ThreeAxisConfidence.consequence} — severity, asserted-audited,
 *   derived from code risk classifications; no invented scalar.
 */
export interface ThreeAxisConfidence {
  readonly calibratedConfidence: WidthedConfidence;
  readonly assertedConfidence: WidthedConfidence;
  readonly consequence: ConsequenceAxis;
}

export const THREE_AXIS_CONFIDENCE_SCHEMA = z
  .object({
    calibratedConfidence: WIDTHED_CONFIDENCE_SCHEMA,
    assertedConfidence: WIDTHED_CONFIDENCE_SCHEMA,
    consequence: CONSEQUENCE_AXIS_SCHEMA,
  })
  .readonly();

/**
 * The read-contract object every confidence-emitting surface must return.
 * No bare scalar confidence field exists on this type.
 */
export interface ReadContract {
  readonly axes: ThreeAxisConfidence;
  /** ISO-8601 timestamp when the read-contract was assembled at read time. */
  readonly assembledAt: string;
  /**
   * Model-attribution stamp from the ledger deposit that sourced this
   * read. Omitted on deterministic / non-model reads.
   */
  readonly modelAttribution?: ModelAttributionStamp;
}

export const READ_CONTRACT_SCHEMA = z
  .object({
    axes: THREE_AXIS_CONFIDENCE_SCHEMA,
    assembledAt: z.string().min(1),
    modelAttribution: MODEL_ATTRIBUTION_STAMP_SCHEMA.optional(),
  })
  .readonly();

export interface CreateThreeAxisConfidenceInput {
  calibratedConfidence: z.input<typeof WIDTHED_CONFIDENCE_SCHEMA>;
  assertedConfidence: z.input<typeof WIDTHED_CONFIDENCE_SCHEMA>;
  consequence: z.input<typeof CONSEQUENCE_AXIS_SCHEMA>;
}

export function createThreeAxisConfidence(
  input: CreateThreeAxisConfidenceInput,
): ThreeAxisConfidence {
  const parsed = THREE_AXIS_CONFIDENCE_SCHEMA.parse(input);
  return {
    calibratedConfidence: createWidthedConfidence(parsed.calibratedConfidence),
    assertedConfidence: createWidthedConfidence(parsed.assertedConfidence),
    consequence: createConsequenceAxis(parsed.consequence),
  };
}

export interface CreateReadContractInput {
  axes: CreateThreeAxisConfidenceInput;
  assembledAt: string;
  modelAttribution?: z.input<typeof MODEL_ATTRIBUTION_STAMP_SCHEMA>;
}

export function createReadContract(input: CreateReadContractInput): ReadContract {
  const parsed = READ_CONTRACT_SCHEMA.parse({
    axes: input.axes,
    assembledAt: input.assembledAt,
    modelAttribution: input.modelAttribution,
  });
  return {
    axes: createThreeAxisConfidence(parsed.axes),
    assembledAt: parsed.assembledAt,
    modelAttribution: parsed.modelAttribution,
  };
}

/**
 * Legacy {@link EngineEnvelopeConfidence} shape still emitted by
 * engine-core and cortex-api. Migration adapters consume this and
 * produce a {@link ReadContract}; it is not a valid emission shape
 * once F4 propagation lands.
 */
export interface LegacyEngineEnvelopeConfidence {
  readonly value: number;
  readonly kind: "calibrated" | "asserted" | "deterministic";
}
