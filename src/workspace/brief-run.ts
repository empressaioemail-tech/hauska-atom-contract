import { z } from "zod";

import { WORKSPACE_ATOM_METADATA_SCHEMA, type WorkspaceAtomMetadata } from "./common.js";

export interface BriefRunCitationRef {
  citationDid: string;
  sourceType: "attachment" | "atom" | "external-link";
}

export interface BriefRun extends WorkspaceAtomMetadata {
  entityType: "brief-run";
  workspaceDid: string;
  runInputs: Record<string, unknown>;
  citationRefs: ReadonlyArray<BriefRunCitationRef>;
  confidence: number;
  generatedAt: string;
}

export const BRIEF_RUN_CITATION_REF_SCHEMA = z.object({
  citationDid: z.string().min(1),
  sourceType: z.enum(["attachment", "atom", "external-link"]),
});

export const BRIEF_RUN_SCHEMA = WORKSPACE_ATOM_METADATA_SCHEMA.extend({
  entityType: z.literal("brief-run"),
  workspaceDid: z.string().min(1),
  runInputs: z.record(z.string(), z.unknown()),
  citationRefs: z.array(BRIEF_RUN_CITATION_REF_SCHEMA),
  confidence: z.number().min(0).max(1),
  generatedAt: z.string().min(1),
});

export function validateBriefRun(input: unknown): BriefRun {
  return BRIEF_RUN_SCHEMA.parse(input);
}
