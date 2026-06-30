import { describe, it, expect } from "vitest";

import {
  isAnticipatoryClaimType,
  isEventClaimType,
} from "../common.js";
import {
  deriveEvtNodeId,
  validateEvtNodeAnchor,
} from "../node-id.js";
import {
  validateAnticipatoryAtom,
  warnFutureValidFromOnNonAnticipatory,
} from "../anticipatory-atom.js";
import {
  validateWouldAffectEdge,
} from "../would-affect-edge.js";
import {
  filterAtomsForAsOf,
  isAtomVisibleAtAsOf,
} from "../interval-query.js";
import {
  SAMPLE_ANTICIPATORY_ATOM,
  SAMPLE_EVT_NODE_ID,
  SAMPLE_WOULD_AFFECT_EDGE,
} from "../fixtures.js";

describe("anticipatory claim_type", () => {
  it("accepts anticipatory.<kind> with open sub-kinds", () => {
    expect(isAnticipatoryClaimType("anticipatory.calendar_item")).toBe(true);
    expect(isAnticipatoryClaimType("anticipatory.regulatory_notice")).toBe(true);
    expect(isAnticipatoryClaimType("anticipatory.anything")).toBe(true);
    expect(isEventClaimType("anticipatory.legislative_item")).toBe(true);
  });

  it("rejects bare anticipatory without sub-kind", () => {
    expect(isAnticipatoryClaimType("anticipatory")).toBe(false);
    expect(isAnticipatoryClaimType("anticipatory.")).toBe(false);
  });
});

describe("validateAnticipatoryAtom", () => {
  it("round-trips a valid anticipatory atom with future valid_from", () => {
    const result = validateAnticipatoryAtom(SAMPLE_ANTICIPATORY_ATOM);
    expect(result.ok).toBe(true);
    expect(result.atom?.valid_from).toBe("2027-01-15T00:00:00.000Z");
    expect(result.atom?.claim_type).toBe("anticipatory.legislative_item");
  });

  it("rejects confidence.basis live on new anticipatory deposits", () => {
    const result = validateAnticipatoryAtom({
      ...SAMPLE_ANTICIPATORY_ATOM,
      confidence: { basis: "live", estimate: 0.9 },
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "invalid-confidence-basis")).toBe(
      true,
    );
  });

  it("warns on future valid_from for non-anticipatory claim types", () => {
    const warning = warnFutureValidFromOnNonAnticipatory({
      claim_type: "event.resolution",
      valid_from: "2099-01-01T00:00:00.000Z",
      asOf: new Date("2026-06-30T00:00:00.000Z"),
    });
    expect(warning).not.toBeNull();
    expect(warning?.severity).toBe("warning");
  });
});

describe("validateWouldAffectEdge", () => {
  it("accepts a valid would_affect edge", () => {
    const result = validateWouldAffectEdge(SAMPLE_WOULD_AFFECT_EDGE);
    expect(result.ok).toBe(true);
    expect(result.edge?.immutable).toBe(true);
  });

  it("rejects sourceNodeId without evt_ prefix", () => {
    const result = validateWouldAffectEdge({
      ...SAMPLE_WOULD_AFFECT_EDGE,
      sourceNodeId: "parcel_not_evt",
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "invalid-source-prefix")).toBe(
      true,
    );
  });

  it("rejects missing effectiveDate", () => {
    const { effectiveDate: _removed, ...withoutDate } = SAMPLE_WOULD_AFFECT_EDGE;
    const result = validateWouldAffectEdge(withoutDate);
    expect(result.ok).toBe(false);
    expect(
      result.issues.some((i) => i.code === "missing-effective-date"),
    ).toBe(true);
  });

  it("rejects non-ISO effectiveDate", () => {
    const result = validateWouldAffectEdge({
      ...SAMPLE_WOULD_AFFECT_EDGE,
      effectiveDate: "not-a-date",
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "invalid-effective-date")).toBe(
      true,
    );
  });
});

describe("evt_ node ID anchor", () => {
  it("derives stable evt_ IDs from source and external_id", () => {
    const id = deriveEvtNodeId("source-a", "ext-1");
    expect(id.startsWith("evt_")).toBe(true);
    expect(validateEvtNodeAnchor(id, { source: "source-a", externalId: "ext-1" })).toBe(
      true,
    );
    expect(
      validateEvtNodeAnchor(id, { source: "other", externalId: "ext-1" }),
    ).toBe(false);
  });
});

describe("interval-query helpers", () => {
  it("excludes future anticipatory atoms from default current-state queries", () => {
    const visible = isAtomVisibleAtAsOf(SAMPLE_ANTICIPATORY_ATOM, {
      asOf: new Date("2026-06-30T00:00:00.000Z"),
    });
    expect(visible).toBe(false);
  });

  it("includes future anticipatory atoms when includeAnticipatory is set", () => {
    const filtered = filterAtomsForAsOf([SAMPLE_ANTICIPATORY_ATOM], {
      asOf: new Date("2026-06-30T00:00:00.000Z"),
      includeAnticipatory: true,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.isFutureAnticipatory).toBe(true);
  });
});

describe("evt_ prefix collision check", () => {
  it("SAMPLE_EVT_NODE_ID uses evt_ prefix and matches fixture anchor", () => {
    expect(SAMPLE_EVT_NODE_ID.startsWith("evt_")).toBe(true);
    expect(
      validateEvtNodeAnchor(SAMPLE_EVT_NODE_ID, {
        source: SAMPLE_ANTICIPATORY_ATOM.source,
        externalId: SAMPLE_ANTICIPATORY_ATOM.external_id,
      }),
    ).toBe(true);
  });
});
