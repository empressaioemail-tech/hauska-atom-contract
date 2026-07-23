/**
 * Property reasoning atom kind tests — master WDLL 3.2–3.6.
 */

import { describe, expect, it } from "vitest";

import { REASONING_CHAIN_SCHEMA } from "../../reasoning-chain.js";
import { BUILDABLE_ENVELOPE_SCHEMA } from "../buildable-envelope.js";
import {
  BEXAR_NULL_ZONING_FACT_FIXTURE,
  COMAL_SETBACK_RULE_FIXTURE,
  FALLBACK_SETBACK_RULE_FIXTURE,
  HAYS_BUILDABLE_ENVELOPE_FIXTURE,
  HAYS_ZONING_FACT_FIXTURE,
  NEGATIVE_ENVELOPE_NO_INPUT_REFS,
  NEGATIVE_SETBACK_BARE_STRING_CITATION,
  NEGATIVE_SETBACK_FALLBACK_NO_ABSENCE,
  NEGATIVE_ZONING_DISTRICT_AND_ABSENCE,
  TRAVIS_PREFIX_SETBACK_RULE_FIXTURE,
} from "../fixtures.js";
import { SETBACK_RULE_SCHEMA } from "../setback-rule.js";
import { ZONING_FACT_SCHEMA } from "../zoning-fact.js";

describe("property — zoning-fact (WDLL 3.3)", () => {
  it("validates Hays County RS district fixture 48209:156346", () => {
    expect(ZONING_FACT_SCHEMA.safeParse(HAYS_ZONING_FACT_FIXTURE).success).toBe(true);
    expect(HAYS_ZONING_FACT_FIXTURE.parcelNodeId).toBe("48209:156346");
    expect(HAYS_ZONING_FACT_FIXTURE.district).toBe("RS");
    expect(HAYS_ZONING_FACT_FIXTURE.accessPolicy).toBe("public-free");
    expect(HAYS_ZONING_FACT_FIXTURE.atomTier).toBe("data");
  });

  it("validates Bexar null-zoning honest-absence 48029:410119", () => {
    expect(ZONING_FACT_SCHEMA.safeParse(BEXAR_NULL_ZONING_FACT_FIXTURE).success).toBe(
      true,
    );
    expect(BEXAR_NULL_ZONING_FACT_FIXTURE.absence?.kind).toBe("no-zoning-stamp");
    expect(BEXAR_NULL_ZONING_FACT_FIXTURE.district).toBeUndefined();
  });

  it("rejects both district and absence", () => {
    expect(
      ZONING_FACT_SCHEMA.safeParse(NEGATIVE_ZONING_DISTRICT_AND_ABSENCE).success,
    ).toBe(false);
  });

  it("allows asserted readContract snapshot with placeholder calibrated axis", () => {
    const axes = HAYS_ZONING_FACT_FIXTURE.readContract?.axes;
    expect(axes?.calibratedConfidence.provenance).toBe("asserted");
    expect(axes?.assertedConfidence.provenance).toBe("asserted");
  });
});

describe("property — setback-rule (WDLL 3.4/3.5)", () => {
  it("validates Comal exact-match with typed sourceCodeAtomRef", () => {
    expect(SETBACK_RULE_SCHEMA.safeParse(COMAL_SETBACK_RULE_FIXTURE).success).toBe(true);
    expect(COMAL_SETBACK_RULE_FIXTURE.sourceCodeAtomRef.role).toBe("rule");
    expect(typeof COMAL_SETBACK_RULE_FIXTURE.sourceCodeAtomRef).toBe("object");
    expect(COMAL_SETBACK_RULE_FIXTURE.matchBasis).toBe("exact");
    expect(COMAL_SETBACK_RULE_FIXTURE.fieldProvenance?.front?.atomDid).toBeTruthy();
  });

  it("validates Travis prefix-match fixture", () => {
    expect(SETBACK_RULE_SCHEMA.safeParse(TRAVIS_PREFIX_SETBACK_RULE_FIXTURE).success).toBe(
      true,
    );
    expect(TRAVIS_PREFIX_SETBACK_RULE_FIXTURE.matchBasis).toBe("prefix");
  });

  it("validates fallback with honest-absence", () => {
    expect(SETBACK_RULE_SCHEMA.safeParse(FALLBACK_SETBACK_RULE_FIXTURE).success).toBe(
      true,
    );
    expect(FALLBACK_SETBACK_RULE_FIXTURE.absence?.kind).toBe("setback-fallback");
  });

  it("rejects bare string sourceCodeAtomRef (not AtomInputRef)", () => {
    expect(
      SETBACK_RULE_SCHEMA.safeParse(NEGATIVE_SETBACK_BARE_STRING_CITATION).success,
    ).toBe(false);
  });

  it("rejects fallback matchBasis without honest-absence", () => {
    expect(
      SETBACK_RULE_SCHEMA.safeParse(NEGATIVE_SETBACK_FALLBACK_NO_ABSENCE).success,
    ).toBe(false);
  });
});

describe("property — buildable-envelope (WDLL 3.6)", () => {
  it("validates derived envelope for 48209:156346 with full input chain", () => {
    expect(BUILDABLE_ENVELOPE_SCHEMA.safeParse(HAYS_BUILDABLE_ENVELOPE_FIXTURE).success).toBe(
      true,
    );
    const chain = HAYS_BUILDABLE_ENVELOPE_FIXTURE.reasoningChain;
    expect(chain.derivationMethod).toBe("buildable-envelope-inset-v1");
    expect(chain.inputAtomRefs.length).toBe(4);
    expect(
      REASONING_CHAIN_SCHEMA.safeParse(HAYS_BUILDABLE_ENVELOPE_FIXTURE.reasoningChain)
        .success,
    ).toBe(true);
  });

  it("uses not-applicable PropertyConsequence on envelope readContract", () => {
    const consequence = HAYS_BUILDABLE_ENVELOPE_FIXTURE.readContract?.axes.consequence;
    expect(consequence?.kind).toBe("not-applicable");
  });

  it("has no labeling x district multiply field", () => {
    const keys = Object.keys(HAYS_BUILDABLE_ENVELOPE_FIXTURE);
    expect(keys).not.toContain("labeling");
    expect(keys).not.toContain("district");
    expect(JSON.stringify(HAYS_BUILDABLE_ENVELOPE_FIXTURE)).not.toMatch(
      /labeling.*district|district.*labeling/,
    );
  });

  it("rejects derived without inputAtomRefs", () => {
    expect(
      BUILDABLE_ENVELOPE_SCHEMA.safeParse(NEGATIVE_ENVELOPE_NO_INPUT_REFS).success,
    ).toBe(false);
    expect(REASONING_CHAIN_SCHEMA.safeParse(NEGATIVE_ENVELOPE_NO_INPUT_REFS.reasoningChain).success).toBe(
      false,
    );
  });
});

describe("property — SourceAttribution absence", () => {
  it("grep-equivalent: no SourceAttribution export in property module", async () => {
    const mod = await import("../index.js");
    expect(Object.keys(mod)).not.toContain("SourceAttribution");
    expect(Object.keys(mod)).not.toContain("SourceLicensingTerms");
  });
});
