import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import { OG_QUALITY_GATE_FIELDS } from "./common.js";

/**
 * Tract atom instance per ADR-025 — the land the interests attach to.
 * DID format: tract_<county>-<abstract> where abstract-keyed; hashed
 * derivation otherwise.
 */
export interface TractAtomInstance {
  entityType: "tract";
  tractDid: string;
  legalDescription: string;
  plssOrSurveyRef: string;
  abstractNumber?: string;
  county: string;
  state: string;
  acreage?: number;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const TRACT_SCHEMA = z.object({
  entityType: z.literal("tract"),
  tractDid: z.string().min(1),
  legalDescription: z.string().min(1),
  plssOrSurveyRef: z.string().min(1),
  abstractNumber: z.string().min(1).optional(),
  county: z.string().min(1),
  state: z.string().min(1),
  acreage: z.number().optional(),
  ...OG_QUALITY_GATE_FIELDS,
  accessPolicy: z.enum([
    "public-free",
    "public-paid",
    "platform-internal",
    "tenant-private",
    "tenant-shared",
  ]),
});
