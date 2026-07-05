import type { AtomEvent } from "../history.js";
import { __internal } from "../history.js";
import { SAMPLE_READ_CONTRACT } from "../read-contract/fixtures.js";

import type { AtomConformanceTarget } from "./validate.js";
import { ATOM_CONFORMANCE_TARGET_VERSION } from "./common.js";
import { verifyEventChain } from "./verify-chain.js";

type ChainEventSeed = Omit<AtomEvent, "chainHash" | "prevHash"> & {
  prevHash?: string | null;
  chainHash?: string;
};

/** Build a gap-free signed chain with recomputed hashes for tests. */
export function buildValidSignedEventChain(
  events: ReadonlyArray<ChainEventSeed>,
): AtomEvent[] {
  const built: AtomEvent[] = [];
  for (const raw of events) {
    const prevHash =
      built.length > 0
        ? (built[built.length - 1]?.chainHash ?? null)
        : (raw.prevHash ?? null);
    const chainHash =
      raw.chainHash ??
      __internal.computeChainHash({
        prevHash,
        payload: raw.payload,
        occurredAt: raw.occurredAt,
        eventType: raw.eventType,
        actor: raw.actor,
      });
    built.push({ ...raw, prevHash, chainHash });
  }
  return built;
}

export const SAMPLE_DATA_CONFORMANCE_EVENTS = buildValidSignedEventChain([
  {
    id: "evt-genesis",
    entityType: "code-section",
    entityId: "ibc-2021-1603",
    eventType: "atom.created",
    actor: { kind: "system", id: "ingest:icc" },
    payload: { version: 1 },
    prevHash: null,
    occurredAt: new Date("2026-06-01T00:00:00.000Z"),
    recordedAt: new Date("2026-06-01T00:00:01.000Z"),
  },
  {
    id: "evt-calibrated",
    entityType: "code-section",
    entityId: "ibc-2021-1603",
    eventType: "calibration.updated",
    actor: { kind: "agent", id: "calibration-runner" },
    payload: { pool: "icc-ibc-2021" },
    occurredAt: new Date("2026-06-21T12:00:00.000Z"),
    recordedAt: new Date("2026-06-21T12:00:01.000Z"),
  },
]);

export const SAMPLE_DATA_CONFORMANCE_TARGET: AtomConformanceTarget = {
  conformanceTargetVersion: ATOM_CONFORMANCE_TARGET_VERSION,
  tier: "data",
  readContract: SAMPLE_READ_CONTRACT,
  accessPolicy: "public-free",
  signedHistory: {
    events: SAMPLE_DATA_CONFORMANCE_EVENTS,
    verifyChain: verifyEventChain(SAMPLE_DATA_CONFORMANCE_EVENTS),
  },
};

export const SAMPLE_APP_CONFORMANCE_TARGET: AtomConformanceTarget = {
  conformanceTargetVersion: ATOM_CONFORMANCE_TARGET_VERSION,
  tier: "app",
  readContract: SAMPLE_READ_CONTRACT,
  accessPolicy: "tenant-private",
};
