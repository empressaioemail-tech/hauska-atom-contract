import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  COUNTY_COVERAGE_PARCEL_NODE_SUFFIX,
  PARCEL_EXTERNAL_KEY_SCHEMA,
  PARCEL_GEOMETRY_SOURCE_TIER_SCHEMA,
  PARCEL_GEOMETRY_STORE_REF_SCHEMA,
  PARCEL_KEY_KIND_SCHEMA,
  PARCEL_NODE_ABSENCE_SCHEMA,
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_DEFAULT_ACCESS_POLICY,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  SITE_LAYER_PROVENANCE_FIELDS,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  type ParcelExternalKey,
  type ParcelGeometrySourceTier,
  type ParcelGeometryStoreRef,
  type ParcelKeyKind,
  type ParcelNodeAbsence,
  type SiteLayerVerifiedAbsence,
} from "./common.js";

/**
 * Parcel node ANCHOR atom — parcel identity and geometry provenance.
 *
 * Rail 1 of the county shape. This atom is the citable record that a parcel
 * exists, which external key names it, where its ring came from, and at what
 * vintage. Every other property rail keys on `parcelNodeId`, so this is the
 * anchor the chain hangs from — MCP has advertised the type since the property
 * chain shipped (`did:hauska:parcel-node:{parcelNodeId}`); this closes the gap
 * where nothing produced it.
 *
 * **It is NOT the geometry.** Geometry Law rule 1 fixes one ring per parcel in
 * `txgio_parcel`; the ten engine files that serve geometry read that store
 * directly. `geometryStoreRef` is a POINTER into that truth frame. Putting the
 * ring in the atom would create a second source of geometry truth, re-open the
 * defect class Geometry Law rule 3 closed, and multiply row count by the whole
 * statewide parcel corpus. Do not add a geometry body field to this type.
 *
 * **Typed absence is first-class**, matching `building-footprint` /
 * `utility-easement`: a parcel we established does not exist, or a county whose
 * ring source we probed and found unpublished, is a FINDING with provenance —
 * not a missing row. `sourceTier: "absent"` fails closed unless `verifiedAbsence`
 * carries a non-empty `provenanceScope`, and absence never coexists with a
 * resolved `geometryStoreRef`.
 */
export interface ParcelNodeAtomInstance {
  entityType: "parcel-node";
  /** `did:hauska:parcel-node:{parcelNodeId}` — the convention MCP already serves. */
  atomDid: string;
  /** `{county_fips}:{prop_id}`, or the `{fips}:_county_coverage` anchor. */
  parcelNodeId: string;
  countyFips: string;
  /** Which key kind the second token of `parcelNodeId` carries. */
  keyKind: ParcelKeyKind;
  /** Additional external keys, each with its own provenance. */
  externalKeys?: ReadonlyArray<ParcelExternalKey>;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  geometrySourceTier: ParcelGeometrySourceTier;
  /** Pointer into the single geometry truth frame. Never the ring itself. */
  geometryStoreRef?: ParcelGeometryStoreRef;
  /** False when the county ring set is not in the store yet. */
  geometryLoaded: boolean;
  /** Per-parcel typed absence (fail-closed; distinct from not-yet-loaded). */
  absence?: ParcelNodeAbsence;
  /** County-level verified absence on the `_county_coverage` anchor. */
  verifiedAbsence?: SiteLayerVerifiedAbsence;
  /**
   * Count of `PARCEL-RING-SOURCE-DIVERGENCE` observations between the county
   * CAD ring and the TxGIO ring. Reporting only — it never re-picks the truth
   * frame, which stays TxGIO unless an explicit override tier is recorded.
   */
  divergenceObservationCount?: number;
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

/** Canonical parcel-node DID (matches the published MCP property-chain form). */
export function parcelNodeAtomDid(parcelNodeId: string): string {
  return `did:hauska:parcel-node:${parcelNodeId}`;
}

export const PARCEL_NODE_ATOM_DID_PATTERN =
  /^did:hauska:parcel-node:\d{5}:[A-Za-z0-9._-]+$/;

export const PARCEL_NODE_SCHEMA = z
  .object({
    entityType: z.literal("parcel-node"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ATOM_DID_PATTERN.test(val), {
        message: "atomDid must be did:hauska:parcel-node:{county_fips}:{key}",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    countyFips: z.string().regex(/^\d{5}$/, "countyFips must be 5 digits"),
    keyKind: PARCEL_KEY_KIND_SCHEMA,
    externalKeys: z.array(PARCEL_EXTERNAL_KEY_SCHEMA).min(1).readonly().optional(),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    geometrySourceTier: PARCEL_GEOMETRY_SOURCE_TIER_SCHEMA,
    geometryStoreRef: PARCEL_GEOMETRY_STORE_REF_SCHEMA.optional(),
    geometryLoaded: z.boolean(),
    absence: PARCEL_NODE_ABSENCE_SCHEMA.optional(),
    verifiedAbsence: SITE_LAYER_VERIFIED_ABSENCE_SCHEMA.optional(),
    divergenceObservationCount: z.number().int().nonnegative().optional(),
    accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
    ...PROPERTY_QUALITY_GATE_FIELDS,
    ...SITE_LAYER_PROVENANCE_FIELDS,
    atomTier: z.literal(PROPERTY_ATOM_TIER),
    readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
  })
  .superRefine((data, ctx) => {
    const hasGeometryRef = data.geometryStoreRef !== undefined;
    const hasAbsence = data.absence !== undefined;
    const isAbsentTier = data.geometrySourceTier === "absent";

    // Rule 1 — a resolved geometry pointer and a typed absence are contradictory.
    if (hasGeometryRef && hasAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "geometryStoreRef and absence are mutually exclusive",
        path: ["geometryStoreRef"],
      });
    }

    if (isAbsentTier && hasGeometryRef) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "geometrySourceTier absent must not carry geometryStoreRef",
        path: ["geometrySourceTier"],
      });
    }

    // Rule 2 — fail closed on absent tier: verified absence with real scope.
    if (isAbsentTier) {
      if (!data.verifiedAbsence) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "geometrySourceTier absent requires verifiedAbsence (evaluated + provenanceScope)",
          path: ["verifiedAbsence"],
        });
      }
      if (data.geometryLoaded) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "geometrySourceTier absent requires geometryLoaded false",
          path: ["geometryLoaded"],
        });
      }
    } else if (!hasGeometryRef && !hasAbsence) {
      // Rule 3 — a present tier must resolve to a ring or say why it did not.
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "parcel-node requires geometryStoreRef OR per-parcel absence when geometrySourceTier is not absent",
        path: ["geometryStoreRef"],
      });
    }

    // Rule 4 — geometryLoaded is a claim about the pointer, not a mood.
    if (data.geometryLoaded && !hasGeometryRef) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "geometryLoaded true requires geometryStoreRef",
        path: ["geometryLoaded"],
      });
    }
    if (!data.geometryLoaded && hasGeometryRef) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "geometryStoreRef present requires geometryLoaded true",
        path: ["geometryLoaded"],
      });
    }

    // Rule 5 — the pointer must name the same parcel the atom is about.
    if (data.geometryStoreRef) {
      if (data.geometryStoreRef.countyFips !== data.countyFips) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "geometryStoreRef.countyFips must equal countyFips",
          path: ["geometryStoreRef", "countyFips"],
        });
      }
      const expectedPrefix = `${data.countyFips}:`;
      if (
        data.parcelNodeId.startsWith(expectedPrefix) &&
        data.parcelNodeId.slice(expectedPrefix.length) !==
          data.geometryStoreRef.propId
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "geometryStoreRef.propId must equal the parcelNodeId key token",
          path: ["geometryStoreRef", "propId"],
        });
      }
    }

    // Rule 6 — atomDid embeds the parcel node id (MCP resolves by this form).
    if (data.atomDid !== parcelNodeAtomDid(data.parcelNodeId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "atomDid must be did:hauska:parcel-node:{parcelNodeId}",
        path: ["atomDid"],
      });
    }

    // Rule 7 — the parcel node id must sit in the county the atom claims.
    if (!data.parcelNodeId.startsWith(`${data.countyFips}:`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "parcelNodeId must begin with countyFips",
        path: ["parcelNodeId"],
      });
    }

    // Rule 8 — county-coverage anchors are county-level rows only.
    const isCountyCoverage = data.parcelNodeId.endsWith(
      `:${COUNTY_COVERAGE_PARCEL_NODE_SUFFIX}`,
    );
    if (isCountyCoverage && !data.verifiedAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "county-coverage parcel-node anchor requires verifiedAbsence",
        path: ["verifiedAbsence"],
      });
    }

    // Rule 9 — public record; parcel identity is never gated.
    if (data.accessPolicy !== PROPERTY_DEFAULT_ACCESS_POLICY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "parcel-node must use accessPolicy public-free",
        path: ["accessPolicy"],
      });
    }
  });

export function createParcelNode(
  input: z.input<typeof PARCEL_NODE_SCHEMA>,
): ParcelNodeAtomInstance {
  return PARCEL_NODE_SCHEMA.parse(input) as ParcelNodeAtomInstance;
}
