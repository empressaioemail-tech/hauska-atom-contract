import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  EASEMENT_RECORDING_REF_SCHEMA,
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_DEFAULT_ACCESS_POLICY,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  UTILITY_EASEMENT_ABSENCE_SCHEMA,
  UTILITY_EASEMENT_CLASS_SCHEMA,
  UTILITY_EASEMENT_SOURCE_TIER_SCHEMA,
  EASEMENT_GEOMETRY_SCHEMA,
  type EasementGeometry,
  type EasementRecordingRef,
  type SiteLayerVerifiedAbsence,
  type UtilityEasementAbsence,
  type UtilityEasementClass,
  type UtilityEasementSourceTier,
} from "./common.js";

/**
 * Utility easement FACT atom — observed GIS easement geometry or honest absence.
 *
 * ADR-029 / T3: public-record site-layer rail; uniform `public-free` accessPolicy.
 * Distinct from ADR-020 title-track instruments (`linkedInstrumentDid` bridge only).
 */
export interface UtilityEasementAtomInstance {
  entityType: "utility-easement";
  atomDid: string;
  parcelNodeId: string;
  easementId: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  easementClass: UtilityEasementClass;
  sourceTier: UtilityEasementSourceTier;
  easementGeometry?: EasementGeometry;
  absence?: UtilityEasementAbsence;
  verifiedAbsence?: SiteLayerVerifiedAbsence;
  accessPolicy: AccessPolicy;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  sourceVintage?: string;
  verificationStatus: "machine" | "human" | "unsurveyed";
  sourceAdapter: string;
  evaluatedAt: string;
  holderLabel?: string;
  recordingRef?: EasementRecordingRef;
  corridorWidthFt?: number;
  linkedInstrumentDid?: string;
  atomTier: AtomTier;
  readContract?: ReasoningReadContract;
}

export const UTILITY_EASEMENT_SCHEMA = z
  .object({
    entityType: z.literal("utility-easement"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^ueasm_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format ueasm_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    easementId: z.string().min(1),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    easementClass: UTILITY_EASEMENT_CLASS_SCHEMA,
    sourceTier: UTILITY_EASEMENT_SOURCE_TIER_SCHEMA,
    easementGeometry: EASEMENT_GEOMETRY_SCHEMA.optional(),
    absence: UTILITY_EASEMENT_ABSENCE_SCHEMA.optional(),
    verifiedAbsence: SITE_LAYER_VERIFIED_ABSENCE_SCHEMA.optional(),
    accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
    ...PROPERTY_QUALITY_GATE_FIELDS,
    ...SITE_LAYER_PROVENANCE_FIELDS,
    holderLabel: z.string().min(1).optional(),
    recordingRef: EASEMENT_RECORDING_REF_SCHEMA.optional(),
    corridorWidthFt: z.number().positive().optional(),
    linkedInstrumentDid: z.string().min(1).optional(),
    atomTier: z.literal(PROPERTY_ATOM_TIER),
    readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
  })
  .superRefine((data, ctx) => {
    const hasGeometry = data.easementGeometry !== undefined;
    const hasAbsence = data.absence !== undefined;
    const isAbsentTier = data.sourceTier === "absent";

    if (data.accessPolicy !== PROPERTY_DEFAULT_ACCESS_POLICY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "utility-easement must use accessPolicy public-free",
        path: ["accessPolicy"],
      });
    }

    if (hasGeometry && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "easementGeometry and absence are mutually exclusive",
        path: ["easementGeometry"],
      });
    }

    if (hasGeometry && isAbsentTier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "sourceTier absent must not carry easementGeometry",
        path: ["sourceTier"],
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
    } else if (!hasGeometry && !hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "utility-easement requires easementGeometry OR per-parcel absence when sourceTier is not absent",
        path: ["easementGeometry"],
      });
    }
  });

export function createUtilityEasement(
  input: z.input<typeof UTILITY_EASEMENT_SCHEMA>,
): UtilityEasementAtomInstance {
  return UTILITY_EASEMENT_SCHEMA.parse(input) as UtilityEasementAtomInstance;
}
