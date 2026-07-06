import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import { WIDTHED_CONFIDENCE_SCHEMA, type WidthedConfidence } from "../read-contract/common.js";
import {
  ANCHOR_KINDS,
  GRANULARITIES,
  OG_ACCESS_POLICY_SCHEMA,
  OG_QUALITY_GATE_FIELDS,
  PRODUCT_TYPES,
  type AnchorKind,
  type Granularity,
  type ProductType,
} from "./common.js";

/**
 * Stream kind discriminator per ADR-025 C1c finding #6.
 * Reported streams are as-reported from source; derived streams require
 * derivationMethod, confidence, and a derivesFromStreamDid link.
 */
export type StreamKind = "reported" | "derived-allocation";

export const STREAM_KINDS: ReadonlyArray<StreamKind> = ["reported", "derived-allocation"];

/**
 * Production-timeseries atom instance per ADR-025 — one atom per stream,
 * where a stream is (anchor, product, source). Models the reporting split:
 * Texas oil production anchors to rrc-lease; gas anchors to well.
 * DID format: prodts_<hash> (hashed derivation from source, externalId).
 *
 * A derived allocation must never be contract-indistinguishable from reported
 * fact (ADR line ~86); streamKind discriminates them.
 */
export interface ProductionTimeseriesAtomInstance {
  entityType: "production-timeseries";
  streamDid: string;
  streamKind: StreamKind;
  anchorKind: AnchorKind;
  anchorDid: string;
  product: ProductType;
  granularity: Granularity;
  sourceAdapter: string;
  derivationMethod?: string;
  derivesFromStreamDid?: string;
  confidence?: WidthedConfidence;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const PRODUCTION_TIMESERIES_SCHEMA = z
  .object({
    entityType: z.literal("production-timeseries"),
    streamDid: z
      .string()
      .min(1)
      .refine((val) => /^prodts_[0-9a-f]{16}$/.test(val), {
        message: "streamDid must be in format prodts_<16-hex-chars>",
      }),
    streamKind: z.enum(STREAM_KINDS as [StreamKind, ...StreamKind[]]),
    anchorKind: z.enum(ANCHOR_KINDS as [AnchorKind, ...AnchorKind[]]),
    anchorDid: z.string().min(1),
    product: z.enum(PRODUCT_TYPES as [ProductType, ...ProductType[]]),
    granularity: z.enum(GRANULARITIES as [Granularity, ...Granularity[]]),
    sourceAdapter: z.string().min(1),
    derivationMethod: z.string().min(1).optional(),
    derivesFromStreamDid: z.string().min(1).optional(),
    confidence: WIDTHED_CONFIDENCE_SCHEMA.optional(),
    ...OG_QUALITY_GATE_FIELDS,
    accessPolicy: OG_ACCESS_POLICY_SCHEMA,
  })
  .refine(
    (data) => {
      if (data.streamKind === "derived-allocation") {
        return (
          data.derivationMethod !== undefined &&
          data.confidence !== undefined &&
          data.derivesFromStreamDid !== undefined
        );
      }
      return true;
    },
    {
      message:
        "Derived streams require derivationMethod, confidence, and derivesFromStreamDid",
      path: ["streamKind"],
    },
  );
