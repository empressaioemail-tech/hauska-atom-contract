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

import { PROPERTY_ATOM_TIER, PROPERTY_DEFAULT_ACCESS_POLICY } from "./common.js";
import type { BuildableEnvelopeAtomInstance } from "./buildable-envelope.js";
import { BUILDABLE_ENVELOPE_DERIVATION_METHOD } from "./buildable-envelope.js";
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
