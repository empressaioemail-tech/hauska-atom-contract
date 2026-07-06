# Empressa Atom Specification

**Version:** 1.7.0 (tracks `@empressaio/atom-contract` npm package)  
**Status:** Open Standard  
**Target:** Language-neutral, implementation-agnostic

---

## Overview

The **Empressa Atom Specification** is an open standard for representing agent-readable, jurisdictional, and physical-world facts. An atom is the fundamental unit of typed data in the Empressa ecosystem, designed to be:

- **Verifiable**: Every atom carries provenance, confidence metrics, and an event-anchored history.
- **Composable**: Atoms declare their relationships to other atoms, forming a knowledge graph.
- **Interoperable**: Language-neutral JSON Schema definitions allow any language to mint conformant atoms.
- **Calibrated**: Confidence is never a bare scalar—it's an inseparable three-axis object (accuracy, source-quality, consequence) with calibration provenance.

This specification defines the **Atom Contract**: the four-layer structure every conformant atom must satisfy.

---

## Four-Layer Contract

Every Empressa atom satisfies four layers:

### 1. **Identity Layer**

An atom is uniquely identified by:
- **`entityType`** (string): A stable, literal type identifier (e.g., `"jurisdiction"`, `"parcel"`, `"task"`).
- **`entityId`** (string): A unique identifier within that type.

Together, `(entityType, entityId)` form a globally-addressable atom reference.

**Domain Grouping:**  
- **`domain`** (string): Required grouping for catalog filtering and prompt-builder derivation (e.g., `"property"`, `"compliance"`, `"workflow"`).

### 2. **Context Interface**

An atom exposes a **`contextSummary`** function that returns a four-layer payload:

- **`prose`** (string): Human-readable summary suitable for AI prompt insertion.
- **`typed`** (object): Structured, atom-specific data (open schema).
- **`keyMetrics`** (array): Key/value pairs for compact visualization (label, value, unit).
- **`relatedAtoms`** (array): References to other atoms, forming the composition graph.

**Provenance & Access:**
- **`historyProvenance`**: Latest event ID and timestamp.
- **`accessPolicy`**: Per-instance access tier (see Access Policy below).
- **`scopeFiltered`**: Boolean indicating if the scope (audience, requestor, asOf) changed the result.

See [`context-summary.json`](schema/context-summary.json) for the full schema.

### 3. **Composition Declaration**

An atom declares its child relationships via the **`composition`** array. Each entry specifies:
- **`childType`**: Entity type of the child atom.
- **`relationLabel`**: Human-readable relationship (e.g., `"contains"`, `"references"`).
- **`cardinality`**: `"one"` or `"many"`.

An empty array (`[]`) is valid and declares "no children."

### 4. **History Anchoring**

Every atom writes mutations through the **event-anchoring service**, which maintains a tamper-evident chain:

- **`AtomEvent`** structure: `id`, `entityType`, `entityId`, `eventType`, `actor`, `payload`, `prevHash`, `chainHash`, `occurredAt`, `recordedAt`.
- **Chain integrity**: Each event's `chainHash` is deterministic (currently SHA-256; future: cryptographic ledger anchor). The `prevHash` links to the prior event, forming an append-only chain.

See [`atom-event.json`](schema/atom-event.json) for the full schema.

---

## Provenance Fields

Atoms that represent sourced data (not purely workflow/app-level) should declare provenance:

- **`sourceAdapter`** (string, required): Identifier of the adapter that sourced this atom (e.g., `"buildingeye-api"`, `"assessor-scraper"`).
- **`sourceUrl`** (string, optional): URL or URI of the original data source.
- **`contentHash`** (string, optional): Hash of the source content for tamper-detection and cache invalidation.
- **`fetchedAt`** (string, required): ISO-8601 timestamp when the atom was fetched.

These fields appear in the atom registration's `provenance` object.

---

## Access Policy

The **`accessPolicy`** field controls catalog visibility and surface-level gating. It is a **five-value union**:

1. **`public-free`**: Visible in the unauthenticated public catalog.
2. **`public-paid`**: Visible in the catalog; entitlement-gated at fetch.
3. **`platform-internal`**: Visible to platform staff only; never enumerated to public clients.
4. **`tenant-private`**: Visible only to the owning tenant.
5. **`tenant-shared`**: Shared between explicit tenants (cross-tenant benchmarking, HOA packs).

**Resolution Hierarchy:**
- If the **context summary** specifies `accessPolicy`, it wins.
- Otherwise, the **atom registration** default applies.
- If both are omitted, the default is **`public-free`**.

---

## Earned-Confidence Model (WidthedConfidence)

Empressa atoms **do not use bare scalar confidence values**. Instead, every confidence statement is a **`WidthedConfidence`** object:

```json
{
  "estimate": 0.92,
  "n": 150,
  "intervalWidth": 0.08,
  "provenance": "backtest"
}
```

**Fields:**
- **`estimate`** (number, [0,1]): Branded point estimate. Not assignable from a bare number; must be constructed as part of a complete `WidthedConfidence`.
- **`n`** (integer, ≥0): Sample size or observation count.
- **`intervalWidth`** (number, [0,1]): Width of the confidence interval.
- **`provenance`** (enum): How the estimate was earned:
  - `"asserted"`: Claimed by the source.
  - `"backtest"`: Derived from historical data.
  - `"seed"`: Initial/bootstrapped estimate.
  - `"live"`: Earned in production.

See [`widthed-confidence.json`](schema/widthed-confidence.json).

---

## Read Contract (Three-Axis Confidence)

At **read time**, every confidence-emitting atom returns a **`ReadContract`** object with three distinct axes:

### 1. **Calibrated Confidence** (Accuracy, Earned)
- **Type:** `WidthedConfidence`
- **Meaning:** Commitment #2 governs only this axis. Earned through backtesting or live production.

### 2. **Asserted Confidence** (Source Quality)
- **Type:** `WidthedConfidence`
- **Meaning:** Source-quality rating, asserted with provenance on every write.

### 3. **Consequence** (Severity)
- **Type:** `ConsequenceAxis`
- **Meaning:** Derived from code risk classifications (ASCE 7, IBC). No invented severity scalar—only classification inputs and a discrete stratum (`"routine"`, `"elevated"`, `"critical"`, `"essential"`).

**Additional Fields:**
- **`assembledAt`** (string): ISO-8601 timestamp when the read-contract was assembled.
- **`modelAttribution`** (optional): Stamp linking to the model, prompt, context, and sampling params (for AI-generated reads).

See [`read-contract.json`](schema/read-contract.json), [`consequence-axis.json`](schema/consequence-axis.json), and [`model-attribution.json`](schema/model-attribution.json).

---

## Atom Conformance

The `@empressaio/atom-contract` package exports a conformance validator:

### `validateAtomConformance(input)`

**Input:**
- **`tier`**: `"data"` (requires signed history) or `"app"` (workflow container, no history).
- **`readContract`**: The three-axis confidence object.
- **`accessPolicy`**: The five-value access tier.
- **`signedHistory`** (data-tier only): Array of `AtomEvent` objects.

**Output:**
```json
{
  "ok": true | false,
  "conformanceTargetVersion": "1.5.0",
  "errors": [ /* AtomConformanceError[] */ ],
  "target": { /* AtomConformanceTarget (if ok) */ }
}
```

### `verifyEventChain(events)`

Validates the integrity of the `prevHash` → `chainHash` chain:
- Checks that each event's `prevHash` matches the prior event's `chainHash`.
- Recomputes `chainHash` from event data to detect tampering.

**Output:**
```json
{
  "ok": true | false,
  "errors": [ /* VerifyChainError[] */ ]
}
```

---

## Versioning

This specification is **tied to the `@empressaio/atom-contract` npm package version**. Changes to the JSON Schemas or the conformance target are published as new npm versions.

**Current Version:** `1.7.0`  
**Conformance Target Version:** `1.5.0` (used by `validateAtomConformance`)

Implementers should:
1. Pin to a specific `@empressaio/atom-contract` version.
2. Use the exported `validateAtomConformance` function to verify conformance.
3. Consult the [CHANGELOG](../CHANGELOG.md) when upgrading.

---

## Render Modes

Atoms declare **render modes** they support. The five modes are:

1. **`inline`**: Chip in prose (e.g., `{{atom|jurisdiction|ca-san-francisco|San Francisco}}`).
2. **`compact`**: Compact tile with key metrics.
3. **`card`**: Full card with prose, metrics, and related atoms.
4. **`expanded`**: Detailed view with history and composition graph.
5. **`focus`**: Full-screen, deeply interactive view.

An atom's **`defaultMode`** is used when the caller doesn't specify one. Render bindings (React components) live in a separate package; this specification is render-agnostic.

---

## Minting Conformant Atoms

To mint a conformant atom in **any language**:

1. **Validate against the JSON Schemas** in [`spec/schema/`](schema/).
2. **Implement the four layers**:
   - Identity: `entityType`, `entityId`, `domain`.
   - Context: `contextSummary` function returning `prose`, `typed`, `keyMetrics`, `relatedAtoms`.
   - Composition: `composition` array (or empty `[]`).
   - History: Append events via the event-anchoring service.
3. **Emit a `ReadContract`** at read time:
   - Populate `calibratedConfidence`, `assertedConfidence`, `consequence`.
   - Include `assembledAt` timestamp.
   - Optionally attach `modelAttribution` for AI-generated reads.
4. **Call the conformance validator** (via the TypeScript reference implementation or a language-specific port):
   - Use `validateAtomConformance` to check the full shape.
   - Use `verifyEventChain` to validate history integrity.

**Extension Modules:** The seven core JSON Schemas cover the atom contract itself. Domain-specific atom types (encumbrances, O&G) ship in the TypeScript package as separate subpaths (`./encumbrances`, `./og`) with Zod-validated payloads. JSON Schemas for extension modules are generated at publish time. See the [spec README](README.md#extension-modules) for details on the O&G module (asset spine, production timeseries, land leg, revenue-allocation-unit) and encumbrances module (recorded-instrument, restriction-clause).

---

## Reference Implementation

The **canonical reference implementation** is the TypeScript package:

**`@empressaio/atom-contract`**  
**npm:** [https://www.npmjs.com/package/@empressaio/atom-contract](https://www.npmjs.com/package/@empressaio/atom-contract)  
**GitHub:** [https://github.com/empressaioemail-tech/hauska-atom-contract](https://github.com/empressaioemail-tech/hauska-atom-contract)

The TypeScript package exports:
- Type definitions for all atom structures.
- Zod schemas for runtime validation.
- `validateAtomConformance` and `verifyEventChain` functions.
- Event-anchoring service interface and Postgres implementation.
- **Extension modules**: `./encumbrances` (ADR-020/021) and `./og` (ADR-025 O&G ontology) ship domain-specific atom types (recorded-instrument, restriction-clause, well, mineral-lease, revenue-allocation-unit, etc.) with Zod-validated payloads. The core `obligation` type ships in the main module.

---

## Compliance Summary

A **conformant Empressa atom** must:

✅ Declare `entityType`, `entityId`, and `domain`.  
✅ Implement a `contextSummary` function returning the four-layer payload.  
✅ Declare a `composition` array (empty if no children).  
✅ Write mutations through the event-anchoring service (data-tier atoms).  
✅ Emit a three-axis `ReadContract` at read time (no bare scalar confidence).  
✅ Specify an `accessPolicy` (or default to `"public-free"`).  
✅ Pass `validateAtomConformance` and `verifyEventChain` checks.

---

## License & Governance

This specification is **open and freely implementable**. The JSON Schemas are published under the same license as the `@empressaio/atom-contract` package. Community contributions are welcome via GitHub issues and pull requests.

---

## See Also

- [JSON Schema Directory](schema/) — Machine-readable definitions for all atom structures.
- [README](README.md) — Quick links and versioning summary.
- [CHANGELOG](../CHANGELOG.md) — Version history and migration notes.
- [npm Package](https://www.npmjs.com/package/@empressaio/atom-contract) — TypeScript reference implementation.
