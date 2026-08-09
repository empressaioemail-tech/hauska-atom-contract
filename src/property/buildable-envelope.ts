import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomTier } from "../conformance/common.js";
import type { AtomInputRef } from "../reasoning-chain.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import { REASONING_CHAIN_DERIVED_SCHEMA } from "../reasoning-chain.js";
import type { ReasoningReadContract } from "../read-contract/reasoning-axes.js";

import {
  BUILDABLE_ENVELOPE_ABSENCE_SCHEMA,
  PARCEL_NODE_ID_PATTERN,
  PROPERTY_ACCESS_POLICY_SCHEMA,
  PROPERTY_ATOM_TIER,
  PROPERTY_QUALITY_GATE_FIELDS,
  PROPERTY_READ_CONTRACT_SCHEMA,
  SITE_LAYER_VERIFIED_ABSENCE_SCHEMA,
  type BuildableEnvelopeAbsence,
  type SiteLayerVerifiedAbsence,
} from "./common.js";

/** Canonical derivation method for buildable envelope inset (master 3.6). */
export const BUILDABLE_ENVELOPE_DERIVATION_METHOD = "buildable-envelope-inset-v1" as const;

/**
 * Buildable-envelope DERIVED atom — inputs cite fact + rule + reference fields,
 * OR carry typed absence when the warm/cascade path deliberately declines.
 *
 * Typed absence (1.15.0): when the engine refuses to compute an envelope it
 * emits `absence` (kind = live decline code) plus `verifiedAbsence` with a
 * non-empty `provenanceScope`. That is the same fail-closed dialect as the
 * site-layer families (`sourceTier: absent` → `verifiedAbsence`), expressed
 * for a derived atom that has no source tier.
 *
 * Positive envelopes still require zoning-fact + setback-rule + geometry +
 * front-edge reference inputs. Decline envelopes require only a zoning-fact
 * fact ref (setbacks and rings may not exist — fabricating them is exactly
 * the silent-fabrication mode honest absence exists to prevent).
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
  /** Present when warm/cascade evaluation deliberately refused an envelope. */
  absence?: BuildableEnvelopeAbsence;
  /**
   * Required whenever `absence` is present — documents that the decline was
   * evaluated against named sources (fail-closed; empty scope is a parse error).
   */
  verifiedAbsence?: SiteLayerVerifiedAbsence;
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
    reasoningChain: REASONING_CHAIN_DERIVED_SCHEMA,
    absence: BUILDABLE_ENVELOPE_ABSENCE_SCHEMA.optional(),
    verifiedAbsence: SITE_LAYER_VERIFIED_ABSENCE_SCHEMA.optional(),
    accessPolicy: PROPERTY_ACCESS_POLICY_SCHEMA,
    ...PROPERTY_QUALITY_GATE_FIELDS,
    atomTier: z.literal(PROPERTY_ATOM_TIER),
    readContract: PROPERTY_READ_CONTRACT_SCHEMA.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const chain = data.reasoningChain;
    if (chain.derivationMethod !== BUILDABLE_ENVELOPE_DERIVATION_METHOD) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `derivationMethod must be ${BUILDABLE_ENVELOPE_DERIVATION_METHOD}`,
        path: ["reasoningChain", "derivationMethod"],
      });
    }

    const hasAbsence = data.absence !== undefined;
    const hasVerifiedAbsence = data.verifiedAbsence !== undefined;

    if (hasAbsence && !hasVerifiedAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "buildable-envelope absence requires verifiedAbsence (evaluated + provenanceScope)",
        path: ["verifiedAbsence"],
      });
    }

    if (!hasAbsence && hasVerifiedAbsence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "verifiedAbsence on buildable-envelope requires per-parcel absence kind",
        path: ["absence"],
      });
    }

    const hasZoningFact = chain.inputAtomRefs.some(
      (r) => r.role === "fact" && r.entityType === "zoning-fact",
    );
    if (!hasZoningFact) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "buildable-envelope requires a zoning-fact input ref",
        path: ["reasoningChain", "inputAtomRefs"],
      });
    }

    // Positive envelopes keep the full derivation chain. Decline envelopes
    // may lack setback-rule and geometry refs — refusing to invent them.
    if (!hasAbsence) {
      const hasSetbackRule = chain.inputAtomRefs.some(
        (r) => r.role === "rule" && r.entityType === "setback-rule",
      );
      const refFieldCount = chain.inputAtomRefs.filter(
        (r) => r.role === "reference-field",
      ).length;
      if (!hasSetbackRule) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "buildable-envelope requires a setback-rule input ref",
          path: ["reasoningChain", "inputAtomRefs"],
        });
      }
      if (refFieldCount < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "buildable-envelope requires geometry + front-edge reference-field inputs",
          path: ["reasoningChain", "inputAtomRefs"],
        });
      }
    }
  });

export function createBuildableEnvelope(
  input: z.input<typeof BUILDABLE_ENVELOPE_SCHEMA>,
): BuildableEnvelopeAtomInstance {
  return BUILDABLE_ENVELOPE_SCHEMA.parse(input) as BuildableEnvelopeAtomInstance;
}
