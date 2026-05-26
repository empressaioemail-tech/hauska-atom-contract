/**
 * Shared encumbrance substrate types per ADR-020 / ADR-021.
 *
 * Encumbrance atoms are never `public-free`. Schemas use
 * {@link ENCUMBRANCE_ACCESS_POLICY_SCHEMA} rather than the full
 * {@link AccessPolicy} union so public tiers fail validation at the
 * boundary.
 */

import { z } from "zod";

import type { AccessPolicy, AtomMode } from "../registration.js";

/** ADR-020 instrument categories. */
export type InstrumentType =
  | "plat-restriction"
  | "cc-r-declaration"
  | "deed-restriction"
  | "easement"
  | "lien"
  | "other";

export const INSTRUMENT_TYPES: ReadonlyArray<InstrumentType> = [
  "plat-restriction",
  "cc-r-declaration",
  "deed-restriction",
  "easement",
  "lien",
  "other",
];

/** Ingest source track per {@link 49b_encumbrance_ingestion_pipeline}. */
export type EncumbranceSourceAdapter = "R1" | "R2" | "R3" | "R4" | "R5";

export const ENCUMBRANCE_SOURCE_ADAPTERS: ReadonlyArray<EncumbranceSourceAdapter> =
  ["R1", "R2", "R3", "R4", "R5"];

export type VerificationStatus = "machine" | "human" | "title-company";

export const VERIFICATION_STATUSES: ReadonlyArray<VerificationStatus> = [
  "machine",
  "human",
  "title-company",
];

export type LegalWeight = "recorded" | "advisory";

export const LEGAL_WEIGHTS: ReadonlyArray<LegalWeight> = ["recorded", "advisory"];

/**
 * Access tiers allowed on encumbrance payloads. Subset of ADR-017
 * {@link AccessPolicy}; excludes all public tiers.
 */
export type EncumbranceAccessPolicy = "tenant-private" | "tenant-shared";

export const ENCUMBRANCE_ACCESS_POLICIES: ReadonlyArray<EncumbranceAccessPolicy> =
  ["tenant-private", "tenant-shared"];

export const ENCUMBRANCE_ACCESS_POLICY_SCHEMA = z.enum([
  "tenant-private",
  "tenant-shared",
]);

/** Rejects catalog-visible tiers on encumbrance instances. */
export function isEncumbranceAccessPolicy(
  value: AccessPolicy | undefined,
): value is EncumbranceAccessPolicy {
  return value === "tenant-private" || value === "tenant-shared";
}

export const RECORDING_SCHEMA = z.object({
  county: z.string().min(1),
  state: z.string().min(1),
  book: z.string().min(1).optional(),
  page: z.string().min(1).optional(),
  instrumentNumber: z.string().min(1).optional(),
  recordedAt: z.string().min(1).optional(),
});

export type RecordingInfo = z.infer<typeof RECORDING_SCHEMA>;

export const APPLIES_TO_SCHEMA = z
  .object({
    parcelDids: z.array(z.string().min(1)).optional(),
    platId: z.string().min(1).optional(),
    legalDescription: z.string().min(1).optional(),
  })
  .refine(
    (v) =>
      (v.parcelDids?.length ?? 0) > 0 ||
      v.platId !== undefined ||
      v.legalDescription !== undefined,
    {
      message:
        "appliesTo requires at least one of parcelDids, platId, or legalDescription",
    },
  );

export type AppliesTo = z.infer<typeof APPLIES_TO_SCHEMA>;

/** Typed extract bucket on {@link RestrictionClauseAtomInstance}. */
export const STRUCTURED_FIELDS_SCHEMA = z
  .object({
    maxHeightFt: z.number().optional(),
    prohibitedUses: z.array(z.string()).optional(),
    setbackFt: z.number().optional(),
    materialAllowlist: z.array(z.string()).optional(),
  })
  .passthrough();

export type StructuredFields = z.infer<typeof STRUCTURED_FIELDS_SCHEMA>;

const CONFIDENCE = z.number().min(0).max(1);

export const QUALITY_GATE_FIELDS = {
  confidence: CONFIDENCE,
  evaluatedAt: z.string().min(1),
  reasoningSummary: z.string().min(1).optional(),
  sourceCitation: z.string().min(1),
} as const;

/**
 * Recommended render modes for engine / product registrations.
 * `restriction-clause` includes `focus` for citation surfaces (ADR-020
 * dispatch).
 */
export const ENCUMBRANCE_RENDER_MODES = {
  "recorded-instrument": ["card", "compact", "expanded"] as const,
  "restriction-clause": [
    "inline",
    "compact",
    "card",
    "expanded",
    "focus",
  ] as const,
  "restriction-corpus": ["card", "expanded"] as const,
  "administrative-rule": ["inline", "compact", "card", "expanded"] as const,
  "constraint-resolution": ["card", "expanded"] as const,
} satisfies Record<string, ReadonlyArray<AtomMode>>;

export const ENCUMBRANCE_DEFAULT_RENDER_MODE = {
  "recorded-instrument": "card",
  "restriction-clause": "focus",
  "restriction-corpus": "card",
  "administrative-rule": "compact",
  "constraint-resolution": "card",
} as const satisfies Record<string, AtomMode>;

/** Atom-type default access tiers (never `public-free`). */
export const ENCUMBRANCE_DEFAULT_ACCESS_POLICY = {
  "recorded-instrument": "tenant-private",
  "restriction-clause": "tenant-private",
  "restriction-corpus": "tenant-shared",
  "administrative-rule": "tenant-private",
  "constraint-resolution": "tenant-private",
} as const satisfies Record<string, EncumbranceAccessPolicy>;
