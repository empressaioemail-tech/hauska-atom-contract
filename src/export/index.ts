/**
 * Downloadable-atom export shape for gate and console portability.
 */

export {
  createDownloadableAtom,
  isDownloadableAtom,
  DOWNLOADABLE_ATOM_CITATION_SCHEMA,
  DOWNLOADABLE_ATOM_IDENTITY_SCHEMA,
  type CreateDownloadableAtomFailure,
  type CreateDownloadableAtomInput,
  type CreateDownloadableAtomOutcome,
  type CreateDownloadableAtomResult,
  type DownloadableAtom,
  type DownloadableAtomCitation,
  type DownloadableAtomIdentity,
} from "./downloadable-atom.js";

export { ATOM_CONFORMANCE_TARGET_VERSION } from "../conformance/common.js";
