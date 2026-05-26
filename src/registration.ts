/**
 * Atom registration contract.
 *
 * An {@link AtomRegistration} declares the four-layer contract that every
 * Hauska atom must satisfy: identity, context interface, composition
 * declaration, and history anchoring. The registration is **server-safe**:
 * it carries no React types so the registry can be used from the AI context
 * pipeline as well as the FE renderer.
 *
 * Render bindings (the React `<AtomShell>`, per-mode components, focus
 * store wiring) live in a separate package that depends on this one — not
 * the other way around. See README §"What this package does NOT ship".
 */

import type { AtomComposition } from "./composition.js";
import type { ContextSummary } from "./context.js";
import type { Scope } from "./scope.js";

/**
 * The five render modes declared by the contract. This package ships these
 * as a type-only contract; the React binding for each mode lands in a
 * sibling package.
 */
export type AtomMode =
  | "inline"
  | "compact"
  | "card"
  | "expanded"
  | "focus";

/**
 * Atom access tier per ADR-017. Drives catalog visibility and surface-level
 * gating at the MCP / API boundary.
 *
 * - `public-free`     — visible in the unauthenticated public catalog.
 * - `public-paid`     — visible in the catalog; entitlement-gated at fetch.
 * - `platform-internal` — visible to platform staff only; never enumerated
 *   to public clients. Used for partnership-pending data that has been
 *   ingested but is not yet sanctioned for public surfacing.
 * - `tenant-private`  — visible only to the owning tenant.
 * - `tenant-shared`   — shared between explicit tenants (cross-tenant
 *   benchmarking opt-in per ADR-017; encumbrance corpora, HOA packs).
 *
 * An atom that omits the field is treated as `"public-free"` by surfaces
 * that gate on visibility. The contract itself performs no enforcement;
 * downstream filters (MCP `list_*`, catalog APIs) honor the tag.
 *
 * The field may appear on:
 *   - {@link AtomRegistration.accessPolicy} — atom-type default; useful
 *     when an entire atom type is platform-internal (e.g. an audit atom).
 *   - {@link ContextSummary.accessPolicy} — per-instance value; lets a
 *     mostly-public atom mark individual instances internal (the
 *     partnership-pending jurisdiction case). When both are present the
 *     instance value wins.
 */
export type AccessPolicy =
  | "public-free"
  | "public-paid"
  | "platform-internal"
  | "tenant-private"
  | "tenant-shared";

/**
 * Stable reference to a single atom instance. The {@link displayLabel} is
 * populated by {@link parseInlineReferences} from the third token of
 * `{{atom|type|id|label}}`; downstream code should treat the label as
 * presentation-only and never use it for identity.
 */
export interface AtomReference {
  kind: "atom";
  entityType: string;
  entityId: string;
  mode?: AtomMode;
  /**
   * Inline-prose display label. Single source of truth for the chip text.
   */
  displayLabel?: string;
}

/**
 * Headless atom props passed to render bindings (lives in a sibling
 * package). Declared here so the registration's render-mode contract is
 * complete, but free of React imports.
 */
export interface AtomProps {
  entityId: string;
  mode: AtomMode;
  data?: Record<string, unknown>;
  onAction?: (message: string) => void;
  onModeChange?: (mode: AtomMode) => void;
  onDrillIn?: (atom: AtomReference) => void;
}

/**
 * Optional chip action surfaced by the render layer when an atom appears
 * in inline prose. Generated from the underlying data, never persisted.
 */
export interface ChipAction {
  id: string;
  label: string;
  /** Free-form prompt fragment the chat will send when the chip is clicked. */
  message: string;
}

/**
 * Type-level helper that constrains `defaultMode` to a member of
 * `supportedModes`. Used as the `defaultMode` field type so registrations
 * with a mismatched default fail to typecheck.
 */
export type DefaultModeOf<TSupported extends ReadonlyArray<AtomMode>> =
  TSupported[number];

/**
 * Type-level guard rejecting widened (non-literal) string types. When
 * `T = string` (i.e. callers passed a non-literal), `string extends T` is
 * `true` and this resolves to `never`, which makes the surrounding field
 * un-assignable. When `T = "task"` (a literal), it resolves to `T`.
 *
 * Used to enforce: every registration must have a literal `entityType` so
 * the registry can narrow the resolved type.
 */
export type LiteralString<T extends string> = string extends T ? never : T;

/**
 * The four-layer atom contract. Generic in `TType` (a literal string) so
 * the resolver can narrow the entity type at the call site. Preserves a
 * compile-time union of registered types.
 *
 * @typeParam TType - Literal string type identifying the atom (e.g. `"task"`).
 * @typeParam TSupported - Tuple of supported render modes; constrains
 *   `defaultMode` at compile time.
 */
export interface AtomRegistration<
  TType extends string = string,
  TSupported extends ReadonlyArray<AtomMode> = ReadonlyArray<AtomMode>,
> {
  /**
   * Stable atom identity. The literal-only constraint is enforced at the
   * {@link AtomRegistry.register} entry point (via {@link LiteralString})
   * rather than on the type itself, so heterogeneous storage shapes
   * (`AnyAtomRegistration`) and stub builders can carry plain `TType`
   * without fighting the type system.
   */
  entityType: TType;

  /**
   * Required, queryable. Atoms are grouped by domain for prompt-builder
   * derivation (`registry.describeForPrompt()`) and for `listByDomain()`.
   */
  domain: string;

  /** Modes the future render binding will implement. */
  supportedModes: TSupported;

  /**
   * Default mode used when the caller does not specify one. The type
   * constraint forces this to be a member of `supportedModes` —
   * registrations with a mismatched default fail to typecheck.
   */
  defaultMode: DefaultModeOf<TSupported>;

  /**
   * Optional chip-action generator invoked by the render layer when the
   * atom appears as an inline chip.
   */
  chipActions?: (data: Record<string, unknown>) => ChipAction[];

  /**
   * The four-layer context resolver. Receives the entity id and a
   * {@link Scope} object; returns a typed payload (never a bare string).
   * Atoms that don't differentiate by scope can ignore the second arg.
   */
  contextSummary: (
    entityId: string,
    scope: Scope,
  ) => Promise<ContextSummary<TType>>;

  /**
   * Declarative composition graph. Pass an empty array (`[]`) to declare
   * "no children" — the field is **required** so a registration cannot
   * silently omit the composition layer of the four-layer contract.
   * The registry validates referenced child types at `validate()` and on
   * first lookup.
   */
  composition: ReadonlyArray<AtomComposition>;

  /**
   * Atom-type default access tier per ADR-017. Surfaces that gate on
   * visibility (MCP `list_*`, public catalog APIs) treat an omitted field
   * as `"public-free"`. Per-instance overrides flow through
   * {@link ContextSummary.accessPolicy}; when both are present the
   * instance value wins.
   *
   * @see {@link AccessPolicy} for the value semantics.
   */
  accessPolicy?: AccessPolicy;

  /**
   * Optional, machine-readable list of event-type strings this atom is
   * allowed to emit (and that downstream consumers — audit logs, history
   * filters, contract tests, catalog surfaces — can rely on to be the
   * canonical vocabulary for the atom).
   *
   * The registry does **not** enforce that producers call
   * {@link EventAnchoringService.appendEvent} with one of these strings;
   * the framework treats the field as documentation that the registry
   * exposes through {@link AtomPromptDescription.eventTypes} so tooling
   * can introspect it without sniffing source files. Atoms that don't
   * emit events may omit the field — the catalog surface treats a
   * missing field as "no declared events" (empty array).
   *
   * Convention: dotted names namespaced by `entityType` (e.g.
   * `"sheet.created"`, `"snapshot.referenced-in-submission"`). Producers
   * should reference the same constant the registration carries so a
   * rename surfaces as a typecheck failure.
   */
  eventTypes?: ReadonlyArray<string>;
}

/**
 * Convenience alias for a registration whose render-mode tuple is
 * forgotten — useful for storage in heterogeneous collections (the
 * registry's `Map`). Loses the `defaultMode ⊂ supportedModes` constraint
 * so should not be used as a parameter type for `register(...)`.
 */
export type AnyAtomRegistration = AtomRegistration<
  string,
  ReadonlyArray<AtomMode>
>;
