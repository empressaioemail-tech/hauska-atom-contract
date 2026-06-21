/**
 * Read-contract schema conformance and no-scalar-accessor type guards.
 */

import { describe, expect, it } from "vitest";

import {
  CALIBRATION_PROVENANCE_SCHEMA,
  WIDTHED_CONFIDENCE_SCHEMA,
  createWidthedConfidence,
  type WidthedConfidence,
  type WidthedPointEstimate,
} from "../common.js";
import { CONSEQUENCE_AXIS_SCHEMA } from "../consequence.js";
import { MODEL_ATTRIBUTION_STAMP_SCHEMA } from "../model-attribution.js";
import {
  READ_CONTRACT_SCHEMA,
  THREE_AXIS_CONFIDENCE_SCHEMA,
} from "../read-contract.js";
import {
  SAMPLE_MODEL_ATTRIBUTION,
  SAMPLE_READ_CONTRACT,
  SAMPLE_THREE_AXIS,
} from "../fixtures.js";

describe("read-contract — Zod validation", () => {
  it("validates a complete read-contract fixture", () => {
    expect(READ_CONTRACT_SCHEMA.safeParse(SAMPLE_READ_CONTRACT).success).toBe(true);
  });

  it("validates three-axis confidence", () => {
    expect(THREE_AXIS_CONFIDENCE_SCHEMA.safeParse(SAMPLE_THREE_AXIS).success).toBe(
      true,
    );
  });

  it("rejects widthed confidence missing n", () => {
    expect(
      WIDTHED_CONFIDENCE_SCHEMA.safeParse({
        estimate: 0.5,
        intervalWidth: 0.2,
        provenance: "asserted",
      }).success,
    ).toBe(false);
  });

  it("rejects widthed confidence missing intervalWidth", () => {
    expect(
      WIDTHED_CONFIDENCE_SCHEMA.safeParse({
        estimate: 0.5,
        n: 10,
        provenance: "live",
      }).success,
    ).toBe(false);
  });

  it("rejects widthed confidence missing provenance", () => {
    expect(
      WIDTHED_CONFIDENCE_SCHEMA.safeParse({
        estimate: 0.5,
        n: 10,
        intervalWidth: 0.2,
      }).success,
    ).toBe(false);
  });

  it("rejects bare number as widthed confidence", () => {
    expect(WIDTHED_CONFIDENCE_SCHEMA.safeParse(0.87).success).toBe(false);
  });

  it("accepts all calibration provenance values", () => {
    for (const provenance of CALIBRATION_PROVENANCE_SCHEMA.options) {
      expect(
        createWidthedConfidence({
          estimate: 0.6,
          n: 1,
          intervalWidth: 0.4,
          provenance,
        }).provenance,
      ).toBe(provenance);
    }
  });

  it("validates model-attribution stamp", () => {
    expect(
      MODEL_ATTRIBUTION_STAMP_SCHEMA.safeParse(SAMPLE_MODEL_ATTRIBUTION).success,
    ).toBe(true);
  });

  it("validates consequence axis", () => {
    expect(
      CONSEQUENCE_AXIS_SCHEMA.safeParse(SAMPLE_THREE_AXIS.consequence).success,
    ).toBe(true);
  });
});

describe("read-contract — no scalar accessor (type-level)", () => {
  it("a bare number is not assignable to WidthedPointEstimate", () => {
    // @ts-expect-error - bare number lacks the widthed brand
    const bad: WidthedPointEstimate = 0.87;
    expect(bad).toBeDefined();
  });

  it("a partial confidence object fails widthed validation at runtime", () => {
    const partial = { estimate: 0.87 };
    expect(WIDTHED_CONFIDENCE_SCHEMA.safeParse(partial).success).toBe(false);
  });

  it("ReadContract has no top-level scalar confidence field", () => {
    const contract = SAMPLE_READ_CONTRACT;
    // @ts-expect-error - ReadContract exposes axes, not a scalar confidence
    const scalarField = contract.confidence;
    expect(scalarField).toBeUndefined();
  });

  it("WidthedConfidence requires all four fields at type level", () => {
    // @ts-expect-error - missing n, intervalWidth, provenance
    const bad: WidthedConfidence = { estimate: 0.5 as WidthedPointEstimate };
    expect(bad).toBeDefined();
  });
});
