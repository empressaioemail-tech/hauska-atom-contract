/**
 * Architecture-homes conformance target constants (doc 02).
 *
 * Every atom family must satisfy the shape validated by
 * {@link validateAtomConformance} against
 * {@link ATOM_CONFORMANCE_TARGET_VERSION}.
 */

import { z } from "zod";

import type { AccessPolicy } from "../registration.js";

/**
 * Pin every consumer co-bump to this semver when adopting the
 * conformance target or downloadable-atom export shape.
 */
export const ATOM_CONFORMANCE_TARGET_VERSION = "1.5.0" as const;

export type AtomConformanceTargetVersion =
  typeof ATOM_CONFORMANCE_TARGET_VERSION;

/** Data-level atoms carry signed history; app-level workflow containers skip it. */
export type AtomTier = "data" | "app";

export const ATOM_TIER_VALUES: ReadonlyArray<AtomTier> = ["data", "app"];

export const ACCESS_POLICY_VALUES: ReadonlyArray<AccessPolicy> = [
  "public-free",
  "public-paid",
  "platform-internal",
  "tenant-private",
  "tenant-shared",
];

export const ACCESS_POLICY_SCHEMA = z.enum([
  "public-free",
  "public-paid",
  "platform-internal",
  "tenant-private",
  "tenant-shared",
]);
