import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import {
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
  completionDid: z.string().min(1),
  wellboreDid: z.string().min(1),
  completionDate: z.string().min(1),
  perforatedIntervals: z.array(PERFORATED_INTERVAL_SCHEMA),
  ...OG_QUALITY_GATE_FIELDS,
  accessPolicy: z.enum([
    "public-free",
    "public-paid",
    "platform-internal",
    "tenant-private",
    "tenant-shared",
  ]),
});
