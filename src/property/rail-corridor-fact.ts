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
  PROPERTY_DEFAULT_ACCESS_POLICY,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  RAIL_CORRIDOR_ABSENCE_SCHEMA,
  RAIL_CORRIDOR_AT_GRADE_CROSSING_SCHEMA,
  RAIL_CORRIDOR_CLASS_SCHEMA,
  RAIL_CORRIDOR_SOURCE_TIER_SCHEMA,
  RAIL_CORRIDOR_STATUS_SCHEMA,
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  type RailCorridorAbsence,
  type RailCorridorAtGradeCrossing,
  type RailCorridorClass,
  type RailCorridorSourceTier,
  type RailCorridorStatus,
  type SiteLayerVerifiedAbsence,
} from "./common.js";

/**
 * Rail corridor FACT atom — NTAD NARN proximity / ROW exposure or honest absence.
 *
 * Parcels outside the evaluation buffer are PRESENT with `nearRailCorridor: false`
 * (same outside-mapped discipline as flood-hazard-fact). Absence is for missing
 * parcel geometry or an empty/unreachable rail index only.
 */
export interface RailCorridorFactAtomInstance {
  entityType: "rail-corridor-fact";
  atomDid: string;
  parcelNodeId: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  sourceTier: RailCorridorSourceTier;
  /** Buffer distance used for parcel-edge ↔ corridor line evaluation (meters). */
  bufferMeters: number;
  /** True when any corridor segment lies within bufferMeters of a parcel edge. */
  nearRailCorridor?: boolean;
  corridorStatus?: RailCorridorStatus;
  corridorClass?: RailCorridorClass;
  /** Minimum edge-to-corridor distance when nearRailCorridor is true (meters). */
  nearestCorridorDistanceMeters?: number;
  /** At-grade crossings within bufferMeters of the parcel boundary. */
  atGradeCrossings?: ReadonlyArray<RailCorridorAtGradeCrossing>;
  absence?: RailCorridorAbsence;
  verifiedAbsence?: SiteLayerVerifiedAbsence;
  accessPolicy: AccessPolicy;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  sourceVintage?: string;
  verificationStatus: "machine" | "human" | "unsurveyed";
  sourceAdapter: string;
  evaluatedAt: string;
  atomTier: AtomTier;
  readContract?: ReasoningReadContract;
}

function hasCorridorClaim(data: {
  nearRailCorridor?: boolean;
  corridorStatus?: RailCorridorStatus;
  corridorClass?: RailCorridorClass;
  nearestCorridorDistanceMeters?: number;
  atGradeCrossings?: ReadonlyArray<RailCorridorAtGradeCrossing>;
}): boolean {
  return (
    data.nearRailCorridor !== undefined ||
    data.corridorStatus !== undefined ||
    data.corridorClass !== undefined ||
    data.nearestCorridorDistanceMeters !== undefined ||
    (data.atGradeCrossings !== undefined && data.atGradeCrossings.length > 0)
  );
}

export const RAIL_CORRIDOR_FACT_SCHEMA = z
  .object({
    entityType: z.literal("rail-corridor-fact"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^railfact_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format railfact_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    sourceTier: RAIL_CORRIDOR_SOURCE_TIER_SCHEMA,
    bufferMeters: z.number().positive(),
    nearRailCorridor: z.boolean().optional(),
    corridorStatus: RAIL_CORRIDOR_STATUS_SCHEMA.optional(),
    corridorClass: RAIL_CORRIDOR_CLASS_SCHEMA.optional(),
    nearestCorridorDistanceMeters: z.number().nonnegative().optional(),
    atGradeCrossings: z.array(RAIL_CORRIDOR_AT_GRADE_CROSSING_SCHEMA).optional(),
    absence: RAIL_CORRIDOR_ABSENCE_SCHEMA.optional(),
    verifiedAbsence: SITE_LAYER_VERIFIED_ABSENCE_SCHEMA.optional(),
    accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
    ...PROPERTY_QUALITY_GATE_FIELDS,
    ...SITE_LAYER_PROVENANCE_FIELDS,
    atomTier: z.literal(PROPERTY_ATOM_TIER),
    readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
  })
  .superRefine((data, ctx) => {
    const hasAbsence = data.absence !== undefined;
    const isAbsentTier = data.sourceTier === "absent";
    const hasClaim = hasCorridorClaim(data);

    if (data.accessPolicy !== PROPERTY_DEFAULT_ACCESS_POLICY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "rail-corridor-fact must use accessPolicy public-free",
        path: ["accessPolicy"],
      });
    }

    if (hasClaim && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "corridor claim fields and absence are mutually exclusive",
        path: ["absence"],
      });
    }

    if (isAbsentTier) {
      if (!data.verifiedAbsence) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "sourceTier absent requires verifiedAbsence (evaluated + provenanceScope)",
          path: ["verifiedAbsence"],
        });
      }
      if (hasClaim || data.nearRailCorridor !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceTier absent must not carry corridor claim fields",
          path: ["sourceTier"],
        });
      }
    } else if (hasAbsence) {
      if (hasClaim || data.nearRailCorridor !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "absence must not coexist with corridor claim fields",
          path: ["absence"],
        });
      }
    } else if (data.nearRailCorridor === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ntad-narn tier requires nearRailCorridor when no absence",
        path: ["nearRailCorridor"],
      });
    } else if (data.nearRailCorridor) {
      if (!data.corridorStatus || !data.corridorClass) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "nearRailCorridor true requires corridorStatus and corridorClass",
          path: ["corridorStatus"],
        });
      }
      if (data.nearestCorridorDistanceMeters === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "nearRailCorridor true requires nearestCorridorDistanceMeters",
          path: ["nearestCorridorDistanceMeters"],
        });
      }
    }
  });

export function createRailCorridorFact(
  input: z.input<typeof RAIL_CORRIDOR_FACT_SCHEMA>,
): RailCorridorFactAtomInstance {
  return RAIL_CORRIDOR_FACT_SCHEMA.parse(input) as RailCorridorFactAtomInstance;
}
