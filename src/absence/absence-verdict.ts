/**
 * Absence verdicts — instrument contract item 2.4.
 *
 * A bare verdict string does not compile. Each verdict carries its
 * required reference fields.
 */

export type AbsentVerified = {
  readonly verdict: "absent-verified";
  readonly sourceId: string;
  readonly responseRef: string;
  readonly sourceResponded: true;
};

export type LookupFailed = {
  readonly verdict: "lookup-failed";
  readonly failureRef: string;
};

export type NotApplicable = {
  readonly verdict: "not-applicable";
  readonly excludingRule: string;
};

export type AbsenceVerdict = AbsentVerified | LookupFailed | NotApplicable;

export class AbsenceParseError extends Error {
  readonly code = "ABSENCE_VERDICT" as const;

  constructor(
    message: string,
    readonly input: unknown,
  ) {
    super(message);
    this.name = "AbsenceParseError";
  }
}

export function parseAbsenceVerdict(input: unknown): AbsenceVerdict {
  if (!input || typeof input !== "object") {
    throw new AbsenceParseError("absence verdict required", input);
  }
  const row = input as Record<string, unknown>;
  const verdict = row.verdict;
  if (verdict === "absent-verified") {
    if (
      row.sourceResponded !== true ||
      typeof row.sourceId !== "string" ||
      row.sourceId.length === 0 ||
      typeof row.responseRef !== "string" ||
      row.responseRef.length === 0
    ) {
      throw new AbsenceParseError(
        "absent-verified requires a source that responded (sourceId plus responseRef)",
        input,
      );
    }
    return {
      verdict: "absent-verified",
      sourceId: row.sourceId,
      responseRef: row.responseRef,
      sourceResponded: true,
    };
  }
  if (verdict === "lookup-failed") {
    if (typeof row.failureRef !== "string" || row.failureRef.length === 0) {
      throw new AbsenceParseError("lookup-failed requires the failure reference", input);
    }
    return { verdict: "lookup-failed", failureRef: row.failureRef };
  }
  if (verdict === "not-applicable") {
    if (typeof row.excludingRule !== "string" || row.excludingRule.length === 0) {
      throw new AbsenceParseError("not-applicable requires the rule that excludes", input);
    }
    return { verdict: "not-applicable", excludingRule: row.excludingRule };
  }
  throw new AbsenceParseError(`unknown absence verdict ${String(verdict)}`, input);
}

/** Runtime export so the Factory shim check observes `AbsenceVerdict` on the module. */
export const AbsenceVerdict = Object.freeze({
  parse: parseAbsenceVerdict,
});
