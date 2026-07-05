# Hauska Atom Open Specification

**Version:** 1.6.1  
**Status:** Open Standard  
**Language:** Agnostic (JSON Schema draft 2020-12)

---

## Overview

This directory contains the **language-neutral, open specification** for the Hauska Atom contract. The specification enables any programming language to mint conformant atoms—agent-readable, jurisdictional, and physical-world facts with provenance, confidence, and tamper-evident history.

---

## Contents

### 📄 [SPEC.md](SPEC.md)

The **canonical, implementation-agnostic description** of the Hauska Atom contract. Read this first to understand:

- The **four-layer contract** (identity, context, composition, history).
- **Provenance fields** (`sourceAdapter`, `sourceUrl`, `contentHash`, `fetchedAt`).
- **Access policy** rules (the five-value union: `public-free`, `public-paid`, `platform-internal`, `tenant-private`, `tenant-shared`).
- The **earned-confidence model** (`WidthedConfidence`: estimate, n, intervalWidth, provenance).
- The **read-contract shape** (three-axis confidence: calibrated, asserted, consequence).
- How to **verify conformance** using `validateAtomConformance` and `verifyEventChain`.

### 📁 [schema/](schema/)

**JSON Schema (draft 2020-12) documents** derived from the TypeScript types in [`src/`](../src/). These schemas are the source of truth for cross-language validation.

| Schema | TypeScript Source | Description |
|--------|-------------------|-------------|
| [`atom-registration.json`](schema/atom-registration.json) | [`src/registration.ts`](../src/registration.ts) | Atom envelope: identity, domain, modes, composition, provenance, accessPolicy. |
| [`context-summary.json`](schema/context-summary.json) | [`src/context.ts`](../src/context.ts) | Four-layer context payload: prose, typed, keyMetrics, relatedAtoms. |
| [`widthed-confidence.json`](schema/widthed-confidence.json) | [`src/read-contract/common.ts`](../src/read-contract/common.ts) | Inseparable confidence object (estimate, n, intervalWidth, provenance). |
| [`read-contract.json`](schema/read-contract.json) | [`src/read-contract/read-contract.ts`](../src/read-contract/read-contract.ts) | Three-axis confidence contract (calibrated, asserted, consequence). |
| [`consequence-axis.json`](schema/consequence-axis.json) | [`src/read-contract/consequence.ts`](../src/read-contract/consequence.ts) | Severity axis (ASCE 7, IBC classifications, discrete strata). |
| [`model-attribution.json`](schema/model-attribution.json) | [`src/read-contract/model-attribution.ts`](../src/read-contract/model-attribution.ts) | Model-attribution stamp (model, prompt, context, sampling params). |
| [`atom-event.json`](schema/atom-event.json) | [`src/history.ts`](../src/history.ts) | Event-anchored history (id, entityType, entityId, actor, payload, chainHash). |

---

## Versioning

This specification is **tightly coupled** to the `@hauska/atom-contract` npm package version:

- **Current Package Version:** `1.6.1`
- **Conformance Target Version:** `1.5.0` (embedded in `validateAtomConformance`)

When the TypeScript types change, the JSON Schemas are updated in lockstep and published as a new npm version. **Always pin to a specific package version** to avoid schema drift.

---

## Usage

### For Implementers (Any Language)

1. **Read [SPEC.md](SPEC.md)** to understand the contract.
2. **Validate against the JSON Schemas** in [`schema/`](schema/):
   - Use a JSON Schema validator library in your language (e.g., `ajv` for JavaScript, `jsonschema` for Python, `gojsonschema` for Go).
   - Load the schemas from this directory.
3. **Call the conformance validator**:
   - **Option A:** Use the TypeScript reference implementation (`@hauska/atom-contract/conformance`) via Node.js.
   - **Option B:** Port `validateAtomConformance` and `verifyEventChain` to your language.
4. **Emit atoms** that satisfy the four-layer contract (identity, context, composition, history).

### For TypeScript Projects

Import directly from the npm package:

```typescript
import { validateAtomConformance, verifyEventChain } from '@hauska/atom-contract/conformance';
import type { AtomRegistration, ContextSummary, ReadContract } from '@hauska/atom-contract';

const result = validateAtomConformance({
  tier: 'data',
  readContract: myReadContract,
  accessPolicy: 'public-free',
  signedHistory: { events: myEvents },
});

if (result.ok) {
  console.log('Atom is conformant!');
} else {
  console.error('Validation errors:', result.errors);
}
```

---

## Reference Implementation

**TypeScript Package:** [`@hauska/atom-contract`](https://www.npmjs.com/package/@hauska/atom-contract)  
**GitHub:** [empressaioemail-tech/hauska-atom-contract](https://github.com/empressaioemail-tech/hauska-atom-contract)

The package exports:
- **Type definitions** for all atom structures.
- **Zod schemas** for runtime validation.
- **Conformance validators** (`validateAtomConformance`, `verifyEventChain`).
- **Event-anchoring service** interface and Postgres implementation.

---

## License

The JSON Schemas in this directory are published under the same license as the `@hauska/atom-contract` package. See the [LICENSE](../LICENSE) file for details.

---

## Contributing

Community contributions are welcome! To propose changes:

1. Open an issue in the [GitHub repository](https://github.com/empressaioemail-tech/hauska-atom-contract/issues).
2. Submit a pull request with:
   - Updated TypeScript types in [`src/`](../src/).
   - Corresponding JSON Schema updates in [`spec/schema/`](schema/).
   - Changes to [SPEC.md](SPEC.md) documenting the behavior.
3. Bump the package version per semantic versioning.

---

## Quick Links

- **[SPEC.md](SPEC.md)** — Read the full specification.
- **[schema/](schema/)** — Browse the JSON Schemas.
- **[npm Package](https://www.npmjs.com/package/@hauska/atom-contract)** — Install the TypeScript reference implementation.
- **[CHANGELOG](../CHANGELOG.md)** — See what changed between versions.
