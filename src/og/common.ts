/**
 * Shared O&G ontology substrate types per ADR-025.
 *
 * O&G atoms carry structured confidence, source citation, and access policy
 * per the existing quality-gate discipline. Every confidence field is
 * WidthedConfidence; bare scalars are unrepresentable.
 *
 * Link vocabulary (semantic edges between atoms):
 * - `evidenced-by`: mineral-lease → recorded-instrument (the wet-document trail)
 * - `regulatory-expression-of`: rrc-lease → mineral-lease (many-to-many mapping)
 * - `derives-from`: derived stream → source stream; ownership-interest → instruments
 * - `located-on`: well → tract
 * - `assigned-to`: well → rrc-lease (oil wells; the reporting split)
 * - `produces-from`: completion → zone
 * - `subject-to`: tract → recorded-instrument
 * - `reconciles-with`: computed DOI → obtained operator DOI / signed division order
 *   (added 1.7.0, C1b; external assertion reconciled against computed value;
 *   discrepancies surface as disputes, never silent overwrites)
 *
 * Links are semantic relationships described in ADR-025 and consumed by the
 * graph traversal layer (ADR-010). This contract module defines atom types
 * and schemas; link resolution is handled by downstream graph engines.
 */

import { z } from "zod";

import type { AccessPolicy, AtomMode } from "../registration.js";
import type { NodeTypePrefix } from "../temporal/common.js";
import {
  createWidthedConfidence,
  WIDTHED_CONFIDENCE_SCHEMA,
  type WidthedConfidence,
} from "../read-contract/common.js";
import { ACCESS_POLICY_SCHEMA } from "../conformance/common.js";

/**
 * O&G access policy schema, derived from the canonical ACCESS_POLICY_SCHEMA.
 * Per ADR-025, all O&G atoms use the same five-value access policy enum.
 */
export const OG_ACCESS_POLICY_SCHEMA = ACCESS_POLICY_SCHEMA;

/**
 * Node-type prefixes registered additively for O&G atoms (ADR-025).
 * well_, wbore_, cmpl_, zone_, pad_, mlease_, rrclease_, tract_, intr_,
 * prodts_, equip_, unit_. (oblg_ is core, not ./og-specific.)
 * Re-exported from the core registry to avoid parallel source of truth.
 */
export type OgNodeTypePrefix = Extract<
  NodeTypePrefix,
  | "well_"
  | "wbore_"
  | "cmpl_"
  | "zone_"
  | "pad_"
  | "mlease_"
  | "rrclease_"
  | "tract_"
  | "intr_"
  | "prodts_"
  | "equip_"
  | "unit_"
>;

export const OG_NODE_TYPE_PREFIXES: ReadonlyArray<OgNodeTypePrefix> = [
  "well_",
  "wbore_",
  "cmpl_",
  "zone_",
  "pad_",
  "mlease_",
  "rrclease_",
  "tract_",
  "intr_",
  "prodts_",
  "equip_",
  "unit_",
];

/**
 * Well type classification per ADR-025 asset spine.
 */
export type WellType =
  | "oil"
  | "gas"
  | "injection"
  | "disposal"
  | "dry"
  | "plugged";

export const WELL_TYPES: ReadonlyArray<WellType> = [
  "oil",
  "gas",
  "injection",
  "disposal",
  "dry",
  "plugged",
];

/**
 * Product classification for production-timeseries.
 */
export type ProductType = "oil" | "gas" | "water" | "injection";

export const PRODUCT_TYPES: ReadonlyArray<ProductType> = [
  "oil",
  "gas",
  "water",
  "injection",
];

/**
 * Production stream anchor kind (lease vs well), modeling the reporting split
 * per ADR-025: Texas oil production is reported at RRC lease level; gas is
 * reported at well level.
 */
export type AnchorKind = "rrc-lease" | "well";

export const ANCHOR_KINDS: ReadonlyArray<AnchorKind> = ["rrc-lease", "well"];

/**
 * Production timeseries granularity.
 */
export type Granularity = "monthly" | "daily";

export const GRANULARITIES: ReadonlyArray<Granularity> = ["monthly", "daily"];

/**
 * Equipment kind for equipment-state atoms.
 */
export type EquipmentKind =
  | "rod-pump"
  | "esp"
  | "gas-lift"
  | "plunger-lift"
  | "surface-facility"
  | "other";

export const EQUIPMENT_KINDS: ReadonlyArray<EquipmentKind> = [
  "rod-pump",
  "esp",
  "gas-lift",
  "plunger-lift",
  "surface-facility",
  "other",
];

/**
 * Mineral lease status per ADR-025. Status is engine-derived from obligation
 * determinations.
 */
export type MineralLeaseStatus = "active" | "expired" | "released" | "hbp" | "disputed";

export const MINERAL_LEASE_STATUSES: ReadonlyArray<MineralLeaseStatus> = [
  "active",
  "expired",
  "released",
  "hbp",
  "disputed",
];

/**
 * Ownership interest type discriminator (ADR-025, single discriminated type).
 */
export type InterestType =
  | "mineral"
  | "royalty"
  | "overriding-royalty"
  | "working"
  | "surface"
  | "npri";

export const INTEREST_TYPES: ReadonlyArray<InterestType> = [
  "mineral",
  "royalty",
  "overriding-royalty",
  "working",
  "surface",
  "npri",
];

/**
 * Geolocation with datum per ADR-025 (well surface/bottomhole locations).
 */
export const GEO_LOCATION_SCHEMA = z.object({
  latitude: z.number(),
  longitude: z.number(),
  datum: z.string().min(1),
});

export type GeoLocation = z.infer<typeof GEO_LOCATION_SCHEMA>;

/**
 * RRC field reference (field name and number).
 */
export const FIELD_REF_SCHEMA = z.object({
  fieldName: z.string().min(1),
  fieldNumber: z.string().min(1),
});

export type FieldRef = z.infer<typeof FIELD_REF_SCHEMA>;

/**
 * Perforated interval on a completion.
 */
export const PERFORATED_INTERVAL_SCHEMA = z.object({
  topDepth: z.number(),
  bottomDepth: z.number(),
  zoneDid: z.string().min(1).optional(),
});

export type PerforatedInterval = z.infer<typeof PERFORATED_INTERVAL_SCHEMA>;

/**
 * Clause extract bucket on mineral-lease (typed: shut-in, Pugh, continuous
 * development, depth severance). Each extract carries confidence +
 * sourceCitation into the instrument and page.
 */
export interface ClauseExtract {
  clauseType: "shut-in" | "pugh" | "continuous-development" | "depth-severance";
  extractedText: string;
  confidence: WidthedConfidence;
  sourceCitation: string;
  sourceInstrumentDid: string;
  pageRef?: string;
}

export const CLAUSE_EXTRACT_SCHEMA = z.object({
  clauseType: z.enum([
    "shut-in",
    "pugh",
    "continuous-development",
    "depth-severance",
  ]),
  extractedText: z.string().min(1),
  confidence: WIDTHED_CONFIDENCE_SCHEMA,
  sourceCitation: z.string().min(1),
  sourceInstrumentDid: z.string().min(1),
  pageRef: z.string().min(1).optional(),
});

/**
 * Quality gate fields: sourceCitation, extractedAt/asOf per ADR-025.
 * Every O&G atom carries these fields. Confidence is included separately
 * on types that reason from other atoms (ownership-interest, obligation).
 */
export const OG_QUALITY_GATE_FIELDS = {
  sourceCitation: z.string().min(1),
  extractedAt: z.string().min(1),
  asOf: z.string().min(1).optional(),
} as const;

/**
 * Asserted confidence for O&G extracts at activation. Per ADR-025, the entire
 * domain is uncalibrated at launch; every confidence ships
 * `provenance: "asserted"` with its source named.
 */
export function createOgAssertedConfidence(estimate: number): WidthedConfidence {
  return createWidthedConfidence({
    estimate,
    n: 0,
    intervalWidth: 1,
    provenance: "asserted",
  });
}

/**
 * Recommended render modes for O&G atom registrations.
 */
export const OG_RENDER_MODES = {
  well: ["card", "compact", "expanded"] as const,
  wellbore: ["card", "compact", "expanded"] as const,
  completion: ["card", "compact", "expanded"] as const,
  zone: ["card", "compact"] as const,
  pad: ["card", "compact", "expanded"] as const,
  "production-timeseries": ["card", "compact", "expanded"] as const,
  "equipment-state": ["card", "compact", "expanded"] as const,
  "mineral-lease": ["card", "compact", "expanded", "focus"] as const,
  "rrc-lease": ["card", "compact", "expanded"] as const,
  tract: ["card", "compact", "expanded"] as const,
  "ownership-interest": ["card", "compact", "expanded", "focus"] as const,
  "revenue-allocation-unit": ["card", "compact", "expanded", "focus"] as const,
} satisfies Record<string, ReadonlyArray<AtomMode>>;

export const OG_DEFAULT_RENDER_MODE = {
  well: "card",
  wellbore: "card",
  completion: "card",
  zone: "card",
  pad: "card",
  "production-timeseries": "card",
  "equipment-state": "card",
  "mineral-lease": "focus",
  "rrc-lease": "card",
  tract: "card",
  "ownership-interest": "focus",
  "revenue-allocation-unit": "card",
} as const satisfies Record<string, AtomMode>;

/**
 * Default access policies per ADR-025. Public regulatory data is public-free;
 * operator telemetry and land books are tenant-private. Obligation (core type,
 * domain-neutral) defaults to tenant-private per operator ruling 3.
 */
export const OG_DEFAULT_ACCESS_POLICY = {
  well: "public-free",
  wellbore: "public-free",
  completion: "public-free",
  zone: "public-free",
  pad: "public-free",
  "production-timeseries": "public-free",
  "equipment-state": "tenant-private",
  "mineral-lease": "tenant-private",
  "rrc-lease": "public-free",
  tract: "public-free",
  "ownership-interest": "tenant-private",
  "revenue-allocation-unit": "public-free",
  obligation: "tenant-private",
} as const satisfies Record<string, AccessPolicy>;
