/**
 * Shared property reasoning atom substrate (master WDLL 3.2–3.6).
 *
 * Property fact / rule / derived kinds reuse 1.8.0 primitives:
 * {@link ReasoningChain}, {@link AtomInputRef}, {@link PropertyConsequence},
 * {@link ReasoningReadContract}, {@link ActorRecordAtomInstance},
 * {@link ObligationAtomInstance}.
 *
 * **Calibrated confidence at READ (I-E):** instances MAY carry a
 * {@link ReasoningThreeAxisConfidence}-shaped asserted snapshot at write
 * time (including a placeholder `calibratedConfidence` with
 * `provenance: "asserted"`). At READ, the calibrated axis resolves through
 * the calibration overlay — it is NOT composed-and-frozen on the instance.
 * Do not invent a frozen multiply (e.g. no `labeling x district` field).
 */

import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import { ACCESS_POLICY_SCHEMA } from "../conformance/common.js";
import {
  WIDTHED_CONFIDENCE_SCHEMA,
  type WidthedConfidence,
} from "../read-contract/common.js";
import {
  REASONING_READ_CONTRACT_SCHEMA,
  type ReasoningReadContract,
} from "../read-contract/reasoning-axes.js";

/** Central-TX parcel node id: `{county_fips}:{prop_id}`. */
export const PARCEL_NODE_ID_PATTERN = /^\d{5}:[A-Za-z0-9._-]+$/;

/** Road spine node id: `{county_fips}:road:{osm_way_id}` (27c WDLL 3 / R1). */
export const ROAD_NODE_ID_PATTERN = /^\d{5}:road:\d+$/;

export const PROPERTY_ATOM_TIER: AtomTier = "data";

export const PROPERTY_DEFAULT_ACCESS_POLICY: AccessPolicy = "public-free";

/**
 * The paid property tier. Only `owner-fact` uses it today: owner identity was
 * ruled `public-paid` at the atom level, and its schema pins this value so the
 * policy cannot be dropped by a writer. Every other property atom pins
 * `PROPERTY_DEFAULT_ACCESS_POLICY`.
 */
export const PROPERTY_PAID_ACCESS_POLICY: AccessPolicy = "public-paid";

export const PROPERTY_ACCESS_POLICY_SCHEMA = ACCESS_POLICY_SCHEMA;

/** Quality gate fields required on every property reasoning atom. */
export const PROPERTY_QUALITY_GATE_FIELDS = {
  sourceCitation: z.string().min(1),
  extractedAt: z.string().min(1),
  asOf: z.string().min(1).optional(),
} as const;

/** Honest absence when no zoning polygon stamps the parcel. */
export const ZONING_ABSENCE_KIND = "no-zoning-stamp" as const;

export const ZONING_ABSENCE_SCHEMA = z.object({
  kind: z.literal(ZONING_ABSENCE_KIND),
  reason: z.string().min(1),
});

export type ZoningAbsence = z.infer<typeof ZONING_ABSENCE_SCHEMA>;

/** Honest absence when setback match falls back to a conservative default. */
export const SETBACK_ABSENCE_KIND = "setback-fallback" as const;

export const SETBACK_ABSENCE_SCHEMA = z.object({
  kind: z.literal(SETBACK_ABSENCE_KIND),
  reason: z.string().min(1),
});

export type SetbackAbsence = z.infer<typeof SETBACK_ABSENCE_SCHEMA>;

// ============================================================================
// buildable-envelope typed absence (1.15.0) — lifted from live producers
// ============================================================================

/**
 * Named decline codes actually written onto `buildable-envelope` atoms.
 *
 * Ground truth is Bastrop store population (2026-08-08 grade audit §8.1)
 * plus the two residual buckets from `bucketVerifyFailReasons` that can be
 * minted even when a cohort snapshot shows zero rows. Do NOT invent codes
 * here — expand only when a live producer lands a new string.
 *
 * Grouping: each live code is its own kind. Compressing would erase
 * agent-routing and cert-grade branches (cascade codes grade differently;
 * edge-label early declines differ from verify-bucket orientation; R32 is
 * a distinct inset path). The free-text `reason` carries path detail; the
 * kind is the durable finding identity.
 */
export const BUILDABLE_ENVELOPE_ABSENCE_KINDS = [
  // Cascade (unzoned-county bake) — cert-grade branches on these two.
  "unzoned-no-district-basis",
  "no-district-on-record",
  // Warm early refusals (depth-warm city batch / edgeLabeling).
  "no-setback-row",
  "no-road-adjacency",
  "front-orientation-unresolved",
  "superseded-prop-id",
  // Warm verify-fail buckets (`bucketVerifyFailReasons`).
  "front-orientation",
  "road-classification-mismatch",
  "r32-per-edge-inset",
  "null-inset",
  "faces-answer",
  "geometry",
  "setback-edge-distance",
  "other-verify-fail",
] as const;

export type BuildableEnvelopeAbsenceKind =
  (typeof BUILDABLE_ENVELOPE_ABSENCE_KINDS)[number];

export const BUILDABLE_ENVELOPE_ABSENCE_SCHEMA = z
  .object({
    kind: z.enum(BUILDABLE_ENVELOPE_ABSENCE_KINDS),
    reason: z.string().min(1),
  })
  .strict();

export type BuildableEnvelopeAbsence = z.infer<
  typeof BUILDABLE_ENVELOPE_ABSENCE_SCHEMA
>;

/** Residual kind when a producer hands an unknown decline string. */
export const BUILDABLE_ENVELOPE_ABSENCE_FALLBACK_KIND =
  "other-verify-fail" as const;

/**
 * Map a live engine decline-code string onto a contract absence kind.
 * Unknown codes collapse to {@link BUILDABLE_ENVELOPE_ABSENCE_FALLBACK_KIND}
 * so writers never invent enum members off-band.
 */
export function toBuildableEnvelopeAbsenceKind(
  declineCode: string,
): BuildableEnvelopeAbsenceKind {
  if (
    (BUILDABLE_ENVELOPE_ABSENCE_KINDS as ReadonlyArray<string>).includes(
      declineCode,
    )
  ) {
    return declineCode as BuildableEnvelopeAbsenceKind;
  }
  return BUILDABLE_ENVELOPE_ABSENCE_FALLBACK_KIND;
}

export type SetbackMatchBasis = "exact" | "prefix" | "fallback";

export const SETBACK_MATCH_BASIS_VALUES: ReadonlyArray<SetbackMatchBasis> = [
  "exact",
  "prefix",
  "fallback",
];

export const SETBACK_MATCH_BASIS_SCHEMA = z.enum([
  "exact",
  "prefix",
  "fallback",
]);

/**
 * Per-field provenance consumed from setback JSON (fan gift — do not invent
 * tiers). Keys are scalar field names (`front`, `side`, `rear`).
 */
export interface SetbackFieldProvenanceEntry {
  atomDid: string;
  confidence: WidthedConfidence;
}

export const SETBACK_FIELD_PROVENANCE_ENTRY_SCHEMA = z.object({
  atomDid: z.string().min(1),
  confidence: WIDTHED_CONFIDENCE_SCHEMA,
});

export const SETBACK_FIELD_PROVENANCE_SCHEMA = z
  .object({
    front: SETBACK_FIELD_PROVENANCE_ENTRY_SCHEMA.optional(),
    side: SETBACK_FIELD_PROVENANCE_ENTRY_SCHEMA.optional(),
    rear: SETBACK_FIELD_PROVENANCE_ENTRY_SCHEMA.optional(),
  })
  .strict();

export type SetbackFieldProvenance = z.infer<typeof SETBACK_FIELD_PROVENANCE_SCHEMA>;

/** Optional read-contract snapshot on write; calibrated axis resolves at READ. */
export const PROPERTY_READ_CONTRACT_SCHEMA = REASONING_READ_CONTRACT_SCHEMA;

export type PropertyReadContract = ReasoningReadContract;

/** WGS84 [lng, lat] vertex — shared GeoJSON primitive. */
export type GeoCoord = readonly [number, number];

export const GEO_COORD_SCHEMA = z.tuple([z.number(), z.number()]);

export const GEOJSON_POLYGON_SCHEMA = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(GEO_COORD_SCHEMA).min(4)),
});

export const GEOJSON_MULTI_POLYGON_SCHEMA = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(z.array(GEO_COORD_SCHEMA).min(4)).min(1)),
});

export const GEOJSON_LINE_STRING_SCHEMA = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(GEO_COORD_SCHEMA).min(2),
});

export const FOOTPRINT_GEOMETRY_SCHEMA = z.union([
  GEOJSON_POLYGON_SCHEMA,
  GEOJSON_MULTI_POLYGON_SCHEMA,
]);

export type FootprintGeometry = z.infer<typeof FOOTPRINT_GEOMETRY_SCHEMA>;

export const EASEMENT_GEOMETRY_SCHEMA = z.union([
  GEOJSON_POLYGON_SCHEMA,
  GEOJSON_MULTI_POLYGON_SCHEMA,
  GEOJSON_LINE_STRING_SCHEMA,
]);

export type EasementGeometry = z.infer<typeof EASEMENT_GEOMETRY_SCHEMA>;

/**
 * ADR-028 verified absence pair for site-layer honest absence (ADR-029 ruling 1).
 * `evaluated: true` MUST carry a non-empty `provenanceScope`.
 */
export const SITE_LAYER_VERIFIED_ABSENCE_SCHEMA = z
  .object({
    evaluated: z.literal(true),
    provenanceScope: z.array(z.string().min(1)).min(1),
  })
  .strict();

export type SiteLayerVerifiedAbsence = z.infer<
  typeof SITE_LAYER_VERIFIED_ABSENCE_SCHEMA
>;

/**
 * County-coverage absence row anchor: `{county_fips}:_county_coverage`.
 * One row per county when no footprint/easement source is published; referenced at serve time.
 */
export const COUNTY_COVERAGE_PARCEL_NODE_SUFFIX = "_county_coverage" as const;

export function countyCoverageParcelNodeId(countyFips: string): string {
  return `${countyFips}:${COUNTY_COVERAGE_PARCEL_NODE_SUFFIX}`;
}

export type SiteLayerVerificationStatus = "machine" | "human" | "unsurveyed";

export const SITE_LAYER_VERIFICATION_STATUSES: ReadonlyArray<SiteLayerVerificationStatus> =
  ["machine", "human", "unsurveyed"];

export const SITE_LAYER_VERIFICATION_STATUS_SCHEMA = z.enum([
  "machine",
  "human",
  "unsurveyed",
]);

/** Shared provenance gate fields for ADR-029 site-layer atoms. */
export const SITE_LAYER_PROVENANCE_FIELDS = {
  sourceVintage: z.string().min(1).optional(),
  verificationStatus: SITE_LAYER_VERIFICATION_STATUS_SCHEMA,
  sourceAdapter: z.string().min(1),
  evaluatedAt: z.string().min(1),
} as const;

export type BuildingFootprintSourceTier =
  | "cad-authoritative"
  | "ml-derived"
  | "absent";

export const BUILDING_FOOTPRINT_SOURCE_TIER_SCHEMA = z.enum([
  "cad-authoritative",
  "ml-derived",
  "absent",
]);

/** Per-parcel absence when a source exists but yields no feature for the parcel. */
export const BUILDING_FOOTPRINT_ABSENCE_KIND = "no-footprint-feature" as const;

export const BUILDING_FOOTPRINT_ABSENCE_SCHEMA = z.object({
  kind: z.literal(BUILDING_FOOTPRINT_ABSENCE_KIND),
  reason: z.string().min(1),
});

export type BuildingFootprintAbsence = z.infer<
  typeof BUILDING_FOOTPRINT_ABSENCE_SCHEMA
>;

// ============================================================================
// parcel-node (Rail 1 — parcel identity and geometry provenance)
// ============================================================================

/**
 * Which external key the second token of `parcelNodeId` carries.
 *
 * Eight Central-TX counties fail a straight `prop_id` join and route through a
 * geo_id / address crosswalk (`90_operations/OPS-1_texas_source_registry.md`).
 * Recording the key KIND on the anchor is identity metadata — it is not the
 * join-quality RATE, which stays a manifest/roster metric and is deliberately
 * not atomized.
 */
export type ParcelKeyKind = "prop_id" | "geo_id_crosswalk";

export const PARCEL_KEY_KIND_SCHEMA = z.enum(["prop_id", "geo_id_crosswalk"]);

/**
 * Where the parcel ring came from.
 *
 * `absent` is the typed-absence tier (mirrors `building-footprint` /
 * `utility-easement`): the county was probed and no ring source published.
 */
export type ParcelGeometrySourceTier =
  | "txgio-stratmap"
  | "county-arcgis-override"
  | "absent";

export const PARCEL_GEOMETRY_SOURCE_TIER_SCHEMA = z.enum([
  "txgio-stratmap",
  "county-arcgis-override",
  "absent",
]);

/**
 * Pointer to the single geometry truth frame — NEVER the ring bytes.
 *
 * Geometry Law rule 1 (`_decisions/2026-08-07_envelope_saga_close_and_geometry_law`):
 * one ring per parcel, `txgio_parcel` is the truth frame. Ten engine files read
 * that store directly; duplicating the ring into an atom would create a second
 * source of geometry truth and re-open rule 3's master defect class. This
 * reference resolves to the ring; it does not restate it.
 */
export const PARCEL_GEOMETRY_STORE_REF_SCHEMA = z
  .object({
    store: z.literal("txgio_parcel"),
    countyFips: z.string().regex(/^\d{5}$/, "countyFips must be 5 digits"),
    propId: z.string().min(1),
  })
  .strict();

export type ParcelGeometryStoreRef = z.infer<
  typeof PARCEL_GEOMETRY_STORE_REF_SCHEMA
>;

/**
 * Per-parcel typed absence for `parcel-node`.
 *
 * - `no-parcel-geometry` — county IS loaded, parcel key resolves nothing.
 *   Fail-closed and distinct from not-yet-loaded, which is county-level
 *   `verifiedAbsence` on the `{fips}:_county_coverage` anchor.
 * - `geometry-incomplete` — the store row carries a MultiPolygon whose extra
 *   rings the serving path would silently truncate. Emit the finding; do not
 *   pass a half-parcel off as the parcel.
 * - `parcel-key-unresolved` — crosswalk county where the key kind could not be
 *   established; a guessed join is worse than an honest gap.
 */
export const PARCEL_NODE_ABSENCE_KINDS = [
  "no-parcel-geometry",
  "geometry-incomplete",
  "parcel-key-unresolved",
] as const;

export type ParcelNodeAbsenceKind = (typeof PARCEL_NODE_ABSENCE_KINDS)[number];

export const PARCEL_NODE_ABSENCE_SCHEMA = z
  .object({
    kind: z.enum(PARCEL_NODE_ABSENCE_KINDS),
    reason: z.string().min(1),
  })
  .strict();

export type ParcelNodeAbsence = z.infer<typeof PARCEL_NODE_ABSENCE_SCHEMA>;

/**
 * One external key with its own provenance. A parcel anchor may carry several
 * (prop_id from the TxGIO row, geo_id from the CAD roll); each states where it
 * came from so a consumer never has to guess which key a join used.
 */
export const PARCEL_EXTERNAL_KEY_SCHEMA = z
  .object({
    keyKind: PARCEL_KEY_KIND_SCHEMA,
    keyValue: z.string().min(1),
    sourceCitation: z.string().min(1),
  })
  .strict();

export type ParcelExternalKey = z.infer<typeof PARCEL_EXTERNAL_KEY_SCHEMA>;

export type UtilityEasementSourceTier =
  | "plat-gis-authoritative"
  | "county-gis"
  | "record-extracted"
  | "absent";

export const UTILITY_EASEMENT_SOURCE_TIER_SCHEMA = z.enum([
  "plat-gis-authoritative",
  "county-gis",
  "record-extracted",
  "absent",
]);

export type UtilityEasementClass =
  | "utility"
  | "drainage"
  | "ingress-egress"
  | "combined"
  | "unknown";

export const UTILITY_EASEMENT_CLASS_SCHEMA = z.enum([
  "utility",
  "drainage",
  "ingress-egress",
  "combined",
  "unknown",
]);

export const UTILITY_EASEMENT_ABSENCE_KIND = "no-easement-feature" as const;

export const UTILITY_EASEMENT_ABSENCE_SCHEMA = z.object({
  kind: z.literal(UTILITY_EASEMENT_ABSENCE_KIND),
  reason: z.string().min(1),
});

export type UtilityEasementAbsence = z.infer<typeof UTILITY_EASEMENT_ABSENCE_SCHEMA>;

/** Recording pointer when plat/GIS attributes carry book/page metadata. */
export const EASEMENT_RECORDING_REF_SCHEMA = z
  .object({
    county: z.string().min(1),
    book: z.string().min(1).optional(),
    page: z.string().min(1).optional(),
    instrumentNumber: z.string().min(1).optional(),
  })
  .strict();

export type EasementRecordingRef = z.infer<typeof EASEMENT_RECORDING_REF_SCHEMA>;

// ============================================================================
// flood-hazard-fact (Rail — FEMA NFHL)
// ============================================================================

export type FloodHazardSourceTier = "fema-nfhl" | "absent";

export const FLOOD_HAZARD_SOURCE_TIER_SCHEMA = z.enum(["fema-nfhl", "absent"]);

export const FLOOD_HAZARD_ABSENCE_KIND = "no-flood-coverage" as const;

export const FLOOD_HAZARD_ABSENCE_SCHEMA = z
  .object({
    kind: z.literal(FLOOD_HAZARD_ABSENCE_KIND),
    reason: z.string().min(1),
  })
  .strict();

export type FloodHazardAbsence = z.infer<typeof FLOOD_HAZARD_ABSENCE_SCHEMA>;

// ============================================================================
// rail-corridor-fact (Rail — NTAD NARN railroad tracks, NOT RRC oil/gas)
// ============================================================================

export type RailCorridorSourceTier = "ntad-narn" | "absent";

export const RAIL_CORRIDOR_SOURCE_TIER_SCHEMA = z.enum(["ntad-narn", "absent"]);

export const RAIL_CORRIDOR_STATUS_VALUES = [
  "active",
  "abandoned",
  "rail-trail",
] as const;

export type RailCorridorStatus = (typeof RAIL_CORRIDOR_STATUS_VALUES)[number];

export const RAIL_CORRIDOR_STATUS_SCHEMA = z.enum(RAIL_CORRIDOR_STATUS_VALUES);

export const RAIL_CORRIDOR_CLASS_VALUES = [
  "mainline",
  "spur",
  "yard",
] as const;

export type RailCorridorClass = (typeof RAIL_CORRIDOR_CLASS_VALUES)[number];

export const RAIL_CORRIDOR_CLASS_SCHEMA = z.enum(RAIL_CORRIDOR_CLASS_VALUES);

export const RAIL_CORRIDOR_ABSENCE_KINDS = [
  "no-rail-coverage",
  "no-parcel-geometry",
] as const;

export type RailCorridorAbsenceKind =
  (typeof RAIL_CORRIDOR_ABSENCE_KINDS)[number];

export const RAIL_CORRIDOR_ABSENCE_SCHEMA = z
  .object({
    kind: z.enum(RAIL_CORRIDOR_ABSENCE_KINDS),
    reason: z.string().min(1),
  })
  .strict();

export type RailCorridorAbsence = z.infer<typeof RAIL_CORRIDOR_ABSENCE_SCHEMA>;

export const RAIL_CORRIDOR_AT_GRADE_CROSSING_SCHEMA = z
  .object({
    crossingId: z.string().min(1),
    distanceMeters: z.number().nonnegative(),
  })
  .strict();

export type RailCorridorAtGradeCrossing = z.infer<
  typeof RAIL_CORRIDOR_AT_GRADE_CROSSING_SCHEMA
>;

/** Default parcel-edge buffer for NTAD NARN proximity (500 ft ROW / horn screening). */
export const RAIL_CORRIDOR_DEFAULT_BUFFER_METERS = 152.4;

// ============================================================================
// rrc-pipeline-fact (RRC T-4 pipelines — NOT PHMSA NPMS; NOT railroad tracks)
// ============================================================================

export type RrcPipelineSourceTier = "rrc-public-gis" | "absent";

export const RRC_PIPELINE_SOURCE_TIER_SCHEMA = z.enum([
  "rrc-public-gis",
  "absent",
]);

export const RRC_PIPELINE_ABSENCE_KINDS = [
  "no-pipeline-coverage",
  "no-parcel-geometry",
] as const;

export type RrcPipelineAbsenceKind =
  (typeof RRC_PIPELINE_ABSENCE_KINDS)[number];

export const RRC_PIPELINE_ABSENCE_SCHEMA = z
  .object({
    kind: z.enum(RRC_PIPELINE_ABSENCE_KINDS),
    reason: z.string().min(1),
  })
  .strict();

export type RrcPipelineAbsence = z.infer<typeof RRC_PIPELINE_ABSENCE_SCHEMA>;

/** Default parcel-edge buffer for RRC T-4 pipeline proximity (exact 500 ft). */
export const RRC_PIPELINE_DEFAULT_BUFFER_METERS = 152.4;

// ============================================================================
// cad-parcel-roll / land-use-fact (Rail — county appraisal roll)
// ============================================================================

/** Shared CAD roll tier — Cotality is extinguished; never add a cotality tier. */
export type CadRollSourceTier = "cad-authoritative" | "absent";

export const CAD_ROLL_SOURCE_TIER_SCHEMA = z.enum([
  "cad-authoritative",
  "absent",
]);

export const CAD_PARCEL_ROLL_ABSENCE_KINDS = [
  "no-cad-row",
  "join-hold",
] as const;

export type CadParcelRollAbsenceKind =
  (typeof CAD_PARCEL_ROLL_ABSENCE_KINDS)[number];

export const CAD_PARCEL_ROLL_ABSENCE_SCHEMA = z
  .object({
    kind: z.enum(CAD_PARCEL_ROLL_ABSENCE_KINDS),
    reason: z.string().min(1),
  })
  .strict();

export type CadParcelRollAbsence = z.infer<typeof CAD_PARCEL_ROLL_ABSENCE_SCHEMA>;

export const LAND_USE_ABSENCE_KINDS = [
  "no-land-use-code",
  "no-cad-row",
  "join-hold",
] as const;

export type LandUseAbsenceKind = (typeof LAND_USE_ABSENCE_KINDS)[number];

export const LAND_USE_ABSENCE_SCHEMA = z
  .object({
    kind: z.enum(LAND_USE_ABSENCE_KINDS),
    reason: z.string().min(1),
  })
  .strict();

export type LandUseAbsence = z.infer<typeof LAND_USE_ABSENCE_SCHEMA>;

// ============================================================================
// well-fact (Rail — RRC public GIS surface wells, operations lens)
// ============================================================================

export type WellFactSourceTier = "texas-rrc-gis" | "absent";

export const WELL_FACT_SOURCE_TIER_SCHEMA = z.enum(["texas-rrc-gis", "absent"]);

export const WELL_STATUS_VALUES = [
  "producing",
  "permitted",
  "dry",
  "plugged-abandoned",
  "unknown",
] as const;

export type WellStatus = (typeof WELL_STATUS_VALUES)[number];

export const WELL_STATUS_SCHEMA = z.enum(WELL_STATUS_VALUES);

export const WELL_TYPE_VALUES = ["oil", "gas", "injection", "disposal", "unknown"] as const;

export type WellType = (typeof WELL_TYPE_VALUES)[number];

export const WELL_TYPE_SCHEMA = z.enum(WELL_TYPE_VALUES);

export const WELL_PARCEL_RELATION_VALUES = ["on-parcel", "near-parcel"] as const;

export type WellParcelRelation = (typeof WELL_PARCEL_RELATION_VALUES)[number];

export const WELL_PARCEL_RELATION_SCHEMA = z.enum(WELL_PARCEL_RELATION_VALUES);

export const WELL_SURFACE_LOCATION_SCHEMA = z
  .object({
    lng: z.number().finite(),
    lat: z.number().finite(),
  })
  .strict();

export type WellSurfaceLocation = z.infer<typeof WELL_SURFACE_LOCATION_SCHEMA>;

export const WELL_FACT_ABSENCE_KIND = "no-well-on-or-near" as const;

export const WELL_FACT_ABSENCE_SCHEMA = z
  .object({
    kind: z.literal(WELL_FACT_ABSENCE_KIND),
    reason: z.string().min(1),
  })
  .strict();

export type WellFactAbsence = z.infer<typeof WELL_FACT_ABSENCE_SCHEMA>;

/**
 * Owner absence kinds. `owner-withheld` is the one that does NOT exist for the
 * other CAD facets: a CAD may publish a parcel row while suppressing owner
 * identity (confidentiality elections for judges, peace officers, and victims
 * of family violence are statutory in Texas). That is a lawful, expected
 * absence and must be representable as such — never as a missing row and never
 * as an empty owner name.
 */
export const OWNER_FACT_ABSENCE_KINDS = [
  "no-owner-name",
  "owner-withheld",
  "no-cad-row",
  "join-hold",
] as const;

export type OwnerFactAbsenceKind = (typeof OWNER_FACT_ABSENCE_KINDS)[number];

export const OWNER_FACT_ABSENCE_SCHEMA = z
  .object({
    kind: z.enum(OWNER_FACT_ABSENCE_KINDS),
    reason: z.string().min(1),
  })
  .strict();

export type OwnerFactAbsence = z.infer<typeof OWNER_FACT_ABSENCE_SCHEMA>;

/** CAD numeric export may carry acres as a string; accept either form. */
export const LAND_ACRES_SCHEMA = z.union([z.string().min(1), z.number()]);

// ============================================================================
// special-district-fact (Rail — TCEQ water-district boundaries + Comptroller enrich)
// ============================================================================

export type SpecialDistrictSourceTier = "tceq-water-districts" | "absent";

export const SPECIAL_DISTRICT_SOURCE_TIER_SCHEMA = z.enum([
  "tceq-water-districts",
  "absent",
]);

/**
 * Scoped absence when a parcel centroid misses every polygon in the TCEQ layer.
 * This is NOT a statewide "no special district" claim — Comptroller omissions,
 * ESD/PID, and other types outside this source may still apply.
 */
export const SPECIAL_DISTRICT_ABSENCE_KIND =
  "outside-tceq-source-boundaries" as const;

export const SPECIAL_DISTRICT_ABSENCE_SCHEMA = z
  .object({
    kind: z.literal(SPECIAL_DISTRICT_ABSENCE_KIND),
    reason: z.string().min(1),
  })
  .strict();

export type SpecialDistrictAbsence = z.infer<
  typeof SPECIAL_DISTRICT_ABSENCE_SCHEMA
>;

export const SPECIAL_DISTRICT_MEMBERSHIP_BASIS = ["point-in-polygon"] as const;

export type SpecialDistrictMembershipBasis =
  (typeof SPECIAL_DISTRICT_MEMBERSHIP_BASIS)[number];

export const SPECIAL_DISTRICT_MEMBERSHIP_BASIS_SCHEMA = z.enum(
  SPECIAL_DISTRICT_MEMBERSHIP_BASIS,
);

/** Optional Comptroller SPDPID tax-rate enrichment — absence of rate is honest. */
export const SPECIAL_DISTRICT_TAX_RATE_SCHEMA = z
  .object({
    totalRatePc: z.number().optional(),
    effectiveAvtRatePc: z.number().optional(),
    reportYear: z.number().int().optional(),
    registrySpdPublId: z.string().min(1).optional(),
    source: z.literal("comptroller-spdpid"),
  })
  .strict();

export type SpecialDistrictTaxRate = z.infer<
  typeof SPECIAL_DISTRICT_TAX_RATE_SCHEMA
>;
