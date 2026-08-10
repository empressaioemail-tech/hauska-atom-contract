/**
 * Property reasoning atom kinds — master WDLL 3.2–3.6.
 *
 * Import from `@empressaio/atom-contract/property`.
 *
 * Re-exports 1.8.0 primitives used by property emitters:
 * ReasoningChain, AtomInputRef, PropertyConsequence, ReasoningReadContract,
 * ActorRecord, ObligationAtomInstance.
 */

export * from "./common.js";
export * from "./parcel-node.js";
export * from "./zoning-fact.js";
export * from "./setback-rule.js";
export * from "./buildable-envelope.js";
export * from "./parcel-terrain-model.js";
export * from "./road-node.js";
export * from "./building-footprint.js";
export * from "./utility-easement.js";
export * from "./flood-hazard-fact.js";
export * from "./cad-parcel-roll.js";
export * from "./land-use-fact.js";
export * from "./owner-fact.js";
export * from "./rail-corridor-fact.js";
export * from "./well-fact.js";
export * from "./fixtures.js";

export type {
  AtomInputRef,
  AtomInputRefRole,
  ReasoningChain,
} from "../reasoning-chain.js";
export {
  ATOM_INPUT_REF_ROLES,
  ATOM_INPUT_REF_SCHEMA,
  REASONING_CHAIN_SCHEMA,
  createReasoningChain,
  validateReasoningChain,
} from "../reasoning-chain.js";

export type {
  PropertyConsequence,
  PropertyRiskStratum,
  ReasoningThreeAxisConfidence,
  ReasoningReadContract,
} from "../read-contract/reasoning-axes.js";
export {
  PROPERTY_CONSEQUENCE_SCHEMA,
  REASONING_READ_CONTRACT_SCHEMA,
  REASONING_THREE_AXIS_CONFIDENCE_SCHEMA,
  createPropertyConsequence,
  createReasoningReadContract,
  createReasoningThreeAxisConfidence,
  validateReasoningReadContract,
} from "../read-contract/reasoning-axes.js";

export type {
  ActorRecordAtomInstance,
  ActorLicensingTerms,
} from "../actor-record.js";
export { ACTOR_RECORD_SCHEMA, ICC_ACTOR_RECORD_FIXTURE } from "../actor-record.js";

export type {
  ObligationAtomInstance,
  ObligationType,
} from "../obligation.js";
export { OBLIGATION_SCHEMA, LICENSE_OBLIGATION_TYPES } from "../obligation.js";
