import { z } from "zod";

import {
  ENCUMBRANCE_ACCESS_POLICY_SCHEMA,
  QUALITY_GATE_FIELDS,
  STRUCTURED_FIELDS_SCHEMA,
} from "./common.js";

export interface RestrictionClauseAtomInstance {
  entityType: "restriction-clause";
  clauseDid: string;
  parentInstrumentCid: string;
  clausePath: string;
  bodyText: string;
  structuredFields?: z.infer<typeof STRUCTURED_FIELDS_SCHEMA>;
  confidence: number;
  extractedBy: string;
  humanVerifiedAt?: string;
  verifiedByActorDid?: string;
  accessPolicy: "tenant-private" | "tenant-shared";
  legalWeight: "recorded";
  reasoningSummary?: string;
  sourceCitation: string;
  evaluatedAt: string;
}

export const RESTRICTION_CLAUSE_SCHEMA = z.object({
  entityType: z.literal("restriction-clause"),
  clauseDid: z.string().min(1),
  parentInstrumentCid: z.string().min(1),
  clausePath: z.string().min(1),
  bodyText: z.string().min(1),
  structuredFields: STRUCTURED_FIELDS_SCHEMA.optional(),
  extractedBy: z.string().min(1),
  humanVerifiedAt: z.string().min(1).optional(),
  verifiedByActorDid: z.string().min(1).optional(),
  accessPolicy: ENCUMBRANCE_ACCESS_POLICY_SCHEMA,
  legalWeight: z.literal("recorded"),
  ...QUALITY_GATE_FIELDS,
});
