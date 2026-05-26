/**
 * Sample encumbrance payloads for contract tests and consumer scaffolding.
 * Phase 1 R4 upload (Cortex) should validate against these shapes.
 */

import type { AdministrativeRuleAtomInstance } from "./administrative-rule.js";
import type { ConstraintResolutionAtomInstance } from "./constraint-resolution.js";
import type { RecordedInstrumentAtomInstance } from "./recorded-instrument.js";
import type { RestrictionClauseAtomInstance } from "./restriction-clause.js";
import type { RestrictionCorpusAtomInstance } from "./restriction-corpus.js";

export const SAMPLE_RECORDED_INSTRUMENT: RecordedInstrumentAtomInstance = {
  entityType: "recorded-instrument",
  instrumentDid: "did:hauska:instrument:bastrop-lot-12-ccr-2019",
  instrumentType: "cc-r-declaration",
  recording: {
    county: "Bastrop",
    state: "TX",
    instrumentNumber: "2019-001234",
    recordedAt: "2019-03-15T00:00:00Z",
  },
  issuerActorDid: "did:hauska:actor:hoa-oak-hollow",
  sourceDocumentCid: "bafySampleInstrumentPdf",
  appliesTo: {
    platId: "plat-oak-hollow-phase-2",
    parcelDids: ["did:hauska:parcel:bastrop-lot-12"],
  },
  accessPolicy: "tenant-private",
  legalWeight: "recorded",
  verificationStatus: "machine",
  extractedAt: "2026-05-26T12:00:00Z",
  sourceAdapter: "R4",
};

export const SAMPLE_UPLOAD_ONLY_INSTRUMENT: RecordedInstrumentAtomInstance = {
  ...SAMPLE_RECORDED_INSTRUMENT,
  instrumentDid: "did:hauska:instrument:engagement-upload-deed-001",
  instrumentType: "deed-restriction",
  recording: null,
  sourceAdapter: "R4",
  appliesTo: {
    parcelDids: ["did:hauska:parcel:cedar-hill-lot-7"],
    legalDescription: "Lot 7, Block C, Cedar Hill Estates",
  },
};

export const SAMPLE_RESTRICTION_CLAUSE: RestrictionClauseAtomInstance = {
  entityType: "restriction-clause",
  clauseDid: "did:hauska:clause:oak-hollow-height-7-4-2",
  parentInstrumentCid: "bafySampleInstrumentPdf",
  clausePath: "Article VII § 4.2",
  bodyText:
    "No structure shall exceed thirty-five (35) feet in height above finished grade.",
  structuredFields: { maxHeightFt: 35 },
  confidence: 0.92,
  extractedBy: "encumbrance-extract-v1",
  accessPolicy: "tenant-private",
  legalWeight: "recorded",
  sourceCitation: "CC&R Oak Hollow Phase 2, p. 14",
  evaluatedAt: "2026-05-26T12:05:00Z",
  reasoningSummary:
    "Height cap extracted from Article VII; matches plat elevation note.",
};

export const SAMPLE_RESTRICTION_CORPUS: RestrictionCorpusAtomInstance = {
  entityType: "restriction-corpus",
  corpusDid: "did:hauska:corpus:oak-hollow-phase-2",
  displayName: "Oak Hollow Phase 2 CC&Rs",
  platId: "plat-oak-hollow-phase-2",
  subdivisionName: "Oak Hollow Phase 2",
  instrumentCids: ["bafySampleInstrumentPdf", "bafyPlatRestrictionsPdf"],
  coverageParcelCount: 142,
  lastRefreshedAt: "2026-05-26T12:00:00Z",
  accessPolicy: "tenant-shared",
};

export const SAMPLE_ADMINISTRATIVE_RULE: AdministrativeRuleAtomInstance = {
  entityType: "administrative-rule",
  clauseDid: "did:hauska:rule:oak-hollow-fence-guideline",
  clausePath: "Design Guidelines § 3.1",
  bodyText: "Front-yard fences shall use wrought iron or masonry only.",
  confidence: 0.88,
  extractedBy: "encumbrance-extract-v1",
  accessPolicy: "tenant-private",
  legalWeight: "advisory",
  sourceCitation: "HOA design guidelines packet, p. 8",
  evaluatedAt: "2026-05-26T12:10:00Z",
};

export const SAMPLE_CONSTRAINT_RESOLUTION: ConstraintResolutionAtomInstance = {
  entityType: "constraint-resolution",
  resolutionDid: "did:hauska:resolution:bastrop-lot-12-2026-05-26",
  parcelDid: "did:hauska:parcel:bastrop-lot-12",
  resolvedAt: "2026-05-26T12:15:00Z",
  rules: [
    {
      basis: "code-section",
      basisCid: "bafyZoningSetbackSection",
      ruleSummary: "Front setback 25 ft minimum (zoning).",
      precedenceRank: 1,
      confidence: 0.99,
      legalWeight: "recorded",
      precedenceReason:
        "Adopted municipal code sets the public minimum; private covenant may be stricter.",
      evaluatedAt: "2026-05-26T12:15:00Z",
    },
    {
      basis: "restriction-clause",
      basisCid: "bafyClauseHeightLimit",
      ruleSummary: "Maximum structure height 35 ft (CC&R).",
      precedenceRank: 2,
      confidence: 0.92,
      legalWeight: "recorded",
      precedenceReason:
        "Recorded covenant is stricter than zoning height allowance on the same topic.",
      evaluatedAt: "2026-05-26T12:15:00Z",
    },
  ],
  conflicts: [],
  accessPolicy: "tenant-private",
};
