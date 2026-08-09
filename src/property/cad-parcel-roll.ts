import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  CAD_PARCEL_ROLL_ABSENCE_SCHEMA,
  CAD_ROLL_SOURCE_TIER_SCHEMA,
  LAND_ACRES_SCHEMA,
  PARCEL_KEY_KIND_SCHEMA,
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_DEFAULT_ACCESS_POLICY,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  type CadParcelRollAbsence,
  type CadRollSourceTier,
  type ParcelKeyKind,
  type SiteLayerVerifiedAbsence,
} from "./common.js";

/**
 * CAD parcel roll FACT atom — county appraisal roll row or honest absence.
 *
 * Owner fields are gated on `joinPassedOwnerMatchGate`; wrong owner is worse
 * than missing. Cotality is extinguished — writers read county CAD exports only.
 */
export interface CadParcelRollAtomInstance {
  entityType: "cad-parcel-roll";
  atomDid: string;
  parcelNodeId: string;
  taxYear: number;
  countyFips: string;
  propId: string;
  keyKind: ParcelKeyKind;
  joinPassedOwnerMatchGate: boolean;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  sourceTier: CadRollSourceTier;
  ownerName?: string;
  ownerMailingAddress?: string;
  situsAddress?: string;
  situsCity?: string;
  situsZip?: string;
  legalDescription?: string;
  exemptionCodes?: ReadonlyArray<string>;
  landValue?: number;
  improvementValue?: number;
  marketValue?: number;
  assessedValue?: number;
  yearBuilt?: number;
  livingAreaSqft?: number;
  landAcres?: string | number;
  propertyUseCode?: string;
  sourceFile?: string;
  absence?: CadParcelRollAbsence;
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

function hasOwnerFields(data: {
  ownerName?: string;
  ownerMailingAddress?: string;
}): boolean {
  return data.ownerName !== undefined || data.ownerMailingAddress !== undefined;
}

function hasCadDataClaims(data: {
  situsAddress?: string;
  situsCity?: string;
  situsZip?: string;
  legalDescription?: string;
  exemptionCodes?: ReadonlyArray<string>;
  landValue?: number;
  improvementValue?: number;
  marketValue?: number;
  assessedValue?: number;
  yearBuilt?: number;
  livingAreaSqft?: number;
  landAcres?: string | number;
  propertyUseCode?: string;
}): boolean {
  return (
    data.situsAddress !== undefined ||
    data.situsCity !== undefined ||
    data.situsZip !== undefined ||
    data.legalDescription !== undefined ||
    (data.exemptionCodes !== undefined && data.exemptionCodes.length > 0) ||
    data.landValue !== undefined ||
    data.improvementValue !== undefined ||
    data.marketValue !== undefined ||
    data.assessedValue !== undefined ||
    data.yearBuilt !== undefined ||
    data.livingAreaSqft !== undefined ||
    data.landAcres !== undefined ||
    data.propertyUseCode !== undefined
  );
}

export const CAD_PARCEL_ROLL_SCHEMA = z
  .object({
    entityType: z.literal("cad-parcel-roll"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^cadroll_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format cadroll_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    taxYear: z.number().int(),
    countyFips: z.string().regex(/^\d{5}$/, "countyFips must be 5 digits"),
    propId: z.string().min(1),
    keyKind: PARCEL_KEY_KIND_SCHEMA,
    joinPassedOwnerMatchGate: z.boolean(),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    sourceTier: CAD_ROLL_SOURCE_TIER_SCHEMA,
    ownerName: z.string().min(1).optional(),
    ownerMailingAddress: z.string().min(1).optional(),
    situsAddress: z.string().min(1).optional(),
    situsCity: z.string().min(1).optional(),
    situsZip: z.string().min(1).optional(),
    legalDescription: z.string().min(1).optional(),
    exemptionCodes: z.array(z.string().min(1)).readonly().optional(),
    landValue: z.number().optional(),
    improvementValue: z.number().optional(),
    marketValue: z.number().optional(),
    assessedValue: z.number().optional(),
    yearBuilt: z.number().int().optional(),
    livingAreaSqft: z.number().optional(),
    landAcres: LAND_ACRES_SCHEMA.optional(),
    propertyUseCode: z.string().min(1).optional(),
    sourceFile: z.string().min(1).optional(),
    absence: CAD_PARCEL_ROLL_ABSENCE_SCHEMA.optional(),
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
    const hasOwner = hasOwnerFields(data);
    const hasDataClaims = hasCadDataClaims(data);

    if (data.accessPolicy !== PROPERTY_DEFAULT_ACCESS_POLICY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cad-parcel-roll must use accessPolicy public-free",
        path: ["accessPolicy"],
      });
    }

    if (!data.parcelNodeId.startsWith(`${data.countyFips}:`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "parcelNodeId must begin with countyFips",
        path: ["parcelNodeId"],
      });
    }

    const expectedPropId = data.parcelNodeId.slice(`${data.countyFips}:`.length);
    if (expectedPropId !== data.propId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "propId must equal the parcelNodeId key token",
        path: ["propId"],
      });
    }

    if (!data.joinPassedOwnerMatchGate && hasOwner) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "joinPassedOwnerMatchGate false must not carry ownerName or ownerMailingAddress",
        path: ["joinPassedOwnerMatchGate"],
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
      if (hasOwner || hasDataClaims || data.sourceFile !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceTier absent must not carry CAD roll claim fields",
          path: ["sourceTier"],
        });
      }
    } else if (hasAbsence) {
      if (hasOwner || hasDataClaims) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "absence must not coexist with CAD roll claim fields",
          path: ["absence"],
        });
      }
    } else {
      if (!data.sourceFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "cad-authoritative tier requires sourceFile when no absence",
          path: ["sourceFile"],
        });
      }
      if (!hasDataClaims && !hasOwner && data.propertyUseCode === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "cad-authoritative present row requires at least one non-owner CAD attribute, propertyUseCode, situs, or values",
          path: ["propertyUseCode"],
        });
      }
    }
  });

export function createCadParcelRoll(
  input: z.input<typeof CAD_PARCEL_ROLL_SCHEMA>,
): CadParcelRollAtomInstance {
  return CAD_PARCEL_ROLL_SCHEMA.parse(input) as CadParcelRollAtomInstance;
}
