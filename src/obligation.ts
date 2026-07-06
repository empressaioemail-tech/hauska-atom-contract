/**
 * Obligation atom type per ADR-025 — domain-neutral from birth.
 * Shipped in the core contract module (not ./og), consumed by Mox and O&G.
 * The oblg_ prefix registers with the core prefix set.
 *
 * What keeps a lease alive; the first job the product does. Status is
 * engine-derived, never hand-asserted. Each status derivation is a
 * procedure-execution atom (ADR-013) audit trail.
 */

import { z } from "zod";

import type { AccessPolicy } from "./registration.js";
import { WIDTHED_CONFIDENCE_SCHEMA, type WidthedConfidence } from "./read-contract/common.js";

/**
 * Obligation type discriminator. ADR-025 specifies O&G obligation types;
 * additively extensible for other verticals (Mox facility obligations, etc.).
 */
export type ObligationType =
  | "delay-rental"
  | "shut-in-royalty"
  | "minimum-royalty"
  | "bonus"
  | "rental"
  | "lease-expiration"
  | "continuous-development"
  | "pugh-release"
  | "other";

export const OBLIGATION_TYPES: ReadonlyArray<ObligationType> = [
  "delay-rental",
  "shut-in-royalty",
  "minimum-royalty",
  "bonus",
  "rental",
  "lease-expiration",
  "continuous-development",
  "pugh-release",
  "other",
];

/**
 * Obligation status. Derived, never hand-asserted. Each status derivation is
 * recorded as a procedure-execution atom (ADR-013).
 */
export type ObligationStatus =
  | "upcoming"
  | "due"
  | "satisfied"
  | "delinquent"
  | "released";

export const OBLIGATION_STATUSES: ReadonlyArray<ObligationStatus> = [
  "upcoming",
  "due",
  "satisfied",
  "delinquent",
  "released",
];

/**
 * Obligation atom instance. Domain-neutral from birth (ADR-025 operator ruling
 * 2): O&G anchors to mineral-lease DIDs (anchorKind: 'mineral-lease'), Mox
 * anchors to facility DIDs (anchorKind: 'facility'). The core type must not
 * freeze a lease-specific field name.
 * DID format: oblg_<hash> (hashed derivation from source, externalId).
 */
export interface ObligationAtomInstance {
  entityType: "obligation";
  obligationDid: string;
  obligationType: ObligationType;
  anchorDid: string;
  anchorKind?: string;
  owedToActorDid?: string;
  owedToInterestDid?: string;
  dueDate: string;
  recurrence?: string;
  amount?: number;
  graceTerms?: string;
  status: ObligationStatus;
  confidence: WidthedConfidence;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const OBLIGATION_SCHEMA = z.object({
  entityType: z.literal("obligation"),
  obligationDid: z
    .string()
    .min(1)
    .refine((val) => /^oblg_[0-9a-f]{16}$/.test(val), {
      message: "obligationDid must be in format oblg_<16-hex-chars>",
    }),
  obligationType: z.enum(OBLIGATION_TYPES as [ObligationType, ...ObligationType[]]),
  anchorDid: z.string().min(1),
  anchorKind: z.string().min(1).optional(),
  owedToActorDid: z.string().min(1).optional(),
  owedToInterestDid: z.string().min(1).optional(),
  dueDate: z.string().min(1),
  recurrence: z.string().min(1).optional(),
  amount: z.number().optional(),
  graceTerms: z.string().min(1).optional(),
  status: z.enum(OBLIGATION_STATUSES as [ObligationStatus, ...ObligationStatus[]]),
  confidence: WIDTHED_CONFIDENCE_SCHEMA,
  sourceCitation: z.string().min(1),
  extractedAt: z.string().min(1),
  asOf: z.string().min(1).optional(),
  accessPolicy: z.enum([
    "public-free",
    "public-paid",
    "platform-internal",
    "tenant-private",
    "tenant-shared",
  ]),
});
