/**
 * Shared read-contract substrate per Calibrated Spine F4 / F6 / K6.
 *
 * A widthed confidence point is inseparable from its n, interval width,
 * and calibration provenance. Bare scalars are unrepresentable: the
 * estimate is a branded nominal type constructible only through
 * {@link createWidthedConfidence}.
 */

import { z } from "zod";

/** How the accuracy-axis estimate was earned or labeled. */
export type CalibrationProvenance = "asserted" | "backtest" | "seed" | "live";

export const CALIBRATION_PROVENANCE_VALUES: ReadonlyArray<CalibrationProvenance> =
  ["asserted", "backtest", "seed", "live"];

export const CALIBRATION_PROVENANCE_SCHEMA = z.enum([
  "asserted",
  "backtest",
  "seed",
  "live",
]);

declare const WidthedPointEstimateBrand: unique symbol;

/**
 * Branded point estimate — not assignable from a bare `number`.
 * Consumers must hold a {@link WidthedConfidence} object; there is no
 * exported scalar confidence type.
 */
export type WidthedPointEstimate = number & {
  readonly [WidthedPointEstimateBrand]: true;
};

const UNIT_INTERVAL = z.number().min(0).max(1);

export const WIDTHED_CONFIDENCE_FIELDS = {
  estimate: UNIT_INTERVAL,
  n: z.number().int().min(0),
  intervalWidth: UNIT_INTERVAL,
  provenance: CALIBRATION_PROVENANCE_SCHEMA,
} as const;

export const WIDTHED_CONFIDENCE_SCHEMA = z
  .object(WIDTHED_CONFIDENCE_FIELDS)
  .readonly();

/**
 * Inseparable accuracy-or-source-quality confidence object. Every field
 * is required; partial objects fail validation and typechecking.
 */
export interface WidthedConfidence {
  readonly estimate: WidthedPointEstimate;
  readonly n: number;
  readonly intervalWidth: number;
  readonly provenance: CalibrationProvenance;
}

function brandEstimate(value: number): WidthedPointEstimate {
  return value as WidthedPointEstimate;
}

export interface CreateWidthedConfidenceInput {
  estimate: number;
  n: number;
  intervalWidth: number;
  provenance: CalibrationProvenance;
}

/**
 * Sole constructor for {@link WidthedConfidence}. Validates the full
 * widthed shape at runtime; brands the estimate at compile time.
 */
export function createWidthedConfidence(
  input: CreateWidthedConfidenceInput,
): WidthedConfidence {
  const parsed = WIDTHED_CONFIDENCE_SCHEMA.parse(input);
  return {
    estimate: brandEstimate(parsed.estimate),
    n: parsed.n,
    intervalWidth: parsed.intervalWidth,
    provenance: parsed.provenance,
  };
}

/** Runtime guard — rejects bare numbers and partial objects. */
export function isWidthedConfidence(value: unknown): value is WidthedConfidence {
  return WIDTHED_CONFIDENCE_SCHEMA.safeParse(value).success;
}

/**
 * Display/read helper that preserves the inseparable object. Returns
 * the same widthed shape; not a scalar accessor.
 */
export function asWidthedConfidenceRecord(
  confidence: WidthedConfidence,
): Readonly<WidthedConfidence> {
  return Object.freeze({ ...confidence });
}
