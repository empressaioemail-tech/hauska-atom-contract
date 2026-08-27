/**
 * Opaque node identity (`NodeId`) — mint/parse only constructors.
 *
 * Import from `@empressaio/atom-contract/identity`.
 */

export {
  COUNTY_PROP_ALIAS_KEY,
  NODE_ID_PATTERN,
  NodeId,
  NodeIdParseError,
  bindNodeIdForWrite,
  isCountyPropAliasKey,
  isNodeId,
  mint,
  nodeIdToString,
  parse,
} from "./node-id.js";

export {
  LINEAGE_NODE_COLUMNS,
  AliasAtom,
  AliasParseError,
  LineageParseError,
  acceptNodeWithoutLineage,
  parseAliasAtom,
  parseAliasKey,
  parseLineageEdge,
} from "./alias.js";
