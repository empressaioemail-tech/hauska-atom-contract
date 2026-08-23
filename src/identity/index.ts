/**
 * Opaque node identity (`NodeId`) — mint/parse only constructors.
 *
 * Import from `@empressaio/atom-contract/identity`.
 */

export {
  NODE_ID_PATTERN,
  NodeIdParseError,
  bindNodeIdForWrite,
  isNodeId,
  mint,
  nodeIdToString,
  parse,
  type NodeId,
} from "./node-id.js";
