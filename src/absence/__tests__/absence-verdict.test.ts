/**
 * Absence verdicts — F-15 item 6 / Track 2.4.
 */

import { describe, expect, it } from "vitest";

import {
  TRACK2_ABSENT_VERIFIED,
  TRACK2_LOOKUP_FAILED,
  TRACK2_NOT_APPLICABLE,
} from "../../conformance/track2-absence.js";
import { AbsenceParseError, parseAbsenceVerdict } from "../absence-verdict.js";
import type { AbsenceVerdict } from "../absence-verdict.js";

describe("AbsenceVerdict fixtures", () => {
  it("accepts three verdict fixtures", () => {
    expect(TRACK2_ABSENT_VERIFIED.verdict).toBe("absent-verified");
    expect(TRACK2_LOOKUP_FAILED.verdict).toBe("lookup-failed");
    expect(TRACK2_NOT_APPLICABLE.verdict).toBe("not-applicable");
  });

  it("a bare verdict string does not compile", () => {
    // @ts-expect-error — a bare verdict string is not AbsenceVerdict
    const _bad: AbsenceVerdict = "absent-verified";
    expect(typeof _bad).toBe("string");
  });
});

describe("AbsenceVerdict refusals", () => {
  it("refuses absent-verified without a responding source", () => {
    expect(() =>
      parseAbsenceVerdict({ verdict: "absent-verified", sourceId: "fema" }),
    ).toThrow(AbsenceParseError);
  });

  it("refuses lookup-failed without failureRef", () => {
    expect(() => parseAbsenceVerdict({ verdict: "lookup-failed" })).toThrow(
      AbsenceParseError,
    );
  });

  it("refuses not-applicable without excludingRule", () => {
    expect(() => parseAbsenceVerdict({ verdict: "not-applicable" })).toThrow(
      AbsenceParseError,
    );
  });
});
