# Changelog

All notable changes to `@hauska/atom-contract` are documented here.

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
