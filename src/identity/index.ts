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
