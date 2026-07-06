import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import { WIDTHED_CONFIDENCE_SCHEMA } from "../read-contract/common.js";
import { OG_QUALITY_GATE_FIELDS } from "./common.js";

/**
 * Allocation method for tract participation factors. Per ADR-025 Herbert review,
 * the method is operator-asserted and must be tagged on every factor — no bare
 * factors without method + source are representable.
 */
export type AllocationMethod =
  | "stated-fraction"
  | "acreage"
  | "lateral-length"
  | "take-points"
  | "acre-feet"
  | "oil-in-place"
  | "other";

export const ALLOCATION_METHODS: ReadonlyArray<AllocationMethod> = [
  "stated-fraction",
  "acreage",
  "lateral-length",
  "take-points",
  "acre-feet",
  "oil-in-place",
  "other",
];

/**
 * Unit basis discriminator: pooled-unit (county instruments), allocation-well
 * (RRC plat), or psa (pooling and spacing agreement).
 */
export type UnitBasis = "pooled-unit" | "allocation-well" | "psa";

export const UNIT_BASES: ReadonlyArray<UnitBasis> = [
  "pooled-unit",
  "allocation-well",
  "psa",
];

/**
 * Tract participation entry carrying operator-asserted factor, allocation
 * method, and source. Per ADR-025, the schema must NOT allow a bare factor
 * without allocationMethod + source.
 */
export interface TractParticipation {
  tractDid: string;
  factor: number;
  allocationMethod: AllocationMethod;
  source: string;
  confidence: ReturnType<typeof WIDTHED_CONFIDENCE_SCHEMA["parse"]>;
  /** For allocation-well basis: take points on this tract */
  takePoints?: number;
  /** For allocation-well basis: productive lateral footage on this tract */
  productiveLateralFootage?: number;
}

export const TRACT_PARTICIPATION_SCHEMA = z.object({
  tractDid: z.string().min(1),
  factor: z.number(),
  allocationMethod: z.enum(
    ALLOCATION_METHODS as [AllocationMethod, ...AllocationMethod[]],
  ),
  source: z.string().min(1),
  confidence: WIDTHED_CONFIDENCE_SCHEMA,
  takePoints: z.number().optional(),
  productiveLateralFootage: z.number().optional(),
});

/**
 * Per-tract ratification gap for pooled-unit basis. Mirrors the gaps[] pattern
 * on ownership-interest: ratifications are load-bearing (pooling often not
 * binding until ratified), so the model renders gaps as gaps rather than
 * asserting clean coverage over a broken record.
 */
export interface RatificationGap {
  tractDid: string;
  gapDescription: string;
}

export const RATIFICATION_GAP_SCHEMA = z.object({
  tractDid: z.string().min(1),
  gapDescription: z.string().min(1),
});

/**
 * Revenue-allocation-unit atom instance per ADR-025 Herbert review
 * (2026-07-06). One first-class object with two source adapters (pooled-unit
 * from county instruments; allocation-well from RRC plat), discriminated by
 * `basis`. Defines how production revenue allocates across tracts for a well
 * or well set.
 *
 * Per ADR-025: "The DOI is derived, never source." Computed owner decimals
 * (allocation factor × NMI × lease royalty) are engine-run outputs
 * (procedure-execution). Obtained operator DOIs / signed division orders enter
 * as external assertions linked by a `reconciles-with` edge to the computed
 * value; discrepancies surface as disputes, never silent overwrites.
 *
 * DID format: unit_<hash> (hashed derivation from source, externalId).
 */
export interface RevenueAllocationUnitAtomInstance {
  entityType: "revenue-allocation-unit";
  unitDid: string;
  basis: UnitBasis;
  wellDids: ReadonlyArray<string>;
  operatorActorDid: string;
  effectiveFrom: string;
  effectiveTo?: string;
  tractParticipations: ReadonlyArray<TractParticipation>;

  // Pooled-unit basis fields: sourced from recorded unit family
  // (unit-designation, declaration-of-pooling, amendments, releases).
  // Ratification is load-bearing (Opiela: unit + ratifications from ≥65% in
  // interest per tract).
  sourceInstrumentDids?: ReadonlyArray<string>;
  ratificationInstrumentDids?: ReadonlyArray<string>;
  ratificationGaps?: ReadonlyArray<RatificationGap>;

  // Allocation-well basis fields: sourced from RRC W-1 allocation attachment
  // plus as-drilled plat ("Final As-Drilled Allocation Well Location"). No
  // county instrument exists for allocation wells; absence of county pooling
  // instruments for a horizontal well is a signal (likely allocation or
  // standalone), never "missing data."
  sourcePlatCid?: string;

  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

const BASE_SCHEMA = z.object({
  entityType: z.literal("revenue-allocation-unit"),
  unitDid: z.string().min(1),
  basis: z.enum(UNIT_BASES as [UnitBasis, ...UnitBasis[]]),
  wellDids: z.array(z.string().min(1)),
  operatorActorDid: z.string().min(1),
  effectiveFrom: z.string().min(1),
  effectiveTo: z.string().min(1).optional(),
  tractParticipations: z.array(TRACT_PARTICIPATION_SCHEMA).min(1),
  ...OG_QUALITY_GATE_FIELDS,
  accessPolicy: z.enum([
    "public-free",
    "public-paid",
    "platform-internal",
    "tenant-private",
    "tenant-shared",
  ]),
});

/**
 * Schema for pooled-unit basis: requires sourceInstrumentDids, allows
 * ratificationInstrumentDids and ratificationGaps.
 */
const POOLED_UNIT_SCHEMA = BASE_SCHEMA.extend({
  basis: z.literal("pooled-unit"),
  sourceInstrumentDids: z.array(z.string().min(1)).min(1),
  ratificationInstrumentDids: z.array(z.string().min(1)).optional(),
  ratificationGaps: z.array(RATIFICATION_GAP_SCHEMA).optional(),
  sourcePlatCid: z.undefined(),
});

/**
 * Schema for allocation-well basis: requires sourcePlatCid. Per-tract take
 * points and productive-lateral footage carried on tractParticipations entries.
 */
const ALLOCATION_WELL_SCHEMA = BASE_SCHEMA.extend({
  basis: z.literal("allocation-well"),
  sourcePlatCid: z.string().min(1),
  sourceInstrumentDids: z.undefined(),
  ratificationInstrumentDids: z.undefined(),
  ratificationGaps: z.undefined(),
});

/**
 * Schema for psa basis: like pooled-unit, may have sourceInstrumentDids.
 */
const PSA_SCHEMA = BASE_SCHEMA.extend({
  basis: z.literal("psa"),
  sourceInstrumentDids: z.array(z.string().min(1)).min(1),
  ratificationInstrumentDids: z.array(z.string().min(1)).optional(),
  ratificationGaps: z.array(RATIFICATION_GAP_SCHEMA).optional(),
  sourcePlatCid: z.undefined(),
});

/**
 * Revenue-allocation-unit schema with discriminated union on basis. Each basis
 * variant enforces its required fields; for example, pooled-unit requires
 * sourceInstrumentDids, allocation-well requires sourcePlatCid.
 */
export const REVENUE_ALLOCATION_UNIT_SCHEMA = z.discriminatedUnion("basis", [
  POOLED_UNIT_SCHEMA,
  ALLOCATION_WELL_SCHEMA,
  PSA_SCHEMA,
]);
