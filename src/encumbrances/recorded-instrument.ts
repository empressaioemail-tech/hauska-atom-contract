import { z } from "zod";

import {
  APPLIES_TO_SCHEMA,
  ENCUMBRANCE_ACCESS_POLICY_SCHEMA,
  ENCUMBRANCE_SOURCE_ADAPTERS,
  INSTRUMENT_TYPES,
  RECORDING_SCHEMA,
  VERIFICATION_STATUSES,
  type AppliesTo,
  type EncumbranceAccessPolicy,
  type EncumbranceSourceAdapter,
  type InstrumentType,
  type RecordingInfo,
  type VerificationStatus,
} from "./common.js";

export interface RecordedInstrumentAtomInstance {
  entityType: "recorded-instrument";
  /** Per ADR-011. */
  instrumentDid: string;
  instrumentType: InstrumentType;
  /** Null when source is upload-only (R4/R5). */
  recording: RecordingInfo | null;
  issuerActorDid: string;
  sourceDocumentCid: string;
  appliesTo: AppliesTo;
  accessPolicy: EncumbranceAccessPolicy;
  /** Fixed for this type. */
  legalWeight: "recorded";
  verificationStatus: VerificationStatus;
  extractedAt: string;
  sourceAdapter: EncumbranceSourceAdapter;
  supersedesInstrumentDid?: string;
  amendedByInstrumentDid?: ReadonlyArray<string>;
}

export const RECORDED_INSTRUMENT_SCHEMA = z.object({
  entityType: z.literal("recorded-instrument"),
  instrumentDid: z.string().min(1),
  instrumentType: z.enum(INSTRUMENT_TYPES as [InstrumentType, ...InstrumentType[]]),
  recording: RECORDING_SCHEMA.nullable(),
  issuerActorDid: z.string().min(1),
  sourceDocumentCid: z.string().min(1),
  appliesTo: APPLIES_TO_SCHEMA,
  accessPolicy: ENCUMBRANCE_ACCESS_POLICY_SCHEMA,
  legalWeight: z.literal("recorded"),
  verificationStatus: z.enum(
    VERIFICATION_STATUSES as [VerificationStatus, ...VerificationStatus[]],
  ),
  extractedAt: z.string().min(1),
  sourceAdapter: z.enum(
    ENCUMBRANCE_SOURCE_ADAPTERS as [
      (typeof ENCUMBRANCE_SOURCE_ADAPTERS)[number],
      ...(typeof ENCUMBRANCE_SOURCE_ADAPTERS)[number][],
    ],
  ),
  supersedesInstrumentDid: z.string().min(1).optional(),
  amendedByInstrumentDid: z.array(z.string().min(1)).optional(),
});
