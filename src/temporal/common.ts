/**
 * Temporal-Context Engine substrate types (TCE spec).
 *
 * Atom families, claim-type vocabulary, node-type prefixes, and edge
 * unions consumed by hauska-engine retrieval and cc-agent-C / cc-agent-E.
 */

import { z } from "zod";

/**
 * Top-level atom family discriminator. Anticipatory atoms slot into the
 * `"event"` family — no separate family value is introduced in v1.6.0.
 */
export type AtomFamily = "event" | "claim" | "observation" | "derived";

export const ATOM_FAMILY_VALUES: ReadonlyArray<AtomFamily> = [
  "event",
  "claim",
  "observation",
  "derived",
];

export const ATOM_FAMILY_SCHEMA = z.enum([
  "event",
  "claim",
  "observation",
  "derived",
]);

/** Base event-family claim types (non-anticipatory). */
export type BaseEventClaimType =
  | "event.resolution"
  | "event.filing"
  | "event.notice"
  | "event.observation";

export const BASE_EVENT_CLAIM_TYPE_VALUES: ReadonlyArray<BaseEventClaimType> = [
  "event.resolution",
  "event.filing",
  "event.notice",
  "event.observation",
];

/**
 * Anticipatory claim types use the open-ended prefix `anticipatory.<kind>`.
 * Unknown sub-kinds (e.g. `anticipatory.calendar_item`,
 * `anticipatory.legislative_item`, `anticipatory.regulatory_notice`) fall
 * back to base event-family behavior at read time.
 */
export type AnticipatoryClaimType = `anticipatory.${string}`;

/** Event-family claim types including the anticipatory prefix pattern. */
export type EventClaimType = BaseEventClaimType | AnticipatoryClaimType;

/** Claim-type union across all families (v1.6.0 extends the event family). */
export type ClaimType = EventClaimType;

/** Requires a non-empty sub-kind after `anticipatory.` — bare `anticipatory` fails. */
export const ANTICIPATORY_CLAIM_TYPE_PATTERN = /^anticipatory\.[^.]+(?:\.[^.]+)*$/;

export function isAnticipatoryClaimType(
  claimType: string,
): claimType is AnticipatoryClaimType {
  return ANTICIPATORY_CLAIM_TYPE_PATTERN.test(claimType);
}

export function isEventClaimType(claimType: string): claimType is EventClaimType {
  if ((BASE_EVENT_CLAIM_TYPE_VALUES as ReadonlyArray<string>).includes(claimType)) {
    return true;
  }
  return isAnticipatoryClaimType(claimType);
}

/**
 * Registered node-type ID prefixes. Every stable graph node ID begins with
 * one of these prefixes.
 */
export type NodeTypePrefix =
  | "parcel_"
  | "jurisdiction_"
  | "code-section_"
  | "security_"
  | "evt_";

export const NODE_TYPE_PREFIX_VALUES: ReadonlyArray<NodeTypePrefix> = [
  "parcel_",
  "jurisdiction_",
  "code-section_",
  "security_",
  "evt_",
];

export const NODE_TYPE_PREFIX_SCHEMA = z.enum([
  "parcel_",
  "jurisdiction_",
  "code-section_",
  "security_",
  "evt_",
]);

/** ISO 8601 calendar date (YYYY-MM-DD). */
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed);
}

/** ISO 8601 timestamp — date or date-time. */
export function isIsoTimestamp(value: string): boolean {
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

export function hasNodeTypePrefix(
  nodeId: string,
  prefix: NodeTypePrefix,
): boolean {
  return nodeId.startsWith(prefix);
}

export function detectNodeTypePrefix(nodeId: string): NodeTypePrefix | null {
  for (const prefix of NODE_TYPE_PREFIX_VALUES) {
    if (nodeId.startsWith(prefix)) return prefix;
  }
  return null;
}
