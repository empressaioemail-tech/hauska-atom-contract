import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  ROAD_NODE_ID_PATTERN,
} from "./common.js";

/** v1 road hierarchy (27c WDLL 3 / R1). */
export type RoadClassification =
  | "highway"
  | "major_collector"
  | "minor_collector"
  | "residential"
  | "alley"
  | "gravel"
  | "unclassified";

export const ROAD_CLASSIFICATION_VALUES: ReadonlyArray<RoadClassification> = [
  "highway",
  "major_collector",
  "minor_collector",
  "residential",
  "alley",
  "gravel",
  "unclassified",
];

export const ROAD_CLASSIFICATION_SCHEMA = z.enum([
  "highway",
  "major_collector",
  "minor_collector",
  "residential",
  "alley",
  "gravel",
  "unclassified",
]);

/** WGS84 [lng, lat] vertex. */
export type GeoCoord = readonly [number, number];

export const GEO_COORD_SCHEMA = z.tuple([z.number(), z.number()]);

export const ROAD_CENTERLINE_SCHEMA = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(GEO_COORD_SCHEMA).min(2),
});

export type RoadCenterline = z.infer<typeof ROAD_CENTERLINE_SCHEMA>;

export const ROW_PROVENANCE_KIND = "approximate-assumed-per-class" as const;

export const ROW_PROVENANCE_SCHEMA = z.object({
  kind: z.literal(ROW_PROVENANCE_KIND),
  /** Descriptor table key used for assumed width (jurisdiction knowledge). */
  assumedWidthTableKey: z.string().min(1),
  osmHighwayTag: z.string().min(1),
  note: z.string().min(1).optional(),
});

export type RowProvenance = z.infer<typeof ROW_PROVENANCE_SCHEMA>;

export const ROAD_ROW_SCHEMA = z.object({
  assumedWidthFt: z.number().positive(),
  provenance: ROW_PROVENANCE_SCHEMA,
  /** Offset polylines from centerline + assumed half-width (v1 approximate). */
  leftEdge: ROAD_CENTERLINE_SCHEMA,
  rightEdge: ROAD_CENTERLINE_SCHEMA,
});

export type RoadRow = z.infer<typeof ROAD_ROW_SCHEMA>;

/** Digital-twin-ready attach slot — no infra atoms in R1 scope. */
export const ROAD_ATTACH_POINT_SCHEMA = z.object({
  kind: z.literal("infra-slot"),
  refKey: z.string().min(1),
  position: GEO_COORD_SCHEMA,
  note: z.string().min(1).optional(),
});

export type RoadAttachPoint = z.infer<typeof ROAD_ATTACH_POINT_SCHEMA>;

/**
 * Road NODE atom — first-class spine node (27c WDLL 3).
 *
 * Stable id `{county_fips}:road:{osm_way_id}`. Centerline from OSM;
 * ROW edges from assumed per-class width with honest approximate provenance.
 */
export interface RoadNodeAtomInstance {
  entityType: "road-node";
  atomDid: string;
  roadNodeId: string;
  /** Human label when OSM carries a name tag (e.g. "Spring Street"). */
  displayName?: string;
  countyFips: string;
  osmWayId: number;
  classification: RoadClassification;
  centerline: RoadCenterline;
  row: RoadRow;
  /** Reserved reference/attach points for future infra atoms (streetlight, water main, …). */
  attachPoints: ReadonlyArray<RoadAttachPoint>;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  accessPolicy: AccessPolicy;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  atomTier: AtomTier;
  readContract?: ReasoningReadContract;
}

export const ROAD_NODE_SCHEMA = z.object({
  entityType: z.literal("road-node"),
  atomDid: z
    .string()
    .min(1)
    .refine((val) => /^rnode_[0-9a-f]{16}$/.test(val), {
      message: "atomDid must be in format rnode_<16-hex-chars>",
    }),
  roadNodeId: z
    .string()
    .min(1)
    .refine((val) => ROAD_NODE_ID_PATTERN.test(val), {
      message: "roadNodeId must match {county_fips}:road:{osm_way_id}",
    }),
  displayName: z.string().min(1).optional(),
  countyFips: z.string().regex(/^\d{5}$/),
  osmWayId: z.number().int().positive(),
  classification: ROAD_CLASSIFICATION_SCHEMA,
  centerline: ROAD_CENTERLINE_SCHEMA,
  row: ROAD_ROW_SCHEMA,
  attachPoints: z.array(ROAD_ATTACH_POINT_SCHEMA),
  reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
  accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
  ...PROPERTY_QUALITY_GATE_FIELDS,
  atomTier: z.literal(PROPERTY_ATOM_TIER),
  readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
});

export function createRoadNode(
  input: z.input<typeof ROAD_NODE_SCHEMA>,
): RoadNodeAtomInstance {
  return ROAD_NODE_SCHEMA.parse(input) as RoadNodeAtomInstance;
}

export function roadNodeIdFromParts(countyFips: string, osmWayId: number): string {
  return `${countyFips}:road:${osmWayId}`;
}
