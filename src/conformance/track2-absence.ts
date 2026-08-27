/**
 * Conformance fixtures — Track 2.4 absence verdicts.
 */

import {
  parseAbsenceVerdict,
  type AbsenceVerdict,
} from "../absence/absence-verdict.js";

export const TRACK2_ABSENT_VERIFIED: AbsenceVerdict = parseAbsenceVerdict({
  verdict: "absent-verified",
  sourceId: "fema-nfhl",
  responseRef: "https://hazards.fema.gov/nfhl/48021",
  sourceResponded: true,
});

export const TRACK2_LOOKUP_FAILED: AbsenceVerdict = parseAbsenceVerdict({
  verdict: "lookup-failed",
  failureRef: "http-403:williamson-tylerhost",
});

export const TRACK2_NOT_APPLICABLE: AbsenceVerdict = parseAbsenceVerdict({
  verdict: "not-applicable",
  excludingRule: "shape:parcel has no flood layer",
});
