import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  CAD_ROLL_SOURCE_TIER_SCHEMA,
  OWNER_FACT_ABSENCE_SCHEMA,
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_PAID_ACCESS_POLICY,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  type CadRollSourceTier,
  type OwnerFactAbsence,
  type SiteLayerVerifiedAbsence,
} from "./common.js";

/**
 * Owner FACT atom — CAD `owner_name` + mailing address, or honest absence.
 *
 * THE POLICY CAME FIRST AND THE CARRIER CAME LAST. Owner was ruled
 * `public-paid` at the atom level long before any owner atom existed, so the
 * county manifest's OWN rail has been reading `NO ATOM` over a store that
 * already holds 4.5M owner rows (`cad_property.owner_name`, 98.4% populated
 * across 15 counties as of 2026-08-09). This type is the carrier that ruling
 * always presumed. See doc_repo `90_operations/OPS-15_owner_and_rrc_rail_gap_
 * analysis.md`.
 *
 * WHY THIS IS THE ONLY `public-paid` PROPERTY ATOM. Every sibling in this
 * module pins `public-free` in its superRefine. Owner is the deliberate
 * exception and the schema enforces it in the same shape: an owner-fact that
 * tries to ship `public-free` fails to parse. The policy therefore cannot be
 * lost by a careless writer — it is structural, not conventional.
 *
 * PRIVACY POSTURE (doc_repo OPS-15 R4). Owner name plus mailing address on
 * Texas parcels is public record and lawful to serve, but it is the most
 * privacy-sensitive facet in the catalog. Two deliberate constraints:
 *
 *   1. `exemptionFlags` carries BOOLEAN FLAGS, never raw exemption codes.
 *      Homestead and over-65/disability exemption codes imply occupancy and
 *      household composition; a flag answers the underwriting question
 *      ("is this owner-occupied?") without republishing the code that
 *      implies who lives there.
 *   2. `ownerMailingAddress` is optional and independently omittable, so a
 *      serving tier can carry the name without the mailing address.
 *
 * Cotality is extinguished — owner data comes from the CAD roll only. Never
 * add a cotality sourceTier.
 */
export interface OwnerFactAtomInstance {
  entityType: "owner-fact";
  atomDid: string;
  parcelNodeId: string;
  taxYear: number;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  sourceTier: CadRollSourceTier;
  ownerName?: string;
  ownerMailingAddress?: string;
  /**
   * Boolean flags derived from CAD `exemption_codes`, never the raw codes.
   * Absent when the roll carries no exemption data for the parcel.
   */
  exemptionFlags?: OwnerExemptionFlags;
  absence?: OwnerFactAbsence;
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

export const OWNER_EXEMPTION_FLAGS_SCHEMA = z
  .object({
    /** Any homestead exemption present — implies owner-occupied. */
    homestead: z.boolean(),
    /** Over-65 or disability exemption present. */
    seniorOrDisability: z.boolean(),
    /** Agricultural / open-space / timber valuation present. */
    agricultural: z.boolean(),
    /** Veteran exemption present. */
    veteran: z.boolean(),
  })
  .strict();

export type OwnerExemptionFlags = z.infer<typeof OWNER_EXEMPTION_FLAGS_SCHEMA>;

export const OWNER_FACT_SCHEMA = z
  .object({
    entityType: z.literal("owner-fact"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^ownfact_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format ownfact_<16-hex-chars>",
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
    ownerName: z.string().min(1).optional(),
    ownerMailingAddress: z.string().min(1).optional(),
    exemptionFlags: OWNER_EXEMPTION_FLAGS_SCHEMA.optional(),
    absence: OWNER_FACT_ABSENCE_SCHEMA.optional(),
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
    const hasOwnerName = data.ownerName !== undefined;
    const hasMailing = data.ownerMailingAddress !== undefined;
    const hasExemptions = data.exemptionFlags !== undefined;
    const hasClaimField = hasOwnerName || hasMailing || hasExemptions;

    // The load-bearing inversion: owner is paid, every sibling is free.
    if (data.accessPolicy !== PROPERTY_PAID_ACCESS_POLICY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "owner-fact must use accessPolicy public-paid (owner identity is the paid facet; a public-free owner atom would leak it)",
        path: ["accessPolicy"],
      });
    }

    if (hasClaimField && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "owner fields and absence are mutually exclusive",
        path: ["absence"],
      });
    }

    // A mailing address with no owner name is a dangling PII fragment: it
    // names a household without naming the claim it supports.
    if (hasMailing && !hasOwnerName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "ownerMailingAddress requires ownerName (a bare mailing address is a dangling PII fragment)",
        path: ["ownerMailingAddress"],
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
      if (hasClaimField) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceTier absent must not carry owner claim fields",
          path: ["sourceTier"],
        });
      }
    } else if (hasAbsence) {
      if (hasClaimField) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "absence must not coexist with owner claim fields",
          path: ["absence"],
        });
      }
    } else if (!hasOwnerName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cad-authoritative tier requires ownerName when no absence",
        path: ["ownerName"],
      });
    }
  });

export function createOwnerFact(
  input: z.input<typeof OWNER_FACT_SCHEMA>,
): OwnerFactAtomInstance {
  return OWNER_FACT_SCHEMA.parse(input) as OwnerFactAtomInstance;
}
