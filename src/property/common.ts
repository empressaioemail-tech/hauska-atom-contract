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
