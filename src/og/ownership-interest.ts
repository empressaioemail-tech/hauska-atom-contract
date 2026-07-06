import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import { WIDTHED_CONFIDENCE_SCHEMA, type WidthedConfidence } from "../read-contract/common.js";
import { INTEREST_TYPES, OG_ACCESS_POLICY_SCHEMA, type InterestType } from "./common.js";

/**
 * Ownership-interest atom instance per ADR-025 — single type with
 * discriminator. Interest is a conclusion reasoned from recorded instruments,
 * so it carries confidence, sourceCitation, and gaps[] where the record is
 * broken.
 * DID format: intr_<hash> (hashed derivation from source, externalId).
 */
export interface OwnershipInterestAtomInstance {
  entityType: "ownership-interest";
  interestDid: string;
  interestType: InterestType;
  ownerActorDid: string;
  anchorTractDid?: string;
  anchorLeaseDid?: string;
  decimalInterest: number;
  fraction?: string;
  burdens?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  derivedFromInstrumentDids: ReadonlyArray<string>;
  gaps?: ReadonlyArray<string>;
  confidence: WidthedConfidence;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const OWNERSHIP_INTEREST_SCHEMA = z
  .object({
    entityType: z.literal("ownership-interest"),
    interestDid: z
      .string()
      .min(1)
      .refine((val) => /^intr_[0-9a-f]{16}$/.test(val), {
        message: "interestDid must be in format intr_<16-hex-chars>",
      }),
    interestType: z.enum(INTEREST_TYPES as [InterestType, ...InterestType[]]),
    ownerActorDid: z.string().min(1),
    anchorTractDid: z.string().min(1).optional(),
    anchorLeaseDid: z.string().min(1).optional(),
    decimalInterest: z.number(),
    fraction: z.string().min(1).optional(),
    burdens: z.string().min(1).optional(),
    effectiveFrom: z.string().min(1),
    effectiveTo: z.string().min(1).optional(),
    derivedFromInstrumentDids: z.array(z.string().min(1)),
    gaps: z.array(z.string().min(1)).optional(),
    confidence: WIDTHED_CONFIDENCE_SCHEMA,
    sourceCitation: z.string().min(1),
    extractedAt: z.string().min(1),
    asOf: z.string().min(1).optional(),
    accessPolicy: OG_ACCESS_POLICY_SCHEMA,
  })
  .refine(
    (data) => {
      return data.anchorTractDid !== undefined || data.anchorLeaseDid !== undefined;
    },
    {
      message: "At least one of anchorTractDid or anchorLeaseDid is required",
      path: ["anchorTractDid"],
    },
  );
