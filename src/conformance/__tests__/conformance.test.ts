/**
 * Atom conformance target validation and verify-chain tests.
 */

import { describe, expect, it } from "vitest";

import { createInMemoryEventService } from "../../testing/index.js";
import { SAMPLE_READ_CONTRACT } from "../../read-contract/fixtures.js";

import {
  ATOM_CONFORMANCE_TARGET_VERSION,
  ACCESS_POLICY_VALUES,
  validateAtomConformance,
  verifyEventChain,
} from "../index.js";
import {
  SAMPLE_APP_CONFORMANCE_TARGET,
  SAMPLE_DATA_CONFORMANCE_EVENTS,
  SAMPLE_DATA_CONFORMANCE_TARGET,
} from "../fixtures.js";

describe("conformance — target version", () => {
  it("pins the co-bump semver", () => {
    expect(ATOM_CONFORMANCE_TARGET_VERSION).toBe("1.5.0");
  });
});

describe("conformance — validateAtomConformance", () => {
  it("accepts a data-level target with valid read-contract, policy, and chain", () => {
    const result = validateAtomConformance({
      tier: "data",
      readContract: SAMPLE_DATA_CONFORMANCE_TARGET.readContract,
      accessPolicy: "public-free",
      signedHistory: { events: SAMPLE_DATA_CONFORMANCE_EVENTS },
    });
    expect(result.ok).toBe(true);
    expect(result.target?.signedHistory?.verifyChain.ok).toBe(true);
  });

  it("accepts an app-level target without signed history", () => {
    const result = validateAtomConformance({
      tier: "app",
      readContract: SAMPLE_APP_CONFORMANCE_TARGET.readContract,
      accessPolicy: "tenant-private",
    });
    expect(result.ok).toBe(true);
    expect(result.target?.signedHistory).toBeUndefined();
  });

  it("rejects missing read-contract axes", () => {
    const result = validateAtomConformance({
      tier: "app",
      readContract: { assembledAt: "2026-06-21T00:00:00.000Z" },
      accessPolicy: "public-free",
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.code === "invalid-read-contract")).toBe(
      true,
    );
  });

  it("rejects invalid accessPolicy", () => {
    const result = validateAtomConformance({
      tier: "app",
      readContract: SAMPLE_READ_CONTRACT,
      accessPolicy: "internal",
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.code === "invalid-access-policy")).toBe(
      true,
    );
  });

  it("requires signed history for data-level atoms", () => {
    const result = validateAtomConformance({
      tier: "data",
      readContract: SAMPLE_READ_CONTRACT,
      accessPolicy: "public-free",
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.code === "missing-signed-history")).toBe(
      true,
    );
  });

  it("accepts all five accessPolicy values", () => {
    for (const accessPolicy of ACCESS_POLICY_VALUES) {
      const result = validateAtomConformance({
        tier: "app",
        readContract: SAMPLE_READ_CONTRACT,
        accessPolicy,
      });
      expect(result.ok).toBe(true);
    }
  });
});

describe("conformance — verifyEventChain", () => {
  it("verifies a chain produced by the in-memory event service", async () => {
    const history = createInMemoryEventService();
    await history.appendEvent({
      entityType: "property-workspace",
      entityId: "ws-1",
      eventType: "workspace.created",
      actor: { kind: "user", id: "tenant-1" },
      payload: { parcelId: "p-1" },
      occurredAt: new Date("2026-06-01T00:00:00.000Z"),
    });
    await history.appendEvent({
      entityType: "property-workspace",
      entityId: "ws-1",
      eventType: "brief.started",
      actor: { kind: "agent", id: "brief-runner" },
      payload: { runId: "run-1" },
      occurredAt: new Date("2026-06-21T12:00:00.000Z"),
    });
    const events = await history.readHistory({
      kind: "atom",
      entityType: "property-workspace",
      entityId: "ws-1",
    });
    const verify = verifyEventChain(events);
    expect(verify.ok).toBe(true);
    expect(verify.eventCount).toBe(2);
  });

  it("detects a tampered chainHash", () => {
    const tampered = SAMPLE_DATA_CONFORMANCE_EVENTS.map((e, i) =>
      i === 1 ? { ...e, chainHash: "deadbeef".repeat(8) } : e,
    );
    const verify = verifyEventChain(tampered);
    expect(verify.ok).toBe(false);
    expect(verify.errors.some((e) => e.kind === "hash-mismatch")).toBe(true);
  });
});
