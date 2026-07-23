/**
 * Core reasoning-chain primitive per Gate B §2.5.1.
 *
 * Generalizes the O&G production-timeseries derived idiom into an
 * entity-type-agnostic shape for property reasoning and future compliance
 * findings. O&G streams keep `derivesFromStreamDid`; new code uses
 * `inputAtomRefs` as the contract-level expression of the `derives-from`
 * semantic edge (see `./og/common.ts` link vocabulary).
 *
 * Composed confidence is NOT frozen on the instance — it resolves at read
 * via calibration overlay (I-E) + asserted axes on
 * {@link ReasoningReadContract}.
 */

import { z } from "zod";

/** Role of an input atom or reference field in a derivation chain. */
export type AtomInputRefRole = "fact" | "rule" | "derived" | "reference-field";

export const ATOM_INPUT_REF_ROLES: ReadonlyArray<AtomInputRefRole> = [
  "fact",
  "rule",
  "derived",
  "reference-field",
];

/**
 * Stable typed pointer to an input atom in a reasoning chain.
 * Bare strings without resolvable identity fail conformance for
 * fact / rule / derived roles; reference-field cites external geometry.
 */
export interface AtomInputRef {
  /** DID or atomDid string of the input atom. */
  atomDid: string;
  /**
   * Role of this input in the derivation.
   * - fact / rule / derived = atom inputs
   * - reference-field = continuous cited input (geometry, topo, road) not atomized
   */
  role: AtomInputRefRole;
  /** Optional entityType hint for validators / UI (e.g. "zoning-fact", "setback-rule"). */
  entityType?: string;
  /** Optional human citation label for inspect-card rendering. */
  citationLabel?: string;
}

export const ATOM_INPUT_REF_SCHEMA = z
  .object({
    atomDid: z.string().min(1),
    role: z.enum(ATOM_INPUT_REF_ROLES as [AtomInputRefRole, ...AtomInputRefRole[]]),
    entityType: z.string().min(1).optional(),
    citationLabel: z.string().min(1).optional(),
  })
  .readonly();

/**
 * Discriminated reasoning block. Observed atoms omit derivation fields.
 * Derived atoms MUST carry method + at least one input ref.
 */
export type ReasoningChain =
  | { reasoningKind: "observed" }
  | {
      reasoningKind: "derived";
      derivationMethod: string;
      inputAtomRefs: AtomInputRef[];
    };

export const REASONING_CHAIN_OBSERVED_SCHEMA = z.object({
  reasoningKind: z.literal("observed"),
});

export const REASONING_CHAIN_DERIVED_SCHEMA = z.object({
  reasoningKind: z.literal("derived"),
  derivationMethod: z.string().min(1),
  inputAtomRefs: z.array(ATOM_INPUT_REF_SCHEMA).min(1),
});

export const REASONING_CHAIN_SCHEMA = z
  .discriminatedUnion("reasoningKind", [
    REASONING_CHAIN_OBSERVED_SCHEMA,
    REASONING_CHAIN_DERIVED_SCHEMA,
  ])
  .superRefine((data, ctx) => {
    if (data.reasoningKind !== "derived") {
      return;
    }
    for (let i = 0; i < data.inputAtomRefs.length; i++) {
      const ref = data.inputAtomRefs[i]!;
      if (!ref.atomDid || ref.atomDid.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Every inputAtomRef must have a non-empty atomDid",
          path: ["inputAtomRefs", i, "atomDid"],
        });
      }
    }
  });

export function createReasoningChain(
  input: z.input<typeof REASONING_CHAIN_SCHEMA>,
): ReasoningChain {
  return REASONING_CHAIN_SCHEMA.parse(input) as ReasoningChain;
}

export function validateReasoningChain(value: unknown): ReasoningChain {
  return REASONING_CHAIN_SCHEMA.parse(value) as ReasoningChain;
}
