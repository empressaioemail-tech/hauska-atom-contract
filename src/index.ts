/**
 * Public surface of `@empressaio/atom-contract`.
 *
 * The barrel re-exports every primitive but never anything from
 * `src/testing/` — testing utilities live behind the `./testing` subpath
 * so production bundles never pull them in.
 *
 * See `README.md` for the contract walk-through and the
 * "What this package does NOT ship" deferred-surface list.
 */

export type {
  AccessPolicy,
  AtomMode,
  AtomReference,
  AtomProps,
  ChipAction,
  AtomRegistration,
  AnyAtomRegistration,
  DefaultModeOf,
} from "./registration.js";

export type { Scope } from "./scope.js";
export { defaultScope } from "./scope.js";

export type {
  ContextSummary,
  KeyMetric,
  HistoryProvenance,
  HttpContextSummaryOptions,
  HttpContextSummaryHandle,
} from "./context.js";
export { httpContextSummary } from "./context.js";

export type {
  AtomComposition,
  ResolvedChild,
  CompositionRegistryView,
} from "./composition.js";
export { resolveComposition } from "./composition.js";

export {
  FALLBACK_ORDER,
  resolveMode,
} from "./render.js";

export type {
  ParsedSegment,
  ParsedTextSegment,
  ParsedAtomSegment,
} from "./inline-reference.js";
export {
  INLINE_ATOM_REGEX,
  parseInlineReferences,
  serializeInlineReference,
} from "./inline-reference.js";

export type {
  EventActor,
  AppendEventInput,
  AtomEvent,
  ReadHistoryOptions,
  EventAnchoringService,
  DrizzleLikeDb,
} from "./history.js";
export { PostgresEventAnchoringService } from "./history.js";

export type { VdaEnvelope, WrappedValue } from "./vda.js";
export { wrapForStorage, unwrapFromStorage } from "./vda.js";

export type {
  AtomRegistry,
  ResolveResult,
  ValidateResult,
  DanglingCompositionRef,
  AtomPromptDescription,
} from "./registry.js";
export { createAtomRegistry, AtomNotRegisteredError } from "./registry.js";

export type {
  ObligationAtomInstance,
  ObligationType,
  ObligationStatus,
} from "./obligation.js";
export {
  OBLIGATION_SCHEMA,
  OBLIGATION_TYPES,
  OBLIGATION_STATUSES,
  LICENSE_OBLIGATION_TYPES,
} from "./obligation.js";

export type {
  AtomInputRef,
  AtomInputRefRole,
  ReasoningChain,
} from "./reasoning-chain.js";
export {
  ATOM_INPUT_REF_ROLES,
  ATOM_INPUT_REF_SCHEMA,
  REASONING_CHAIN_SCHEMA,
  REASONING_CHAIN_OBSERVED_SCHEMA,
  REASONING_CHAIN_DERIVED_SCHEMA,
  createReasoningChain,
  validateReasoningChain,
} from "./reasoning-chain.js";

export type {
  ActorRecordAtomInstance,
  ActorLicensingTerms,
  ActorType,
  ActorTrustLevel,
  OrganizationTenantKind,
} from "./actor-record.js";
export {
  ACTOR_RECORD_SCHEMA,
  ACTOR_LICENSING_TERMS_SCHEMA,
  ACTOR_TYPES,
  ACTOR_TRUST_LEVELS,
  ORGANIZATION_TENANT_KINDS,
  ICC_ACTOR_RECORD_FIXTURE,
  createActorRecord,
} from "./actor-record.js";

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
} from "./identity/node-id.js";

export {
  LINEAGE_NODE_COLUMNS,
  AliasAtom,
  AliasParseError,
  LineageParseError,
  acceptNodeWithoutLineage,
  parseAliasAtom,
  parseAliasKey,
  parseLineageEdge,
} from "./identity/alias.js";

export {
  PROVENANCE_CLASSES,
  ProvenanceClass,
  ProvenanceParseError,
  parseProvenance,
} from "./provenance/provenance-class.js";
