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
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  SPECIAL_DISTRICT_ABSENCE_SCHEMA,
  SPECIAL_DISTRICT_MEMBERSHIP_BASIS_SCHEMA,
  SPECIAL_DISTRICT_SOURCE_TIER_SCHEMA,
  SPECIAL_DISTRICT_TAX_RATE_SCHEMA,
  type SpecialDistrictAbsence,
  type SpecialDistrictMembershipBasis,
  type SpecialDistrictSourceTier,
  type SpecialDistrictTaxRate,
  type SiteLayerVerifiedAbsence,
} from "./common.js";

/**
 * Special district FACT atom — TCEQ water-district boundary membership.
 *
 * Membership is BINARY point-in-polygon only. Adjacency to a district boundary
 * does NOT imply membership and must never be inferred with buffers or
 * proximity thresholds — a false "in MUD" tax claim is a closing-cost defect.
 *
 * Parcels outside every polygon in this source carry scoped absence
 * (`outside-tceq-source-boundaries`), not a statewide negative.
 */
export interface SpecialDistrictFactAtomInstance {
  entityType: "special-district-fact";
  atomDid: string;
  parcelNodeId: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  sourceTier: SpecialDistrictSourceTier;
  districtName?: string;
  districtId?: string;
  districtType?: string;
  countyFips?: string;
  membershipBasis?: SpecialDistrictMembershipBasis;
  taxRate?: SpecialDistrictTaxRate;
  absence?: SpecialDistrictAbsence;
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

export const SPECIAL_DISTRICT_FACT_SCHEMA = z
  .object({
    entityType: z.literal("special-district-fact"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^sdfact_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format sdfact_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    sourceTier: SPECIAL_DISTRICT_SOURCE_TIER_SCHEMA,
    districtName: z.string().min(1).optional(),
    districtId: z.string().min(1).optional(),
    districtType: z.string().min(1).optional(),
    countyFips: z
      .string()
      .min(5)
      .max(5)
      .regex(/^\d{5}$/)
      .optional(),
    membershipBasis: SPECIAL_DISTRICT_MEMBERSHIP_BASIS_SCHEMA.optional(),
    taxRate: SPECIAL_DISTRICT_TAX_RATE_SCHEMA.optional(),
    absence: SPECIAL_DISTRICT_ABSENCE_SCHEMA.optional(),
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
    const hasDistrictClaim =
      data.districtName !== undefined ||
      data.districtId !== undefined ||
      data.districtType !== undefined;

    if (data.accessPolicy !== PROPERTY_DEFAULT_ACCESS_POLICY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "special-district-fact must use accessPolicy public-free",
        path: ["accessPolicy"],
      });
    }

    if (hasDistrictClaim && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "district fields and absence are mutually exclusive",
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
      if (hasDistrictClaim || data.membershipBasis !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceTier absent must not carry district membership fields",
          path: ["sourceTier"],
        });
      }
    } else if (hasAbsence) {
      if (hasDistrictClaim || data.membershipBasis !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "absence must not coexist with district membership fields",
          path: ["absence"],
        });
      }
      if (data.taxRate !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "absence must not carry taxRate enrichment",
          path: ["taxRate"],
        });
      }
    } else {
      if (!data.districtId || !data.districtName || !data.districtType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "present tier requires districtId, districtName, and districtType",
          path: ["districtId"],
        });
      }
      if (data.membershipBasis !== "point-in-polygon") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "present tier requires membershipBasis point-in-polygon (binary PIP only — no proximity)",
          path: ["membershipBasis"],
        });
      }
      if (!data.countyFips) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "present tier requires countyFips",
          path: ["countyFips"],
        });
      }
    }
  });

export function createSpecialDistrictFact(
  input: z.input<typeof SPECIAL_DISTRICT_FACT_SCHEMA>,
): SpecialDistrictFactAtomInstance {
  return SPECIAL_DISTRICT_FACT_SCHEMA.parse(
    input,
  ) as SpecialDistrictFactAtomInstance;
}
