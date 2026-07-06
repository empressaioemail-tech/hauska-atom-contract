import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import {
  ANCHOR_KINDS,
  GRANULARITIES,
  OG_QUALITY_GATE_FIELDS,
  PRODUCT_TYPES,
  type AnchorKind,
  type Granularity,
  type ProductType,
} from "./common.js";

/**
 * Production-timeseries atom instance per ADR-025 — one atom per stream,
 * where a stream is (anchor, product, source). Models the reporting split:
 * Texas oil production anchors to rrc-lease; gas anchors to well.
 * DID format: prodts_<hash> (hashed derivation from source, externalId).
 */
export interface ProductionTimeseriesAtomInstance {
  entityType: "production-timeseries";
  streamDid: string;
  anchorKind: AnchorKind;
  anchorDid: string;
  product: ProductType;
  granularity: Granularity;
  sourceAdapter: string;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const PRODUCTION_TIMESERIES_SCHEMA = z.object({
  entityType: z.literal("production-timeseries"),
  streamDid: z.string().min(1),
  anchorKind: z.enum(ANCHOR_KINDS as [AnchorKind, ...AnchorKind[]]),
  anchorDid: z.string().min(1),
  product: z.enum(PRODUCT_TYPES as [ProductType, ...ProductType[]]),
  granularity: z.enum(GRANULARITIES as [Granularity, ...Granularity[]]),
  sourceAdapter: z.string().min(1),
  ...OG_QUALITY_GATE_FIELDS,
  accessPolicy: z.enum([
    "public-free",
    "public-paid",
    "platform-internal",
    "tenant-private",
    "tenant-shared",
  ]),
});
