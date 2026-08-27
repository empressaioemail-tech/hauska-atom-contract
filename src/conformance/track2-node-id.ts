/**
 * Conformance fixture — Track 2.1 branded NodeId.
 */

import { mint, parse, type NodeId } from "../identity/node-id.js";

export const TRACK2_NODE_ID_FIXTURE: NodeId = parse(
  "nid_0123456789abcdef0123456789abcdef",
);

export function track2NodeIdRoundTrip(): NodeId {
  return parse(String(mint()));
}
