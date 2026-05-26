import { z } from "zod";

import {
  ENCUMBRANCE_ACCESS_POLICY_SCHEMA,
  QUALITY_GATE_FIELDS,
  STRUCTURED_FIELDS_SCHEMA,
} from "./common.js";

/**
 * Unrecorded HOA design guidelines. Same clause shape where applicable;
 * `legalWeight` is fixed to `advisory`.
 */
export interface AdministrativeRuleAtomInstance {
  entityType: "administrative-rule";
  clauseDid: string;
  parentInstrumentCid?: string;
  clausePath: string;
  bodyText: string;
  structuredFields?: z.infer<typeof STRUCTURED_FIELDS_SCHEMA>;
  confidence: number;
  extractedBy: string;
  humanVerifiedAt?: string;
  verifiedByActorDid?: string;
  sourceDocumentCid?: string;
  accessPolicy: "tenant-private" | "tenant-shared";
  legalWeight: "advisory";
  reasoningSummary?: string;
  sourceCitation: string;
  evaluatedAt: string;
}

export const ADMINISTRATIVE_RULE_SCHEMA = z.object({
  entityType: z.literal("administrative-rule"),
  clauseDid: z.string().min(1),
  parentInstrumentCid: z.string().min(1).optional(),
  clausePath: z.string().min(1),
  bodyText: z.string().min(1),
  structuredFields: STRUCTURED_FIELDS_SCHEMA.optional(),
  extractedBy: z.string().min(1),
  humanVerifiedAt: z.string().min(1).optional(),
  verifiedByActorDid: z.string().min(1).optional(),
  sourceDocumentCid: z.string().min(1).optional(),
  accessPolicy: ENCUMBRANCE_ACCESS_POLICY_SCHEMA,
  legalWeight: z.literal("advisory"),
  ...QUALITY_GATE_FIELDS,
});
