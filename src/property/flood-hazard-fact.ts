import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  FLOOD_HAZARD_ABSENCE_SCHEMA,
  FLOOD_HAZARD_SOURCE_TIER_SCHEMA,
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_DEFAULT_ACCESS_POLICY,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  type FloodHazardAbsence,
  type FloodHazardSourceTier,
  type SiteLayerVerifiedAbsence,
} from "./common.js";

/**
 * Flood hazard FACT atom — FEMA NFHL SFHA finding or honest absence.
 *
 * Outside-mapped parcels are PRESENT with `inSpecialFloodHazardArea: false`
 * (Zone X by omission), not typed absence. Absence is for off-coverage / no
 * geocode only (`no-flood-coverage`).
 */
export interface FloodHazardFactAtomInstance {
  entityType: "flood-hazard-fact";
  atomDid: string;
  parcelNodeId: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  sourceTier: FloodHazardSourceTier;
  /** Required when sourceTier is fema-nfhl and no absence. */
  inSpecialFloodHazardArea?: boolean;
  floodZone?: string | null;
  zoneSubtype?: string | null;
  baseFloodElevation?: number | null;
  absence?: FloodHazardAbsence;
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

function hasFloodZoneClaim(data: {
  inSpecialFloodHazardArea?: boolean;
  floodZone?: string | null;
  zoneSubtype?: string | null;
  baseFloodElevation?: number | null;
}): boolean {
  return (
    data.inSpecialFloodHazardArea !== undefined ||
    data.floodZone !== undefined ||
    data.zoneSubtype !== undefined ||
    data.baseFloodElevation !== undefined
  );
}

export const FLOOD_HAZARD_FACT_SCHEMA = z
  .object({
    entityType: z.literal("flood-hazard-fact"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^fhfact_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format fhfact_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    sourceTier: FLOOD_HAZARD_SOURCE_TIER_SCHEMA,
    inSpecialFloodHazardArea: z.boolean().optional(),
    floodZone: z.string().nullable().optional(),
    zoneSubtype: z.string().nullable().optional(),
    baseFloodElevation: z.number().nullable().optional(),
    absence: FLOOD_HAZARD_ABSENCE_SCHEMA.optional(),
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
    const hasClaim = hasFloodZoneClaim(data);

    if (data.accessPolicy !== PROPERTY_DEFAULT_ACCESS_POLICY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "flood-hazard-fact must use accessPolicy public-free",
        path: ["accessPolicy"],
      });
    }

    if (hasClaim && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SFHA finding fields and absence are mutually exclusive",
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
      if (hasClaim) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "sourceTier absent must not carry flood zone claim fields",
          path: ["sourceTier"],
        });
      }
      if (hasAbsence) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceTier absent uses verifiedAbsence, not per-parcel absence",
          path: ["absence"],
        });
      }
    } else if (hasAbsence) {
      if (hasClaim) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "absence must not coexist with SFHA finding fields",
          path: ["absence"],
        });
      }
    } else {
      if (data.inSpecialFloodHazardArea === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "fema-nfhl tier requires inSpecialFloodHazardArea when no absence",
          path: ["inSpecialFloodHazardArea"],
        });
      }
    }
  });

export function createFloodHazardFact(
  input: z.input<typeof FLOOD_HAZARD_FACT_SCHEMA>,
): FloodHazardFactAtomInstance {
  return FLOOD_HAZARD_FACT_SCHEMA.parse(input) as FloodHazardFactAtomInstance;
}
