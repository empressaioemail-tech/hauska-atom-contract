/**
 * Conformance fixture — Track 2.3 Derivation / derivesFrom.
 */

import { parseDerivation, type Derivation } from "../derivation/derivation.js";

export const TRACK2_DERIVATION_FIXTURE: Derivation = parseDerivation({
  class: "Derivation",
  formula: "materialise(selector, storeVersion, method)",
  inputs: ["flood-hazard-selector:AE"],
  derivesFrom: {
    selectorAtomId: "1fcfca7db0dc4f1bd8a4f99f18a0d2587c66ee3d45799baba34d2a50efc676c4",
    storeVersion: "NFHL_48_20260101",
    method: "closed-union",
  },
});
