/**
 * ADR-020 / ADR-021 schema conformance — sample fixtures must parse.
 */

import { describe, expect, it } from "vitest";

import { ADMINISTRATIVE_RULE_SCHEMA } from "../administrative-rule.js";
import { CONSTRAINT_RESOLUTION_SCHEMA } from "../constraint-resolution.js";
import {
  ENCUMBRANCE_DEFAULT_ACCESS_POLICY,
  isEncumbranceAccessPolicy,
} from "../common.js";
import {
  SAMPLE_ADMINISTRATIVE_RULE,
  SAMPLE_CONSTRAINT_RESOLUTION,
  SAMPLE_RECORDED_INSTRUMENT,
  SAMPLE_RESTRICTION_CLAUSE,
  SAMPLE_RESTRICTION_CORPUS,
  SAMPLE_UPLOAD_ONLY_INSTRUMENT,
} from "../fixtures.js";
import { RECORDED_INSTRUMENT_SCHEMA } from "../recorded-instrument.js";
import { RESTRICTION_CLAUSE_SCHEMA } from "../restriction-clause.js";
import { RESTRICTION_CORPUS_SCHEMA } from "../restriction-corpus.js";

describe("encumbrance fixtures — Zod validation", () => {
  it("validates recorded-instrument with county recording", () => {
    expect(RECORDED_INSTRUMENT_SCHEMA.safeParse(SAMPLE_RECORDED_INSTRUMENT).success).toBe(
      true,
    );
  });

  it("validates recorded-instrument with null recording (R4 upload)", () => {
    expect(
      RECORDED_INSTRUMENT_SCHEMA.safeParse(SAMPLE_UPLOAD_ONLY_INSTRUMENT).success,
    ).toBe(true);
  });

  it("validates restriction-clause", () => {
    expect(RESTRICTION_CLAUSE_SCHEMA.safeParse(SAMPLE_RESTRICTION_CLAUSE).success).toBe(
      true,
    );
  });

  it("validates restriction-corpus", () => {
    expect(RESTRICTION_CORPUS_SCHEMA.safeParse(SAMPLE_RESTRICTION_CORPUS).success).toBe(
      true,
    );
  });

  it("validates administrative-rule", () => {
    expect(
      ADMINISTRATIVE_RULE_SCHEMA.safeParse(SAMPLE_ADMINISTRATIVE_RULE).success,
    ).toBe(true);
  });

  it("validates constraint-resolution", () => {
    expect(
      CONSTRAINT_RESOLUTION_SCHEMA.safeParse(SAMPLE_CONSTRAINT_RESOLUTION).success,
    ).toBe(true);
  });
});

describe("encumbrance access policy", () => {
  it("defaults never use public-free", () => {
    for (const policy of Object.values(ENCUMBRANCE_DEFAULT_ACCESS_POLICY)) {
      expect(isEncumbranceAccessPolicy(policy)).toBe(true);
      expect(policy).not.toBe("public-free");
    }
  });

  it("rejects public-free on recorded-instrument", () => {
    const bad = {
      ...SAMPLE_RECORDED_INSTRUMENT,
      accessPolicy: "public-free",
    };
    const result = RECORDED_INSTRUMENT_SCHEMA.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects appliesTo with no anchor", () => {
    const bad = {
      ...SAMPLE_RECORDED_INSTRUMENT,
      appliesTo: {},
    };
    const result = RECORDED_INSTRUMENT_SCHEMA.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("requires sourceDocumentCid on recorded-instrument", () => {
    const bad = { ...SAMPLE_RECORDED_INSTRUMENT, sourceDocumentCid: "" };
    const result = RECORDED_INSTRUMENT_SCHEMA.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("requires legalWeight advisory on administrative-rule", () => {
    const bad = { ...SAMPLE_ADMINISTRATIVE_RULE, legalWeight: "recorded" };
    const result = ADMINISTRATIVE_RULE_SCHEMA.safeParse(bad);
    expect(result.success).toBe(false);
  });
});
