/**
 * Type-level smoke tests for the ADR-017 `AccessPolicy` union.
 *
 * These tests do not exercise runtime behavior — they exist so that a
 * future widening of the `AccessPolicy` type (or accidental loss of the
 * literal-union constraint on the registration / context fields) trips
 * `tsc --noEmit` rather than slipping through to consumers.
 */

import { describe, it, expect } from "vitest";
import type { AccessPolicy, AtomRegistration } from "./registration.js";
import type { ContextSummary } from "./context.js";

describe("AccessPolicy (type-level)", () => {
  it("rejects an arbitrary string outside the union on AtomRegistration", () => {
    // The runtime body is incidental; the assertions live in the
    // ts-expect-error directives below. If the union is widened to
    // `string` (or the field becomes `any`), the directives go
    // un-erased and the type-check step fails.
    const baseReg: Omit<
      AtomRegistration<"task", ["card"]>,
      "accessPolicy"
    > = {
      entityType: "task",
      domain: "sprint",
      supportedModes: ["card"],
      defaultMode: "card",
      composition: [],
      contextSummary: async () => ({
        prose: "",
        typed: {},
        keyMetrics: [],
        relatedAtoms: [],
        historyProvenance: { latestEventId: "", latestEventAt: "" },
        scopeFiltered: false,
      }),
    };

    const widenedReg: AtomRegistration<"task", ["card"]> = {
      ...baseReg,
      // @ts-expect-error — "not-a-policy" is not a member of AccessPolicy.
      accessPolicy: "not-a-policy",
    };
    // Touch the value so eslint / tsc don't strip the binding before the
    // directive has a chance to bind.
    expect(typeof widenedReg.accessPolicy).toBe("string");

    // Sanity: a real member still type-checks.
    const validReg: AtomRegistration<"task", ["card"]> = {
      ...baseReg,
      accessPolicy: "platform-internal",
    };
    expect(validReg.accessPolicy).toBe("platform-internal");
  });

  it("rejects an arbitrary string outside the union on ContextSummary", () => {
    const baseCtx: Omit<ContextSummary, "accessPolicy"> = {
      prose: "",
      typed: {},
      keyMetrics: [],
      relatedAtoms: [],
      historyProvenance: { latestEventId: "", latestEventAt: "" },
      scopeFiltered: false,
    };

    const widenedCtx: ContextSummary = {
      ...baseCtx,
      // @ts-expect-error — "internal" is not a member of AccessPolicy (the
      // union uses "platform-internal", not the shorter literal).
      accessPolicy: "internal",
    };
    expect(typeof widenedCtx.accessPolicy).toBe("string");

    const validCtx: ContextSummary = {
      ...baseCtx,
      accessPolicy: "platform-internal",
    };
    expect(validCtx.accessPolicy).toBe("platform-internal");
  });

  it("type-checks every member of the AccessPolicy union", () => {
    // A future narrowing of the union (e.g. removing "public-paid")
    // breaks this list at compile time, which is the intended signal —
    // any drop should be deliberate and reflected here.
    const all: ReadonlyArray<AccessPolicy> = [
      "public-free",
      "public-paid",
      "platform-internal",
      "tenant-private",
      "tenant-shared",
    ];
    expect(all).toHaveLength(5);
  });
});
