/**
 * Reasoning-chain conformance fixtures per Gate B §2.3 and §5.7.
 *
 * Property entityTypes (zoning-fact, setback-rule, buildable-envelope) are
 * Phase 1b bindings — named in comments, not registered as full kinds in 1.8.0.
 */

import type { AccessPolicy } from "../registration.js";
import type { ReasoningChain } from "../reasoning-chain.js";
import {
  createReasoningReadContract,
  createReasoningThreeAxisConfidence,
  type ReasoningReadContract,
} from "../read-contract/reasoning-axes.js";
import { createWidthedConfidence } from "../read-contract/common.js";
import type { ObligationAtomInstance } from "../obligation.js";
import { createOgAssertedConfidence } from "../og/common.js";
import { ICC_ACTOR_RECORD_FIXTURE } from "../actor-record.js";

/** Stub shape showing how reasoning chain attaches before Phase 1b kinds ship. */
export interface ReasoningInstanceStub {
  /** Phase 1b: entityType would be e.g. "zoning-fact". */
  entityTypeHint: string;
  reasoningChain: ReasoningChain;
  sourceCitation: string;
  extractedAt: string;
  accessPolicy: AccessPolicy;
  readContract?: ReasoningReadContract;
}

const SAMPLE_ASSERTED = createWidthedConfidence({
  estimate: 0.85,
  n: 0,
  intervalWidth: 0.3,
  provenance: "asserted",
});

const SAMPLE_CALIBRATED = createWidthedConfidence({
  estimate: 0.78,
  n: 12,
  intervalWidth: 0.15,
  provenance: "backtest",
});

/** Observed fact stub — public-free with provenance fields present. */
export const OBSERVED_FACT_REASONING_STUB: ReasoningInstanceStub = {
  entityTypeHint: "zoning-fact", // Phase 1b binding
  reasoningChain: { reasoningKind: "observed" },
  sourceCitation: "Bastrop County Appraisal District parcel record 2024",
  extractedAt: "2026-07-23T12:00:00.000Z",
  accessPolicy: "public-free",
};

/** Derived envelope stub — not-applicable consequence, no stuffed ASCE7. */
export const DERIVED_ENVELOPE_REASONING_STUB: ReasoningInstanceStub = {
  entityTypeHint: "buildable-envelope", // Phase 1b binding
  reasoningChain: {
    reasoningKind: "derived",
    derivationMethod: "buildable-envelope-inset-v1",
    inputAtomRefs: [
      {
        atomDid: "did:hauska:atom:zoning-fact:bastrop-r1-demo",
        role: "fact",
        entityType: "zoning-fact",
        citationLabel: "R-1 zoning district",
      },
      {
        atomDid: "did:hauska:atom:setback-rule:bastrop-front-side-demo",
        role: "rule",
        entityType: "setback-rule",
        citationLabel: "Front and side setback requirements",
      },
      {
        atomDid: "ref:geometry:parcel-footprint-demo",
        role: "reference-field",
        citationLabel: "Parcel footprint geometry",
      },
      {
        atomDid: "ref:geometry:front-edge-demo",
        role: "reference-field",
        citationLabel: "Front lot line edge",
      },
    ],
  },
  sourceCitation: "Derived from zoning fact + setback rule + parcel geometry",
  extractedAt: "2026-07-23T12:00:00.000Z",
  accessPolicy: "public-free",
  readContract: createReasoningReadContract({
    axes: createReasoningThreeAxisConfidence({
      calibratedConfidence: SAMPLE_CALIBRATED,
      assertedConfidence: SAMPLE_ASSERTED,
      consequence: {
        kind: "not-applicable",
        reason: "envelope-geometry-derivation-has-no-life-safety-stratum",
        assertedAt: "2026-07-23T12:00:00.000Z",
      },
    }),
    assembledAt: "2026-07-23T12:00:00.000Z",
  }),
};

/** Negative fixture inputs — validated in tests, not valid instances. */
export const NEGATIVE_DERIVED_NO_INPUT_REFS = {
  reasoningKind: "derived" as const,
  derivationMethod: "buildable-envelope-inset-v1",
  inputAtomRefs: [] as [],
};

export const NEGATIVE_DERIVED_EMPTY_ATOM_DID = {
  reasoningKind: "derived" as const,
  derivationMethod: "buildable-envelope-inset-v1",
  inputAtomRefs: [{ atomDid: "", role: "fact" as const }],
};

/** Re-export ICC actor for obligation edge demonstrations. */
export { ICC_ACTOR_RECORD_FIXTURE };

/**
 * ICC inbound reference royalty — reuses shipped ObligationAtomInstance shape.
 * amount omitted with graceTerms pending-rate when commercial rates unset (I-K).
 */
export const ICC_LICENSE_REFERENCE_OBLIGATION_FIXTURE: ObligationAtomInstance = {
  entityType: "obligation",
  obligationDid: "oblg_a1b2c3d4e5f67890",
  obligationType: "license-reference-royalty",
  anchorDid: "did:hauska:atom:code-section:ibc-2024-1003-demo",
  anchorKind: "code-section",
  owedToActorDid: ICC_ACTOR_RECORD_FIXTURE.actorId,
  dueDate: "2026-07-23T12:00:00.000Z",
  recurrence: "per-reference",
  graceTerms: "pending-rate",
  status: "upcoming",
  confidence: createOgAssertedConfidence(0.9),
  sourceCitation: "ICC IBC 2024 Section 1003.1",
  extractedAt: "2026-07-23T12:00:00.000Z",
  accessPolicy: "platform-internal",
};

/** Negative obligation fixture — license type without owedToActorDid. */
export const NEGATIVE_ICC_OBLIGATION_MISSING_ACTOR = {
  entityType: "obligation" as const,
  obligationDid: "oblg_b2c3d4e5f6789012",
  obligationType: "license-reference-royalty" as const,
  anchorDid: "did:hauska:atom:code-section:ibc-2024-1003-demo",
  anchorKind: "code-section",
  dueDate: "2026-07-23T12:00:00.000Z",
  recurrence: "per-reference",
  graceTerms: "pending-rate",
  status: "upcoming" as const,
  confidence: createOgAssertedConfidence(0.9),
  sourceCitation: "ICC IBC 2024 Section 1003.1",
  extractedAt: "2026-07-23T12:00:00.000Z",
  accessPolicy: "platform-internal" as const,
};
