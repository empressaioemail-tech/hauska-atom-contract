import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { AtomInputRef } from "../reasoning-chain.js";
import { ATOM_INPUT_REF_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_OBSERVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  SETBACK_ABSENCE_SCHEMA,
  SETBACK_FIELD_PROVENANCE_SCHEMA,
  SETBACK_MATCH_BASIS_SCHEMA,
  type SetbackAbsence,
  type SetbackFieldProvenance,
  type SetbackMatchBasis,
} from "./common.js";

/**
 * Setback RULE atom — observed rule scalars cited to a code atom.
 *
 * `sourceCodeAtomRef` is a typed {@link AtomInputRef} (role `rule` or `fact`),
 * NOT a bare string citation. ICC royalties accrue via separate
 * {@link ObligationAtomInstance} rows — no parallel SourceAttribution type.
 */
export interface SetbackRuleAtomInstance {
  entityType: "setback-rule";
  atomDid: string;
  parcelNodeId: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "observed" }>;
  front: number;
  side: number;
  rear: number;
  /** Typed pointer to the code-section (or rule) atom — never a bare string. */
  sourceCodeAtomRef: AtomInputRef;
  /** Consumed from setback JSON; do not invent tiers. */
  fieldProvenance?: SetbackFieldProvenance;
  matchBasis: SetbackMatchBasis;
  /** Required when matchBasis is fallback (honest-absence grading). */
  absence?: SetbackAbsence;
  accessPolicy: AccessPolicy;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  atomTier: AtomTier;
  readContract?: ReasoningReadContract;
}

export const SETBACK_RULE_SCHEMA = z
  .object({
    entityType: z.literal("setback-rule"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^sbrule_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format sbrule_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    reasoningChain: REASONING_CHAIN_OBSERVED_SCHEMA,
    front: z.number().nonnegative(),
    side: z.number().nonnegative(),
    rear: z.number().nonnegative(),
    sourceCodeAtomRef: ATOM_INPUT_REF_SCHEMA.superRefine((ref, ctx) => {
      if (ref.role !== "rule" && ref.role !== "fact") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceCodeAtomRef role must be rule or fact",
          path: ["role"],
        });
      }
    }),
    fieldProvenance: SETBACK_FIELD_PROVENANCE_SCHEMA.optional(),
    matchBasis: SETBACK_MATCH_BASIS_SCHEMA,
    absence: SETBACK_ABSENCE_SCHEMA.optional(),
    accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
    ...PROPERTY_QUALITY_GATE_FIELDS,
    atomTier: z.literal(PROPERTY_ATOM_TIER),
    readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.matchBasis === "fallback" && !data.absence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "matchBasis fallback requires honest-absence",
        path: ["absence"],
      });
    }
  });

export function createSetbackRule(
  input: z.input<typeof SETBACK_RULE_SCHEMA>,
): SetbackRuleAtomInstance {
  return SETBACK_RULE_SCHEMA.parse(input) as SetbackRuleAtomInstance;
}
