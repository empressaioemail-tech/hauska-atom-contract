/**
 * P-167 self-test required by the OPS-23 mission: every BuildableDisplayKind
 * has a `pdfLabel`. `pdfLabel` is typed as a required `string` (never
 * nullable) on `BuildableDisplayVocab`, so this test is an exhaustiveness
 * check — one representative input per kind — that the type promise holds
 * at runtime for all nine kinds, plus a snapshot of that canonical output
 * table so any edit to the branch strings is a visible diff.
 */
import { describe, it, expect } from "vitest";
import {
  mapBuildableDisplay,
  type BuildableDisplayKind,
  type BuildableDisplayInput,
} from "./buildable.js";

/** One representative input per BuildableDisplayKind, drawn from buildable.test.ts's own cases. */
const REPRESENTATIVE_INPUT_BY_KIND: Record<BuildableDisplayKind, BuildableDisplayInput> = {
  absent: {},
  loading: { declineReason: "atom_path_pending" },
  pending: { envelopeStatus: "ok" },
  provisional: {
    envelopeStatus: "ok",
    warmEnvelopeKind: "provisional-front-edge",
    buildableAreaSqFt: 9000,
    provisional: true,
  },
  "buildable-with-area": { envelopeStatus: "ok", buildableAreaSqFt: 13641 },
  "declined-consume": { envelopeStatus: "no-buildable-area", buildableAreaPct: 0 },
  not_specified: { envelopeStatus: "ok", notSpecifiedAxes: true },
  "not-applicable": { warmEnvelopeKind: "not-applicable" },
  "modelled-figure-withheld": { declineReason: "atom_path_pending", hasGeometry: true },
};

describe("BuildableDisplayKind exhaustiveness self-test", () => {
  const kinds = Object.keys(REPRESENTATIVE_INPUT_BY_KIND) as BuildableDisplayKind[];

  it("covers all nine kinds (fails to compile if a kind is added without a fixture)", () => {
    expect(kinds.sort()).toEqual(
      [
        "absent",
        "buildable-with-area",
        "declined-consume",
        "loading",
        "modelled-figure-withheld",
        "not-applicable",
        "not_specified",
        "pending",
        "provisional",
      ].sort(),
    );
  });

  it.each(kinds)("kind %s produces a non-empty pdfLabel and actually maps to itself", (kind) => {
    const vocab = mapBuildableDisplay(REPRESENTATIVE_INPUT_BY_KIND[kind]);
    expect(vocab.kind).toBe(kind);
    expect(typeof vocab.pdfLabel).toBe("string");
    expect(vocab.pdfLabel.length).toBeGreaterThan(0);
  });

  it("the canonical per-kind output table is snapshotted so a branch-string edit is a visible diff", () => {
    const table = Object.fromEntries(
      kinds.map((kind) => [kind, mapBuildableDisplay(REPRESENTATIVE_INPUT_BY_KIND[kind])]),
    );
    expect(table).toMatchSnapshot();
  });
});
