import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import { FIELD_REF_SCHEMA, OG_ACCESS_POLICY_SCHEMA, OG_QUALITY_GATE_FIELDS, type FieldRef } from "./common.js";

/**
 * RRC-lease atom instance per ADR-025 — the regulatory production unit.
 * A different thing with the same name as mineral-lease, kept as a separate
 * type on purpose. Many-to-many mapping to mineral-lease is inference, not
 * record.
 * DID format: rrclease_<district>-<leaseNo> (legible-DID exception).
 */
export interface RrcLeaseAtomInstance {
  entityType: "rrc-lease";
  rrcLeaseDid: string;
  leaseNumber: string;
  leaseName: string;
  district: string;
  fieldRef?: FieldRef;
  operatorActorDid: string;
  wellCount?: number;
  status: string;
  acreage?: number;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const RRC_LEASE_SCHEMA = z
  .object({
    entityType: z.literal("rrc-lease"),
    rrcLeaseDid: z
      .string()
      .min(1)
      .refine((val) => val.startsWith("rrclease_"), {
        message: "rrcLeaseDid must start with rrclease_ prefix",
      }),
    leaseNumber: z.string().min(1),
    leaseName: z.string().min(1),
    district: z.string().min(1),
    fieldRef: FIELD_REF_SCHEMA.optional(),
    operatorActorDid: z.string().min(1),
    wellCount: z.number().optional(),
    status: z.string().min(1),
    acreage: z.number().optional(),
    ...OG_QUALITY_GATE_FIELDS,
    accessPolicy: OG_ACCESS_POLICY_SCHEMA,
  })
  .refine(
    (data) => {
      return data.rrcLeaseDid === `rrclease_${data.district}-${data.leaseNumber}`;
    },
    {
      message: "rrcLeaseDid must match the derived ID from district and leaseNumber",
      path: ["rrcLeaseDid"],
    },
  );
