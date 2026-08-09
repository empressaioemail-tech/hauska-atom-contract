/**
 * Downloadable-atom export shape tests.
 */

import { describe, expect, it } from "vitest";

import { SAMPLE_READ_CONTRACT } from "../../read-contract/fixtures.js";
import {
  SAMPLE_DATA_CONFORMANCE_EVENTS,
  buildValidSignedEventChain,
} from "../../conformance/fixtures.js";
import { ATOM_CONFORMANCE_TARGET_VERSION } from "../../conformance/common.js";
import { BUILDABLE_ENVELOPE_SCHEMA } from "../../property/buildable-envelope.js";
import { BASTROP_ENVELOPE_SUPERSEDED_DECLINE_FIXTURE } from "../../property/fixtures.js";

import {
  createDownloadableAtom,
  isDownloadableAtom,
} from "../downloadable-atom.js";

const SAMPLE_CONTEXT = {
  prose: "IBC 2021 section 1603 — roof live load.",
  typed: { section: "1603" },
  keyMetrics: [{ label: "Edition", value: "2021" }],
  relatedAtoms: [
    {
      kind: "atom" as const,
      entityType: "code-edition",
      entityId: "ibc-2021",
    },
  ],
  historyProvenance: {
    latestEventId: "evt-calibrated",
    latestEventAt: "2026-06-21T12:00:00.000Z",
  },
  scopeFiltered: false,
  accessPolicy: "public-free" as const,
};

describe("export — createDownloadableAtom", () => {
  it("assembles a data-level portable export bundle", () => {
    const result = createDownloadableAtom({
      tier: "data",
      identity: {
        entityType: "code-section",
        entityId: "ibc-2021-1603",
        contentId: "sha256:abc123",
        vdaRef: "vda:icc:ibc-2021:1603",
      },
      accessPolicy: "public-free",
      contextSummary: SAMPLE_CONTEXT,
      readContract: SAMPLE_READ_CONTRACT,
      compositionReferences: SAMPLE_CONTEXT.relatedAtoms,
      citations: [
        {
          citationDid: "did:hauska:citation:icc-2021-1603",
          label: "IBC 2021 §1603",
          citedAtom: SAMPLE_CONTEXT.relatedAtoms[0],
        },
      ],
      signedEventChain: SAMPLE_DATA_CONFORMANCE_EVENTS,
      exportedAt: "2026-06-21T12:30:00.000Z",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    expect(result.export.exportVersion).toBe(ATOM_CONFORMANCE_TARGET_VERSION);
    expect(result.export.verifyChain.ok).toBe(true);
    expect(result.export.compositionReferences).toHaveLength(1);
    expect(result.export.citations).toHaveLength(1);
    expect(isDownloadableAtom(result.export)).toBe(true);
  });

  it("assembles an app-level export without signed history", () => {
    const result = createDownloadableAtom({
      tier: "app",
      identity: {
        entityType: "property-workspace",
        entityId: "ws-demo",
        contentId: "ws-demo",
      },
      accessPolicy: "tenant-private",
      contextSummary: {
        ...SAMPLE_CONTEXT,
        accessPolicy: "tenant-private",
      },
      readContract: SAMPLE_READ_CONTRACT,
      exportedAt: "2026-06-21T12:30:00.000Z",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    expect(result.export.signedEventChain).toHaveLength(0);
    expect(result.export.verifyChain.ok).toBe(false);
    expect(isDownloadableAtom(result.export)).toBe(true);
  });

  it("rejects an export when data-level chain fails verification", () => {
    const badChain = buildValidSignedEventChain([
      {
        id: "evt-1",
        entityType: "code-section",
        entityId: "x",
        eventType: "atom.created",
        actor: { kind: "system", id: "ingest" },
        payload: {},
        occurredAt: new Date("2026-06-01T00:00:00.000Z"),
        recordedAt: new Date("2026-06-01T00:00:01.000Z"),
      },
    ]).map((e) => ({ ...e, chainHash: "invalid" }));

    const result = createDownloadableAtom({
      tier: "data",
      identity: {
        entityType: "code-section",
        entityId: "x",
        contentId: "x",
      },
      accessPolicy: "public-free",
      contextSummary: SAMPLE_CONTEXT,
      readContract: SAMPLE_READ_CONTRACT,
      signedEventChain: badChain,
    });

    expect(result.ok).toBe(false);
  });

  it("serves a new-shaped buildable-envelope decline through downloadable export", () => {
    const parsed = BUILDABLE_ENVELOPE_SCHEMA.safeParse(
      BASTROP_ENVELOPE_SUPERSEDED_DECLINE_FIXTURE,
    );
    expect(parsed.success).toBe(true);
    if (!parsed.success) throw new Error("decline fixture must be contract-valid");

    const decline = parsed.data;
    const absenceKind = decline.absence?.kind;
    expect(absenceKind).toBe("superseded-prop-id");

    const result = createDownloadableAtom({
      tier: "data",
      identity: {
        entityType: decline.entityType,
        entityId: decline.parcelNodeId,
        contentId: decline.atomDid,
      },
      accessPolicy: decline.accessPolicy,
      contextSummary: {
        ...SAMPLE_CONTEXT,
        prose: `Honest envelope decline: ${absenceKind} — ${decline.absence?.reason}`,
        typed: {
          absenceKind,
          provenanceScope: decline.verifiedAbsence?.provenanceScope ?? [],
        },
        keyMetrics: [
          { label: "Absence kind", value: String(absenceKind) },
        ],
      },
      readContract: SAMPLE_READ_CONTRACT,
      citations: [
        {
          citationDid: `did:hauska:citation:envelope-decline:${decline.parcelNodeId}`,
          label: decline.sourceCitation,
          sourceCitation: decline.sourceCitation,
        },
      ],
      signedEventChain: SAMPLE_DATA_CONFORMANCE_EVENTS,
      exportedAt: "2026-08-09T12:00:00.000Z",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected decline export success");
    expect(result.export.identity.entityType).toBe("buildable-envelope");
    expect(result.export.contextSummary.typed).toMatchObject({
      absenceKind: "superseded-prop-id",
    });
    expect(isDownloadableAtom(result.export)).toBe(true);
  });
});
