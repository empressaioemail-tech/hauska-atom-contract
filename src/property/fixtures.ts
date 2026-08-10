/**
 * Property reasoning atom fixtures — master WDLL 3.2–3.6 Central-TX probes.
 *
 * Parcel ids are real Central-TX node anchors for grading notes.
 */

import { createWidthedConfidence } from "../read-contract/common.js";
import {
  createReasoningReadContract,
  createReasoningThreeAxisConfidence,
} from "../read-contract/reasoning-axes.js";

import {
  PROPERTY_ATOM_TIER,
  PROPERTY_DEFAULT_ACCESS_POLICY,
  PROPERTY_PAID_ACCESS_POLICY,
} from "./common.js";
import type { BuildableEnvelopeAtomInstance } from "./buildable-envelope.js";
import { BUILDABLE_ENVELOPE_DERIVATION_METHOD } from "./buildable-envelope.js";
import {
  BUILDABLE_ENVELOPE_ABSENCE_KINDS,
  type BuildableEnvelopeAbsenceKind,
} from "./common.js";
import type { BuildingFootprintAtomInstance } from "./building-footprint.js";
import type { ParcelTerrainModelAtomInstance } from "./parcel-terrain-model.js";
import {
  PARCEL_TERRAIN_DERIVATION_METHOD,
  TERRAIN_DEFAULT_ACCESS_POLICY,
} from "./parcel-terrain-model.js";
import type { SetbackRuleAtomInstance } from "./setback-rule.js";
import type { ZoningFactAtomInstance } from "./zoning-fact.js";
import type { RoadNodeAtomInstance } from "./road-node.js";
import { roadNodeIdFromParts } from "./road-node.js";
import type { UtilityEasementAtomInstance } from "./utility-easement.js";
import type { ParcelNodeAtomInstance } from "./parcel-node.js";
import { parcelNodeAtomDid } from "./parcel-node.js";
import { countyCoverageParcelNodeId } from "./common.js";
import type { FloodHazardFactAtomInstance } from "./flood-hazard-fact.js";
import type { CadParcelRollAtomInstance } from "./cad-parcel-roll.js";
import type { LandUseFactAtomInstance } from "./land-use-fact.js";
import type { OwnerFactAtomInstance } from "./owner-fact.js";

const SAMPLE_ASSERTED = createWidthedConfidence({
  estimate: 0.9,
  n: 0,
  intervalWidth: 0.2,
  provenance: "asserted",
});

/** Placeholder calibrated snapshot — resolves via overlay at READ (I-E). */
const PLACEHOLDER_CALIBRATED = createWidthedConfidence({
  estimate: 0.75,
  n: 0,
  intervalWidth: 0.25,
  provenance: "asserted",
});

/**
 * Hays County (48209) — parcel 48209:156346, RS district from city GIS stamp.
 * WDLL 3.3 zoning FACT probe.
 */
export const HAYS_ZONING_FACT_FIXTURE: ZoningFactAtomInstance = {
  entityType: "zoning-fact",
  atomDid: "zfact_a1b2c3d4e5f67890",
  parcelNodeId: "48209:156346",
  reasoningChain: { reasoningKind: "observed" },
  district: "RS",
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "City of Kyle GIS zoning layer 2026-07-01",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
  readContract: createReasoningReadContract({
    axes: createReasoningThreeAxisConfidence({
      calibratedConfidence: PLACEHOLDER_CALIBRATED,
      assertedConfidence: SAMPLE_ASSERTED,
      consequence: {
        kind: "property-risk",
        stratum: "routine",
        basis: "zoning-stamp-exact",
        assertedAt: "2026-07-23T12:00:00.000Z",
      },
    }),
    assembledAt: "2026-07-23T12:00:00.000Z",
  }),
};

/**
 * Bexar County (48029) — parcel 48029:410119, null zoning honest-absence.
 * WDLL 3.3 negative probe — NOT a stamped I-2 invent.
 */
export const BEXAR_NULL_ZONING_FACT_FIXTURE: ZoningFactAtomInstance = {
  entityType: "zoning-fact",
  atomDid: "zfact_b2c3d4e5f6789012",
  parcelNodeId: "48029:410119",
  reasoningChain: { reasoningKind: "observed" },
  absence: {
    kind: "no-zoning-stamp",
    reason: "no-zoning-polygon-covers-parcel-unincorporated",
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Bexar County Appraisal District + city GIS overlay 2026-07-01",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
  readContract: createReasoningReadContract({
    axes: createReasoningThreeAxisConfidence({
      calibratedConfidence: PLACEHOLDER_CALIBRATED,
      assertedConfidence: createWidthedConfidence({
        estimate: 0.95,
        n: 0,
        intervalWidth: 0.1,
        provenance: "asserted",
      }),
      consequence: {
        kind: "property-risk",
        stratum: "routine",
        basis: "honest-absence-no-zoning-stamp",
        assertedAt: "2026-07-23T12:00:00.000Z",
      },
    }),
    assembledAt: "2026-07-23T12:00:00.000Z",
  }),
};

/** Comal County (48091) — exact-match setback with typed code atom ref. WDLL 3.4/3.5. */
export const COMAL_SETBACK_RULE_FIXTURE: SetbackRuleAtomInstance = {
  entityType: "setback-rule",
  atomDid: "sbrule_c3d4e5f678901234",
  parcelNodeId: "48091:123456",
  reasoningChain: { reasoningKind: "observed" },
  front: 25,
  side: 6,
  rear: 10,
  sourceCodeAtomRef: {
    atomDid: "did:hauska:atom:code-section:udc-comal-2024-s4-2",
    role: "rule",
    entityType: "code-section",
    citationLabel: "Comal County UDC S4.2 setbacks",
  },
  fieldProvenance: {
    front: {
      atomDid: "did:hauska:atom:code-section:udc-comal-2024-s4-2",
      confidence: createWidthedConfidence({
        estimate: 0.9,
        n: 0,
        intervalWidth: 0.15,
        provenance: "asserted",
      }),
    },
    side: {
      atomDid: "did:hauska:atom:code-section:udc-comal-2024-s4-2",
      confidence: createWidthedConfidence({
        estimate: 0.9,
        n: 0,
        intervalWidth: 0.15,
        provenance: "asserted",
      }),
    },
    rear: {
      atomDid: "did:hauska:atom:code-section:udc-comal-2024-s4-2",
      confidence: createWidthedConfidence({
        estimate: 0.9,
        n: 0,
        intervalWidth: 0.15,
        provenance: "asserted",
      }),
    },
  },
  matchBasis: "exact",
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Comal County UDC 2024 S4.2 transcribed + verified",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Travis County prefix-match fixture — WDLL 3.4 prefix grading. */
export const TRAVIS_PREFIX_SETBACK_RULE_FIXTURE: SetbackRuleAtomInstance = {
  entityType: "setback-rule",
  atomDid: "sbrule_d4e5f67890123456",
  parcelNodeId: "48453:789012",
  reasoningChain: { reasoningKind: "observed" },
  front: 25,
  side: 5,
  rear: 10,
  sourceCodeAtomRef: {
    atomDid: "did:hauska:atom:code-section:austin-land-dev-code-2023",
    role: "rule",
    entityType: "code-section",
    citationLabel: "Austin LDC prefix match SA-C-3NA*",
  },
  matchBasis: "prefix",
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "City of Austin Land Development Code 2023 prefix SA-C-3NA",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Fallback match with honest-absence — Kyle R1-T / Bexar I-2 fallback grading. */
export const FALLBACK_SETBACK_RULE_FIXTURE: SetbackRuleAtomInstance = {
  entityType: "setback-rule",
  atomDid: "sbrule_e5f6789012345678",
  parcelNodeId: "48209:156346",
  reasoningChain: { reasoningKind: "observed" },
  front: 25,
  side: 5,
  rear: 10,
  sourceCodeAtomRef: {
    atomDid: "did:hauska:atom:code-section:kyle-udc-conservative-default",
    role: "rule",
    entityType: "code-section",
    citationLabel: "Conservative default setback table",
  },
  matchBasis: "fallback",
  absence: {
    kind: "setback-fallback",
    reason: "district-prefix-unmatched-using-conservative-default",
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Kyle UDC fallback table row (prefix unmatched)",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/**
 * Derived envelope for 48209:156346 — WDLL 3.6.
 * Inputs: zoning-fact + setback-rule + geometry + front-edge reference fields.
 */
export const HAYS_BUILDABLE_ENVELOPE_FIXTURE: BuildableEnvelopeAtomInstance = {
  entityType: "buildable-envelope",
  atomDid: "benvelope_f678901234567890",
  parcelNodeId: "48209:156346",
  reasoningChain: {
    reasoningKind: "derived",
    derivationMethod: BUILDABLE_ENVELOPE_DERIVATION_METHOD,
    inputAtomRefs: [
      {
        atomDid: HAYS_ZONING_FACT_FIXTURE.atomDid,
        role: "fact",
        entityType: "zoning-fact",
        citationLabel: "RS zoning district",
      },
      {
        atomDid: FALLBACK_SETBACK_RULE_FIXTURE.atomDid,
        role: "rule",
        entityType: "setback-rule",
        citationLabel: "Front/side/rear setbacks",
      },
      {
        atomDid: "ref:geometry:48209-156346-footprint",
        role: "reference-field",
        citationLabel: "Parcel footprint geometry (TxGIO)",
      },
      {
        atomDid: "ref:geometry:48209-156346-front-edge",
        role: "reference-field",
        citationLabel: "Front lot line (shape-tier provisional)",
      },
    ],
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Derived from zoning fact + setback rule + parcel geometry",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
  readContract: createReasoningReadContract({
    axes: createReasoningThreeAxisConfidence({
      calibratedConfidence: PLACEHOLDER_CALIBRATED,
      assertedConfidence: SAMPLE_ASSERTED,
      consequence: {
        kind: "not-applicable",
        reason: "envelope-geometry-derivation-has-no-life-safety-stratum",
        assertedAt: "2026-07-23T12:00:00.000Z",
      },
    }),
    assembledAt: "2026-07-23T12:00:00.000Z",
  }),
};

/** Default provenance scope for honest envelope declines (evaluation sources). */
export const ENVELOPE_DECLINE_PROVENANCE_SCOPE = [
  "depth-warm-verify",
  "txgio-parcel",
  "zoning-fact",
] as const;

/**
 * Build a contract-shaped buildable-envelope decline for one live absence kind.
 * Decline envelopes cite zoning-fact only — setback/geometry may not exist.
 */
export function buildEnvelopeDeclineFixture(
  kind: BuildableEnvelopeAbsenceKind,
  reason = `fixture decline: ${kind}`,
): BuildableEnvelopeAtomInstance {
  // Stable hex per kind index so atomDid stays unique and deterministic.
  const idx = BUILDABLE_ENVELOPE_ABSENCE_KINDS.indexOf(kind);
  const hex = (0xf000000000000000n + BigInt(idx + 1))
    .toString(16)
    .slice(0, 16);
  return {
    entityType: "buildable-envelope",
    atomDid: `benvelope_${hex}`,
    parcelNodeId: "48021:27303",
    reasoningChain: {
      reasoningKind: "derived",
      derivationMethod: BUILDABLE_ENVELOPE_DERIVATION_METHOD,
      inputAtomRefs: [
        {
          atomDid: "zfact_a1234567890abcde",
          role: "fact",
          entityType: "zoning-fact",
          citationLabel: "Zoning fact for declined envelope",
        },
      ],
    },
    absence: { kind, reason },
    verifiedAbsence: {
      evaluated: true,
      provenanceScope: [...ENVELOPE_DECLINE_PROVENANCE_SCOPE],
    },
    accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
    sourceCitation: "depth-warm-verify-decline",
    extractedAt: "2026-08-09T00:00:00.000Z",
    atomTier: PROPERTY_ATOM_TIER,
  };
}

/** Representative live decline — superseded prop_id (R27 poster case). */
export const BASTROP_ENVELOPE_SUPERSEDED_DECLINE_FIXTURE =
  buildEnvelopeDeclineFixture(
    "superseded-prop-id",
    "prop_id absent from county cadastral",
  );

/** Cascade unzoned cohort decline. */
export const BASTROP_ENVELOPE_UNZONED_DECLINE_FIXTURE = buildEnvelopeDeclineFixture(
  "unzoned-no-district-basis",
  "unzoned jurisdiction — no district basis for setbacks or envelope",
);

/** Negative — absence without verifiedAbsence (must fail closed). */
export const NEGATIVE_ENVELOPE_ABSENCE_NO_VERIFIED = {
  entityType: "buildable-envelope" as const,
  atomDid: "benvelope_bad0000000000002",
  parcelNodeId: "48021:27303",
  reasoningChain: {
    reasoningKind: "derived" as const,
    derivationMethod: BUILDABLE_ENVELOPE_DERIVATION_METHOD,
    inputAtomRefs: [
      {
        atomDid: "zfact_a1234567890abcde",
        role: "fact" as const,
        entityType: "zoning-fact",
      },
    ],
  },
  absence: {
    kind: "no-setback-row" as const,
    reason: "missing verifiedAbsence",
  },
  accessPolicy: "public-free" as const,
  sourceCitation: "depth-warm-verify-decline",
  extractedAt: "2026-08-09T00:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — verifiedAbsence without absence kind. */
export const NEGATIVE_ENVELOPE_VERIFIED_WITHOUT_ABSENCE = {
  entityType: "buildable-envelope" as const,
  atomDid: "benvelope_bad0000000000003",
  parcelNodeId: "48021:27303",
  reasoningChain: {
    reasoningKind: "derived" as const,
    derivationMethod: BUILDABLE_ENVELOPE_DERIVATION_METHOD,
    inputAtomRefs: [
      {
        atomDid: "zfact_a1234567890abcde",
        role: "fact" as const,
        entityType: "zoning-fact",
      },
    ],
  },
  verifiedAbsence: {
    evaluated: true as const,
    provenanceScope: ["depth-warm-verify"],
  },
  accessPolicy: "public-free" as const,
  sourceCitation: "depth-warm-verify-decline",
  extractedAt: "2026-08-09T00:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — bare string citation instead of AtomInputRef (WDLL 3.5 fail). */
export const NEGATIVE_SETBACK_BARE_STRING_CITATION = {
  entityType: "setback-rule" as const,
  atomDid: "sbrule_bad00000000000001",
  parcelNodeId: "48209:156346",
  reasoningChain: { reasoningKind: "observed" as const },
  front: 25,
  side: 5,
  rear: 10,
  sourceCodeAtomRef: "did:hauska:atom:code-section:ibc-2024-1003",
  matchBasis: "exact" as const,
  accessPolicy: "public-free" as const,
  sourceCitation: "Invalid bare-string citation",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — derived without inputAtomRefs. */
export const NEGATIVE_ENVELOPE_NO_INPUT_REFS = {
  entityType: "buildable-envelope" as const,
  atomDid: "benvelope_bad0000000000001",
  parcelNodeId: "48209:156346",
  reasoningChain: {
    reasoningKind: "derived" as const,
    derivationMethod: BUILDABLE_ENVELOPE_DERIVATION_METHOD,
    inputAtomRefs: [] as [],
  },
  accessPolicy: "public-free" as const,
  sourceCitation: "Missing inputs",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — zoning with both district and absence. */
export const NEGATIVE_ZONING_DISTRICT_AND_ABSENCE = {
  entityType: "zoning-fact" as const,
  atomDid: "zfact_bad00000000000001",
  parcelNodeId: "48209:156346",
  reasoningChain: { reasoningKind: "observed" as const },
  district: "RS",
  absence: { kind: "no-zoning-stamp" as const, reason: "conflict" },
  accessPolicy: "public-free" as const,
  sourceCitation: "Invalid both district and absence",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — fallback matchBasis without honest-absence. */
export const NEGATIVE_SETBACK_FALLBACK_NO_ABSENCE = {
  entityType: "setback-rule" as const,
  atomDid: "sbrule_bad00000000000002",
  parcelNodeId: "48209:156346",
  reasoningChain: { reasoningKind: "observed" as const },
  front: 25,
  side: 5,
  rear: 10,
  sourceCodeAtomRef: {
    atomDid: "did:hauska:atom:code-section:default",
    role: "rule" as const,
  },
  matchBasis: "fallback" as const,
  accessPolicy: "public-free" as const,
  sourceCitation: "Fallback without absence",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: "data" as const,
};

/**
 * Terrain-export derived atom for Bastrop CAD property 48021:27303.
 * WDLL terrain-IFC + CAD amendment — shared triangulation, format-keyed artifacts.
 */
export const BASTROP_TERRAIN_EXPORT_FIXTURE: ParcelTerrainModelAtomInstance = {
  entityType: "parcel-terrain-model",
  atomDid: "pterrain_c0ffee0011223344",
  parcelNodeId: "48021:27303",
  reasoningChain: {
    reasoningKind: "derived",
    derivationMethod: PARCEL_TERRAIN_DERIVATION_METHOD,
    inputAtomRefs: [
      {
        atomDid: "ref:topo:usgs-3dep:48021-27303",
        role: "reference-field",
        citationLabel: "usgs-3dep-dem",
      },
      {
        atomDid: "ref:geometry:48021-27303-footprint",
        role: "reference-field",
        citationLabel: "parcel-geometry-ring",
      },
    ],
  },
  artifacts: {
    glb: {
      format: "glb",
      ref: "bafyterrain-glb-48021-27303-example",
      byteCount: 240000,
      vertexCount: 19740,
      triangleCount: 38920,
    },
    ifc: {
      format: "ifc",
      ref: "bafyterrain-ifc-48021-27303-example",
      byteCount: 1589254,
      vertexCount: 19740,
      triangleCount: 38920,
      ifcSchemaVersion: "IFC4",
      geometryPrimitive: "IfcTriangulatedFaceSet",
    },
    "dxf-3dface": {
      format: "dxf-3dface",
      ref: "bafyterrain-dxf3dface-48021-27303-example",
      byteCount: 900000,
      vertexCount: 19740,
      triangleCount: 38920,
    },
    "dxf-contour": {
      format: "dxf-contour",
      ref: "bafyterrain-dxfcontour-48021-27303-example",
      byteCount: 120000,
      contourIntervalMeters: 1,
      contourPolylineCount: 42,
    },
    "landxml-tin": {
      format: "landxml-tin",
      ref: "deferred",
      deferred: true,
      deferredReason: "LandXML TIN emitter not yet shipped — honest defer per WDLL",
    },
  },
  coverage: {
    coverageFraction: 1,
    nodataCount: 0,
    totalCells: 19740,
    resolutionMetersRequested: 10,
    resolutionMetersActual: null,
    touchesNodata: false,
  },
  confidence: createWidthedConfidence({
    estimate: 0.85,
    n: 0,
    intervalWidth: 1,
    provenance: "asserted",
  }),
  accessPolicy: TERRAIN_DEFAULT_ACCESS_POLICY,
  sourceCitation: "USGS 3DEP",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
  readContract: createReasoningReadContract({
    axes: createReasoningThreeAxisConfidence({
      calibratedConfidence: PLACEHOLDER_CALIBRATED,
      assertedConfidence: createWidthedConfidence({
        estimate: 0.85,
        n: 0,
        intervalWidth: 1,
        provenance: "asserted",
      }),
      consequence: {
        kind: "not-applicable",
        reason: "terrain-export-has-no-life-safety-stratum",
        assertedAt: "2026-07-23T12:00:00.000Z",
      },
    }),
    assembledAt: "2026-07-23T12:00:00.000Z",
  }),
};

/** Negative — missing DEM reference-field. */
export const NEGATIVE_TERRAIN_NO_DEM_REF = {
  entityType: "parcel-terrain-model" as const,
  atomDid: "pterrain_bad0000000000001",
  parcelNodeId: "48021:27303",
  reasoningChain: {
    reasoningKind: "derived" as const,
    derivationMethod: PARCEL_TERRAIN_DERIVATION_METHOD,
    inputAtomRefs: [
      {
        atomDid: "ref:geometry:48021-27303-footprint",
        role: "reference-field" as const,
        citationLabel: "parcel-geometry-ring",
      },
    ],
  },
  artifacts: {
    glb: {
      format: "glb" as const,
      ref: "bafy-example",
      vertexCount: 1,
      triangleCount: 1,
    },
  },
  coverage: {
    coverageFraction: 1,
    nodataCount: 0,
    totalCells: 1,
  },
  confidence: createWidthedConfidence({
    estimate: 0.5,
    n: 0,
    intervalWidth: 1,
    provenance: "asserted",
  }),
  accessPolicy: TERRAIN_DEFAULT_ACCESS_POLICY,
  sourceCitation: "USGS 3DEP",
  extractedAt: "2026-07-23T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/**
 * Bastrop County (48021) — Spring Street OSM way near 714 Spring St parcel.
 * R1 road-node WDLL 3 probe (named Bastrop road, centerline + assumed ROW).
 */
export const BASTROP_SPRING_STREET_ROAD_FIXTURE: RoadNodeAtomInstance = {
  entityType: "road-node",
  atomDid: "rnode_a1b2c3d4e5f67890",
  roadNodeId: roadNodeIdFromParts("48021", 123456789),
  displayName: "Spring Street",
  countyFips: "48021",
  osmWayId: 123456789,
  classification: "residential",
  centerline: {
    type: "LineString",
    coordinates: [
      [-97.3188, 30.1102],
      [-97.3182, 30.1105],
      [-97.3176, 30.1108],
    ],
  },
  row: {
    assumedWidthFt: 50,
    provenance: {
      kind: "approximate-assumed-per-class",
      assumedWidthTableKey: "residential",
      osmHighwayTag: "residential",
      note: "v1 assumed ROW — not survey/CAD",
    },
    leftEdge: {
      type: "LineString",
      coordinates: [
        [-97.31882, 30.11018],
        [-97.31822, 30.11048],
        [-97.31762, 30.11078],
      ],
    },
    rightEdge: {
      type: "LineString",
      coordinates: [
        [-97.31878, 30.11022],
        [-97.31818, 30.11052],
        [-97.31758, 30.11082],
      ],
    },
  },
  attachPoints: [
    {
      kind: "infra-slot",
      refKey: "centerline-mid",
      position: [-97.3182, 30.1105],
      note: "Digital-twin attach point — no infra atoms in R1 scope",
    },
  ],
  reasoningChain: { reasoningKind: "observed" },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "OpenStreetMap way/123456789 highway=residential name=Spring Street",
  extractedAt: "2026-07-25T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
  readContract: createReasoningReadContract({
    axes: createReasoningThreeAxisConfidence({
      calibratedConfidence: PLACEHOLDER_CALIBRATED,
      assertedConfidence: createWidthedConfidence({
        estimate: 0.65,
        n: 0,
        intervalWidth: 0.3,
        provenance: "asserted",
      }),
      consequence: {
        kind: "not-applicable",
        reason: "road-node-v1-approximate-row-has-no-life-safety-stratum",
        assertedAt: "2026-07-25T12:00:00.000Z",
      },
    }),
    assembledAt: "2026-07-25T12:00:00.000Z",
  }),
};

/**
 * Bastrop County (48021) — ML-derived building footprint on parcel 48021:27303.
 * ADR-029 T3 probe — ODC-By attribution mandatory for ml-derived tier.
 */
export const BASTROP_ML_FOOTPRINT_FIXTURE: BuildingFootprintAtomInstance = {
  entityType: "building-footprint",
  atomDid: "bfoot_a1b2c3d4e5f67890",
  parcelNodeId: "48021:27303",
  footprintId: "primary",
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "ml-derived",
  footprintGeometry: {
    type: "Polygon",
    coordinates: [
      [
        [-97.3189, 30.1101],
        [-97.3185, 30.1101],
        [-97.3185, 30.1105],
        [-97.3189, 30.1105],
        [-97.3189, 30.1101],
      ],
    ],
  },
  structureRole: "primary",
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation:
    "Microsoft Building Footprints 2026-07-01 (ODC-By 1.0) via T3-ml-join-v1",
  extractedAt: "2026-08-05T12:00:00.000Z",
  sourceVintage: "2026-07-01",
  verificationStatus: "machine",
  sourceAdapter: "T3-ml-join-v1",
  evaluatedAt: "2026-08-05T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/**
 * Bastrop County county-coverage footprint absence — hybrid absence ruling 1.
 * One row referenced at serve time when no county footprint source is published.
 */
export const BASTROP_COUNTY_FOOTPRINT_ABSENCE_FIXTURE: BuildingFootprintAtomInstance = {
  entityType: "building-footprint",
  atomDid: "bfoot_b2c3d4e5f6789012",
  parcelNodeId: countyCoverageParcelNodeId("48021"),
  footprintId: "county-coverage",
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "absent",
  verifiedAbsence: {
    evaluated: true,
    provenanceScope: [
      "bastropcad.org/bulk-download",
      "microsoft-building-footprints",
      "overture-maps-buildings",
    ],
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "T3 footprint source registry probe 48021 2026-08-05",
  extractedAt: "2026-08-05T12:00:00.000Z",
  verificationStatus: "machine",
  sourceAdapter: "T3-source-registry-probe",
  evaluatedAt: "2026-08-05T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Per-parcel absence when ML source exists but spatial join finds no feature. */
export const BASTROP_PARCEL_FOOTPRINT_ABSENCE_FIXTURE: BuildingFootprintAtomInstance = {
  entityType: "building-footprint",
  atomDid: "bfoot_c3d4e5f678901234",
  parcelNodeId: "48021:99999",
  footprintId: "primary",
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "ml-derived",
  absence: {
    kind: "no-footprint-feature",
    reason: "ml-spatial-join-below-50pct-overlap-threshold",
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation:
    "Microsoft Building Footprints 2026-07-01 (ODC-By 1.0) via T3-ml-join-v1",
  extractedAt: "2026-08-05T12:00:00.000Z",
  sourceVintage: "2026-07-01",
  verificationStatus: "machine",
  sourceAdapter: "T3-ml-join-v1",
  evaluatedAt: "2026-08-05T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/**
 * City of Bastrop Easements_/43 — utility easement on parcel 48021:27303.
 * Phase 2b municipal GIS rail (148 features in city limits).
 */
export const BASTROP_CITY_EASEMENT_FIXTURE: UtilityEasementAtomInstance = {
  entityType: "utility-easement",
  atomDid: "ueasm_d4e5f67890123456",
  parcelNodeId: "48021:27303",
  easementId: "Easements_/43:1287",
  reasoningChain: { reasoningKind: "observed" },
  easementClass: "utility",
  sourceTier: "plat-gis-authoritative",
  easementGeometry: {
    type: "LineString",
    coordinates: [
      [-97.3190, 30.1100],
      [-97.3186, 30.1104],
    ],
  },
  corridorWidthFt: 20,
  holderLabel: "City of Bastrop Utilities",
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "City of Bastrop GIS Easements_/43 feature 1287 2026-08-05",
  extractedAt: "2026-08-05T12:00:00.000Z",
  sourceVintage: "2026-08-05",
  verificationStatus: "machine",
  sourceAdapter: "T3-bastrop-easements-v1",
  evaluatedAt: "2026-08-05T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** County-coverage easement absence for Bastrop County. */
export const BASTROP_COUNTY_EASEMENT_ABSENCE_FIXTURE: UtilityEasementAtomInstance = {
  entityType: "utility-easement",
  atomDid: "ueasm_e5f6789012345678",
  parcelNodeId: countyCoverageParcelNodeId("48021"),
  easementId: "county-coverage",
  reasoningChain: { reasoningKind: "observed" },
  easementClass: "unknown",
  sourceTier: "absent",
  verifiedAbsence: {
    evaluated: true,
    provenanceScope: [
      "bastrop-county-gis-easements",
      "city-of-bastrop-Easements_/43",
    ],
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "T3 easement source registry probe 48021 2026-08-05",
  extractedAt: "2026-08-05T12:00:00.000Z",
  verificationStatus: "machine",
  sourceAdapter: "T3-source-registry-probe",
  evaluatedAt: "2026-08-05T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

// ============================================================================
// parcel-node fixtures (Rail 1)
// ============================================================================

/**
 * Bastrop County (48021) parcel 27303 — loaded TxGIO ring, straight prop_id key.
 * The atom points at `txgio_parcel`; it does not restate the ring.
 */
export const BASTROP_PARCEL_NODE_FIXTURE: ParcelNodeAtomInstance = {
  entityType: "parcel-node",
  atomDid: parcelNodeAtomDid("48021:27303"),
  parcelNodeId: "48021:27303",
  countyFips: "48021",
  keyKind: "prop_id",
  externalKeys: [
    {
      keyKind: "prop_id",
      keyValue: "27303",
      sourceCitation: "TxGIO StratMap 2026 parcel row prop_id 27303",
    },
  ],
  reasoningChain: { reasoningKind: "observed" },
  geometrySourceTier: "txgio-stratmap",
  geometryStoreRef: {
    store: "txgio_parcel",
    countyFips: "48021",
    propId: "27303",
  },
  geometryLoaded: true,
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "TxGIO StratMap Texas Parcels 2026 county 48021",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-01-01",
  verificationStatus: "machine",
  sourceAdapter: "txgio-stratmap-bulk-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/**
 * Travis County (48453) — crosswalk key kind. `prop_id` is unreliable in this
 * county (OPS-1 join-quality HOLD), so the anchor records that the second token
 * is a crosswalk key rather than pretending a clean prop_id join happened.
 */
export const TRAVIS_CROSSWALK_PARCEL_NODE_FIXTURE: ParcelNodeAtomInstance = {
  entityType: "parcel-node",
  atomDid: parcelNodeAtomDid("48453:0207310401"),
  parcelNodeId: "48453:0207310401",
  countyFips: "48453",
  keyKind: "geo_id_crosswalk",
  externalKeys: [
    {
      keyKind: "geo_id_crosswalk",
      keyValue: "0207310401",
      sourceCitation: "TCAD geo_id crosswalk 2026 roll",
    },
  ],
  reasoningChain: { reasoningKind: "observed" },
  geometrySourceTier: "county-arcgis-override",
  geometryStoreRef: {
    store: "txgio_parcel",
    countyFips: "48453",
    propId: "0207310401",
  },
  geometryLoaded: true,
  divergenceObservationCount: 2,
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Travis County ArcGIS parcel service 2026-08 override",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-08-01",
  verificationStatus: "machine",
  sourceAdapter: "county-arcgis-parcel-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/**
 * County-level typed absence — the ring source registry was probed for this
 * county and nothing is published. Satisfied-absent, not not-yet.
 */
export const COUNTY_COVERAGE_PARCEL_NODE_ABSENCE_FIXTURE: ParcelNodeAtomInstance = {
  entityType: "parcel-node",
  atomDid: parcelNodeAtomDid(countyCoverageParcelNodeId("48301")),
  parcelNodeId: countyCoverageParcelNodeId("48301"),
  countyFips: "48301",
  keyKind: "prop_id",
  reasoningChain: { reasoningKind: "observed" },
  geometrySourceTier: "absent",
  geometryLoaded: false,
  verifiedAbsence: {
    evaluated: true,
    provenanceScope: [
      "txgio-stratmap-bulk",
      "county-arcgis-override",
    ],
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Rail 1 parcel source registry probe 48301 2026-08-08",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine",
  sourceAdapter: "parcel-source-registry-probe-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/**
 * Per-parcel absence in a LOADED county — the key resolves nothing. Fail-closed
 * and distinct from the county-level not-yet case above.
 */
export const BASTROP_PARCEL_NODE_ABSENCE_FIXTURE: ParcelNodeAtomInstance = {
  entityType: "parcel-node",
  atomDid: parcelNodeAtomDid("48021:99999"),
  parcelNodeId: "48021:99999",
  countyFips: "48021",
  keyKind: "prop_id",
  reasoningChain: { reasoningKind: "observed" },
  geometrySourceTier: "txgio-stratmap",
  geometryLoaded: false,
  absence: {
    kind: "no-parcel-geometry",
    reason: "county 48021 loaded 2026-01-01; prop_id 99999 has no ring row",
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "TxGIO StratMap Texas Parcels 2026 county 48021",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-01-01",
  verificationStatus: "machine",
  sourceAdapter: "txgio-stratmap-bulk-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/**
 * MultiPolygon truncation finding — the store row carries rings the serving
 * path would silently drop. Report it; never serve a half-parcel as the parcel.
 */
export const BASTROP_PARCEL_NODE_INCOMPLETE_FIXTURE: ParcelNodeAtomInstance = {
  entityType: "parcel-node",
  atomDid: parcelNodeAtomDid("48021:27304"),
  parcelNodeId: "48021:27304",
  countyFips: "48021",
  keyKind: "prop_id",
  reasoningChain: { reasoningKind: "observed" },
  geometrySourceTier: "txgio-stratmap",
  geometryLoaded: false,
  absence: {
    kind: "geometry-incomplete",
    reason: "MultiPolygon with 3 rings; serving path resolves first ring only",
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "TxGIO StratMap Texas Parcels 2026 county 48021",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-01-01",
  verificationStatus: "machine",
  sourceAdapter: "txgio-stratmap-bulk-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Negative — sourceTier absent without verifiedAbsence (must fail closed). */
export const NEGATIVE_PARCEL_NODE_ABSENT_NO_VERIFIED = {
  entityType: "parcel-node" as const,
  atomDid: parcelNodeAtomDid(countyCoverageParcelNodeId("48301")),
  parcelNodeId: countyCoverageParcelNodeId("48301"),
  countyFips: "48301",
  keyKind: "prop_id" as const,
  reasoningChain: { reasoningKind: "observed" as const },
  geometrySourceTier: "absent" as const,
  geometryLoaded: false,
  accessPolicy: "public-free" as const,
  sourceCitation: "Missing verified absence",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "parcel-source-registry-probe-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — geometry pointer AND typed absence on the same atom. */
export const NEGATIVE_PARCEL_NODE_REF_AND_ABSENCE = {
  entityType: "parcel-node" as const,
  atomDid: parcelNodeAtomDid("48021:27303"),
  parcelNodeId: "48021:27303",
  countyFips: "48021",
  keyKind: "prop_id" as const,
  reasoningChain: { reasoningKind: "observed" as const },
  geometrySourceTier: "txgio-stratmap" as const,
  geometryStoreRef: {
    store: "txgio_parcel" as const,
    countyFips: "48021",
    propId: "27303",
  },
  geometryLoaded: true,
  absence: {
    kind: "no-parcel-geometry" as const,
    reason: "contradicts the resolved pointer",
  },
  accessPolicy: "public-free" as const,
  sourceCitation: "TxGIO StratMap Texas Parcels 2026 county 48021",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "txgio-stratmap-bulk-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — the ring body inlined on the atom (Geometry Law rule 1 guard). */
export const NEGATIVE_PARCEL_NODE_INLINE_GEOMETRY = {
  entityType: "parcel-node" as const,
  atomDid: parcelNodeAtomDid("48021:27303"),
  parcelNodeId: "48021:27303",
  countyFips: "48021",
  keyKind: "prop_id" as const,
  reasoningChain: { reasoningKind: "observed" as const },
  geometrySourceTier: "txgio-stratmap" as const,
  geometryStoreRef: {
    store: "txgio_parcel" as const,
    countyFips: "48021",
    propId: "27303",
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [-97.3189, 30.1101],
          [-97.3185, 30.1101],
          [-97.3185, 30.1105],
          [-97.3189, 30.1101],
        ],
      ],
    },
  },
  geometryLoaded: true,
  accessPolicy: "public-free" as const,
  sourceCitation: "TxGIO StratMap Texas Parcels 2026 county 48021",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "txgio-stratmap-bulk-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — pointer names a different parcel than the atom claims. */
export const NEGATIVE_PARCEL_NODE_REF_MISMATCH = {
  entityType: "parcel-node" as const,
  atomDid: parcelNodeAtomDid("48021:27303"),
  parcelNodeId: "48021:27303",
  countyFips: "48021",
  keyKind: "prop_id" as const,
  reasoningChain: { reasoningKind: "observed" as const },
  geometrySourceTier: "txgio-stratmap" as const,
  geometryStoreRef: {
    store: "txgio_parcel" as const,
    countyFips: "48021",
    propId: "27999",
  },
  geometryLoaded: true,
  accessPolicy: "public-free" as const,
  sourceCitation: "TxGIO StratMap Texas Parcels 2026 county 48021",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "txgio-stratmap-bulk-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — parcel identity behind a paywall. */
export const NEGATIVE_PARCEL_NODE_NON_PUBLIC_POLICY = {
  entityType: "parcel-node" as const,
  atomDid: parcelNodeAtomDid("48021:27303"),
  parcelNodeId: "48021:27303",
  countyFips: "48021",
  keyKind: "prop_id" as const,
  reasoningChain: { reasoningKind: "observed" as const },
  geometrySourceTier: "txgio-stratmap" as const,
  geometryStoreRef: {
    store: "txgio_parcel" as const,
    countyFips: "48021",
    propId: "27303",
  },
  geometryLoaded: true,
  accessPolicy: "public-paid" as const,
  sourceCitation: "TxGIO StratMap Texas Parcels 2026 county 48021",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "txgio-stratmap-bulk-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — ml-derived without ODC-By in sourceCitation. */
export const NEGATIVE_FOOTPRINT_ML_NO_ODC_BY = {
  entityType: "building-footprint" as const,
  atomDid: "bfoot_bad00000000000001",
  parcelNodeId: "48021:27303",
  footprintId: "primary",
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "ml-derived" as const,
  footprintGeometry: {
    type: "Polygon" as const,
    coordinates: [
      [
        [-97.3189, 30.1101],
        [-97.3185, 30.1101],
        [-97.3185, 30.1105],
        [-97.3189, 30.1105],
        [-97.3189, 30.1101],
      ],
    ],
  },
  accessPolicy: "public-free" as const,
  sourceCitation: "Microsoft Building Footprints without license tag",
  extractedAt: "2026-08-05T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "T3-ml-join-v1",
  evaluatedAt: "2026-08-05T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — sourceTier absent without verifiedAbsence. */
export const NEGATIVE_FOOTPRINT_ABSENT_NO_VERIFIED = {
  entityType: "building-footprint" as const,
  atomDid: "bfoot_bad00000000000002",
  parcelNodeId: countyCoverageParcelNodeId("48021"),
  footprintId: "county-coverage",
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "absent" as const,
  accessPolicy: "public-free" as const,
  sourceCitation: "Missing verified absence",
  extractedAt: "2026-08-05T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "T3-source-registry-probe",
  evaluatedAt: "2026-08-05T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — utility-easement with non-public accessPolicy. */
export const NEGATIVE_EASEMENT_NON_PUBLIC_POLICY = {
  entityType: "utility-easement" as const,
  atomDid: "ueasm_bad00000000000001",
  parcelNodeId: "48021:27303",
  easementId: "Easements_/43:999",
  reasoningChain: { reasoningKind: "observed" as const },
  easementClass: "utility" as const,
  sourceTier: "plat-gis-authoritative" as const,
  easementGeometry: {
    type: "LineString" as const,
    coordinates: [
      [-97.3190, 30.1100],
      [-97.3186, 30.1104],
    ],
  },
  accessPolicy: "public-paid" as const,
  sourceCitation: "Invalid paid tier on public GIS easement",
  extractedAt: "2026-08-05T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "T3-bastrop-easements-v1",
  evaluatedAt: "2026-08-05T12:00:00.000Z",
  atomTier: "data" as const,
};

// ============================================================================
// flood-hazard-fact fixtures
// ============================================================================

/** Bastrop 48021:27303 — SFHA true, Zone AE present finding. */
export const BASTROP_FLOOD_SFHA_FIXTURE: FloodHazardFactAtomInstance = {
  entityType: "flood-hazard-fact",
  atomDid: "fhfact_a1b2c3d4e5f67890",
  parcelNodeId: "48021:27303",
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "fema-nfhl",
  inSpecialFloodHazardArea: true,
  floodZone: "AE",
  zoneSubtype: null,
  baseFloodElevation: 412.5,
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "FEMA NFHL 2026-06 county 48021",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-06-01",
  verificationStatus: "machine",
  sourceAdapter: "fema-nfhl-spatial-join-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Hays 48209:156346 — outside mapped SFHA (Zone X by omission), present not absent. */
export const HAYS_FLOOD_OUTSIDE_SFHA_FIXTURE: FloodHazardFactAtomInstance = {
  entityType: "flood-hazard-fact",
  atomDid: "fhfact_b2c3d4e5f6789012",
  parcelNodeId: "48209:156346",
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "fema-nfhl",
  inSpecialFloodHazardArea: false,
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "FEMA NFHL 2026-06 county 48209",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-06-01",
  verificationStatus: "machine",
  sourceAdapter: "fema-nfhl-spatial-join-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Per-parcel no geocode / off-coverage absence. */
export const BASTROP_FLOOD_NO_COVERAGE_FIXTURE: FloodHazardFactAtomInstance = {
  entityType: "flood-hazard-fact",
  atomDid: "fhfact_c3d4e5f678901234",
  parcelNodeId: "48021:99999",
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "fema-nfhl",
  absence: {
    kind: "no-flood-coverage",
    reason: "parcel centroid outside NFHL county tile coverage",
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "FEMA NFHL 2026-06 county 48021",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-06-01",
  verificationStatus: "machine",
  sourceAdapter: "fema-nfhl-spatial-join-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** County-level verified absence — NFHL not published for county. */
export const COUNTY_FLOOD_VERIFIED_ABSENCE_FIXTURE: FloodHazardFactAtomInstance = {
  entityType: "flood-hazard-fact",
  atomDid: "fhfact_d4e5f67890123456",
  parcelNodeId: countyCoverageParcelNodeId("48301"),
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "absent",
  verifiedAbsence: {
    evaluated: true,
    provenanceScope: ["fema-nfhl-ms", "county-gis-flood"],
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Flood source registry probe 48301 2026-08-08",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine",
  sourceAdapter: "flood-source-registry-probe-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Negative — SFHA finding and absence together. */
export const NEGATIVE_FLOOD_SFHA_AND_ABSENCE = {
  entityType: "flood-hazard-fact" as const,
  atomDid: "fhfact_bad00000000000001",
  parcelNodeId: "48021:27303",
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "fema-nfhl" as const,
  inSpecialFloodHazardArea: true,
  floodZone: "AE",
  absence: { kind: "no-flood-coverage" as const, reason: "conflict" },
  accessPolicy: "public-free" as const,
  sourceCitation: "Invalid both finding and absence",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "fema-nfhl-spatial-join-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — absent tier without verifiedAbsence. */
export const NEGATIVE_FLOOD_ABSENT_NO_VERIFIED = {
  entityType: "flood-hazard-fact" as const,
  atomDid: "fhfact_bad00000000000002",
  parcelNodeId: countyCoverageParcelNodeId("48301"),
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "absent" as const,
  accessPolicy: "public-free" as const,
  sourceCitation: "Missing verified absence",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "flood-source-registry-probe-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — absent tier carrying flood zone claims. */
export const NEGATIVE_FLOOD_ABSENT_WITH_CLAIM = {
  entityType: "flood-hazard-fact" as const,
  atomDid: "fhfact_bad00000000000003",
  parcelNodeId: countyCoverageParcelNodeId("48301"),
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "absent" as const,
  inSpecialFloodHazardArea: false,
  verifiedAbsence: {
    evaluated: true as const,
    provenanceScope: ["fema-nfhl-ms"],
  },
  accessPolicy: "public-free" as const,
  sourceCitation: "Absent tier with claim fields",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "flood-source-registry-probe-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

// ============================================================================
// cad-parcel-roll fixtures
// ============================================================================

/** Bastrop 48021:27303 — full CAD roll row with owner match. */
export const BASTROP_CAD_ROLL_FIXTURE: CadParcelRollAtomInstance = {
  entityType: "cad-parcel-roll",
  atomDid: "cadroll_a1b2c3d4e5f67890",
  parcelNodeId: "48021:27303",
  taxYear: 2026,
  countyFips: "48021",
  propId: "27303",
  keyKind: "prop_id",
  joinPassedOwnerMatchGate: true,
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "cad-authoritative",
  ownerName: "EXAMPLE HOLDINGS LLC",
  ownerMailingAddress: "123 Main St, Austin TX 78701",
  situsAddress: "714 Spring St",
  situsCity: "Bastrop",
  situsZip: "78602",
  legalDescription: "LOT 12 BLK 3 SPRING ST ADDN",
  landValue: 85000,
  improvementValue: 215000,
  marketValue: 300000,
  assessedValue: 300000,
  yearBuilt: 1985,
  livingAreaSqft: 1840,
  landAcres: "0.1823",
  propertyUseCode: "A1",
  sourceFile: "bastropcad_2026_property.txt",
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Bastrop CAD 2026 property roll",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-01-15",
  verificationStatus: "machine",
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Join hold — no owner fields allowed. */
export const BASTROP_CAD_ROLL_JOIN_HOLD_FIXTURE: CadParcelRollAtomInstance = {
  entityType: "cad-parcel-roll",
  atomDid: "cadroll_b2c3d4e5f6789012",
  parcelNodeId: "48021:88888",
  taxYear: 2026,
  countyFips: "48021",
  propId: "88888",
  keyKind: "prop_id",
  joinPassedOwnerMatchGate: false,
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "cad-authoritative",
  absence: {
    kind: "join-hold",
    reason: "owner crosswalk below match threshold — owner withheld",
  },
  sourceFile: "bastropcad_2026_property.txt",
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Bastrop CAD 2026 property roll",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-01-15",
  verificationStatus: "machine",
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** County-level verified absence — no CAD roll published. */
export const COUNTY_CAD_ROLL_ABSENCE_FIXTURE: CadParcelRollAtomInstance = {
  entityType: "cad-parcel-roll",
  atomDid: "cadroll_c3d4e5f678901234",
  parcelNodeId: countyCoverageParcelNodeId("48301"),
  taxYear: 2026,
  countyFips: "48301",
  propId: "_county_coverage",
  keyKind: "prop_id",
  joinPassedOwnerMatchGate: false,
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "absent",
  verifiedAbsence: {
    evaluated: true,
    provenanceScope: ["county-cad-bulk", "tx-comptroller-roll"],
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "CAD source registry probe 48301 2026-08-08",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine",
  sourceAdapter: "cad-source-registry-probe-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Negative — join hold with owner fields (wrong owner worse than missing). */
export const NEGATIVE_CAD_ROLL_OWNER_ON_JOIN_HOLD = {
  entityType: "cad-parcel-roll" as const,
  atomDid: "cadroll_bad00000000000001",
  parcelNodeId: "48021:88888",
  taxYear: 2026,
  countyFips: "48021",
  propId: "88888",
  keyKind: "prop_id" as const,
  joinPassedOwnerMatchGate: false,
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "cad-authoritative" as const,
  ownerName: "SHOULD NOT APPEAR",
  situsAddress: "714 Spring St",
  sourceFile: "bastropcad_2026_property.txt",
  accessPolicy: "public-free" as const,
  sourceCitation: "Owner on failed join",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — present tier with empty row (no claims, no absence). */
export const NEGATIVE_CAD_ROLL_EMPTY_PRESENT = {
  entityType: "cad-parcel-roll" as const,
  atomDid: "cadroll_bad00000000000002",
  parcelNodeId: "48021:27303",
  taxYear: 2026,
  countyFips: "48021",
  propId: "27303",
  keyKind: "prop_id" as const,
  joinPassedOwnerMatchGate: true,
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "cad-authoritative" as const,
  sourceFile: "bastropcad_2026_property.txt",
  accessPolicy: "public-free" as const,
  sourceCitation: "Empty present row",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

// ============================================================================
// land-use-fact fixtures
// ============================================================================

/** Bastrop 48021:27303 — A1 residential from CAD property_use_code. */
export const BASTROP_LAND_USE_FIXTURE: LandUseFactAtomInstance = {
  entityType: "land-use-fact",
  atomDid: "lufact_a1b2c3d4e5f67890",
  parcelNodeId: "48021:27303",
  taxYear: 2026,
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "cad-authoritative",
  landUseCode: "A1",
  landUseLabel: "Single Family Residential",
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Bastrop CAD 2026 property_use_code",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-01-15",
  verificationStatus: "machine",
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Honest absence — CAD row exists but no land use code. */
export const BASTROP_LAND_USE_NO_CODE_FIXTURE: LandUseFactAtomInstance = {
  entityType: "land-use-fact",
  atomDid: "lufact_b2c3d4e5f6789012",
  parcelNodeId: "48021:77777",
  taxYear: 2026,
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "cad-authoritative",
  absence: {
    kind: "no-land-use-code",
    reason: "cad_property row present; property_use_code null",
  },
  accessPolicy: PROPERTY_DEFAULT_ACCESS_POLICY,
  sourceCitation: "Bastrop CAD 2026 property_use_code",
  extractedAt: "2026-08-08T12:00:00.000Z",
  sourceVintage: "2026-01-15",
  verificationStatus: "machine",
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Negative — present tier without landUseCode or absence. */
export const NEGATIVE_LAND_USE_EMPTY_PRESENT = {
  entityType: "land-use-fact" as const,
  atomDid: "lufact_bad00000000000001",
  parcelNodeId: "48021:27303",
  taxYear: 2026,
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "cad-authoritative" as const,
  landUseLabel: "label without code",
  accessPolicy: "public-free" as const,
  sourceCitation: "Missing landUseCode",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Owner fact — present, the paid facet. */
export const BASTROP_OWNER_FACT_FIXTURE: OwnerFactAtomInstance = {
  entityType: "owner-fact",
  atomDid: "ownfact_a1b2c3d4e5f67890",
  parcelNodeId: "48021:27303",
  taxYear: 2026,
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "cad-authoritative",
  ownerName: "SAMPLE OWNER LLC",
  ownerMailingAddress: "PO BOX 1234, BASTROP, TX 78602",
  exemptionFlags: {
    homestead: false,
    seniorOrDisability: false,
    agricultural: false,
    veteran: false,
  },
  accessPolicy: PROPERTY_PAID_ACCESS_POLICY,
  sourceCitation: "Bastrop CAD 2026 owner_name + owner_mailing_address",
  extractedAt: "2026-08-09T12:00:00.000Z",
  sourceVintage: "2026-01-15",
  verificationStatus: "machine",
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-09T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/**
 * Owner fact — statutory confidentiality election. The CAD row exists and the
 * parcel is real; owner identity is lawfully withheld. This must read as an
 * established absence, never as a missing row.
 */
export const BASTROP_OWNER_WITHHELD_FIXTURE: OwnerFactAtomInstance = {
  entityType: "owner-fact",
  atomDid: "ownfact_b2c3d4e5f6789012",
  parcelNodeId: "48021:77777",
  taxYear: 2026,
  reasoningChain: { reasoningKind: "observed" },
  sourceTier: "cad-authoritative",
  absence: {
    kind: "owner-withheld",
    reason:
      "cad_property row present; owner identity suppressed under Tex. Tax Code confidentiality election",
  },
  accessPolicy: PROPERTY_PAID_ACCESS_POLICY,
  sourceCitation: "Bastrop CAD 2026 owner_name",
  extractedAt: "2026-08-09T12:00:00.000Z",
  sourceVintage: "2026-01-15",
  verificationStatus: "machine",
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-09T12:00:00.000Z",
  atomTier: PROPERTY_ATOM_TIER,
};

/** Negative — owner-fact must never ship public-free. */
export const NEGATIVE_OWNER_FACT_PUBLIC_FREE = {
  entityType: "owner-fact" as const,
  atomDid: "ownfact_bad0000000000001",
  parcelNodeId: "48021:27303",
  taxYear: 2026,
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "cad-authoritative" as const,
  ownerName: "SAMPLE OWNER LLC",
  accessPolicy: "public-free" as const,
  sourceCitation: "Owner must be paid",
  extractedAt: "2026-08-09T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-09T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — mailing address without an owner name is a dangling PII fragment. */
export const NEGATIVE_OWNER_FACT_BARE_MAILING = {
  entityType: "owner-fact" as const,
  atomDid: "ownfact_bad0000000000002",
  parcelNodeId: "48021:27303",
  taxYear: 2026,
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "cad-authoritative" as const,
  ownerMailingAddress: "PO BOX 1234, BASTROP, TX 78602",
  accessPolicy: "public-paid" as const,
  sourceCitation: "Bare mailing address",
  extractedAt: "2026-08-09T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "cad-property-ingest-v1",
  evaluatedAt: "2026-08-09T12:00:00.000Z",
  atomTier: "data" as const,
};

/** Negative — cotality tier must not exist (schema rejects unknown enum). */
export const NEGATIVE_LAND_USE_COTALITY_TIER = {
  entityType: "land-use-fact" as const,
  atomDid: "lufact_bad00000000000002",
  parcelNodeId: "48021:27303",
  taxYear: 2026,
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "cotality" as const,
  landUseCode: "R1",
  accessPolicy: "public-free" as const,
  sourceCitation: "Cotality tier forbidden",
  extractedAt: "2026-08-08T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "cotality-dead",
  evaluatedAt: "2026-08-08T12:00:00.000Z",
  atomTier: "data" as const,
};

// special-district-fact fixtures

export const BASTROP_SPECIAL_DISTRICT_PRESENT_FIXTURE = {
  entityType: "special-district-fact" as const,
  atomDid: "sdfact_a1b2c3d4e5f67890",
  parcelNodeId: "48021:27303",
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "tceq-water-districts" as const,
  districtName: "EXAMPLE MUD NO 1",
  districtId: "1234500",
  districtType: "MUD",
  countyFips: "48021",
  membershipBasis: "point-in-polygon" as const,
  accessPolicy: "public-free" as const,
  sourceCitation: "TCEQ Public/WaterDistricts MapServer/0",
  extractedAt: "2026-08-10T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "tceq-water-districts-v1",
  evaluatedAt: "2026-08-10T12:00:00.000Z",
  atomTier: "data" as const,
};

export const BASTROP_SPECIAL_DISTRICT_OUTSIDE_FIXTURE = {
  entityType: "special-district-fact" as const,
  atomDid: "sdfact_b2c3d4e5f6789012",
  parcelNodeId: "48021:99999",
  reasoningChain: { reasoningKind: "observed" as const },
  sourceTier: "tceq-water-districts" as const,
  absence: {
    kind: "outside-tceq-source-boundaries" as const,
    reason:
      "Centroid does not intersect tx_special_district (TCEQ Public/WaterDistricts). Scoped to that source only.",
  },
  accessPolicy: "public-free" as const,
  sourceCitation: "TCEQ Public/WaterDistricts MapServer/0",
  extractedAt: "2026-08-10T12:00:00.000Z",
  verificationStatus: "machine" as const,
  sourceAdapter: "tceq-water-districts-v1",
  evaluatedAt: "2026-08-10T12:00:00.000Z",
  atomTier: "data" as const,
};
