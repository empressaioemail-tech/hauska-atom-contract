import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import { OG_QUALITY_GATE_FIELDS } from "./common.js";

/**
 * Zone atom instance per ADR-025 — formation or interval.
 * DID format: zone_<hash> (hashed derivation from source, externalId).
 */
export interface ZoneAtomInstance {
  entityType: "zone";
  zoneDid: string;
  formationName: string;
  tops?: number;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const ZONE_SCHEMA = z.object({
  entityType: z.literal("zone"),
  zoneDid: z
    .string()
    .min(1)
    .refine((val) => /^zone_[0-9a-f]{16}$/.test(val), {
      message: "zoneDid must be in format zone_<16-hex-chars>",
    }),
  formationName: z.string().min(1),
  tops: z.number().optional(),
  ...OG_QUALITY_GATE_FIELDS,
  accessPolicy: z.enum([
    "public-free",
    "public-paid",
    "platform-internal",
    "tenant-private",
    "tenant-shared",
  ]),
});
