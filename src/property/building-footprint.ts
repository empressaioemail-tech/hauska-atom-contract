import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  BUILDING_FOOTPRINT_ABSENCE_SCHEMA,
  BUILDING_FOOTPRINT_SOURCE_TIER_SCHEMA,
  FOOTPRINT_GEOMETRY_SCHEMA,
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_DEFAULT_ACCESS_POLICY,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  type BuildingFootprintAbsence,
  type BuildingFootprintSourceTier,
  type FootprintGeometry,
  type SiteLayerVerifiedAbsence,
} from "./common.js";

/**
 * Building footprint FACT atom — observed improvement geometry or honest absence.
 *
 * ADR-029 / T3: one atom per structure footprint on a parcel (0..N).
 * ML-derived tier is always `public-free` with ODC-By in `sourceCitation`
 * (master ruling 2026-08-05).
 */
export interface BuildingFootprintAtomInstance {
  entityType: "building-footprint";
  atomDid: string;
  parcelNodeId: string;
  /** Stable id within parcel (`primary`, `accessory-1`, `county-coverage`, …). */
  footprintId: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  sourceTier: BuildingFootprintSourceTier;
  /** Present when a footprint polygon is observed. */
  footprintGeometry?: FootprintGeometry;
  /** Per-parcel absence when a source exists but yields no feature. */
  absence?: BuildingFootprintAbsence;
  /** County-coverage or county-level verified absence (ADR-028 pair). */
  verifiedAbsence?: SiteLayerVerifiedAbsence;
  accessPolicy: AccessPolicy;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  sourceVintage?: string;
  verificationStatus: "machine" | "human" | "unsurveyed";
  sourceAdapter: string;
  evaluatedAt: string;
  structureRole?: "primary" | "accessory" | "unknown";
  atomTier: AtomTier;
  readContract?: ReasoningReadContract;
}

export const BUILDING_FOOTPRINT_SCHEMA = z
  .object({
    entityType: z.literal("building-footprint"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^bfoot_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format bfoot_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    footprintId: z.string().min(1),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    sourceTier: BUILDING_FOOTPRINT_SOURCE_TIER_SCHEMA,
    footprintGeometry: FOOTPRINT_GEOMETRY_SCHEMA.optional(),
    absence: BUILDING_FOOTPRINT_ABSENCE_SCHEMA.optional(),
    verifiedAbsence: SITE_LAYER_VERIFIED_ABSENCE_SCHEMA.optional(),
    accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
    ...PROPERTY_QUALITY_GATE_FIELDS,
    ...SITE_LAYER_PROVENANCE_FIELDS,
    structureRole: z.enum(["primary", "accessory", "unknown"]).optional(),
    atomTier: z.literal(PROPERTY_ATOM_TIER),
    readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
  })
  .superRefine((data, ctx) => {
    const hasGeometry = data.footprintGeometry !== undefined;
    const hasAbsence = data.absence !== undefined;
    const isAbsentTier = data.sourceTier === "absent";

    if (hasGeometry && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "footprintGeometry and absence are mutually exclusive",
        path: ["footprintGeometry"],
      });
    }

    if (hasGeometry && isAbsentTier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "sourceTier absent must not carry footprintGeometry",
        path: ["sourceTier"],
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
    } else if (!hasGeometry && !hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "building-footprint requires footprintGeometry OR per-parcel absence when sourceTier is not absent",
        path: ["footprintGeometry"],
      });
    }

    if (data.sourceTier === "ml-derived") {
      if (data.accessPolicy !== PROPERTY_DEFAULT_ACCESS_POLICY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ml-derived building-footprint must use accessPolicy public-free",
          path: ["accessPolicy"],
        });
      }
      if (!/ODC-By/i.test(data.sourceCitation)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "ml-derived building-footprint requires ODC-By attribution in sourceCitation",
          path: ["sourceCitation"],
        });
      }
    }
  });

export function createBuildingFootprint(
  input: z.input<typeof BUILDING_FOOTPRINT_SCHEMA>,
): BuildingFootprintAtomInstance {
  return BUILDING_FOOTPRINT_SCHEMA.parse(input) as BuildingFootprintAtomInstance;
}
