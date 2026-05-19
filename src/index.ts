/**
 * Public surface of `@hauska/atom-contract`.
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
