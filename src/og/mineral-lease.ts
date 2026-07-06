import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import {
  CLAUSE_EXTRACT_SCHEMA,
  MINERAL_LEASE_STATUSES,
  OG_QUALITY_GATE_FIELDS,
  type ClauseExtract,
  type MineralLeaseStatus,
} from "./common.js";

/**
 * Mineral-lease atom instance per ADR-025 — the title-instrument lease a
 * landman manages. Reconciles with recorded-instrument (ADR-020):
 * evidencedByInstrumentDids link to recorded-instrument atoms.
 * DID format: mlease_<hash> (hashed derivation from source, externalId).
 */
export interface MineralLeaseAtomInstance {
  entityType: "mineral-lease";
  leaseDid: string;
  lessorActorDids: ReadonlyArray<string>;
  lesseeActorDid: string;
  evidencedByInstrumentDids: ReadonlyArray<string>;
  primaryTerm: string;
  effectiveDate: string;
  royaltyFraction: number;
  bonusPerAcre?: number;
  clauseExtracts?: ReadonlyArray<ClauseExtract>;
  tractDids: ReadonlyArray<string>;
  status: MineralLeaseStatus;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const MINERAL_LEASE_SCHEMA = z.object({
  entityType: z.literal("mineral-lease"),
  leaseDid: z
    .string()
    .min(1)
    .refine((val) => /^mlease_[0-9a-f]{16}$/.test(val), {
      message: "leaseDid must be in format mlease_<16-hex-chars>",
    }),
  lessorActorDids: z.array(z.string().min(1)).min(1),
  lesseeActorDid: z.string().min(1),
  evidencedByInstrumentDids: z.array(z.string().min(1)).min(1),
  primaryTerm: z.string().min(1),
  effectiveDate: z.string().min(1),
  royaltyFraction: z.number(),
  bonusPerAcre: z.number().optional(),
  clauseExtracts: z.array(CLAUSE_EXTRACT_SCHEMA).optional(),
  tractDids: z.array(z.string().min(1)),
  status: z.enum(
    MINERAL_LEASE_STATUSES as [MineralLeaseStatus, ...MineralLeaseStatus[]],
  ),
  ...OG_QUALITY_GATE_FIELDS,
  accessPolicy: z.enum([
    "public-free",
    "public-paid",
    "platform-internal",
    "tenant-private",
    "tenant-shared",
  ]),
});
