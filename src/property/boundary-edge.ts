import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
} from "./common.js";
import { ROAD_CLASSIFICATION_SCHEMA, type RoadClassification } from "./road-node.js";

/** `{county_fips}:{prop_id}:boundary:{edgeIndex}` (27f S2-U2 / WDLL 4-5). */
export const BOUNDARY_EDGE_ID_PATTERN = /^\d{5}:[A-Za-z0-9._-]+:boundary:\d+$/;

export type BoundaryEdgeRole = "front" | "side" | "rear" | "side_corner";

export const BOUNDARY_EDGE_ROLE_VALUES: ReadonlyArray<BoundaryEdgeRole> = [
  "front",
  "side",
  "rear",
  "side_corner",
];

export const BOUNDARY_EDGE_ROLE_SCHEMA = z.enum([
  "front",
  "side",
  "rear",
  "side_corner",
]);

export type BoundaryAdjacencyKind =
  | "ROW"
  | "alley"
  | "neighbor-parcel"
  | "unmapped";

export const BOUNDARY_ADJACENCY_KIND_VALUES: ReadonlyArray<BoundaryAdjacencyKind> =
  ["ROW", "alley", "neighbor-parcel", "unmapped"];

export const BOUNDARY_ADJACENCY_KIND_SCHEMA = z.enum([
  "ROW",
  "alley",
  "neighbor-parcel",
  "unmapped",
]);

/**
 * How the front role was chosen (honesty requirement — surfaces cite it):
 * - "situs-street-match": parcel situs street name matched exactly one
 *   road-adjacent edge's road displayName.
 * - "adjacency-heuristic": road-proximity heuristic (no situs / no match /
 *   ambiguous match).
 */
export type BoundaryFrontBasis = "situs-street-match" | "adjacency-heuristic";

export const BOUNDARY_FRONT_BASIS_SCHEMA = z.enum([
  "situs-street-match",
  "adjacency-heuristic",
]);

export const BOUNDARY_FACING_ROAD_SCHEMA = z
  .object({
    roadNodeId: z.string().min(1),
    classification: ROAD_CLASSIFICATION_SCHEMA,
    provenance: z.string().min(1),
    osmHighwayTag: z.string().min(1).optional(),
    /** Mirrors road-node isPedestrianWay when known (same engine denylist). */
    isPedestrianWay: z.boolean().optional(),
  })
  .strict();

export interface BoundaryFacingRoad {
  roadNodeId: string;
  classification: RoadClassification;
  provenance: string;
  osmHighwayTag?: string;
  isPedestrianWay?: boolean;
}

export const BOUNDARY_RESOLVED_SETBACK_SCHEMA = z
  .object({
    feet: z.number().nonnegative(),
    provenance: z.string().min(1),
    atomCitation: z.string().min(1).optional(),
  })
  .strict();

export type BoundaryResolvedSetback = z.infer<
  typeof BOUNDARY_RESOLVED_SETBACK_SCHEMA
>;

/**
 * "not-applicable": no zoning ordinance exists to derive a setback from
 * (unincorporated land). Distinct from "no-setback-row" (a genuinely missing
 * ordinance-chart row for a KNOWN zoned district — a real gap, not an
 * absence of zoning itself).
 */
export const BOUNDARY_SETBACK_ABSENCE_KINDS = [
  "no-setback-row",
  "unmapped-adjacency",
  "not-applicable",
] as const;

export type BoundarySetbackAbsenceKind =
  (typeof BOUNDARY_SETBACK_ABSENCE_KINDS)[number];

export const BOUNDARY_SETBACK_ABSENCE_SCHEMA = z
  .object({
    kind: z.enum(BOUNDARY_SETBACK_ABSENCE_KINDS),
    reason: z.string().min(1),
  })
  .strict();

export type BoundarySetbackAbsence = z.infer<
  typeof BOUNDARY_SETBACK_ABSENCE_SCHEMA
>;

export const BOUNDARY_SETBACK_SCHEMA = z.union([
  BOUNDARY_RESOLVED_SETBACK_SCHEMA,
  BOUNDARY_SETBACK_ABSENCE_SCHEMA,
]);

export type BoundarySetback =
  | BoundaryResolvedSetback
  | BoundarySetbackAbsence;

const ENU_POINT_SCHEMA = z.tuple([z.number(), z.number()]);

/**
 * GIS-approximate interior frame (local-ENU metres from depth-warm
 * projectRing: centroid origin, +X east, +Y north) — NOT raw WGS84 lng/lat.
 * Used for GIS property-line-tags.
 */
export const BOUNDARY_INTERIOR_FRAME_SCHEMA = z
  .object({
    ringCcw: z.boolean(),
    centroidInside: z.boolean(),
    inwardNormal: z.object({ x: z.number(), y: z.number() }).strict(),
    edgeEndpoints: z.tuple([ENU_POINT_SCHEMA, ENU_POINT_SCHEMA]),
  })
  .strict();

export interface BoundaryInteriorFrame {
  ringCcw: boolean;
  centroidInside: boolean;
  inwardNormal: { x: number; y: number };
  edgeEndpoints: [[number, number], [number, number]];
}

/**
 * GIS-approximate bearing + distance on a boundary edge (never survey-grade).
 * Honesty string must stay machine-checkable (WDLL anti-fabrication).
 */
export const BOUNDARY_PROPERTY_LINE_TAGS_SCHEMA = z
  .object({
    bearing: z.string().min(1),
    distanceFeet: z.number().nonnegative(),
    provenance: z
      .object({
        kind: z.literal("gis-approximate"),
        honesty: z.string().min(1),
        source: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export type BoundaryPropertyLineTags = z.infer<
  typeof BOUNDARY_PROPERTY_LINE_TAGS_SCHEMA
>;

/**
 * Property boundary edge atom — per-parcel edge with role, adjacency,
 * resolved setback, and interior-frame geometry (27f S2-U2 / WDLL 4-5).
 *
 * Stable id `{county_fips}:{prop_id}:boundary:{edgeIndex}`. A parcel
 * normally carries several of these (one per boundary side), unlike most
 * other property atom kinds which are one-per-parcel.
 */
export interface BoundaryEdgeAtomInstance {
  entityType: "property-boundary-edge";
  atomDid: string;
  boundaryEdgeId: string;
  parcelNodeId: string;
  countyFips: string;
  propId: string;
  edgeIndex: number;
  role: BoundaryEdgeRole;
  /** Present on the front edge only: which rule assigned the front role. */
  frontBasis?: BoundaryFrontBasis;
  adjacencyKind: BoundaryAdjacencyKind;
  parcelNeighborPropId: string | null;
  facingRoad: BoundaryFacingRoad | null;
  setback: BoundarySetback;
  interior: BoundaryInteriorFrame;
  /** GIS-approx from ring endpoints; optional until backfill lands. */
  propertyLineTags?: BoundaryPropertyLineTags;
  effectiveDate: string;
  status: "active" | "retired";
  supersedesEntityId: string | null;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  accessPolicy: AccessPolicy;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  atomTier: AtomTier;
  readContract?: ReasoningReadContract;
}

export const BOUNDARY_EDGE_SCHEMA = z.object({
  entityType: z.literal("property-boundary-edge"),
  atomDid: z
    .string()
    .min(1)
    .refine(
      (val) =>
        /^did:hauska:property-boundary-edge:\d{5}:[A-Za-z0-9._-]+:boundary:\d+$/.test(
          val,
        ),
      {
        message:
          "atomDid must be did:hauska:property-boundary-edge:{county_fips}:{prop_id}:boundary:{edgeIndex}",
      },
    ),
  boundaryEdgeId: z
    .string()
    .min(1)
    .refine((val) => BOUNDARY_EDGE_ID_PATTERN.test(val), {
      message: "boundaryEdgeId must match {county_fips}:{prop_id}:boundary:{edgeIndex}",
    }),
  parcelNodeId: z
    .string()
    .min(1)
    .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
      message: "parcelNodeId must match {county_fips}:{prop_id}",
    }),
  countyFips: z.string().regex(/^\d{5}$/),
  propId: z.string().min(1),
  edgeIndex: z.number().int().nonnegative(),
  role: BOUNDARY_EDGE_ROLE_SCHEMA,
  frontBasis: BOUNDARY_FRONT_BASIS_SCHEMA.optional(),
  adjacencyKind: BOUNDARY_ADJACENCY_KIND_SCHEMA,
  parcelNeighborPropId: z.string().min(1).nullable(),
  facingRoad: BOUNDARY_FACING_ROAD_SCHEMA.nullable(),
  setback: BOUNDARY_SETBACK_SCHEMA,
  interior: BOUNDARY_INTERIOR_FRAME_SCHEMA,
  propertyLineTags: BOUNDARY_PROPERTY_LINE_TAGS_SCHEMA.optional(),
  effectiveDate: z.string().min(1),
  status: z.enum(["active", "retired"]),
  supersedesEntityId: z.string().min(1).nullable(),
  reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
  accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
  ...PROPERTY_QUALITY_GATE_FIELDS,
  atomTier: z.literal(PROPERTY_ATOM_TIER),
  readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
});

export function createBoundaryEdge(
  input: z.input<typeof BOUNDARY_EDGE_SCHEMA>,
): BoundaryEdgeAtomInstance {
  return BOUNDARY_EDGE_SCHEMA.parse(input) as BoundaryEdgeAtomInstance;
}

export function boundaryEdgeIdFromParts(
  countyFips: string,
  propId: string,
  edgeIndex: number,
): string {
  return `${countyFips}:${propId}:boundary:${edgeIndex}`;
}
