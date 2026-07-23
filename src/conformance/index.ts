/**
 * Architecture-homes atom conformance target (doc 02).
 *
 * Import from `@empressaio/atom-contract/conformance`. Validates read-contract,
 * accessPolicy, and signed-history for data-level atoms.
 */

export {
  ATOM_CONFORMANCE_TARGET_VERSION,
  REASONING_CONFORMANCE_TARGET_VERSION,
  PROPERTY_CONFORMANCE_TARGET_VERSION,
  ACCESS_POLICY_VALUES,
  ACCESS_POLICY_SCHEMA,
  ATOM_TIER_VALUES,
  type AtomConformanceTargetVersion,
  type ReasoningConformanceTargetVersion,
  type PropertyConformanceTargetVersion,
  type AtomTier,
} from "./common.js";

export {
  verifyEventChain,
  type VerifyChainError,
  type VerifyChainErrorKind,
  type VerifyChainResult,
} from "./verify-chain.js";

export {
  validateAtomConformance,
  type AtomConformanceError,
  type AtomConformanceErrorCode,
  type AtomConformanceTarget,
  type AtomConformanceValidationResult,
  type ValidateAtomConformanceInput,
} from "./validate.js";

export {
  buildValidSignedEventChain,
  SAMPLE_APP_CONFORMANCE_TARGET,
  SAMPLE_DATA_CONFORMANCE_EVENTS,
  SAMPLE_DATA_CONFORMANCE_TARGET,
} from "./fixtures.js";
