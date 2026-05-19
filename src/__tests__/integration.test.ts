/**
 * In-memory integration test for the `@hauska/atom-contract` framework.
 *
 * Exercises the full path register → validate → resolve → contextSummary
 * → compose → appendEvent → readHistory → latestEvent using the
 * in-memory `EventAnchoringService` from the testing subpath.
 *
 * The Postgres-backed `PostgresEventAnchoringService` is exercised in
 * consumer packages that have a real db stack; this package's CI is
 * self-contained.
 */

import { describe, it, expect } from "vitest";
import {
  createAtomRegistry,
  defaultScope,
  resolveComposition,
  type AtomRegistration,
  type ContextSummary,
} from "../index.js";
import { createInMemoryEventService } from "../testing/index.js";

const STUB_FIXTURE = {
  briefing: {
    id: "brief-1",
    title: "Stub Briefing",
    sheets: [
      { id: "sheet-1", name: "A100" },
      { id: "sheet-2", name: "A101" },
    ],
  },
};

function makeBriefingAtom(): AtomRegistration<"test-briefing", ["card"]> {
  return {
    entityType: "test-briefing",
    domain: "test",
    supportedModes: ["card"],
    defaultMode: "card",
    composition: [
      { childEntityType: "test-sheet", childMode: "compact", dataKey: "sheets" },
    ],
    async contextSummary(
      entityId: string,
    ): Promise<ContextSummary<"test-briefing">> {
      return {
        prose: `Briefing ${entityId}`,
        typed: { id: entityId, sheetCount: STUB_FIXTURE.briefing.sheets.length },
        keyMetrics: [
          { label: "Sheets", value: STUB_FIXTURE.briefing.sheets.length },
        ],
        relatedAtoms: STUB_FIXTURE.briefing.sheets.map((s) => ({
          kind: "atom" as const,
          entityType: "test-sheet",
          entityId: s.id,
          displayLabel: s.name,
        })),
        historyProvenance: {
          latestEventId: "",
          latestEventAt: new Date(0).toISOString(),
        },
        scopeFiltered: false,
      };
    },
  };
}

function makeSheetAtom(): AtomRegistration<"test-sheet", ["compact"]> {
  return {
    entityType: "test-sheet",
    domain: "test",
    supportedModes: ["compact"],
    defaultMode: "compact",
    composition: [],
    async contextSummary(
      entityId: string,
    ): Promise<ContextSummary<"test-sheet">> {
      return {
        prose: `Sheet ${entityId}`,
        typed: { id: entityId },
        keyMetrics: [],
        relatedAtoms: [],
        historyProvenance: {
          latestEventId: "",
          latestEventAt: new Date(0).toISOString(),
        },
        scopeFiltered: false,
      };
    },
  };
}

describe("@hauska/atom-contract registry+history integration (in-memory)", () => {
  it("register → validate → resolve → contextSummary → compose → appendEvent → readHistory", async () => {
    const registry = createAtomRegistry();
    registry.register(makeBriefingAtom());
    registry.register(makeSheetAtom());

    // Validation: composition refs all resolve.
    expect(registry.validate().ok).toBe(true);

    // Resolve narrows the literal type.
    const resolved = registry.resolve("test-briefing");
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("unreachable");

    // ContextSummary returns the four-layer shape.
    const summary = await resolved.registration.contextSummary(
      "brief-1",
      defaultScope(),
    );
    expect(summary.prose).toContain("brief-1");
    expect(summary.typed).toMatchObject({ sheetCount: 2 });
    expect(summary.keyMetrics).toHaveLength(1);
    expect(summary.relatedAtoms).toHaveLength(2);
    expect(summary.historyProvenance).toBeDefined();
    expect(typeof summary.scopeFiltered).toBe("boolean");

    // Compose: resolve the parent's declared composition edges against
    // the parent payload. Composition is one of the four contract
    // layers — the registry must consume it and produce typed children
    // ready for render.
    const composed = resolveComposition(
      resolved.registration,
      { kind: "atom", entityType: "test-briefing", entityId: "brief-1" },
      { sheets: STUB_FIXTURE.briefing.sheets },
      registry,
    );
    expect(composed.ok).toBe(true);
    if (!composed.ok) throw new Error("unreachable");
    expect(composed.children).toHaveLength(2);
    expect(composed.children[0]?.reference).toMatchObject({
      kind: "atom",
      entityType: "test-sheet",
      entityId: "sheet-1",
      mode: "compact",
    });
    expect(composed.children[1]?.reference.entityId).toBe("sheet-2");
    expect(composed.children[0]?.composition.dataKey).toBe("sheets");
    expect(composed.children[0]?.registration.entityType).toBe("test-sheet");

    // History: append two events and read them back with chained hashes.
    const history = createInMemoryEventService();
    const e1 = await history.appendEvent({
      entityType: "test-briefing",
      entityId: "brief-1",
      eventType: "briefing.created",
      actor: { kind: "user", id: "u1" },
      payload: { title: "Stub Briefing" },
      occurredAt: new Date("2026-01-01T00:00:00Z"),
    });
    const e2 = await history.appendEvent({
      entityType: "test-briefing",
      entityId: "brief-1",
      eventType: "briefing.updated",
      actor: { kind: "user", id: "u1" },
      payload: { title: "Stub Briefing v2" },
      occurredAt: new Date("2026-01-02T00:00:00Z"),
    });

    expect(e1.prevHash).toBeNull();
    expect(e2.prevHash).toBe(e1.chainHash);
    expect(e2.chainHash).not.toBe(e1.chainHash);

    const history1 = await history.readHistory({
      kind: "atom",
      entityType: "test-briefing",
      entityId: "brief-1",
    });
    expect(history1).toHaveLength(2);
    expect(history1[0]?.id).toBe(e1.id);
    expect(history1[1]?.id).toBe(e2.id);

    const latest = await history.latestEvent({
      kind: "atom",
      entityType: "test-briefing",
      entityId: "brief-1",
    });
    expect(latest?.id).toBe(e2.id);
    expect(latest?.eventType).toBe("briefing.updated");
  });

  it("sequential appendEvent calls produce a gap-free chain", async () => {
    // Fires N sequential appends against the same (entityType, entityId)
    // pair. With the in-memory service, each append synchronously reads
    // the chain tail and writes the next link, so the chain must be
    // gap-free.
    //
    // The Postgres implementation guarantees the same invariant under
    // concurrent appends via a per-entity advisory lock; that exercise
    // lives in consumer packages with a real db stack. Here we verify
    // the chain-walk invariants the consumer test relies on.
    const history = createInMemoryEventService();
    const N = 8;
    const ref = {
      kind: "atom" as const,
      entityType: "test-briefing",
      entityId: "chain-1",
    };
    for (let i = 0; i < N; i++) {
      await history.appendEvent({
        entityType: ref.entityType,
        entityId: ref.entityId,
        eventType: "briefing.touched",
        actor: { kind: "user", id: "u1" },
        payload: { i },
        occurredAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)),
      });
    }
    const rows = await history.readHistory(ref);
    expect(rows).toHaveLength(N);

    // chainHash uniqueness.
    const seenHashes = new Set<string>(rows.map((r) => r.chainHash));
    expect(seenHashes.size).toBe(N);

    // Exactly one root.
    const roots = rows.filter((r) => r.prevHash === null);
    expect(roots).toHaveLength(1);

    // Each non-root prevHash points to a chainHash in this set
    // (no dangling refs).
    for (const row of rows) {
      if (row.prevHash !== null) {
        expect(seenHashes.has(row.prevHash)).toBe(true);
      }
    }

    // Walk the chain forward from the root: each step has exactly one
    // successor (no fork) and we visit all N rows.
    const byPrev = new Map<string | null, typeof rows>();
    for (const row of rows) {
      const k = row.prevHash;
      const arr = byPrev.get(k) ?? [];
      arr.push(row);
      byPrev.set(k, arr);
    }
    for (const [, succs] of byPrev) {
      expect(succs.length).toBe(1);
    }
    const visited = new Set<string>();
    let cursor: string | null = roots[0]?.chainHash ?? null;
    while (cursor !== null) {
      expect(visited.has(cursor)).toBe(false);
      visited.add(cursor);
      const next: typeof rows = byPrev.get(cursor) ?? [];
      cursor = next[0]?.chainHash ?? null;
    }
    expect(visited.size).toBe(N);
  });
});
