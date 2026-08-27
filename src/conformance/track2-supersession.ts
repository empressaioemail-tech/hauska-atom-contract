/**
 * Conformance fixture — Track 2.8 supersession edge.
 */

import { parse } from "../identity/node-id.js";
import {
  parseSupersessionEdge,
  type SupersessionEdge,
} from "../lineage/supersession.js";

export const TRACK2_SUPERSESSION_FIXTURE: SupersessionEdge = parseSupersessionEdge({
  link_type: "SUPERSEDED_BY",
  from: parse("nid_0123456789abcdef0123456789abcdef"),
  to: parse("nid_abcdef0123456789abcdef0123456789"),
  closedAt: "2026-08-27T15:00:00.000Z",
});
