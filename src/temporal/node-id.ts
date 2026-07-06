/**
 * Stable node ID derivation and anchor validation (ADR-011 discipline).
 *
 * Resolver contract: DID derivation follows two patterns per ADR-025:
 * 1. Public identifier embedding: well_<api14>, rrclease_<district>-<leaseNo>,
 *    tract_<county>-<abstract> where the public identifier IS the stable key.
 * 2. Hashed derivation: evt_, intr_, oblg_, prodts_, unit_, equip_ use
 *    SHA-256(source\0externalId) for entities without global public keys.
 *
 * A manually constructed ID that is not anchored to its real derivation
 * inputs is rejected by the corresponding validation function.
 */

import { createHash } from "node:crypto";

import { hasNodeTypePrefix } from "./common.js";

export interface EvtNodeAnchor {
  readonly source: string;
  readonly externalId: string;
}

/**
 * Derive the canonical evt_ node ID for a source/external_id pair.
 * Deterministic across runtimes — SHA-256 digest truncated to 16 hex chars.
 */
export function deriveEvtNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `evt_${digest}`;
}

/** True when `nodeId` carries the evt_ prefix. */
export function isEvtNodeId(nodeId: string): boolean {
  return hasNodeTypePrefix(nodeId, "evt_");
}

/**
 * Verify that `nodeId` matches the canonical derivation for the anchor.
 * Rejects manually constructed IDs not anchored to the pair.
 */
export function validateEvtNodeAnchor(
  nodeId: string,
  anchor: EvtNodeAnchor,
): boolean {
  if (!isEvtNodeId(nodeId)) return false;
  return nodeId === deriveEvtNodeId(anchor.source, anchor.externalId);
}

// ============================================================================
// O&G DID derivation functions (ADR-025)
// ============================================================================

/**
 * API-14 format: exactly 14 digits, optionally with hyphens at positions
 * 2 and 7 (state code, county code). Examples: 42-123-12345-00-00 or
 * 42123123450000 (both valid).
 */
export const API_14_PATTERN = /^\d{2}-?\d{3}-?\d{5}-?\d{2}-?\d{2}$/;

/**
 * Normalize API-14 to canonical 14-digit format (strip hyphens).
 */
export function normalizeApi14(api14: string): string {
  return api14.replace(/-/g, "");
}

/**
 * Derive the canonical well_ node ID from an API-14 identifier.
 * API-14 is the stable global key; the DID embeds it legibly.
 * Format: well_<api14> where api14 is the 14-digit normalized form.
 */
export function deriveWellNodeId(api14: string): string {
  if (!API_14_PATTERN.test(api14)) {
    throw new Error(`Invalid API-14 format: ${api14}`);
  }
  return `well_${normalizeApi14(api14)}`;
}

/**
 * Derive the canonical rrc-lease node ID from district and lease number.
 * Format: rrclease_<district>-<leaseNo> (public identifiers legibly embedded).
 */
export function deriveRrcLeaseNodeId(district: string, leaseNo: string): string {
  if (!district || !leaseNo) {
    throw new Error("District and leaseNo are required");
  }
  return `rrclease_${district}-${leaseNo}`;
}

/**
 * Derive the canonical tract node ID from county and abstract number.
 * Format: tract_<county>-<abstract> where abstract-keyed; for non-abstract
 * tracts, use the hashed derivation (deriveTractNodeIdHashed).
 */
export function deriveTractNodeId(county: string, abstract: string): string {
  if (!county || !abstract) {
    throw new Error("County and abstract are required");
  }
  return `tract_${county}-${abstract}`;
}

/**
 * Derive a hashed tract node ID for tracts without abstract numbers
 * (metes and bounds, etc.). Uses the same hashing pattern as evt_.
 */
export function deriveTractNodeIdHashed(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `tract_${digest}`;
}

/**
 * Derive an ownership-interest node ID (hashed derivation).
 * Format: intr_<hash> from (source, externalId).
 */
export function deriveInterestNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `intr_${digest}`;
}

/**
 * Derive an obligation node ID (hashed derivation, core type).
 * Format: oblg_<hash> from (source, externalId).
 */
export function deriveObligationNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `oblg_${digest}`;
}

/**
 * Derive a production-timeseries node ID (hashed derivation).
 * Format: prodts_<hash> from (source, externalId).
 */
export function deriveProductionTimeseriesNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `prodts_${digest}`;
}

/**
 * Derive a revenue-allocation-unit node ID (hashed derivation).
 * Format: unit_<hash> from (source, externalId).
 */
export function deriveUnitNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `unit_${digest}`;
}

/**
 * Derive an equipment-state node ID (hashed derivation).
 * Format: equip_<hash> from (source, externalId).
 */
export function deriveEquipmentNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `equip_${digest}`;
}

/**
 * Derive a wellbore node ID (hashed derivation, keyed to parent well + sidetrack).
 * Format: wbore_<hash> from (source, externalId).
 */
export function deriveWellboreNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `wbore_${digest}`;
}

/**
 * Derive a completion node ID (hashed derivation).
 * Format: cmpl_<hash> from (source, externalId).
 */
export function deriveCompletionNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `cmpl_${digest}`;
}

/**
 * Derive a zone node ID (hashed derivation for custom zones; public zones
 * may use formation name directly if that's the stable identifier).
 * Format: zone_<hash> from (source, externalId).
 */
export function deriveZoneNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `zone_${digest}`;
}

/**
 * Derive a pad node ID (hashed derivation, derived entity).
 * Format: pad_<hash> from (source, externalId).
 */
export function derivePadNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `pad_${digest}`;
}

/**
 * Derive a mineral-lease node ID (hashed derivation).
 * Format: mlease_<hash> from (source, externalId).
 */
export function deriveLeaseNodeId(source: string, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${source}\0${externalId}`, "utf8")
    .digest("hex")
    .slice(0, 16);
  return `mlease_${digest}`;
}
