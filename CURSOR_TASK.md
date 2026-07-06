# Task C1 — atom-contract 1.7.0: O&G ontology module (ADR-025)

You are working in a fresh task clone of hauska-atom-contract. The full specification is in this repo at docs/adr-025-og-ontology.md — READ IT FIRST AND FOLLOW IT EXACTLY; it is the ratified ADR. Create branch `feat/1.7.0-og-ontology` off main. RULE: push the branch to origin immediately after your FIRST commit, then keep pushing. Do NOT merge and do NOT publish to npm; open a PR at the end titled "feat: 1.7.0 — O&G ontology (./og module + core obligation) per ADR-025". Delete CURSOR_TASK.md before your final commit (keep docs/adr-025-og-ontology.md — it is meant to be committed).

## What to build (summary; the ADR is authoritative)

1. **New subpath export `./og`** mirroring the existing `./encumbrances` module pattern (instance interfaces + Zod schemas + common module): well, wellbore, completion, zone, pad, production-timeseries, equipment-state, mineral-lease, rrc-lease, tract, ownership-interest. Field lists, unions, accessPolicy defaults, and link semantics exactly per the ADR sections.
2. **`obligation` goes in the CORE contract module, NOT ./og** (operator ruling: domain-neutral; multiple verticals consume it). ./og imports and re-exports it for convenience. `oblg_` prefix registers with the core prefix set.
3. **Node-type prefixes registered additively:** well_, wbore_, cmpl_, zone_, pad_, mlease_, rrclease_, tract_, intr_, oblg_, prodts_, equip_. Follow the repo's existing stable-ID/prefix registration discipline (see the 1.6.0 evt_ addition for the pattern). Legible-DID exception per the ADR: well_<api14>, rrclease_<district>-<leaseNo>, tract_<county>-<abstract>; hashed derivation from (source, externalId) for the rest.
4. **INSTRUMENT_TYPES union extended additively** with: oil-gas-lease, mineral-deed, assignment, division-order.
5. **Every confidence field is WidthedConfidence** (no bare scalars representable); every instance schema carries sourceCitation, extractedAt/asOf, accessPolicy (existing five-value union). Do not invent new confidence or policy shapes.
6. **Strictly additive minor:** no existing union, required field, or export changes. Consumers on ^1.6 must be unaffected. Add conformance fixtures/tests for every new schema following the repo's existing test conventions; make sure the existing test suite still passes untouched.
7. **Version + naming:** bump package version to 1.7.0. ALSO rename the package name in package.json from @hauska/atom-contract to **@empressaio/atom-contract** (ratified branding decision; the publish itself is operator-manual later — you only stage it). Update README title/branding to Empressa accordingly. Add a CHANGELOG entry for 1.7.0 covering the module, the core obligation placement, the prefixes, the INSTRUMENT_TYPES extension, and the package rename.
8. **Do NOT model pooled-units** — it is the ADR's named open question awaiting a domain review; leave a clearly-marked TODO reference to ADR-025 open question 1.

## Verify before opening the PR

- Full typecheck + build + ALL tests green (existing + new).
- `npm pack --dry-run` shows the ./og subpath export wired correctly in package.json exports.
- In the PR description: list every new exported type/schema, confirm zero changes to existing exports (paste the diff summary of the exports map), and note that publish is staged for the operator.
