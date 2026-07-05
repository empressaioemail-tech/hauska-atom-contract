/**
 * Runtime validator for the architecture-homes atom conformance target.
 *
 * Checks read-contract (three widthed axes), accessPolicy (five-value
 * union), and signed-history + verify-chain for data-level atoms.
 */

import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import type { AtomEvent } from "../history.js";
import { READ_CONTRACT_SCHEMA } from "../read-contract/read-contract.js";
import type { ReadContract } from "../read-contract/read-contract.js";

import {
  ACCESS_POLICY_SCHEMA,
  ATOM_CONFORMANCE_TARGET_VERSION,
  type AtomTier,
} from "./common.js";
import { verifyEventChain, type VerifyChainResult } from "./verify-chain.js";

export type AtomConformanceErrorCode =
  | "invalid-read-contract"
  | "invalid-access-policy"
  | "missing-signed-history"
  | "invalid-signed-history"
  | "verify-chain-failed";

export interface AtomConformanceError {
  readonly code: AtomConformanceErrorCode;
  readonly path: string;
  readonly message: string;
}

export interface AtomConformanceTarget {
  readonly conformanceTargetVersion: typeof ATOM_CONFORMANCE_TARGET_VERSION;
  readonly tier: AtomTier;
  readonly readContract: ReadContract;
  readonly accessPolicy: AccessPolicy;
  /** Present and verified when {@link AtomConformanceTarget.tier} is `"data"`. */
  readonly signedHistory?: {
    readonly events: ReadonlyArray<AtomEvent>;
    readonly verifyChain: VerifyChainResult;
  };
}

const ATOM_EVENT_SCHEMA = z
  .object({
    id: z.string().min(1),
    entityType: z.string().min(1),
    entityId: z.string().min(1),
    eventType: z.string().min(1),
    actor: z.object({
      kind: z.enum(["user", "agent", "system"]),
      id: z.string().min(1),
    }),
    payload: z.record(z.unknown()),
    prevHash: z.string().nullable(),
    chainHash: z.string().min(1),
    occurredAt: z.union([z.date(), z.string().min(1)]),
    recordedAt: z.union([z.date(), z.string().min(1)]),
  })
  .readonly();

function normalizeEvent(
  raw: z.infer<typeof ATOM_EVENT_SCHEMA>,
): AtomEvent {
  return {
    id: raw.id,
    entityType: raw.entityType,
    entityId: raw.entityId,
    eventType: raw.eventType,
    actor: raw.actor,
    payload: raw.payload,
    prevHash: raw.prevHash,
    chainHash: raw.chainHash,
    occurredAt:
      raw.occurredAt instanceof Date
        ? raw.occurredAt
        : new Date(raw.occurredAt),
    recordedAt:
      raw.recordedAt instanceof Date
        ? raw.recordedAt
        : new Date(raw.recordedAt),
  };
}

export interface ValidateAtomConformanceInput {
  tier: AtomTier;
  readContract: unknown;
  accessPolicy: unknown;
  signedHistory?: {
    events: unknown;
  };
}

export interface AtomConformanceValidationResult {
  readonly ok: boolean;
  readonly conformanceTargetVersion: typeof ATOM_CONFORMANCE_TARGET_VERSION;
  readonly errors: ReadonlyArray<AtomConformanceError>;
  /** Populated when validation succeeds. */
  readonly target?: AtomConformanceTarget;
}

/**
 * Validate a candidate atom emission against the conformance target.
 * Every repo can call this at read time, export time, or in contract tests.
 */
export function validateAtomConformance(
  input: ValidateAtomConformanceInput,
): AtomConformanceValidationResult {
  const errors: AtomConformanceError[] = [];

  const readContractParsed = READ_CONTRACT_SCHEMA.safeParse(input.readContract);
  if (!readContractParsed.success) {
    errors.push({
      code: "invalid-read-contract",
      path: "readContract",
      message: readContractParsed.error.message,
    });
  }

  const accessPolicyParsed = ACCESS_POLICY_SCHEMA.safeParse(input.accessPolicy);
  if (!accessPolicyParsed.success) {
    errors.push({
      code: "invalid-access-policy",
      path: "accessPolicy",
      message: accessPolicyParsed.error.message,
    });
  }

  let signedHistory: AtomConformanceTarget["signedHistory"] | undefined;

  if (input.tier === "data") {
    if (!input.signedHistory) {
      errors.push({
        code: "missing-signed-history",
        path: "signedHistory",
        message: "data-level atoms require a signed event chain",
      });
    } else if (!Array.isArray(input.signedHistory.events)) {
      errors.push({
        code: "invalid-signed-history",
        path: "signedHistory.events",
        message: "signedHistory.events must be an array",
      });
    } else {
      const events: AtomEvent[] = [];
      for (let i = 0; i < input.signedHistory.events.length; i++) {
        const parsed = ATOM_EVENT_SCHEMA.safeParse(input.signedHistory.events[i]);
        if (!parsed.success) {
          errors.push({
            code: "invalid-signed-history",
            path: `signedHistory.events[${i}]`,
            message: parsed.error.message,
          });
        } else {
          events.push(normalizeEvent(parsed.data));
        }
      }

      if (events.length > 0) {
        const verifyChain = verifyEventChain(events);
        if (!verifyChain.ok) {
          for (const chainError of verifyChain.errors) {
            errors.push({
              code: "verify-chain-failed",
              path: "signedHistory.verifyChain",
              message: chainError.message,
            });
          }
        } else {
          signedHistory = { events, verifyChain };
        }
      }
    }
  }

  if (
    errors.length > 0 ||
    !readContractParsed.success ||
    !accessPolicyParsed.success
  ) {
    return {
      ok: false,
      conformanceTargetVersion: ATOM_CONFORMANCE_TARGET_VERSION,
      errors,
    };
  }

  return {
    ok: true,
    conformanceTargetVersion: ATOM_CONFORMANCE_TARGET_VERSION,
    errors: [],
    target: {
      conformanceTargetVersion: ATOM_CONFORMANCE_TARGET_VERSION,
      tier: input.tier,
      readContract: readContractParsed.data as ReadContract,
      accessPolicy: accessPolicyParsed.data,
      signedHistory,
    },
  };
}
