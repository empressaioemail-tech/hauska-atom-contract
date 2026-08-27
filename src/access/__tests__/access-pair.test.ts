/**
 * Two-field access — F-15 item 9 / Track 2.12.
 */

import { describe, expect, it } from "vitest";

import { TRACK2_ACCESS_FIXTURE } from "../../conformance/track2-access.js";
import {
  AccessParseError,
  mapAccessPolicy,
  parseAccessPair,
} from "../access-pair.js";

describe("AccessPair", () => {
  it("accepts the conformance fixture", () => {
    expect(TRACK2_ACCESS_FIXTURE.discoverability).toBe("catalog-listed");
    expect(TRACK2_ACCESS_FIXTURE.entitlement).toBe("anyone-free");
  });

  it("maps the existing accessPolicy string", () => {
    expect(mapAccessPolicy("public-free").entitlement).toBe("anyone-free");
    expect(mapAccessPolicy("public-paid").entitlement).toBe("anyone-paid");
    expect(mapAccessPolicy("platform-internal").discoverability).toBe("hidden");
    expect(mapAccessPolicy("tenant-private").entitlement).toBe("owner-only");
    expect(mapAccessPolicy("tenant-shared").entitlement).toBe("named-parties");
  });

  it("refuses an atom carrying one field without the other", () => {
    expect(() =>
      parseAccessPair({ discoverability: "catalog-listed" }),
    ).toThrow(AccessParseError);
    expect(() => parseAccessPair({ entitlement: "anyone-free" })).toThrow(
      AccessParseError,
    );
  });

  it("refuses a bare accessPolicy string", () => {
    expect(() => parseAccessPair({ accessPolicy: "public-free" })).toThrow(
      AccessParseError,
    );
  });
});
