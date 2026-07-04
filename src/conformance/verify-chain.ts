/**
 * Signed event-chain verification for data-level atom conformance.
 *
 * Uses the same deterministic SHA-256 formula as
 * {@link PostgresEventAnchoringService} so exports and audit tooling can
 * verify history without trusting the hosting system.
 */

import type { AtomEvent } from "../history.js";
import { __internal } from "../history.js";

export type VerifyChainErrorKind =
  | "empty-chain"
  | "genesis-prev-hash"
  | "broken-link"
  | "hash-mismatch";

export interface VerifyChainError {
  readonly kind: VerifyChainErrorKind;
  readonly eventId?: string;
  readonly message: string;
}

export interface VerifyChainResult {
  readonly ok: boolean;
  readonly eventCount: number;
  readonly errors: ReadonlyArray<VerifyChainError>;
}

function sortEventsOldestFirst(
  events: ReadonlyArray<AtomEvent>,
): ReadonlyArray<AtomEvent> {
  return [...events].sort((a, b) => {
    const cmp = a.occurredAt.getTime() - b.occurredAt.getTime();
    if (cmp !== 0) return cmp;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Verify an append-only signed event chain. Events may be passed in any
 * order; they are sorted oldest-first before verification.
 */
export function verifyEventChain(
  events: ReadonlyArray<AtomEvent>,
): VerifyChainResult {
  if (events.length === 0) {
    return {
      ok: false,
      eventCount: 0,
      errors: [
        {
          kind: "empty-chain",
          message: "signed event chain is empty",
        },
      ],
    };
  }

  const ordered = sortEventsOldestFirst(events);
  const errors: VerifyChainError[] = [];

  for (let i = 0; i < ordered.length; i++) {
    const event = ordered[i];
    if (!event) continue;

    const expectedPrev =
      i === 0 ? null : (ordered[i - 1]?.chainHash ?? null);

    if (i === 0 && event.prevHash !== null) {
      errors.push({
        kind: "genesis-prev-hash",
        eventId: event.id,
        message: `genesis event must have prevHash null; got ${event.prevHash}`,
      });
    }

    if (i > 0 && event.prevHash !== expectedPrev) {
      errors.push({
        kind: "broken-link",
        eventId: event.id,
        message: `prevHash mismatch at event ${event.id}: expected ${expectedPrev}, got ${event.prevHash}`,
      });
    }

    const recomputed = __internal.computeChainHash({
      prevHash: event.prevHash,
      payload: event.payload,
      occurredAt: event.occurredAt,
      eventType: event.eventType,
      actor: event.actor,
    });

    if (recomputed !== event.chainHash) {
      errors.push({
        kind: "hash-mismatch",
        eventId: event.id,
        message: `chainHash mismatch at event ${event.id}: stored ${event.chainHash}, recomputed ${recomputed}`,
      });
    }
  }

  return {
    ok: errors.length === 0,
    eventCount: ordered.length,
    errors,
  };
}
