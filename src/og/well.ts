import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import { API_14_PATTERN, normalizeApi14 } from "../temporal/node-id.js";
import {
  FIELD_REF_SCHEMA,
  GEO_LOCATION_SCHEMA,
  OG_ACCESS_POLICY_SCHEMA,
  OG_QUALITY_GATE_FIELDS,
  WELL_TYPES,
  type FieldRef,
  type GeoLocation,
  type WellType,
} from "./common.js";

/**
 * Well atom instance per ADR-025 — the asset anchor.
 * DID format: well_<api14> (legible-DID exception; API-14 identity).
 */
export interface WellAtomInstance {
  entityType: "well";
  wellDid: string;
  apiNumber14: string;
  wellName: string;
  wellNumber: string;
  wellType: WellType;
  status: string;
  spudDate?: string;
  completionDate?: string;
  totalDepth?: number;
  surfaceLocation: GeoLocation;
  bottomholeLocation?: GeoLocation;
  fieldRef?: FieldRef;
  district: string;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  accessPolicy: AccessPolicy;
}

export const WELL_SCHEMA = z
  .object({
    entityType: z.literal("well"),
    wellDid: z
      .string()
      .min(1)
      .refine((val) => val.startsWith("well_"), {
        message: "wellDid must start with well_ prefix",
      }),
    apiNumber14: z
      .string()
      .min(1)
      .refine((val) => API_14_PATTERN.test(val), {
        message: "apiNumber14 must be valid API-14 format",
      }),
    wellName: z.string().min(1),
    wellNumber: z.string().min(1),
    wellType: z.enum(WELL_TYPES as [WellType, ...WellType[]]),
    status: z.string().min(1),
    spudDate: z.string().min(1).optional(),
    completionDate: z.string().min(1).optional(),
    totalDepth: z.number().optional(),
    surfaceLocation: GEO_LOCATION_SCHEMA,
    bottomholeLocation: GEO_LOCATION_SCHEMA.optional(),
    fieldRef: FIELD_REF_SCHEMA.optional(),
    district: z.string().min(1),
    ...OG_QUALITY_GATE_FIELDS,
    accessPolicy: OG_ACCESS_POLICY_SCHEMA,
  })
  .refine(
    (data) => {
      const normalized = normalizeApi14(data.apiNumber14);
      return data.wellDid === `well_${normalized}`;
    },
    {
      message: "wellDid must match the derived ID from apiNumber14",
      path: ["wellDid"],
    },
  );
