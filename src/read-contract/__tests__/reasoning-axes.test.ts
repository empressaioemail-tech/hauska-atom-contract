/**
 * Reasoning read-contract axes tests (Gate B §2.5.2).
 */

import { describe, expect, it } from "vitest";

import {
  PROPERTY_CONSEQUENCE_SCHEMA,
  REASONING_READ_CONTRACT_SCHEMA,
  REASONING_THREE_AXIS_CONFIDENCE_SCHEMA,
  createPropertyConsequence,
  createReasoningReadContract,
  validateReasoningReadContract,
} from "../reasoning-axes.js";
import { THREE_AXIS_CONFIDENCE_SCHEMA } from "../read-contract.js";
import { SAMPLE_THREE_AXIS } from "../fixtures.js";
import { DERIVED_ENVELOPE_REASONING_STUB } from "../../reasoning/fixtures.js";

describe("reasoning-axes — PropertyConsequence", () => {
  it("accepts property-risk consequence", () => {
    const consequence = createPropertyConsequence({
      kind: "property-risk",
      stratum: "elevated",
      basis: "flood-sfha",
      assertedAt: "2026-07-23T12:00:00.000Z",
    });
    expect(PROPERTY_CONSEQUENCE_SCHEMA.safeParse(consequence).success).toBe(true);
  });

  it("accepts not-applicable consequence", () => {
    const consequence = createPropertyConsequence({
      kind: "not-applicable",
      reason: "envelope-geometry-derivation-has-no-life-safety-stratum",
      assertedAt: "2026-07-23T12:00:00.000Z",
    });
    expect(PROPERTY_CONSEQUENCE_SCHEMA.safeParse(consequence).success).toBe(true);
  });

  it("rejects stuffed ASCE7 shape as PropertyConsequence", () => {
    expect(
      PROPERTY_CONSEQUENCE_SCHEMA.safeParse({
        derivation: { source: "asce7-risk-category", asce7RiskCategory: "I" },
        stratum: "routine",
        assertedAt: "2026-07-23T12:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});

describe("reasoning-axes — ThreeAxisConfidence requiredness unchanged", () => {
  it("life-safety ThreeAxisConfidence still requires ConsequenceAxis", () => {
    expect(THREE_AXIS_CONFIDENCE_SCHEMA.safeParse(SAMPLE_THREE_AXIS).success).toBe(true);
    expect(SAMPLE_THREE_AXIS.consequence.derivation.asce7RiskCategory).toBeDefined();
  });

  it("ReasoningThreeAxisConfidence uses PropertyConsequence not ConsequenceAxis", () => {
    const axes = DERIVED_ENVELOPE_REASONING_STUB.readContract!.axes;
    expect(REASONING_THREE_AXIS_CONFIDENCE_SCHEMA.safeParse(axes).success).toBe(true);
    expect(axes.consequence.kind).toBe("not-applicable");
  });
});

describe("reasoning-axes — ReasoningReadContract", () => {
  it("validates derived envelope read-contract fixture", () => {
    const contract = DERIVED_ENVELOPE_REASONING_STUB.readContract!;
    expect(REASONING_READ_CONTRACT_SCHEMA.safeParse(contract).success).toBe(true);
    expect(validateReasoningReadContract(contract).assembledAt).toBe(contract.assembledAt);
  });

  it("createReasoningReadContract assembles axes", () => {
    const contract = createReasoningReadContract({
      axes: {
        calibratedConfidence: { estimate: 0.7, n: 5, intervalWidth: 0.2, provenance: "seed" },
        assertedConfidence: { estimate: 0.6, n: 0, intervalWidth: 0.4, provenance: "asserted" },
        consequence: {
          kind: "property-risk",
          stratum: "routine",
          basis: "setback-constrained",
          assertedAt: "2026-07-23T12:00:00.000Z",
        },
      },
      assembledAt: "2026-07-23T12:00:00.000Z",
    });
    expect(contract.axes.consequence.kind).toBe("property-risk");
  });
});
