# Changelog

All notable changes to `@hauska/atom-contract` are documented here.

## [1.3.0] - 2026-05-28

Adds brokerage workspace packaging contracts for Property Workspace V1.
This release is contract-only: schemas, exported types, and fixtures for
downstream engine and legacy-design-tools integration.

### Added

- `@hauska/atom-contract/workspace` subpath with Zod schemas, TS types,
  and validators for `property-workspace`, `brief-run`,
  `workspace-attachment`, and `workspace-share-edge`.
- Shared metadata schema (`did`, `createdAt`, `updatedAt`, `accessPolicy`)
  and common user-reference schema for workspace payloads.
- Validation fixtures and schema conformance tests for all four new
  contract entities.

### Consumer migration notes

- Update dependency to `@hauska/atom-contract@^1.3.0`.
- Import workspace contracts from `@hauska/atom-contract/workspace`.
- Validate outbound/inbound workspace payloads against the new schemas
  before passing entities to engine ingestion or legacy-design-tools APIs.
- Preserve the common metadata fields on all four entities. Existing
  payloads missing `did`, `createdAt`, `updatedAt`, or `accessPolicy`
  must be backfilled by consumers before validation succeeds.
- `workspace-attachment` now enforces kind-specific payload shape:
  `note` requires `body`; `link|image|pdf` require `uri`.

## [1.2.0] - 2026-05-26

Recorded private encumbrance atom types per ADR-020 and
`constraint-resolution` per ADR-021. Unblocks Cortex Phase 1
(cc-agent-C) and engine registry registration (cc-agent-E).

### Added

- `@hauska/atom-contract/encumbrances` subpath — Zod schemas, TS
  interfaces, sample fixtures, and recommended render-mode constants
  for: `recorded-instrument`, `restriction-clause`, `restriction-corpus`,
  `administrative-rule`, `constraint-resolution`.
- `ENCUMBRANCE_RENDER_MODES` / `ENCUMBRANCE_DEFAULT_RENDER_MODE` —
  documents `focus` as the default for `restriction-clause` citation
  surfaces.
- `ENCUMBRANCE_DEFAULT_ACCESS_POLICY` — atom-type defaults; all
  encumbrance payloads reject `public-free` at validation time.

### Changed

- `AccessPolicy` union gains `tenant-shared` (ADR-017; required by
  ADR-020 `restriction-corpus` and HOA packs).
- `zod@^3.24.1` added as a direct dependency (schemas only; main barrel
  unchanged).

### Consumer impact

Non-breaking for existing v1.1.0 consumers on the main import path.
Encumbrance consumers pin `^1.2.0` and import
`@hauska/atom-contract/encumbrances`. Engine atom-registry registration
is a separate `@hauska-engine/atoms` bump (cc-agent-E dispatch).

## [1.1.0] - 2026-05-19

Visibility partitioning. Wires the ADR-017 `accessPolicy` tier into
the contract so catalog and MCP surfaces can gate visibility without
inventing their own tagging scheme. Driver: the 2026-05-19 sprint's
partnership-first sourcing constraint — Smithville, Elgin, and Bastrop
County need to ingest as platform-internal until Sylvia closes
partnership, while Bastrop UDC ships public.

### Shape decision

The dispatch offered two paths: reuse the ADR-017 `accessPolicy` model
or add a fresh boolean-ish `visibility` field. **Chose ADR-017**: the
four-value union (`public-free` / `public-paid` / `platform-internal`
/ `tenant-private`) is documented, covers anticipated tenant- and
paid-tier cases without a second migration, and avoids ending up with
two overlapping concepts after ADR-017 lands properly.

### Added

- `AccessPolicy` type — the four-value ADR-017 union — exported from
  the package barrel.
- `AtomRegistration.accessPolicy?: AccessPolicy` — atom-type default
  tier. Undeclared = `"public-free"`.
- `ContextSummary.accessPolicy?: AccessPolicy` — per-instance override.
  Lets a mostly-public atom (e.g. `jurisdiction-corpus`) mark
  individual instances `"platform-internal"` until partnership closes.
  Per-instance value wins when both are present; otherwise fall back
  to the registration default, then `"public-free"`.
- `AtomPromptDescription.accessPolicy: AccessPolicy` —
  `registry.describeForPrompt()` normalizes the registration's
  undeclared field to `"public-free"` so downstream visibility filters
  can branch without nullish guards.
- `httpContextSummary` passes `accessPolicy` through from the server
  response verbatim. Absent → `undefined`, so the per-instance /
  registration / `"public-free"` fallback chain is preserved.

### Consumer impact

No breaking changes. Existing v1.0.0 consumers pin `^1.0.0` and pick
up v1.1.0 automatically. Registrations that omit `accessPolicy`
continue to behave as before; downstream surfaces that do not consult
the field are unaffected.

### Not changed

Render-mode stubs (per-mode React components) live in a sibling
package — this contract package ships the AtomMode union only, so
there are no render-mode stubs to update in this repo. The dispatch's
"flag in expanded mode for operator inspection" expectation belongs
on the eventual `<AtomShell>` consumer.

## [1.0.0] - 2026-05-18

Initial public release. M2-C extraction of the workspace-private
`@workspace/empressa-atom` framework that lived at
`legacy-design-tools/lib/empressa-atom/`.

### Added

- Atom registration contract (`AtomRegistration<TType, TSupported>`)
  with literal-narrowed `entityType` and compile-time
  `defaultMode ⊂ supportedModes` enforcement.
- Five-mode render union: `inline`, `compact`, `card`, `expanded`,
  `focus`.
- `createAtomRegistry()` with `register`, `registerAny`, `resolve`,
  `list`, `listByDomain`, `validate`, `describeForPrompt`.
- Multi-child composition declaration with `forwardRef` opt-out and
  `resolveComposition` resolver.
- `ContextSummary` four-layer shape (`prose`, `typed`, `keyMetrics`,
  `relatedAtoms`) plus `historyProvenance` and `scopeFiltered`.
- `Scope` object passed at the `contextSummary` call site
  (`audience`, `requestor`, `asOf`, `permissions`).
- `httpContextSummary` helper: fetch-backed context loader with
  scope-keyed TTL cache and `invalidate` / `clear` hooks.
- `EventAnchoringService` interface plus `PostgresEventAnchoringService`
  with deterministic SHA-256 chain hash and per-entity advisory lock.
- `wrapForStorage` / `unwrapFromStorage` no-op envelope (VDA placeholder).
- Inline reference syntax `{{atom|type|id|label}}` with
  `parseInlineReferences` and `serializeInlineReference`.
- `./testing` subpath: `createTestRegistry`, `createInMemoryEventService`,
  `runAtomContractTests`.

### Lineage

Substrate placement per doc_repo ADR-018 (atom contract substrate layer
placement and Hauska namespace, accepted 2026-05-18). Peer to
`@hauska-sdk/*` and `hauska-engine`; not part of Empressa product
surface area.

The package extracts the workspace-private framework verbatim. No
behavioral changes from the staged version; only:

- Package renamed from `@workspace/empressa-atom` to
  `@hauska/atom-contract`.
- `@workspace/db` test-time dependency dropped (consumers inject their
  own database).
- Postgres-backed integration tests refactored to the in-memory
  `createInMemoryEventService` so the package's CI is self-contained;
  postgres exercise of `PostgresEventAnchoringService` lives in
  consumer packages.
