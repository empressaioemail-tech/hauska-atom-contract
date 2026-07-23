/**
 * Reasoning-chain primitive tests (Gate B §2.5.1).
 */

import { describe, expect, it } from "vitest";

import {
  REASONING_CHAIN_SCHEMA,
  createReasoningChain,
  validateReasoningChain,
} from "../../reasoning-chain.js";
import {
  DERIVED_ENVELOPE_REASONING_STUB,
  ICC_LICENSE_REFERENCE_OBLIGATION_FIXTURE,
  NEGATIVE_DERIVED_EMPTY_ATOM_DID,
  NEGATIVE_DERIVED_NO_INPUT_REFS,
  NEGATIVE_ICC_OBLIGATION_MISSING_ACTOR,
  OBSERVED_FACT_REASONING_STUB,
} from "../fixtures.js";
import { OBLIGATION_SCHEMA } from "../../obligation.js";
import { ACTOR_RECORD_SCHEMA, ICC_ACTOR_RECORD_FIXTURE } from "../../actor-record.js";

describe("reasoning-chain — observed", () => {
  it("validates observed reasoning kind", () => {
    const chain = createReasoningChain({ reasoningKind: "observed" });
    expect(chain.reasoningKind).toBe("observed");
    expect(REASONING_CHAIN_SCHEMA.safeParse(chain).success).toBe(true);
  });

  it("validates observed fact stub fixture", () => {
    expect(
      REASONING_CHAIN_SCHEMA.safeParse(OBSERVED_FACT_REASONING_STUB.reasoningChain).success,
    ).toBe(true);
    expect(OBSERVED_FACT_REASONING_STUB.accessPolicy).toBe("public-free");
    expect(OBSERVED_FACT_REASONING_STUB.sourceCitation.length).toBeGreaterThan(0);
    expect(OBSERVED_FACT_REASONING_STUB.extractedAt.length).toBeGreaterThan(0);
  });
});

describe("reasoning-chain — derived", () => {
  it("validates derived envelope stub with reference-field inputs", () => {
    const result = REASONING_CHAIN_SCHEMA.safeParse(
      DERIVED_ENVELOPE_REASONING_STUB.reasoningChain,
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.reasoningKind).toBe("derived");
    if (result.data.reasoningKind === "derived") {
      expect(result.data.derivationMethod).toBe("buildable-envelope-inset-v1");
      expect(result.data.inputAtomRefs.length).toBeGreaterThanOrEqual(1);
      const refFieldCount = result.data.inputAtomRefs.filter(
        (r) => r.role === "reference-field",
      ).length;
      expect(refFieldCount).toBe(2);
    }
  });

  it("uses not-applicable consequence on envelope read-contract", () => {
    const axes = DERIVED_ENVELOPE_REASONING_STUB.readContract?.axes;
    expect(axes?.consequence.kind).toBe("not-applicable");
    if (axes?.consequence.kind === "not-applicable") {
      expect(axes.consequence.reason).toContain("life-safety");
    }
  });

  it("rejects derived without inputAtomRefs", () => {
    expect(REASONING_CHAIN_SCHEMA.safeParse(NEGATIVE_DERIVED_NO_INPUT_REFS).success).toBe(
      false,
    );
  });

  it("rejects derived with empty atomDid", () => {
    expect(REASONING_CHAIN_SCHEMA.safeParse(NEGATIVE_DERIVED_EMPTY_ATOM_DID).success).toBe(
      false,
    );
  });

  it("validateReasoningChain throws on invalid derived", () => {
    expect(() => validateReasoningChain(NEGATIVE_DERIVED_NO_INPUT_REFS)).toThrow();
  });
});

describe("reasoning fixtures — ICC actor and obligation", () => {
  it("validates ICC actor-record fixture", () => {
    expect(ACTOR_RECORD_SCHEMA.safeParse(ICC_ACTOR_RECORD_FIXTURE).success).toBe(true);
    expect(ICC_ACTOR_RECORD_FIXTURE.actorId).toBe("did:hauska:actor:org:icc");
    expect(ICC_ACTOR_RECORD_FIXTURE.tenantKind).toBe("licensed-source");
  });

  it("validates ICC license-reference obligation fixture", () => {
    expect(OBLIGATION_SCHEMA.safeParse(ICC_LICENSE_REFERENCE_OBLIGATION_FIXTURE).success).toBe(
      true,
    );
    expect(ICC_LICENSE_REFERENCE_OBLIGATION_FIXTURE.obligationType).toBe(
      "license-reference-royalty",
    );
    expect(ICC_LICENSE_REFERENCE_OBLIGATION_FIXTURE.amount).toBeUndefined();
    expect(ICC_LICENSE_REFERENCE_OBLIGATION_FIXTURE.graceTerms).toBe("pending-rate");
    expect(ICC_LICENSE_REFERENCE_OBLIGATION_FIXTURE.owedToActorDid).toBe(
      ICC_ACTOR_RECORD_FIXTURE.actorId,
    );
  });

  it("rejects license-reference-royalty without owedToActorDid", () => {
    expect(OBLIGATION_SCHEMA.safeParse(NEGATIVE_ICC_OBLIGATION_MISSING_ACTOR).success).toBe(
      false,
    );
  });
});
