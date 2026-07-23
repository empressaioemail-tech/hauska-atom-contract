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
  ZONING_ABSENCE_SCHEMA,
  type ZoningAbsence,
} from "./common.js";

/**
 * Zoning FACT atom — observed district value or honest absence.
 *
 * `calibratedConfidence` on an optional {@link readContract} snapshot is a
 * write-time placeholder; at READ the calibrated axis resolves via the
 * calibration overlay (I-E), not a frozen multiply.
 */
export interface ZoningFactAtomInstance {
  entityType: "zoning-fact";
  atomDid: string;
  /** Parcel node anchor, e.g. `48209:156346` (Hays County). */
  parcelNodeId: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  /** Present when a zoning polygon stamps the parcel. */
  district?: string;
  /** Present when no zoning polygon covers the parcel (honest-absence). */
  absence?: ZoningAbsence;
  accessPolicy: AccessPolicy;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  atomTier: AtomTier;
  /** Optional asserted snapshot; calibrated axis resolves at READ. */
  readContract?: ReasoningReadContract;
}

export const ZONING_FACT_SCHEMA = z
  .object({
    entityType: z.literal("zoning-fact"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^zfact_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format zfact_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    district: z.string().min(1).optional(),
    absence: ZONING_ABSENCE_SCHEMA.optional(),
    accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
    ...PROPERTY_QUALITY_GATE_FIELDS,
    atomTier: z.literal(PROPERTY_ATOM_TIER),
    readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
  })
  .superRefine((data, ctx) => {
    const hasDistrict = data.district !== undefined && data.district.length > 0;
    const hasAbsence = data.absence !== undefined;
    if (hasDistrict && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "district and absence are mutually exclusive",
        path: ["district"],
      });
    }
    if (!hasDistrict && !hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "zoning-fact requires district value OR honest-absence",
        path: ["district"],
      });
    }
  });

export function createZoningFact(
  input: z.input<typeof ZONING_FACT_SCHEMA>,
): ZoningFactAtomInstance {
  return ZONING_FACT_SCHEMA.parse(input) as ZoningFactAtomInstance;
}
