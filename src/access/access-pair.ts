/**
 * Access as two fields — instrument contract item 2.12.
 *
 * discoverability and entitlement sit alongside the existing AccessPolicy
 * string, which stays exported and mapped until F-10 migrates the column.
 * Neither field is defaulted.
 */

import type { AccessPolicy } from "../registration.js";

export type Discoverability = "catalog-listed" | "unlisted" | "hidden";

export type Entitlement =
  | "anyone-free"
  | "anyone-paid"
  | "named-parties"
  | "owner-only"
  | "platform-only";

export type AccessPair = {
  readonly discoverability: Discoverability;
  readonly entitlement: Entitlement;
  readonly accessPolicy?: AccessPolicy;
};

export class AccessParseError extends Error {
  readonly code: string;

  constructor(
    message: string,
    readonly input: unknown,
    code = "ACCESS_REQUIRED",
  ) {
    super(message);
    this.name = "AccessParseError";
    this.code = code;
  }
}

const DISCOVERABILITY: ReadonlySet<string> = new Set([
  "catalog-listed",
  "unlisted",
  "hidden",
]);

const ENTITLEMENT: ReadonlySet<string> = new Set([
  "anyone-free",
  "anyone-paid",
  "named-parties",
  "owner-only",
  "platform-only",
]);

export function parseAccessPair(input: unknown): AccessPair {
  if (!input || typeof input !== "object") {
    throw new AccessParseError("access is two fields, never defaulted", input);
  }
  const row = input as Record<string, unknown>;
  const hasDiscoverability = row.discoverability != null;
  const hasEntitlement = row.entitlement != null;
  if (typeof row.accessPolicy === "string" && !hasDiscoverability && !hasEntitlement) {
    throw new AccessParseError(
      "single accessPolicy string is not two-field access",
      input,
      "ACCESS_SINGLE_FIELD",
    );
  }
  if (hasDiscoverability !== hasEntitlement) {
    throw new AccessParseError(
      "parse refuses an atom carrying one access field without the other",
      input,
    );
  }
  if (!hasDiscoverability || !hasEntitlement) {
    throw new AccessParseError("access requires discoverability and entitlement", input);
  }
  if (
    typeof row.discoverability !== "string" ||
    !DISCOVERABILITY.has(row.discoverability)
  ) {
    throw new AccessParseError("unknown discoverability", input);
  }
  if (typeof row.entitlement !== "string" || !ENTITLEMENT.has(row.entitlement)) {
    throw new AccessParseError("unknown entitlement", input);
  }
  const pair: AccessPair = {
    discoverability: row.discoverability as Discoverability,
    entitlement: row.entitlement as Entitlement,
  };
  if (row.accessPolicy != null) {
    return { ...pair, accessPolicy: row.accessPolicy as AccessPolicy };
  }
  return pair;
}

/** Map the surviving ADR-017 string until F-10 migrates the column. */
export function mapAccessPolicy(policy: AccessPolicy): AccessPair {
  switch (policy) {
    case "public-free":
      return {
        discoverability: "catalog-listed",
        entitlement: "anyone-free",
        accessPolicy: policy,
      };
    case "public-paid":
      return {
        discoverability: "catalog-listed",
        entitlement: "anyone-paid",
        accessPolicy: policy,
      };
    case "platform-internal":
      return {
        discoverability: "hidden",
        entitlement: "platform-only",
        accessPolicy: policy,
      };
    case "tenant-private":
      return {
        discoverability: "unlisted",
        entitlement: "owner-only",
        accessPolicy: policy,
      };
    case "tenant-shared":
      return {
        discoverability: "unlisted",
        entitlement: "named-parties",
        accessPolicy: policy,
      };
    default: {
      const _exhaustive: never = policy;
      throw new AccessParseError(
        `unmapped accessPolicy ${String(_exhaustive)}`,
        policy,
      );
    }
  }
}

/** Runtime export so the Factory shim check observes `AccessPair` on the module. */
export const AccessPair = Object.freeze({
  parse: parseAccessPair,
  mapPolicy: mapAccessPolicy,
});
