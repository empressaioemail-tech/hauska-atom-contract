import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { AtomInputRef } from "../reasoning-chain.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_DERIVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
} from "./common.js";

/** Canonical derivation method for buildable envelope inset (master 3.6). */
export const BUILDABLE_ENVELOPE_DERIVATION_METHOD = "buildable-envelope-inset-v1" as const;

/**
 * Buildable-envelope DERIVED atom — inputs cite fact + rule + reference fields.
 *
 * No `labeling x district` multiply field. `calibratedConfidence` on
 * {@link readContract} may be a placeholder asserted snapshot at write;
 * at READ the calibrated axis resolves via overlay (I-E). Envelope uses
 * {@link PropertyConsequence} `not-applicable`, not life-safety ASCE7 stuffing.
 */
export interface BuildableEnvelopeAtomInstance {
  entityType: "buildable-envelope";
  atomDid: string;
  parcelNodeId: string;
  reasoningChain: Extract<ReasoningChain, { reasoningKind: "derived" }> & {
    derivationMethod: typeof BUILDABLE_ENVELOPE_DERIVATION_METHOD;
    inputAtomRefs: AtomInputRef[];
  };
  accessPolicy: AccessPolicy;
  sourceCitation: string;
  extractedAt: string;
  asOf?: string;
  atomTier: AtomTier;
  readContract?: ReasoningReadContract;
}

export const BUILDABLE_ENVELOPE_SCHEMA = z
  .object({
    entityType: z.literal("buildable-envelope"),
    atomDid: z
      .string()
      .min(1)
      .refine((val) => /^benvelope_[0-9a-f]{16}$/.test(val), {
        message: "atomDid must be in format benvelope_<16-hex-chars>",
      }),
    parcelNodeId: z
      .string()
      .min(1)
      .refine((val) => PARCEL_NODE_ID_PATTERN.test(val), {
        message: "parcelNodeId must match {county_fips}:{prop_id}",
      }),
    reasoningChain: REASONING_CHAIN_DERIVED_SCHEMA.superRefine((chain, ctx) => {
      if (chain.derivationMethod !== BUILDABLE_ENVELOPE_DERIVATION_METHOD) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `derivationMethod must be ${BUILDABLE_ENVELOPE_DERIVATION_METHOD}`,
          path: ["derivationMethod"],
        });
      }
      const hasZoningFact = chain.inputAtomRefs.some(
        (r) => r.role === "fact" && r.entityType === "zoning-fact",
      );
      const hasSetbackRule = chain.inputAtomRefs.some(
        (r) => r.role === "rule" && r.entityType === "setback-rule",
      );
      const refFieldCount = chain.inputAtomRefs.filter(
        (r) => r.role === "reference-field",
      ).length;
      if (!hasZoningFact) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "buildable-envelope requires a zoning-fact input ref",
          path: ["inputAtomRefs"],
        });
      }
      if (!hasSetbackRule) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "buildable-envelope requires a setback-rule input ref",
          path: ["inputAtomRefs"],
        });
      }
      if (refFieldCount < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "buildable-envelope requires geometry + front-edge reference-field inputs",
          path: ["inputAtomRefs"],
        });
      }
    }),
    accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
    ...PROPERTY_QUALITY_GATE_FIELDS,
    atomTier: z.literal(PROPERTY_ATOM_TIER),
    readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
  })
  .strict();

export function createBuildableEnvelope(
  input: z.input<typeof BUILDABLE_ENVELOPE_SCHEMA>,
): BuildableEnvelopeAtomInstance {
  return BUILDABLE_ENVELOPE_SCHEMA.parse(input) as BuildableEnvelopeAtomInstance;
}
