import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import { OG_QUALITY_GATE_FIELDS } from "./common.js";

/**
 * Wellbore atom instance per ADR-025 — one drilled hole including sidetracks.
 * DID format: wbore_<hash> (hashed derivation from source, externalId).
 */
export interface WellboreAtomInstance {
  entityType: "wellbore";
  wellboreDid: string;
  wellDid: string;
  sidetrackSequence: number;
  directionalSurveyCid?: string;
  lateralPathRef?: string;
  kickoffDepth?: number;
  measuredDepth?: number;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const WELLBORE_SCHEMA = z.object({
  entityType: z.literal("wellbore"),
  wellboreDid: z.string().min(1),
  wellDid: z.string().min(1),
  sidetrackSequence: z.number(),
  directionalSurveyCid: z.string().min(1).optional(),
  lateralPathRef: z.string().min(1).optional(),
  kickoffDepth: z.number().optional(),
  measuredDepth: z.number().optional(),
  ...OG_QUALITY_GATE_FIELDS,
  accessPolicy: z.enum([
    "public-free",
    "public-paid",
    "platform-internal",
    "tenant-private",
    "tenant-shared",
  ]),
});
