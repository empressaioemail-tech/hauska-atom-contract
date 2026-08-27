/**
 * Conformance fixture — Track 2.10 alias atom and lineage edges.
 */

import { parse } from "../identity/node-id.js";
import {
  parseAliasAtom,
  parseLineageEdge,
  type AliasAtom,
  type LineageEdge,
} from "../identity/alias.js";

const nodeId = parse("nid_0123456789abcdef0123456789abcdef");

export const TRACK2_ALIAS_FIXTURE: AliasAtom = parseAliasAtom({
  entityType: "identity.alias",
  aliasKey: "48021:34137",
  nodeId,
  authority: "bastrop-cad",
  validFrom: "2026-01-01T00:00:00.000Z",
  validTo: null,
  knowledgeAt: "2026-08-27T00:00:00.000Z",
});

export const TRACK2_LINEAGE_MERGED: LineageEdge = parseLineageEdge({
  kind: "mergedInto",
  from: nodeId,
  to: parse("nid_abcdef0123456789abcdef0123456789"),
});
