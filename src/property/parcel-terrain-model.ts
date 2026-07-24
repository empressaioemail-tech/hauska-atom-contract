/**
 * Parcel terrain-export DERIVED atom — mesh + IFC + CAD formats off ONE triangulation.
 *
 * WDLL: 2026-07-23_terrain_ifc_spine_lift_WDLL (amended CAD export set).
 * DEM/topo is a referenced continuous field (not atomized). Artifacts are
 * keyed by format param; callers request one or more formats per export.
 */

import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { AtomInputRef } from "../reasoning-chain.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_DERIVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";
import {
  WIDTHED_CONFIDENCE_SCHEMA,
  type WidthedConfidence,
} from "../read-contract/common.js";

import {
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
} from "./common.js";

/** Canonical derivation method — shared triangulation, N emitters. */
export const PARCEL_TERRAIN_DERIVATION_METHOD =
  "parcel-terrain-mesh-ifc-v1" as const;

/** Paid default for terrain-export (WDLL accessPolicy public-paid). */
export const TERRAIN_DEFAULT_ACCESS_POLICY: AccessPolicy = "public-paid";

/** Format params for the single terrain-export atom. */
export const TERRAIN_EXPORT_FORMATS = [
  "glb",
  "ifc",
  "dxf-3dface",
  "dxf-contour",
  "landxml-tin",
] as const;

export type TerrainExportFormat = (typeof TERRAIN_EXPORT_FORMATS)[number];

export const TERRAIN_EXPORT_FORMAT_SCHEMA = z.enum(TERRAIN_EXPORT_FORMATS);

export interface TerrainArtifactRef {
  /** Format this artifact was emitted for. */
  format: TerrainExportFormat;
  /** Content-addressed or object-store path (CID-shaped preferred). */
  ref: string;
  /** Byte length when known. */
  byteCount?: number;
  /** Face/mesh formats: vertex count of the shared triangulation. */
  vertexCount?: number;
  /** Face/mesh formats: triangle count of the shared triangulation. */
  triangleCount?: number;
  /** IFC-only: schema version (expect IFC4). */
  ifcSchemaVersion?: string;
  /** IFC-only: geometry primitive (expect IfcTriangulatedFaceSet). */
  geometryPrimitive?: string;
  /** Contour-only: elevation interval meters used for extraction. */
  contourIntervalMeters?: number;
  /** Contour-only: number of polylines emitted. */
  contourPolylineCount?: number;
  /** Honest deferral when a format is not yet shipped. */
  deferred?: boolean;
  deferredReason?: string;
}

export const TERRAIN_ARTIFACT_REF_SCHEMA = z
  .object({
    format: TERRAIN_EXPORT_FORMAT_SCHEMA,
    ref: z.string().min(1),
    byteCount: z.number().nonnegative().optional(),
    vertexCount: z.number().int().nonnegative().optional(),
    triangleCount: z.number().int().nonnegative().optional(),
    ifcSchemaVersion: z.string().min(1).optional(),
    geometryPrimitive: z.string().min(1).optional(),
    contourIntervalMeters: z.number().positive().optional(),
    contourPolylineCount: z.number().int().nonnegative().optional(),
    deferred: z.boolean().optional(),
    deferredReason: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((art, ctx) => {
    if (art.deferred === true && !art.deferredReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "deferred artifact requires deferredReason",
        path: ["deferredReason"],
      });
    }
  });

export interface TerrainCoverage {
  coverageFraction: number;
  nodataCount: number;
  totalCells: number;
  resolutionMetersRequested?: number | null;
  resolutionMetersActual?: number | null;
  touchesNodata?: boolean;
}

export const TERRAIN_COVERAGE_SCHEMA = z
  .object({
    coverageFraction: z.number().min(0).max(1),
    nodataCount: z.number().int().nonnegative(),
    totalCells: z.number().int().nonnegative(),
    resolutionMetersRequested: z.number().positive().nullable().optional(),
    resolutionMetersActual: z.number().positive().nullable().optional(),
    touchesNodata: z.boolean().optional(),
  })
  .strict();

/**
 * Parcel terrain-export DERIVED atom.
 *
 * One atom, format-parameterized artifacts. DEM is only a reference-field
 * input (citationLabel e.g. `usgs-3dep-dem`).
 */
export interface ParcelTerrainModelAtomInstance {
  entityType: "parcel-terrain-model";
  atomDid: string;
  parcelNodeId: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "derived" }> & {
    derivationMethod: typeof PARCEL_TERRAIN_DERIVATION_METHOD;
    inputAtomRefs: AtomInputRef[];
  };
  /** Artifact map keyed by format; omitted/deferred formats may be absent. */
  artifacts: Partial<Record<TerrainExportFormat, TerrainArtifactRef>>;
  coverage: TerrainCoverage;
  /** Asserted baseline confidence (USGS 3DEP); earning loop not claimed. */
  confidence: WidthedConfidence;
  accessPolicy: AccessPolicy;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  atomTier: AtomTier;
  readContract?: ReasoningReadContract;
}

export const PARCEL_TERRAIN_MODEL_SCHEMA = z
  .object({
    entityType: z.literal("parcel-terrain-model"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^pterrain_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format pterrain_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    reasoningChain: REASONING_CHAIN_DERIVED_SCHEMA.superRefine((chain, ctx) => {
      if (chain.derivationMethod !== PARCEL_TERRAIN_DERIVATION_METHOD) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `derivationMethod must be ${PARCEL_TERRAIN_DERIVATION_METHOD}`,
          path: ["derivationMethod"],
        });
      }
      const hasDemRef = chain.inputAtomRefs.some(
        (r) =>
          r.role === "reference-field" &&
          (r.citationLabel === "usgs-3dep-dem" ||
            r.entityType === "usgs-3dep-dem" ||
            /3dep|dem|topo/i.test(r.citationLabel ?? "")),
      );
      if (!hasDemRef) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "parcel-terrain-model requires a DEM/topo reference-field input (citationLabel usgs-3dep-dem)",
          path: ["inputAtomRefs"],
        });
      }
    }),
    artifacts: z.record(TERRAIN_EXPORT_FORMAT_SCHEMA, TERRAIN_ARTIFACT_REF_SCHEMA),
    coverage: TERRAIN_COVERAGE_SCHEMA,
    confidence: WIDTHED_CONFIDENCE_SCHEMA,
    accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
    ...PROPERTY_QUALITY_GATE_FIELDS,
    atomTier: z.literal(PROPERTY_ATOM_TIER),
    readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
  })
  .strict()
  .superRefine((inst, ctx) => {
    for (const [key, art] of Object.entries(inst.artifacts)) {
      if (art && art.format !== key) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `artifacts.${key}.format must equal key (${art.format} given)`,
          path: ["artifacts", key, "format"],
        });
      }
    }
  });

export function createParcelTerrainModel(
  input: z.input<typeof PARCEL_TERRAIN_MODEL_SCHEMA>,
): ParcelTerrainModelAtomInstance {
  return PARCEL_TERRAIN_MODEL_SCHEMA.parse(
    input,
  ) as ParcelTerrainModelAtomInstance;
}
