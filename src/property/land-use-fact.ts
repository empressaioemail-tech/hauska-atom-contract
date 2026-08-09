import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  CAD_ROLL_SOURCE_TIER_SCHEMA,
  LAND_USE_ABSENCE_SCHEMA,
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_DEFAULT_ACCESS_POLICY,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  type CadRollSourceTier,
  type LandUseAbsence,
  type SiteLayerVerifiedAbsence,
} from "./common.js";

/**
 * Land use FACT atom — CAD `property_use_code` or honest absence.
 *
 * Cotality `land_use_code` is dead; writers read `cad_property.property_use_code`
 * only. Never add a cotality sourceTier — Cotality is extinguished.
 */
export interface LandUseFactAtomInstance {
  entityType: "land-use-fact";
  atomDid: string;
  parcelNodeId: string;
  taxYear: number;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  sourceTier: CadRollSourceTier;
  landUseCode?: string;
  landUseLabel?: string;
  absence?: LandUseAbsence;
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

export const LAND_USE_FACT_SCHEMA = z
  .object({
    entityType: z.literal("land-use-fact"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^lufact_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format lufact_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    taxYear: z.number().int(),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    sourceTier: CAD_ROLL_SOURCE_TIER_SCHEMA,
    landUseCode: z.string().min(1).optional(),
    landUseLabel: z.string().min(1).optional(),
    absence: LAND_USE_ABSENCE_SCHEMA.optional(),
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
    const hasLandUseCode = data.landUseCode !== undefined;
    const hasLandUseLabel = data.landUseLabel !== undefined;

    if (data.accessPolicy !== PROPERTY_DEFAULT_ACCESS_POLICY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "land-use-fact must use accessPolicy public-free",
        path: ["accessPolicy"],
      });
    }

    if ((hasLandUseCode || hasLandUseLabel) && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "land use fields and absence are mutually exclusive",
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
      if (hasLandUseCode || hasLandUseLabel) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceTier absent must not carry land use claim fields",
          path: ["sourceTier"],
        });
      }
    } else if (hasAbsence) {
      if (hasLandUseCode || hasLandUseLabel) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "absence must not coexist with land use claim fields",
          path: ["absence"],
        });
      }
    } else if (!hasLandUseCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "cad-authoritative tier requires landUseCode when no absence",
        path: ["landUseCode"],
      });
    }
  });

export function createLandUseFact(
  input: z.input<typeof LAND_USE_FACT_SCHEMA>,
): LandUseFactAtomInstance {
  return LAND_USE_FACT_SCHEMA.parse(input) as LandUseFactAtomInstance;
}
