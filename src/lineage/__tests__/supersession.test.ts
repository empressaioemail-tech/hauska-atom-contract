/**
 * Supersession edge — F-15 item 7 / Track 2.8.
 */

import { describe, expect, it } from "vitest";

import { TRACK2_SUPERSESSION_FIXTURE } from "../../conformance/track2-supersession.js";
import { mint } from "../../identity/node-id.js";
import {
  SupersessionParseError,
  acceptAtomWithoutSupersededBy,
  parseSupersessionEdge,
} from "../supersession.js";

describe("SupersessionEdge", () => {
  it("accepts the conformance fixture with closedAt", () => {
    expect(TRACK2_SUPERSESSION_FIXTURE.link_type).toBe("SUPERSEDED_BY");
    expect(TRACK2_SUPERSESSION_FIXTURE.closedAt).toBe("2026-08-27T15:00:00.000Z");
  });

  it("refuses a supersession without closedAt", () => {
    expect(() =>
      parseSupersessionEdge({
        link_type: "SUPERSEDED_BY",
        from: mint(),
        to: mint(),
      }),
    ).toThrow(SupersessionParseError);
  });

  it("an atom type with a supersededBy field does not compile", () => {
    acceptAtomWithoutSupersededBy({ id: mint() });
    // @ts-expect-error — supersession is an edge; no supersededBy column
    acceptAtomWithoutSupersededBy({ id: mint(), supersededBy: mint() });
  });
});
