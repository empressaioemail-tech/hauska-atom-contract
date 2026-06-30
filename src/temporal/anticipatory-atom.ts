/**
 * Anticipatory event atoms — future-dated claims in the event family.
 *
 * `valid_from` MAY be in the future for anticipatory atoms. This is the
 * only atom type where future valid_from is semantically correct.
 */

import { z } from "zod";

import {
  ATOM_FAMILY_SCHEMA,
  isAnticipatoryClaimType,
  isIsoTimestamp,
} from "./common.js";
import type { AnticipatoryClaimType, AtomFamily } from "./common.js";

/** Calibration basis for anticipatory atom confidence. */
export type AnticipatoryConfidenceBasis = "asserted" | "live";

export const ANTICIPATORY_CONFIDENCE_BASIS_SCHEMA = z.enum(["asserted", "live"]);

/**
 * Confidence on a newly deposited anticipatory atom.
 *
 * `basis` is always `"asserted"` until the resolution calibration loop
 * has accumulated enough outcomes to support `"live"`. Depositors MUST
 * NOT emit `"live"` on initial anticipatory writes — the validator
 * rejects it as a hard error.
 */
export interface AnticipatoryConfidence {
  readonly basis: AnticipatoryConfidenceBasis;
  readonly estimate: number;
}

export const ANTICIPATORY_CONFIDENCE_SCHEMA = z
  .object({
    basis: ANTICIPATORY_CONFIDENCE_BASIS_SCHEMA,
    estimate: z.number().min(0).max(1),
  })
  .readonly();

/**
 * An anticipatory atom in the event family.
 *
 * Unknown `anticipatory.<kind>` sub-kinds inherit base event-family
 * read behavior; consumers MUST NOT special-case sub-kind lists.
 */
export interface AnticipatoryAtom {
  readonly family: Extract<AtomFamily, "event">;
  readonly claim_type: AnticipatoryClaimType;
  /** ISO 8601 timestamp; MAY be in the future. */
  readonly valid_from: string;
  readonly confidence: AnticipatoryConfidence;
  readonly source: string;
  readonly external_id: string;
}

export const ANTICIPATORY_ATOM_SCHEMA = z
  .object({
    family: z.literal("event"),
    claim_type: z.string().min(1),
    valid_from: z.string().min(1),
    confidence: ANTICIPATORY_CONFIDENCE_SCHEMA,
    source: z.string().min(1),
    external_id: z.string().min(1),
  })
  .readonly();

export type AnticipatoryAtomValidationCode =
  | "invalid-claim-type"
  | "invalid-valid-from"
  | "invalid-confidence-basis"
  | "invalid-confidence";

export interface AnticipatoryAtomValidationIssue {
  readonly code: AnticipatoryAtomValidationCode;
  readonly path: string;
  readonly message: string;
  readonly severity: "error" | "warning";
}

export interface AnticipatoryAtomValidationResult {
  readonly ok: boolean;
  readonly atom?: AnticipatoryAtom;
  readonly issues: ReadonlyArray<AnticipatoryAtomValidationIssue>;
}

export interface ValidateAnticipatoryAtomInput {
  family: unknown;
  claim_type: unknown;
  valid_from: unknown;
  confidence: unknown;
  source: unknown;
  external_id: unknown;
}

/**
 * Validate and round-trip an anticipatory atom. Future `valid_from` is
 * permitted. Non-`asserted` confidence basis on new deposits is rejected.
 */
export function validateAnticipatoryAtom(
  input: ValidateAnticipatoryAtomInput,
): AnticipatoryAtomValidationResult {
  const issues: AnticipatoryAtomValidationIssue[] = [];

  const parsed = ANTICIPATORY_ATOM_SCHEMA.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      issues: [
        {
          code: "invalid-claim-type",
          path: "",
          message: parsed.error.message,
          severity: "error",
        },
      ],
    };
  }

  const data = parsed.data;

  const familyParsed = ATOM_FAMILY_SCHEMA.safeParse(data.family);
  if (!familyParsed.success || familyParsed.data !== "event") {
    issues.push({
      code: "invalid-claim-type",
      path: "family",
      message: 'anticipatory atoms must use family "event"',
      severity: "error",
    });
  }

  if (!isAnticipatoryClaimType(data.claim_type)) {
    issues.push({
      code: "invalid-claim-type",
      path: "claim_type",
      message: `claim_type must match anticipatory.<kind>; got "${data.claim_type}"`,
      severity: "error",
    });
  }

  if (!isIsoTimestamp(data.valid_from)) {
    issues.push({
      code: "invalid-valid-from",
      path: "valid_from",
      message: `valid_from must be a valid ISO 8601 timestamp; got "${data.valid_from}"`,
      severity: "error",
    });
  }

  if (data.confidence.basis !== "asserted") {
    issues.push({
      code: "invalid-confidence-basis",
      path: "confidence.basis",
      message: `new anticipatory atoms require confidence.basis "asserted"; got "${data.confidence.basis}"`,
      severity: "error",
    });
  }

  if (issues.some((i) => i.severity === "error")) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    atom: data as AnticipatoryAtom,
    issues,
  };
}

/**
 * Data-quality warning: future `valid_from` on a non-anticipatory atom.
 * Not a hard error — backends may still persist, but callers should flag.
 */
export function warnFutureValidFromOnNonAnticipatory(input: {
  claim_type: string;
  valid_from: string;
  asOf?: Date;
}): AnticipatoryAtomValidationIssue | null {
  if (isAnticipatoryClaimType(input.claim_type)) return null;
  if (!isIsoTimestamp(input.valid_from)) return null;

  const asOf = input.asOf ?? new Date();
  const validFromMs = Date.parse(input.valid_from);
  if (validFromMs <= asOf.getTime()) return null;

  return {
    code: "invalid-valid-from",
    path: "valid_from",
    message:
      "future valid_from is only semantically valid for anticipatory atoms; " +
      `claim_type "${input.claim_type}" is not anticipatory`,
    severity: "warning",
  };
}

export function createAnticipatoryAtom(
  input: Omit<AnticipatoryAtom, "confidence"> & {
    confidence?: Pick<AnticipatoryConfidence, "estimate">;
  },
): AnticipatoryAtom {
  const candidate = {
    ...input,
    confidence: {
      basis: "asserted" as const,
      estimate: input.confidence?.estimate ?? 0.5,
    },
  };
  const result = validateAnticipatoryAtom(candidate);
  if (!result.ok || !result.atom) {
    throw new Error(
      result.issues.map((i) => i.message).join("; ") || "invalid anticipatory atom",
    );
  }
  return result.atom;
}
