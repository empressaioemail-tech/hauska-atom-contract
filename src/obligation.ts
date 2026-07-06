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
import { WIDTHED_CONFIDENCE_SCHEMA } from "./read-contract/common.js";

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
 * Obligation atom instance. Domain-neutral; O&G anchors to leaseDid
 * (mineral-lease), Mox would anchor to facility or other domain-specific DID.
 * DID format: oblg_<hash> (hashed derivation from source, externalId).
 */
export interface ObligationAtomInstance {
  entityType: "obligation";
  obligationDid: string;
  obligationType: ObligationType;
  leaseDid: string;
  owedToActorDid?: string;
  owedToInterestDid?: string;
  dueDate: string;
  recurrence?: string;
  amount?: number;
  graceTerms?: string;
  status: ObligationStatus;
  confidence: ReturnType<typeof WIDTHED_CONFIDENCE_SCHEMA["parse"]>;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const OBLIGATION_SCHEMA = z.object({
  entityType: z.literal("obligation"),
  obligationDid: z.string().min(1),
  obligationType: z.enum(
    OBLIGATION_TYPES as [ObligationType, ...ObligationType[]],
  ),
  leaseDid: z.string().min(1),
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
