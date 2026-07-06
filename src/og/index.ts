/**
 * ADR-025 O&G ontology atom type definitions.
 *
 * Import from `@empressaio/atom-contract/og`. obligation is core (ships in
 * the main contract module, domain-neutral), but ./og re-exports it for
 * convenience.
 */

export * from "./common.js";
export * from "./well.js";
export * from "./wellbore.js";
export * from "./completion.js";
export * from "./zone.js";
export * from "./pad.js";
export * from "./production-timeseries.js";
export * from "./equipment-state.js";
export * from "./mineral-lease.js";
export * from "./rrc-lease.js";
export * from "./tract.js";
export * from "./ownership-interest.js";
export * from "./revenue-allocation-unit.js";
export * from "./fixtures.js";

export {
  OBLIGATION_SCHEMA,
  OBLIGATION_STATUSES,
  OBLIGATION_TYPES,
  type ObligationAtomInstance,
  type ObligationStatus,
  type ObligationType,
} from "../obligation.js";
