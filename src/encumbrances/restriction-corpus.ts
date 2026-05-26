import { z } from "zod";

import { ENCUMBRANCE_ACCESS_POLICY_SCHEMA } from "./common.js";

export interface RestrictionCorpusAtomInstance {
  entityType: "restriction-corpus";
  corpusDid: string;
  displayName: string;
  platId?: string;
  subdivisionName: string;
  instrumentCids: ReadonlyArray<string>;
  coverageParcelCount?: number;
  lastRefreshedAt?: string;
  accessPolicy: "tenant-private" | "tenant-shared";
}

export const RESTRICTION_CORPUS_SCHEMA = z.object({
  entityType: z.literal("restriction-corpus"),
  corpusDid: z.string().min(1),
  displayName: z.string().min(1),
  platId: z.string().min(1).optional(),
  subdivisionName: z.string().min(1),
  instrumentCids: z.array(z.string().min(1)).min(1),
  coverageParcelCount: z.number().int().nonnegative().optional(),
  lastRefreshedAt: z.string().min(1).optional(),
  accessPolicy: ENCUMBRANCE_ACCESS_POLICY_SCHEMA,
});
