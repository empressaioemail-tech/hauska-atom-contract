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
  RRC_PIPELINE_ABSENCE_SCHEMA,
  RRC_PIPELINE_SOURCE_TIER_SCHEMA,
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  type RrcPipelineAbsence,
  type RrcPipelineSourceTier,
  type SiteLayerVerifiedAbsence,
} from "./common.js";

/**
 * RRC T-4 pipeline FACT atom — LINE-geometry proximity / buffer exposure or
 * honest absence. NOT PHMSA NPMS; NOT railroad tracks (see rail-corridor-fact).
 *
 * Engine persistence: entityId = bare parcelNodeId (one atom per parcel).
 * Do not invent a `:pipeline:` suffix in the contract.
 *
 * Parcels outside the evaluation buffer are PRESENT with `nearPipeline: false`
 * (same outside-mapped discipline as rail-corridor-fact / flood-hazard-fact).
 * Absence is for missing parcel geometry or an empty/unreachable pipeline
 * index only.
 *
 * atomDid prefix: `pipefact_<16-hex>`.
 */
export interface RrcPipelineFactAtomInstance {
  entityType: "rrc-pipeline-fact";
  atomDid: string;
  parcelNodeId: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  sourceTier: RrcPipelineSourceTier;
  /** Buffer distance used for parcel-edge ↔ T-4 pipeline line evaluation (meters). */
  bufferMeters: number;
  /** True when any T-4 pipeline segment lies within bufferMeters of a parcel edge. */
  nearPipeline?: boolean;
  /** Minimum edge-to-pipeline distance when nearPipeline is true (meters). */
  nearestPipelineDistanceMeters?: number;
  /** Nearest pipeline T-4 permit id after dedupe (display / identity). */
  t4permit?: string;
  /** Nearest pipeline P-5 operator number (display / identity). */
  p5Num?: string;
  /** Operator display name — NEVER a schema uniqueness key. */
  operatorName?: string;
  systemName?: string;
  commodity?: string;
  commodityDescription?: string;
  systemType?: string;
  status?: string;
  diameter?: number;
  /** Prefer boolean when source is clean; string retained for source fidelity. */
  interstate?: boolean | string;
  absence?: RrcPipelineAbsence;
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

function hasPipelineClaim(data: {
  nearPipeline?: boolean;
  nearestPipelineDistanceMeters?: number;
  t4permit?: string;
  p5Num?: string;
  operatorName?: string;
  systemName?: string;
  commodity?: string;
  commodityDescription?: string;
  systemType?: string;
  status?: string;
  diameter?: number;
  interstate?: boolean | string;
}): boolean {
  return (
    data.nearPipeline !== undefined ||
    data.nearestPipelineDistanceMeters !== undefined ||
    data.t4permit !== undefined ||
    data.p5Num !== undefined ||
    data.operatorName !== undefined ||
    data.systemName !== undefined ||
    data.commodity !== undefined ||
    data.commodityDescription !== undefined ||
    data.systemType !== undefined ||
    data.status !== undefined ||
    data.diameter !== undefined ||
    data.interstate !== undefined
  );
}

export const RRC_PIPELINE_FACT_SCHEMA = z
  .object({
    entityType: z.literal("rrc-pipeline-fact"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^pipefact_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format pipefact_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    sourceTier: RRC_PIPELINE_SOURCE_TIER_SCHEMA,
    bufferMeters: z.number().positive(),
    nearPipeline: z.boolean().optional(),
    nearestPipelineDistanceMeters: z.number().nonnegative().optional(),
    t4permit: z.string().min(1).optional(),
    p5Num: z.string().min(1).optional(),
    operatorName: z.string().min(1).optional(),
    systemName: z.string().min(1).optional(),
    commodity: z.string().min(1).optional(),
    commodityDescription: z.string().min(1).optional(),
    systemType: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    diameter: z.number().optional(),
    interstate: z.union([z.boolean(), z.string()]).optional(),
    absence: RRC_PIPELINE_ABSENCE_SCHEMA.optional(),
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
    const hasClaim = hasPipelineClaim(data);

    if (data.accessPolicy !== PROPERTY_DEFAULT_ACCESS_POLICY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "rrc-pipeline-fact must use accessPolicy public-free",
        path: ["accessPolicy"],
      });
    }

    if (hasClaim && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "pipeline claim fields and absence are mutually exclusive",
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
      if (hasClaim || data.nearPipeline !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceTier absent must not carry pipeline claim fields",
          path: ["sourceTier"],
        });
      }
    } else if (hasAbsence) {
      if (hasClaim || data.nearPipeline !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "absence must not coexist with pipeline claim fields",
          path: ["absence"],
        });
      }
    } else if (data.nearPipeline === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "rrc-public-gis tier requires nearPipeline when no absence",
        path: ["nearPipeline"],
      });
    } else if (data.nearPipeline) {
      if (data.nearestPipelineDistanceMeters === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "nearPipeline true requires nearestPipelineDistanceMeters",
          path: ["nearestPipelineDistanceMeters"],
        });
      }
    }
  });

export function createRrcPipelineFact(
  input: z.input<typeof RRC_PIPELINE_FACT_SCHEMA>,
): RrcPipelineFactAtomInstance {
  return RRC_PIPELINE_FACT_SCHEMA.parse(input) as RrcPipelineFactAtomInstance;
}
