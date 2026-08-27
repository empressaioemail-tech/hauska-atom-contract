/**
 * Conformance fixtures — Track 2.2 provenance classes.
 */

import { parseProvenance, type ProvenanceClass } from "../provenance/provenance-class.js";

export const TRACK2_PROVENANCE_RECORD: ProvenanceClass = parseProvenance({
  class: "Record",
  sourceId: "bastrop-cad",
  fetchRef: "landing:cad_property:48021:2026",
});

export const TRACK2_PROVENANCE_DERIVATION: ProvenanceClass = parseProvenance({
  class: "Derivation",
  formula: "materialise(selector, storeVersion, method)",
  inputs: ["flood-hazard-selector:A"],
  derivesFrom: {
    selectorAtomId: "1fcfca7db0dc4f1bd8a4f99f18a0d2587c66ee3d45799baba34d2a50efc676c4",
    storeVersion: "NFHL_48_20260101",
    method: "closed-union",
  },
});

export const TRACK2_PROVENANCE_ASSERTION: ProvenanceClass = parseProvenance({
  class: "Assertion",
  asserter: "operator:property-seat",
});

export const TRACK2_PROVENANCE_ABSENCE: ProvenanceClass = parseProvenance({
  class: "Absence",
  verdict: "absent-verified",
  sourceId: "fema-nfhl",
  responseRef: "https://hazards.fema.gov/nfhl/48021",
  sourceResponded: true,
});

export const TRACK2_PROVENANCE_OBSERVATION: ProvenanceClass = parseProvenance({
  class: "Observation",
  measurement: "centroid captured from county GIS",
});

export const TRACK2_PROVENANCE_SYNTHESIS: ProvenanceClass = parseProvenance({
  class: "Synthesis",
  citations: ["record:cad", "derivation:flood"],
});
