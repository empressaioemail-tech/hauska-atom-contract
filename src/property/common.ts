/**
 * Shared property reasoning atom substrate (master WDLL 3.2–3.6).
 *
 * Property fact / rule / derived kinds reuse 1.8.0 primitives:
 * {@link ReasoningChain}, {@link AtomInputRef}, {@link PropertyConsequence},
 * {@link ReasoningReadContract}, {@link ActorRecordAtomInstance},
 * {@link ObligationAtomInstance}.
 *
 * **Calibrated confidence at READ (I-E):** instances MAY carry a
 * {@link ReasoningThreeAxisConfidence}-shaped asserted snapshot at write
 * time (including a placeholder `calibratedConfidence` with
 * `provenance: "asserted"`). At READ, the calibrated axis resolves through
 * the calibration overlay — it is NOT composed-and-frozen on the instance.
 * Do not invent a frozen multiply (e.g. no `labeling x district` field).
 */

import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import { ACCESS_POLICY_SCHEMA } from "../conformance/common.js";
import {
  WIDTHED_CONFIDENCE_SCHEMA,
  type WidthedConfidence,
} from "../read-contract/common.js";
import {
  REASONING_READ_CONTRACT_SCHEMA,
  type ReasoningReadContract,
} from "../read-contract/reasoning-axes.js";

/** Central-TX parcel node id: `{county_fips}:{prop_id}`. */
export const PARCEL_NODE_ID_PATTERN = /^\d{5}:[A-Za-z0-9._-]+$/;

export const PROPERTY_ATOM_TIER: AtomTier = "data";

export const PROPERTY_DEFAULT_ACCESS_POLICY: AccessPolicy = "public-free";

export const PROPERTY_ACCESS_POLICY_SCHEMA = ACCESS_POLICY_SCHEMA;

/** Quality gate fields required on every property reasoning atom. */
export const PROPERTY_QUALITY_GATE_FIELDS = {
  sourceCitation: z.string().min(1),
  extractedAt: z.string().min(1),
  asOf: z.string().min(1).optional(),
} as const;

/** Honest absence when no zoning polygon stamps the parcel. */
export const ZONING_ABSENCE_KIND = "no-zoning-stamp" as const;

export const ZONING_ABSENCE_SCHEMA = z.object({
  kind: z.literal(ZONING_ABSENCE_KIND),
  reason: z.string().min(1),
});

export type ZoningAbsence = z.infer<typeof ZONING_ABSENCE_SCHEMA>;

/** Honest absence when setback match falls back to a conservative default. */
export const SETBACK_ABSENCE_KIND = "setback-fallback" as const;

export const SETBACK_ABSENCE_SCHEMA = z.object({
  kind: z.literal(SETBACK_ABSENCE_KIND),
  reason: z.string().min(1),
});

export type SetbackAbsence = z.infer<typeof SETBACK_ABSENCE_SCHEMA>;

export type SetbackMatchBasis = "exact" | "prefix" | "fallback";

export const SETBACK_MATCH_BASIS_VALUES: ReadonlyArray<SetbackMatchBasis> = [
  "exact",
  "prefix",
  "fallback",
];

export const SETBACK_MATCH_BASIS_SCHEMA = z.enum([
  "exact",
  "prefix",
  "fallback",
]);

/**
 * Per-field provenance consumed from setback JSON (fan gift — do not invent
 * tiers). Keys are scalar field names (`front`, `side`, `rear`).
 */
export interface SetbackFieldProvenanceEntry {
  atomDid: string;
  confidence: WidthedConfidence;
}

export const SETBACK_FIELD_PROVENANCE_ENTRY_SCHEMA = z.object({
  atomDid: z.string().min(1),
  confidence: WIDTHED_CONFIDENCE_SCHEMA,
});

export const SETBACK_FIELD_PROVENANCE_SCHEMA = z
  .object({
    front: SETBACK_FIELD_PROVENANCE_ENTRY_SCHEMA.optional(),
    side: SETBACK_FIELD_PROVENANCE_ENTRY_SCHEMA.optional(),
    rear: SETBACK_FIELD_PROVENANCE_ENTRY_SCHEMA.optional(),
  })
  .strict();

export type SetbackFieldProvenance = z.infer<typeof SETBACK_FIELD_PROVENANCE_SCHEMA>;

/** Optional read-contract snapshot on write; calibrated axis resolves at READ. */
export const PROPERTY_READ_CONTRACT_SCHEMA = REASONING_READ_CONTRACT_SCHEMA;

export type PropertyReadContract = ReasoningReadContract;
