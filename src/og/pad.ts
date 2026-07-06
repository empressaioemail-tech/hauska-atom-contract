import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import { WIDTHED_CONFIDENCE_SCHEMA, type WidthedConfidence } from "../read-contract/common.js";
import { GEO_LOCATION_SCHEMA, OG_QUALITY_GATE_FIELDS, type GeoLocation } from "./common.js";

/**
 * Pad atom instance per ADR-025 — derived surface grouping of wells at a site.
 * DID format: pad_<hash> (hashed derivation from source, externalId).
 * Confidence on the grouping is asserted with the derivation method named.
 */
export interface PadAtomInstance {
  entityType: "pad";
  padDid: string;
  wellDids: ReadonlyArray<string>;
  surfaceLocation: GeoLocation;
  derivationMethod: string;
  confidence: WidthedConfidence;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const PAD_SCHEMA = z.object({
  entityType: z.literal("pad"),
  padDid: z
    .string()
    .min(1)
    .refine((val) => /^pad_[0-9a-f]{16}$/.test(val), {
      message: "padDid must be in format pad_<16-hex-chars>",
    }),
  wellDids: z.array(z.string().min(1)),
  surfaceLocation: GEO_LOCATION_SCHEMA,
  derivationMethod: z.string().min(1),
  confidence: WIDTHED_CONFIDENCE_SCHEMA,
  ...OG_QUALITY_GATE_FIELDS,
  accessPolicy: z.enum([
    "public-free",
    "public-paid",
    "platform-internal",
    "tenant-private",
    "tenant-shared",
  ]),
});
