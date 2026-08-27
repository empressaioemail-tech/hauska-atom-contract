/**
 * Provenance class union — F-15 item 4 / Track 2.2.
 */

import { describe, expect, it } from "vitest";

import {
  TRACK2_PROVENANCE_ABSENCE,
  TRACK2_PROVENANCE_ASSERTION,
  TRACK2_PROVENANCE_DERIVATION,
  TRACK2_PROVENANCE_OBSERVATION,
  TRACK2_PROVENANCE_RECORD,
  TRACK2_PROVENANCE_SYNTHESIS,
} from "../../conformance/track2-provenance.js";
import { ProvenanceParseError, parseProvenance } from "../provenance-class.js";

describe("ProvenanceClass fixtures", () => {
  it("accepts one fixture per class", () => {
    expect(TRACK2_PROVENANCE_RECORD.class).toBe("Record");
    expect(TRACK2_PROVENANCE_DERIVATION.class).toBe("Derivation");
    expect(TRACK2_PROVENANCE_ASSERTION.class).toBe("Assertion");
    expect(TRACK2_PROVENANCE_ABSENCE.class).toBe("Absence");
    expect(TRACK2_PROVENANCE_OBSERVATION.class).toBe("Observation");
    expect(TRACK2_PROVENANCE_SYNTHESIS.class).toBe("Synthesis");
  });
});

describe("ProvenanceClass refusals", () => {
  it("refuses Record missing sourceId", () => {
    expect(() =>
      parseProvenance({ class: "Record", fetchRef: "landing:x" }),
    ).toThrow(ProvenanceParseError);
  });

  it("refuses Derivation missing derivesFrom", () => {
    expect(() =>
      parseProvenance({
        class: "Derivation",
        formula: "f",
        inputs: [],
      }),
    ).toThrow(/derivesFrom/);
  });

  it("refuses Assertion missing asserter", () => {
    expect(() => parseProvenance({ class: "Assertion" })).toThrow(
      ProvenanceParseError,
    );
  });

  it("refuses Absence missing verdict fields", () => {
    expect(() => parseProvenance({ class: "Absence" })).toThrow();
  });

  it("refuses Observation missing measurement", () => {
    expect(() => parseProvenance({ class: "Observation" })).toThrow(
      ProvenanceParseError,
    );
  });

  it("refuses Synthesis missing citations", () => {
    expect(() => parseProvenance({ class: "Synthesis" })).toThrow(
      ProvenanceParseError,
    );
  });
});
