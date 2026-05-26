# `@hauska/atom-contract`

The typed-data substrate every Hauska atom must satisfy: identity,
context interface, composition declaration, and history anchoring.
Peer to the Hauska SDK; consumed directly by every product surface
and MCP server.

This package is **framework only**. It ships the contract, the runtime
that enforces it, the schema the history layer writes into, and the
test scaffolding consumer packages use to prove their atoms comply.
Catalog atom registrations (the actual atom types — `engagement`,
`code-section`, `jurisdiction-corpus`, etc.) live in consumer packages
that depend on this one.

Hauska commercial substrate, peer to `@hauska-sdk/*` and `hauska-engine`,
per doc_repo ADR-018 (atom contract substrate layer placement). The
package has zero `@hauska-sdk/*` dependency: an MCP server or product
surface can depend on the contract without inheriting the commerce
stack.

## Install

```bash
npm install @hauska/atom-contract
# or
pnpm add @hauska/atom-contract
```

Requires Node 18.18+ and `drizzle-orm` (^0.30.0) if you intend to use
`PostgresEventAnchoringService`. Atoms that don't anchor history can
use `createInMemoryEventService()` from the `./testing` subpath.

## Public surface

```ts
import {
  createAtomRegistry,
  defaultScope,
  resolveMode,
  parseInlineReferences,
  serializeInlineReference,
  httpContextSummary,
  resolveComposition,
  PostgresEventAnchoringService,
  wrapForStorage,
  unwrapFromStorage,
  type AccessPolicy,
  type AtomRegistration,
  type AtomMode,
  type AtomReference,
  type ContextSummary,
  type Scope,
  type AtomComposition,
  type EventAnchoringService,
} from "@hauska/atom-contract";
```

Testing utilities live behind a separate subpath so production bundles
never pull them in:

```ts
import {
  createTestRegistry,
  createInMemoryEventService,
  runAtomContractTests,
} from "@hauska/atom-contract/testing";
```

## The four-layer contract

An atom registers with one structurally-typed object:

```ts
const taskAtom: AtomRegistration<"task", ["card", "compact", "expanded"]> = {
  // identity
  entityType: "task",
  domain: "sprint",

  // render-mode contract (type-level)
  supportedModes: ["card", "compact", "expanded"],
  defaultMode: "card",

  // context interface
  contextSummary: async (entityId, scope) => ({
    prose: `Task ${entityId}: ...`,
    typed: { id: entityId },
    keyMetrics: [{ label: "Status", value: "open" }],
    relatedAtoms: [],
    historyProvenance: { latestEventId: "evt-...", latestEventAt: "2026-..." },
    scopeFiltered: false,
  }),

  // composition declaration (multi-child; required field)
  composition: [
    { childEntityType: "blocker", childMode: "compact", dataKey: "blockers" },
  ],
};

const registry = createAtomRegistry();
registry.register(taskAtom);
```

Compile-time guarantees:

- `defaultMode` must be a member of `supportedModes`. Mismatched defaults
  fail to typecheck.
- `entityType` is a literal string, narrowed all the way through
  `registry.resolve("task")` so consumers see the exact type back.
- `domain` is required and queryable through `registry.listByDomain(...)`.
- `composition` is required. Pass `[]` to declare no children.

Five render modes ship as a literal union: `inline`, `compact`, `card`,
`expanded`, `focus`. Render bindings (the React `<AtomShell>`, per-mode
components, focus-store wiring) live in a separate package that
depends on this one.

## Scope at the call site

`contextSummary` always takes a second `Scope` argument:

```ts
interface Scope {
  audience: "ai" | "user" | "internal";
  requestor?: { kind: "user" | "agent"; id: string };
  asOf?: Date;
  permissions?: ReadonlyArray<string>;
}
```

Atoms that don't differentiate by scope ignore it and set
`scopeFiltered: false`. Tests use the `defaultScope()` helper.

## Composition

Composition is a multi-child declarative graph. The registry consumes
the field: `registry.validate()` walks every registration's composition
edges and reports any that point at an unregistered child entity type.
Use `resolveComposition(parent, parentRef, parentData, registry)` to
turn the declaration into a typed children list ready for render-side
iteration.

**Boot-time contract:** the application bootstrap MUST call
`registry.validate()` once after every `register()` call has run and
fail to start when the result is `{ ok: false }`. The registry does
not revalidate composition on each `register()` (the parent may
legitimately register before the child) and `resolve()` does not
recheck on lookup, so dangling cross-references would otherwise
surface only at composition-resolution time.

Composition edges may opt out of presence validation by setting
`forwardRef: true`. Forward-ref edges are skipped by both `validate()`
and `resolveComposition` while the child remains unregistered, so a
parent atom can ship a declaration that names a child slated for a
later sprint without crashing the boot.

## Access policy (visibility tier)

Atoms may declare an ADR-017 access tier. The contract performs no
enforcement; downstream surfaces (MCP `list_*`, catalog APIs) gate on
the value.

```ts
type AccessPolicy =
  | "public-free"        // unauthenticated public catalog
  | "public-paid"        // catalog-visible, entitlement-gated at fetch
  | "platform-internal"  // platform staff only; never enumerated publicly
  | "tenant-private"     // owning tenant only
  | "tenant-shared";     // explicit cross-tenant share (ADR-017)
```

The field appears in two places:

- `AtomRegistration.accessPolicy?` — atom-type default. Useful when the
  entire type is internal (e.g. an audit atom).
- `ContextSummary.accessPolicy?` — per-instance value. Lets a
  mostly-public atom mark individual instances internal — for example,
  a public `jurisdiction-corpus` catalog where partnership-pending
  jurisdictions are tagged `"platform-internal"` until partnership
  closes.

Resolution: per-instance `ContextSummary.accessPolicy` wins when
present, otherwise fall back to the registration's `accessPolicy`,
otherwise treat the atom as `"public-free"`. The prompt-builder
catalog (`registry.describeForPrompt()`) normalizes the registration
value to `"public-free"` when undeclared so downstream filters branch
without nullish guards.

## History (`EventAnchoringService`)

Every atom mutation flows through `EventAnchoringService.appendEvent`,
which writes one row to an `atom_events` table. The shipped
`PostgresEventAnchoringService` writes a deterministic SHA-256 chain
hash. `prevHash` links each event to the previous event for the same
`(entityType, entityId)` pair, producing a per-entity hash chain.

**Interface-stable / implementation-evolving.** The
`EventAnchoringService` interface is the contract. The deterministic
SHA-256 implementation will be replaced with a real cryptographic
anchor (Merkle root + external ledger anchor) at a later milestone
without changing the consumer interface. Mark sites that should be
revisited carry `TODO(M2-C):` markers.

The host project owns the `atom_events` schema (table, columns,
constraints). This library issues raw SQL against the agreed table name
only and depends on `drizzle-orm`'s `sql` helper for SQL templating.

## VDA wrapping (no-op today)

`wrapForStorage(value)` returns
`{ envelope: { version: 1, vdaApplied: false }, payload: value }` and
`unwrapFromStorage(stored)` returns `stored.payload`. Consumers call
these from their write paths today; the no-op becomes a real envelope
(version chain + tombstone semantics) at a later milestone without
consumer changes.

## Inline reference syntax

The chat layer embeds atoms in prose using `{{atom|type|id|label}}`:

```ts
parseInlineReferences("see {{atom|task|t1|Pick HVAC}}");
// -> [
//   { kind: "text", text: "see " },
//   { kind: "atom", reference: { kind: "atom", entityType: "task", entityId: "t1", displayLabel: "Pick HVAC" }, raw: "{{atom|task|t1|Pick HVAC}}" }
// ]
```

The delimiter is `|`. The previous shape used `:` and could not
represent Spec 51 entityIds that themselves contain `:` (e.g.
`parcel-briefing:{parcelId}:{intentHash}`). The old shape is no longer
parsed: there is no dual-parse compatibility path.

## Encumbrance atom types (ADR-020 / ADR-021)

Private recorded land-use instruments ship as Zod-validated payloads on
the `./encumbrances` subpath (v1.2.0+). Types are **never**
`public-free`; schemas accept only `tenant-private` and
`tenant-shared`.

```ts
import {
  RECORDED_INSTRUMENT_SCHEMA,
  RESTRICTION_CLAUSE_SCHEMA,
  ENCUMBRANCE_RENDER_MODES,
  SAMPLE_RECORDED_INSTRUMENT,
} from "@hauska/atom-contract/encumbrances";
```

| `entityType` | Purpose | Recommended render modes |
|---|---|---|
| `recorded-instrument` | Parent instrument; wet PDF via `sourceDocumentCid` | `card`, `compact`, `expanded` |
| `restriction-clause` | Enforceable snippet; plan-review citation target | `inline` … `focus` (**default `focus`**) |
| `restriction-corpus` | Subdivision CC&R pack | `card`, `expanded` |
| `administrative-rule` | Unrecorded HOA guidelines (`legalWeight: advisory`) | `inline`, `compact`, `card`, `expanded` |
| `constraint-resolution` | Effective constraint lattice (ADR-021) | `card`, `expanded` |

Engine `AtomRegistration` literals and ingest producers belong in
`hauska-engine/packages/atoms/` (cc-agent-E); Cortex Phase 1 may
validate uploads with these schemas before the engine registry lands.

## Testing utilities

Consumer packages import the contract test suite to prove their
registration is well-formed in one function call:

```ts
import { describe } from "vitest";
import { runAtomContractTests } from "@hauska/atom-contract/testing";
import { taskAtom } from "./task.reg";

describe("task atom contract", () => {
  runAtomContractTests(taskAtom, {
    withFixture: { entityId: "t1", setUp: seedTestData },
    alsoRegister: [/* any composition children */],
  });
});
```

The suite asserts:

1. identity is present and `entityType` is non-empty,
2. `defaultMode` is in `supportedModes`,
3. `contextSummary` returns a valid four-layer shape with
   `historyProvenance` and `scopeFiltered`,
4. every composition edge resolves against `alsoRegister + this`,
5. inline-reference round-trips for an instance of this atom.

`createInMemoryEventService()` provides an in-memory
`EventAnchoringService` for unit tests that don't need Postgres;
`createTestRegistry(initial)` is a convenience over
`createAtomRegistry()`.

## What this package does NOT ship

- **Catalog atom registrations.** No `engagement.atom.ts`,
  `code-section.atom.ts`, etc. Catalog atoms live in consumer packages
  (`hauska-engine/packages/atoms/`, product api-servers, etc.) that
  depend on this one. The line: this package owns the registration
  *mechanism* and the contract; consumers own the per-atom *instances*.
- **React rendering layer.** Type-level render-mode contract only. The
  `<AtomRenderer>`, `<AtomShell>`, per-mode components, focus-store
  wiring, and right-panel state machine all ship in a later sibling
  package.
- **Cryptographic anchoring of `atom_events`.** `chainHash` is
  deterministic SHA-256 today; Merkle root + external anchor land in a
  later milestone.
- **Real VDA backing.** `wrapForStorage` / `unwrapFromStorage` are
  no-ops; the real envelope, version chain, and tombstone semantics
  land in a later milestone.

## Lineage

This package extracts the workspace-private `@workspace/empressa-atom`
that lived at `legacy-design-tools/lib/empressa-atom/`. The framework
is preserved verbatim; only the package name and the `@workspace/db`
test-time dependency changed.

## License

See LICENSE.
