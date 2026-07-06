import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import {
  OG_ACCESS_POLICY_SCHEMA,
  OG_QUALITY_GATE_FIELDS,
  PERFORATED_INTERVAL_SCHEMA,
  type PerforatedInterval,
} from "./common.js";

/**
 * Completion atom instance per ADR-025 — perforated and completed intervals.
 * DID format: cmpl_<hash> (hashed derivation from source, externalId).
 */
export interface CompletionAtomInstance {
  entityType: "completion";
  completionDid: string;
  wellboreDid: string;
  completionDate: string;
  perforatedIntervals: ReadonlyArray<PerforatedInterval>;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const COMPLETION_SCHEMA = z.object({
  entityType: z.literal("completion"),
  completionDid: z
    .string()
    .min(1)
    .refine((val) => /^cmpl_[0-9a-f]{16}$/.test(val), {
      message: "completionDid must be in format cmpl_<16-hex-chars>",
    }),
  wellboreDid: z
    .string()
    .min(1)
    .refine((val) => /^wbore_[0-9a-f]{16}$/.test(val), {
      message: "wellboreDid must be in format wbore_<16-hex-chars>",
    }),
  completionDate: z.string().min(1),
  perforatedIntervals: z.array(PERFORATED_INTERVAL_SCHEMA),
  ...OG_QUALITY_GATE_FIELDS,
  accessPolicy: OG_ACCESS_POLICY_SCHEMA,
});
