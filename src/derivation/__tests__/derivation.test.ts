/**
 * Derivation / derivesFrom — F-15 item 5 / Track 2.3.
 */

import { describe, expect, it } from "vitest";

import { TRACK2_DERIVATION_FIXTURE } from "../../conformance/track2-derivation.js";
import { parseProvenance } from "../../provenance/provenance-class.js";
import { DerivationParseError, parseDerivation } from "../derivation.js";

describe("Derivation", () => {
  it("accepts the conformance fixture", () => {
    expect(TRACK2_DERIVATION_FIXTURE.derivesFrom.method).toBe("closed-union");
  });

  it("refuses a Derivation without derivesFrom", () => {
    expect(() =>
      parseDerivation({
        class: "Derivation",
        formula: "f",
        inputs: ["x"],
      }),
    ).toThrow(DerivationParseError);
  });

  it("refuses a Record with derivesFrom", () => {
    expect(() =>
      parseProvenance({
        class: "Record",
        sourceId: "cad",
        fetchRef: "landing:x",
        derivesFrom: {
          selectorAtomId: "s",
          storeVersion: "v",
          method: "closed-union",
        },
      }),
    ).toThrow(/derivesFrom/);
  });
});
