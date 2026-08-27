/**
 * Selector predicate — F-15 item 8 / Track 2.11.
 */

import { describe, expect, it } from "vitest";

import { TRACK2_FLOOD_SELECTORS } from "../../conformance/track2-selector.js";
import {
  FLOOD_ZONE_SELECTORS,
  SelectorParseError,
  match,
  parseSelector,
  type SelectorHandlers,
  type SelectorPredicate,
} from "../selector-predicate.js";

describe("SelectorPredicate", () => {
  it("type-checks the Factory flood selectors A AE AO X", () => {
    const zones = ["A", "AE", "AO", "X"] as const;
    for (const zone of zones) {
      const pred: SelectorPredicate = TRACK2_FLOOD_SELECTORS[zone];
      expect(pred).toEqual(FLOOD_ZONE_SELECTORS[zone]);
    }
  });

  it("refuses an unknown kind", () => {
    expect(() => parseSelector({ kind: "regex" })).toThrow(SelectorParseError);
  });

  it("match is exhaustive", () => {
    const handlers: SelectorHandlers<string> = {
      "spatial-contains": () => "spatial",
      "set-member": () => "set",
      eq: (p) => String(p.value),
      range: () => "range",
      and: () => "and",
      or: () => "or",
    };
    expect(match(TRACK2_FLOOD_SELECTORS.A, handlers)).toBe("A");
    expect(match(TRACK2_FLOOD_SELECTORS.AE, handlers)).toBe("AE");
    expect(match(TRACK2_FLOOD_SELECTORS.AO, handlers)).toBe("AO");
    expect(match(TRACK2_FLOOD_SELECTORS.X, handlers)).toBe("X");
  });

  it("adding a kind without a handler fails the build", () => {
    // @ts-expect-error — exhaustive match requires an eq handler
    const _incomplete: SelectorHandlers<string> = {
      "spatial-contains": () => "spatial",
      "set-member": () => "set",
      range: () => "range",
      and: () => "and",
      or: () => "or",
    };
    expect(_incomplete.range).toBeTypeOf("function");
  });
});
