# Changelog

All notable changes to `@empressaio/atom-contract` (formerly `@hauska/atom-contract`) are documented here.

## [1.12.0] - 2026-08-05

Additive minor — building footprint and utility easement site-layer atoms (ADR-029 / T3).

### Added

- **`building-footprint`** on `./property` — observed improvement geometry atom
  (`reasoningKind: observed`); `sourceTier: cad-authoritative | ml-derived | absent`;
  GeoJSON `Polygon`/`MultiPolygon`; hybrid honest absence (county-coverage
  `verifiedAbsence` row + per-parcel `no-footprint-feature`); ml-derived tier
  mandatory `public-free` + ODC-By in `sourceCitation` (master ruling 2026-08-05).
- **`utility-easement`** on `./property` — observed GIS easement geometry;
  `easementClass`, `sourceTier: plat-gis-authoritative | county-gis |
  record-extracted | absent`; uniform `public-free`; optional `linkedInstrumentDid`
  bridge to ADR-020.
- Shared site-layer helpers: `SITE_LAYER_VERIFIED_ABSENCE_SCHEMA`,
  `countyCoverageParcelNodeId`, GeoJSON geometry schemas, Bastrop T3 fixtures.
- `PROPERTY_CONFORMANCE_TARGET_VERSION = "1.12.0"`.

### Explicitly NOT in 1.12.0

- ADR-021 `utility-easement` resolver basis enum (deferred post-registration pilot).
- ADR-012 renderer `focus` mode obligation (deferred post-pilot).

## [1.11.0] - 2026-07-25

Additive minor — road spine node atom (27c WDLL 3 / depth-engine R1).

### Added

- **`road-node`** on `./property` — first-class road spine node with stable
  `{county_fips}:road:{osm_way_id}` identity, OSM centerline, assumed-per-class
  ROW edges, classification, approximate ROW provenance, and digital-twin-ready
  `attachPoints` (infra slots only; no non-road atoms in scope).
- `ROAD_NODE_ID_PATTERN`, `roadNodeIdFromParts`, `BASTROP_SPRING_STREET_ROAD_FIXTURE`.
- `road_` registered in temporal `NodeTypePrefix`.

## [1.10.0] - 2026-07-23

Additive minor — parcel terrain-export derived atom (IFC + CAD formats).
Consumers on `^1.9.0` stay green until they import the new kind.

### Added

- **`parcel-terrain-model`** on `./property` — derived {@link ReasoningChain}
  with `derivationMethod: "parcel-terrain-mesh-ifc-v1"`; DEM/topo as
  `reference-field` input (`citationLabel: usgs-3dep-dem`); format-keyed
  `artifacts` map (`glb` | `ifc` | `dxf-3dface` | `dxf-contour` |
  `landxml-tin`); coverage + asserted {@link WidthedConfidence}; default
  `accessPolicy: public-paid`. One atom, not four — callers select format.
- Fixture `BASTROP_TERRAIN_EXPORT_FIXTURE` for parcel `48021:27303` with
  shared triangulation counts across face formats; LandXML marked
  honest-deferred.
- `PROPERTY_CONFORMANCE_TARGET_VERSION = "1.10.0"`.

### Explicitly NOT in 1.10.0

- Spine authoring / MCP metering (engine + gate program phases).
- LandXML TIN emitter runtime (may ship later; contract allows deferred).

## [1.9.0] - 2026-07-23

Additive minor — property reasoning atom kinds (master WDLL 3.2–3.6).
Consumers on `^1.8.0` stay green until they import `./property`.

### Added

- **`./property` subpath** — three data-tier atom kinds for the parcel
  reasoning chain:
  - **`zoning-fact`** — observed {@link ReasoningChain}; district value OR
    honest-absence (`absence: { kind: "no-zoning-stamp", reason }`);
    explicit `accessPolicy` (default `public-free`); `sourceCitation` +
    `extractedAt`; optional {@link ReasoningReadContract} asserted snapshot
    at write (calibrated axis resolves at READ via overlay — I-E).
  - **`setback-rule`** — observed rule scalars (`front`/`side`/`rear`);
    typed `sourceCodeAtomRef: AtomInputRef` (role `rule`|`fact`, NOT bare
    string); optional `fieldProvenance` map consuming setback JSON
    `atom_did` + per-field confidence; `matchBasis: exact|prefix|fallback`
    with honest-absence required on fallback; ICC royalties via separate
    {@link ObligationAtomInstance} rows (no SourceAttribution type).
  - **`buildable-envelope`** — derived {@link ReasoningChain} with
    `derivationMethod: "buildable-envelope-inset-v1"`; `inputAtomRefs` to
    zoning-fact + setback-rule + geometry/front-edge reference-fields;
    {@link PropertyConsequence} `not-applicable` for envelope; no
    `labeling x district` multiply field.
- Central-TX conformance fixtures with named parcel ids (`48209:156346`,
  `48029:410119`, `48091:123456`, etc.).
- Negative fixtures: bare-string setback citation fails; derived without
  `inputAtomRefs` fails.
- `PROPERTY_CONFORMANCE_TARGET_VERSION = "1.9.0"` in `./conformance`.

### Explicitly NOT in 1.9.0

- Standalone `SourceAttribution` module or parallel source-obligation type.
- Gate inbound-meter runtime wiring (Phase 1d).
- StoragePort / spine atom write path (Phase 3.1).

### Consumer migration notes

- Pin `@empressaio/atom-contract@^1.9.0` when adopting property atom kinds.
- Import from `@empressaio/atom-contract/property` (re-exports 1.8.0
  primitives: ReasoningChain, AtomInputRef, PropertyConsequence,
  ReasoningReadContract, ActorRecord, ObligationAtomInstance).
- **Calibrated confidence at READ:** instance snapshots MAY carry placeholder
  `calibratedConfidence` with `provenance: "asserted"` at write time; at READ
  the calibrated axis resolves through the calibration overlay (migration 0037),
  not a frozen multiply.

## [1.8.0] - 2026-07-23

Additive minor — reasoning-chain primitive, property consequence axes,
ADR-015 `actor-record`, and license royalty obligation types. Consumers on
`^1.7.0` stay green until they import the new exports. `./og`, `./encumbrances`,
`./temporal`, and existing `ThreeAxisConfidence.consequence` requiredness are
unchanged.

### Added

- **Core reasoning-chain primitive** (`src/reasoning-chain.ts`, `./reasoning` subpath):
  - `AtomInputRef` with roles `fact` | `rule` | `derived` | `reference-field`.
  - Discriminated `ReasoningChain`: `observed` | `derived` (requires
    `derivationMethod` + `inputAtomRefs` min length 1).
  - Zod schemas with refine mirroring O&G production-timeseries derived idiom.
  - Typed `inputAtomRefs` express the `derives-from` semantic edge at the
    contract level; O&G `derivesFromStreamDid` unchanged.
- **Property reasoning read-contract axes** (`src/read-contract/reasoning-axes.ts`):
  - `PropertyConsequence`: honest `property-risk` stratum OR explicit
    `not-applicable` — never stuffed ASCE7/IBC values.
  - `ReasoningThreeAxisConfidence` + `ReasoningReadContract` for property /
    envelope emitters; life-safety surfaces keep `ReadContract` +
    `ThreeAxisConfidence`.
- **ADR-015 `actor-record`** (`src/actor-record.ts`):
  - `ActorRecordAtomInstance` — typed target for `ObligationAtomInstance.owedToActorDid`.
  - `ActorLicensingTerms` on `tenantKind: "licensed-source"` organizations.
  - `ICC_ACTOR_RECORD_FIXTURE` (`did:hauska:actor:org:icc`).
- **Additive `ObligationType` variants** for licensed-source royalties:
  - `license-reference-royalty` (inbound per-reference meter, I-K).
  - `license-revenue-share` (outbound sale cut).
  - Zod refine: license types require non-empty `owedToActorDid`; O&G types
    unchanged (optional).
  - `ICC_LICENSE_REFERENCE_OBLIGATION_FIXTURE` reuses shipped
    `ObligationAtomInstance` shape with `graceTerms: "pending-rate"`.
- `REASONING_CONFORMANCE_TARGET_VERSION = "1.8.0"` in `./conformance`
  (distinct from `ATOM_CONFORMANCE_TARGET_VERSION` at `1.5.0`).

### Explicitly NOT in 1.8.0

- Property fact/rule/derived **kinds** (Phase 1b, after StoragePort).
- Standalone `SourceAttribution` module or parallel source-obligation type.
- Gate inbound-meter runtime wiring (Phase 1d).

### Consumer migration notes

- Pin `@empressaio/atom-contract@^1.8.0` when adopting reasoning-chain or
  actor-record surfaces.
- Import reasoning primitives from the main barrel or `@empressaio/atom-contract/reasoning`.
- Property Phase 1b emitters should use `ReasoningReadContract`; ICC /
  life-safety code-risk surfaces keep `ReadContract`.
- ICC inbound royalties: mint `ObligationAtomInstance` with
  `obligationType: "license-reference-royalty"` and `owedToActorDid` pointing
  at the licensed-source `actor-record`; rates read from
  `actor-record.sourceLicensing`.

## [1.7.0] - 2026-07-06

O&G ontology module (ADR-025) and package rename to Empressa branding. Additive
minor — no changes to existing unions, required fields, or exports. Consumers on
`^1.6` are unaffected until they import `./og` or adopt the new package name.

### Added

- `@empressaio/atom-contract/og` subpath — O&G atom types per ADR-025:
  - **Asset spine (operations lens):** `well`, `wellbore`, `completion`, `zone`,
    `pad` with node prefixes `well_`, `wbore_`, `cmpl_`, `zone_`, `pad_`.
    Legible-DID exception: `well_<api14>` embeds API-14 identity rather than
    hashing.
  - **Production:** `production-timeseries` (`prodts_` prefix) models the
    reporting split (Texas oil at RRC lease level, gas at well level). Public
    regulatory streams are `public-free`; operator telemetry streams are
    `tenant-private`. `equipment-state` (`equip_` prefix) is operator-overlay
    data (`tenant-private` by default).
  - **Land leg:** `mineral-lease` (`mlease_` prefix), `rrc-lease` (`rrclease_`
    prefix with legible DID `rrclease_<district>-<leaseNo>`), `tract`
    (`tract_<county>-<abstract>` where abstract-keyed), `ownership-interest`
    (`intr_` prefix, discriminated type with `interestType` field). Reconciles
    with ADR-020: `mineral-lease.evidencedByInstrumentDids` links to
    `recorded-instrument` atoms.
  - **Revenue allocation (C1b, Herbert review applied 2026-07-06):**
    `revenue-allocation-unit` (`unit_` prefix) — first-class object with two
    source adapters (pooled-unit from recorded instruments, allocation-well
    from RRC plat), discriminated by `basis` field. Tract participations carry
    operator-asserted factors tagged with `allocationMethod` (stated-fraction,
    acreage, lateral-length, take-points, acre-feet, oil-in-place, other) and
    source — schema enforces no bare factors without method + source. Pooled
    units carry sourceInstrumentDids, ratificationInstrumentDids, and per-tract
    ratificationGaps (Opiela evidentiary pattern). Allocation wells carry
    sourcePlatCid with per-tract take points and productive lateral footage.
    DOI is derived (engine run); obtained operator DOIs linked by
    `reconciles-with` edge.
  - Zod schemas, TypeScript interfaces, sample fixtures, and recommended
    render-mode/access-policy constants for all twelve types.
- **Core `obligation` type** (ships in main contract module, not `./og`):
  domain-neutral from birth (Mox and O&G consume the same shape). Node prefix
  `oblg_` registers with core prefix set. Status is engine-derived, never
  hand-asserted; each derivation is a `procedure-execution` atom (ADR-013).
  `./og` re-exports `obligation` for convenience.
- **Additive INSTRUMENT_TYPES extension** in `./encumbrances`: `oil-gas-lease`,
  `mineral-deed`, `assignment`, `division-order` added to the ADR-020 union;
  **recorded unit family (C1b)** added: `unit-designation`,
  `declaration-of-pooling`, `ratification-of-unit`,
  `amendment-of-unit-designation`, `release-of-unit`. Per ADR-025
  reconciliation: the recorded mineral lease instrument is a
  `recorded-instrument`, not a new recording type. Ratifications are
  load-bearing (pooling often not binding until ratified).
- **Link vocabulary extension (C1b):** `reconciles-with` semantic edge
  documented in `./og/common.ts` — links computed DOI decimals to obtained
  operator DOI / signed division orders. Discrepancies surface as disputes,
  never silent overwrites. Per ADR-025 Herbert review: "The DOI is derived,
  never source."

### Changed

- **Package renamed:** `@hauska/atom-contract` → `@empressaio/atom-contract`.
  Branding decision per `_decisions/2026-07-06_branding_hauska_sdk_only.md`.
  Existing `@hauska/atom-contract@^1.6` consumers stay green on the old name;
  consumers adopt 1.7.0 by changing the package name alongside the version bump
  they already need to import `./og`.
- README title and branding updated to Empressa throughout.

### Consumer migration notes

- Pin `@empressaio/atom-contract@^1.7.0` and change package name in dependencies
  when adopting O&G types.
- Import O&G contracts from `@empressaio/atom-contract/og`; main barrel and
  other subpaths unchanged.
- `obligation` is exported from the main barrel (`@empressaio/atom-contract`)
  as a core type; `./og` re-exports it for O&G consumers' convenience.
- Every O&G atom carries `WidthedConfidence`, `sourceCitation`, `extractedAt`,
  `asOf?`, and `accessPolicy` per ADR-025's quality-gate discipline. At
  activation the entire domain is uncalibrated (`provenance: "asserted"`).
- No publish to npm is included in this release; publish is staged for operator
  manual execution.

## [1.6.1] - 2026-07-05

Restores git provenance for the conformance + export modules (shipped in the
1.5.0 tarball but untracked in git until PR #3); carries the 1.6.0
anticipatory-atom / would_affect / evt_ features. No API changes versus the
1.5.0 tarball plus 1.6.0 temporal additions; provenance-only republish so
published tree equals git HEAD.

## [1.6.0] - 2026-06-30

Temporal-Context Engine substrate (anticipatory atoms, would_affect edges,
evt_ node prefix). Additive release — no changes to `accessPolicy` or other
existing unions.

### Added

- `@hauska/atom-contract/temporal` subpath:
  - **Anticipatory event atoms** — `claim_type` prefix `anticipatory.<kind>`
    (open sub-kind; unknown kinds fall back to base event-family behavior).
    `valid_from` MAY be in the future (only atom type where this is
    semantically correct). New deposits require `confidence.basis: "asserted"`.
    `warnFutureValidFromOnNonAnticipatory()` flags future `valid_from` on
    other claim types as a data-quality warning.
  - **`WouldAffectEdge`** — structural `would_affect` edge from `evt_`
    source to subject node (`parcel_`, `jurisdiction_`, etc.) with required
    ISO 8601 `effectiveDate` and `immutable: true` discriminant. Effect
    probability is not on this edge (derived atom, re-estimated over time).
  - **`evt_` node-type prefix** — added to `NodeTypePrefix` registry.
    `deriveEvtNodeId(source, externalId)` and `validateEvtNodeAnchor()`
    enforce stable-ID discipline; unanchored manual IDs are rejected.
  - **Interval query helpers** — `isAtomVisibleAtAsOf()` /
    `filterAtomsForAsOf()` with explicit `includeAnticipatory` opt-in so
    future-dated anticipatory atoms are not silently excluded.

### Consumer migration notes

- Pin `@hauska/atom-contract@^1.6.0` when adopting TCE types (cc-agent-C,
  cc-agent-E co-bump window).
- Import from `@hauska/atom-contract/temporal`; main barrel unchanged.

## [1.5.0] - 2026-06-21

Calibrated Spine Wave 2 — migrate legacy scalar confidence on
`./encumbrances` and `./workspace` subpaths to `WidthedConfidence`.

### Changed (breaking on subpaths)

- `./encumbrances` `QUALITY_GATE_FIELDS.confidence` — `number` →
  `WidthedConfidence` (Zod: `WIDTHED_CONFIDENCE_SCHEMA`).
- `./encumbrances` atom instances (`restriction-clause`,
  `administrative-rule`) and `constraint-resolution.rules[].confidence`
  — same widthed shape; bare scalars fail schema validation.
- `./workspace` `BriefRun.confidence` — `number` → `WidthedConfidence`.

### Added

- `createEncumbranceQualityConfidence()` — asserted quality-gate helper
  for encumbrance extract deposits (`n: 0`, `intervalWidth: 1`,
  `provenance: "asserted"`).
- `createBriefRunAssertedConfidence()` — same pattern for brief-run
  deposits.
- Schema tests rejecting bare scalar confidence on encumbrance and
  brief-run payloads.

### Consumer migration notes

- Pin `@hauska/atom-contract@^1.5.0` when adopting widthed encumbrance
  or workspace confidence fields.
- Replace `confidence: 0.92` with
  `confidence: createEncumbranceQualityConfidence(0.92)` (or full
  `createWidthedConfidence()` when `n`, width, and provenance are known).
- Co-bump with cortex-api encumbrance and brokerage workspace paths
  (cc-agent-C) in the same release window.

## [1.4.0] - 2026-06-21

Calibrated Spine Wave 1 read-contract substrate (F4 / F6 / K6).
Contract-only: types, Zod schemas, branded constructors, and fixtures.
No derived numbers are stored; consumers derive agreement and posteriors
at read time.

### Added

- `@hauska/atom-contract/read-contract` subpath with:
  - `WidthedConfidence` — estimate + `n` + `intervalWidth` +
    `CalibrationProvenance` as one inseparable object; estimate is a
    branded nominal type with no exported scalar confidence alias.
  - `ThreeAxisConfidence` — `calibratedConfidence` (accuracy, earned),
    `assertedConfidence` (source-quality, asserted), `consequence`
    (severity stratum from ASCE 7 / IBC classification inputs).
  - `ReadContract` — three-axis object plus optional
    `ModelAttributionStamp` for ledger deposit provenance.
  - `CalibrationProvenance` union: `asserted` | `backtest` | `seed` |
    `live` (K6).
  - `ModelAttributionStamp` — model id/version, prompt and context
    template versions, sampling params, retrieved atom-set id (F3
    ledger stamp shape; not persisted derived quantities).
  - `LegacyEngineEnvelopeConfidence` — documented migration source
    only; not a valid emission shape once F4 propagation lands.
  - Zod schemas, `create*` factories, sample fixtures, and type-level
    tests enforcing the no-scalar-accessor contract.

### Consumer migration notes

- Pin `@hauska/atom-contract@^1.4.0` and import from
  `@hauska/atom-contract/read-contract`.
- Replace bare `{ value, kind }` confidence emissions with
  `ReadContract` / `ThreeAxisConfidence`; use
  `createWidthedConfidence` — raw numbers fail the branded estimate
  type.
- Co-bump required across MCP server, cortex-api, Cortex, extension,
  and map once each surface is migrated (Wave 2 propagation).
- Main barrel unchanged; existing v1.3.0 consumers are unaffected
  until they opt into the subpath.

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
