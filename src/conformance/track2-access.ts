/**
 * Conformance fixture — Track 2.12 two-field access.
 */

import { parseAccessPair, type AccessPair } from "../access/access-pair.js";

export const TRACK2_ACCESS_FIXTURE: AccessPair = parseAccessPair({
  discoverability: "catalog-listed",
  entitlement: "anyone-free",
  accessPolicy: "public-free",
});
