import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_DEFAULT_ACCESS_POLICY,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  WELL_FACT_ABSENCE_SCHEMA,
  WELL_FACT_SOURCE_TIER_SCHEMA,
  WELL_PARCEL_RELATION_SCHEMA,
  WELL_STATUS_SCHEMA,
  WELL_SURFACE_LOCATION_SCHEMA,
  WELL_TYPE_SCHEMA,
  type SiteLayerVerifiedAbsence,
  type WellFactAbsence,
  type WellFactSourceTier,
  type WellParcelRelation,
  type WellStatus,
  type WellSurfaceLocation,
  type WellType,
} from "./common.js";

/**
 * Well FACT atom — RRC public GIS surface well on or near a parcel.
 *
 * Operations-lens public-record only (county manifest `rrc-wells` rail).
 * NOT the ADR-025 og-twin vertical. One atom per (parcel, well) association;
 * 0..N per parcel. Subcategorize via body fields (status, type, orphaned),
 * never via separate rails.
 */
export interface WellFactAtomInstance {
  entityType: "well-fact";
  atomDid: string;
  parcelNodeId: string;
  /** Stable well identity within the parcel (typically apiNumber14). */
  wellKey: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  sourceTier: WellFactSourceTier;
  apiNumber14?: string;
  wellStatus?: WellStatus;
  wellType?: WellType;
  orphaned?: boolean;
  operatorName?: string;
  surfaceLocation?: WellSurfaceLocation;
  parcelRelation?: WellParcelRelation;
  /** Named proximity radius used for near-parcel evaluation (always carried). */
  proximityRadiusMeters?: number;
  /** Meters from well surface to parcel boundary; 0 when on-parcel. */
  proximityDistanceMeters?: number;
  absence?: WellFactAbsence;
  verifiedAbsence?: SiteLayerVerifiedAbsence;
  accessPolicy: AccessPolicy;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  sourceVintage?: string;
  verificationStatus: "machine" | "human" | "unsurveyed";
  sourceAdapter: string;
  evaluatedAt: string;
  atomTier: AtomTier;
  readContract?: ReasoningReadContract;
}

export const WELL_FACT_SCHEMA = z
  .object({
    entityType: z.literal("well-fact"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^wlfact_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format wlfact_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    wellKey: z.string().min(1),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    sourceTier: WELL_FACT_SOURCE_TIER_SCHEMA,
    apiNumber14: z
      .string()
      .min(10)
      .max(14)
      .regex(/^\d+$/, "apiNumber14 must be numeric")
      .optional(),
    wellStatus: WELL_STATUS_SCHEMA.optional(),
    wellType: WELL_TYPE_SCHEMA.optional(),
    orphaned: z.boolean().optional(),
    operatorName: z.string().min(1).optional(),
    surfaceLocation: WELL_SURFACE_LOCATION_SCHEMA.optional(),
    parcelRelation: WELL_PARCEL_RELATION_SCHEMA.optional(),
    proximityRadiusMeters: z.number().positive().optional(),
    proximityDistanceMeters: z.number().nonnegative().optional(),
    absence: WELL_FACT_ABSENCE_SCHEMA.optional(),
    verifiedAbsence: SITE_LAYER_VERIFIED_ABSENCE_SCHEMA.optional(),
    accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
    ...PROPERTY_QUALITY_GATE_FIELDS,
    ...SITE_LAYER_PROVENANCE_FIELDS,
    atomTier: z.literal(PROPERTY_ATOM_TIER),
    readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
  })
  .superRefine((data, ctx) => {
    const hasAbsence = data.absence !== undefined;
    const isAbsentTier = data.sourceTier === "absent";
    const hasWellClaim =
      data.apiNumber14 !== undefined &&
      data.wellStatus !== undefined &&
      data.wellType !== undefined &&
      data.orphaned !== undefined &&
      data.surfaceLocation !== undefined &&
      data.parcelRelation !== undefined &&
      data.proximityRadiusMeters !== undefined;

    if (data.accessPolicy !== PROPERTY_DEFAULT_ACCESS_POLICY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "well-fact must use accessPolicy public-free",
        path: ["accessPolicy"],
      });
    }

    if (hasWellClaim && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "well claim fields and absence are mutually exclusive",
        path: ["absence"],
      });
    }

    if (isAbsentTier) {
      if (!data.verifiedAbsence) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "sourceTier absent requires verifiedAbsence (evaluated + provenanceScope)",
          path: ["verifiedAbsence"],
        });
      }
      if (hasWellClaim || hasAbsence) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceTier absent must not carry per-parcel well claims",
          path: ["sourceTier"],
        });
      }
    } else if (hasAbsence) {
      if (hasWellClaim) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "absence must not coexist with well claim fields",
          path: ["absence"],
        });
      }
      if (data.proximityRadiusMeters === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "absence atoms still carry proximityRadiusMeters so the evaluated radius is legible",
          path: ["proximityRadiusMeters"],
        });
      }
    } else if (!hasWellClaim) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "texas-rrc-gis tier requires full well claim fields when no absence",
        path: ["apiNumber14"],
      });
    } else {
      if (data.parcelRelation === "on-parcel") {
        if (
          data.proximityDistanceMeters !== undefined &&
          data.proximityDistanceMeters !== 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "on-parcel claims must carry proximityDistanceMeters 0 or omit",
            path: ["proximityDistanceMeters"],
          });
        }
      } else if (data.parcelRelation === "near-parcel") {
        const radius = data.proximityRadiusMeters ?? 0;
        if (
          data.proximityDistanceMeters === undefined ||
          data.proximityDistanceMeters <= 0 ||
          data.proximityDistanceMeters > radius
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "near-parcel claims require proximityDistanceMeters in (0, proximityRadiusMeters]",
            path: ["proximityDistanceMeters"],
          });
        }
      }
    }
  });

export function createWellFact(
  input: z.input<typeof WELL_FACT_SCHEMA>,
): WellFactAtomInstance {
  return WELL_FACT_SCHEMA.parse(input) as WellFactAtomInstance;
}
