/**
 * Downloadable-atom export shape (architecture homes doc 02).
 *
 * The portable audit unit returned by the gate atom-export tool and
 * rendered by the operator console. Self-contained and verifiable
 * without trusting the hosting system.
 */

import { z } from "zod";

import type { ContextSummary } from "../context.js";
import type { AtomEvent } from "../history.js";
import type { AccessPolicy, AtomReference } from "../registration.js";
import {
  ATOM_CONFORMANCE_TARGET_VERSION,
  validateAtomConformance,
  verifyEventChain,
  type AtomTier,
  type VerifyChainResult,
} from "../conformance/index.js";
import { READ_CONTRACT_SCHEMA } from "../read-contract/read-contract.js";
import type { ReadContract } from "../read-contract/read-contract.js";
import { ACCESS_POLICY_SCHEMA } from "../conformance/common.js";

export interface DownloadableAtomIdentity {
  readonly entityType: string;
  readonly entityId: string;
  /** Stable content identifier (hash, edition key, or corpus row id). */
  readonly contentId: string;
  /** VDA reference for real-world data-level entities. */
  readonly vdaRef?: string;
}

export interface DownloadableAtomCitation {
  readonly citationDid: string;
  readonly label?: string;
  readonly sourceCitation?: string;
  readonly citedAtom?: AtomReference;
}

export interface DownloadableAtom {
  readonly exportVersion: typeof ATOM_CONFORMANCE_TARGET_VERSION;
  readonly identity: DownloadableAtomIdentity;
  readonly accessPolicy: AccessPolicy;
  readonly contextSummary: ContextSummary;
  readonly readContract: ReadContract;
  readonly compositionReferences: ReadonlyArray<AtomReference>;
  readonly citations: ReadonlyArray<DownloadableAtomCitation>;
  readonly signedEventChain: ReadonlyArray<AtomEvent>;
  readonly verifyChain: VerifyChainResult;
  /** ISO-8601 when the export bundle was assembled. */
  readonly exportedAt: string;
}

export const DOWNLOADABLE_ATOM_IDENTITY_SCHEMA = z
  .object({
    entityType: z.string().min(1),
    entityId: z.string().min(1),
    contentId: z.string().min(1),
    vdaRef: z.string().min(1).optional(),
  })
  .readonly();

export const DOWNLOADABLE_ATOM_CITATION_SCHEMA = z
  .object({
    citationDid: z.string().min(1),
    label: z.string().min(1).optional(),
    sourceCitation: z.string().min(1).optional(),
    citedAtom: z
      .object({
        kind: z.literal("atom"),
        entityType: z.string().min(1),
        entityId: z.string().min(1),
        mode: z
          .enum(["inline", "compact", "card", "expanded", "focus"])
          .optional(),
        displayLabel: z.string().optional(),
      })
      .optional(),
  })
  .readonly();

export interface CreateDownloadableAtomInput {
  tier: AtomTier;
  identity: DownloadableAtomIdentity;
  accessPolicy: AccessPolicy;
  contextSummary: ContextSummary;
  readContract: ReadContract;
  compositionReferences?: ReadonlyArray<AtomReference>;
  citations?: ReadonlyArray<DownloadableAtomCitation>;
  signedEventChain?: ReadonlyArray<AtomEvent>;
  exportedAt?: string;
}

export interface CreateDownloadableAtomResult {
  readonly ok: true;
  readonly export: DownloadableAtom;
}

export interface CreateDownloadableAtomFailure {
  readonly ok: false;
  readonly errors: ReadonlyArray<{ path: string; message: string }>;
}

export type CreateDownloadableAtomOutcome =
  | CreateDownloadableAtomResult
  | CreateDownloadableAtomFailure;

/**
 * Assemble a downloadable atom export bundle and run conformance +
 * verify-chain checks before returning.
 */
export function createDownloadableAtom(
  input: CreateDownloadableAtomInput,
): CreateDownloadableAtomOutcome {
  const errors: Array<{ path: string; message: string }> = [];

  const identityParsed = DOWNLOADABLE_ATOM_IDENTITY_SCHEMA.safeParse(input.identity);
  if (!identityParsed.success) {
    errors.push({ path: "identity", message: identityParsed.error.message });
  }

  const readContractParsed = READ_CONTRACT_SCHEMA.safeParse(input.readContract);
  if (!readContractParsed.success) {
    errors.push({ path: "readContract", message: readContractParsed.error.message });
  }

  const accessPolicyParsed = ACCESS_POLICY_SCHEMA.safeParse(input.accessPolicy);
  if (!accessPolicyParsed.success) {
    errors.push({ path: "accessPolicy", message: accessPolicyParsed.error.message });
  }

  const signedEventChain = input.signedEventChain ?? [];
  const verifyChain = verifyEventChain(signedEventChain);

  const conformance = validateAtomConformance({
    tier: input.tier,
    readContract: input.readContract,
    accessPolicy: input.accessPolicy,
    signedHistory:
      input.tier === "data" ? { events: signedEventChain } : undefined,
  });

  if (!conformance.ok) {
    for (const err of conformance.errors) {
      errors.push({ path: err.path, message: err.message });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    export: {
      exportVersion: ATOM_CONFORMANCE_TARGET_VERSION,
      identity: identityParsed.data as DownloadableAtomIdentity,
      accessPolicy: accessPolicyParsed.data as AccessPolicy,
      contextSummary: input.contextSummary,
      readContract: readContractParsed.data as ReadContract,
      compositionReferences: input.compositionReferences ?? [],
      citations: input.citations ?? [],
      signedEventChain,
      verifyChain,
      exportedAt: input.exportedAt ?? new Date().toISOString(),
    },
  };
}

/** Runtime guard for wire payloads (gate export tool, console download). */
export function isDownloadableAtom(value: unknown): value is DownloadableAtom {
  if (value === null || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.exportVersion !== ATOM_CONFORMANCE_TARGET_VERSION) return false;
  if (!DOWNLOADABLE_ATOM_IDENTITY_SCHEMA.safeParse(record.identity).success) {
    return false;
  }
  if (!READ_CONTRACT_SCHEMA.safeParse(record.readContract).success) return false;
  if (!ACCESS_POLICY_SCHEMA.safeParse(record.accessPolicy).success) return false;
  if (!Array.isArray(record.compositionReferences)) return false;
  if (!Array.isArray(record.citations)) return false;
  if (!Array.isArray(record.signedEventChain)) return false;
  if (typeof record.exportedAt !== "string") return false;
  const verify = record.verifyChain;
  if (verify === null || typeof verify !== "object") return false;
  return typeof (verify as VerifyChainResult).ok === "boolean";
}
