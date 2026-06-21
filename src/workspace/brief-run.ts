import { z } from "zod";

import {
  createWidthedConfidence,
  WIDTHED_CONFIDENCE_SCHEMA,
  type WidthedConfidence,
} from "../read-contract/common.js";
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
  confidence: WidthedConfidence;
  generatedAt: string;
}

/** Asserted confidence on a brief-run before live calibration fuel exists. */
export function createBriefRunAssertedConfidence(
  estimate: number,
): WidthedConfidence {
  return createWidthedConfidence({
    estimate,
    n: 0,
    intervalWidth: 1,
    provenance: "asserted",
  });
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
  confidence: WIDTHED_CONFIDENCE_SCHEMA,
  generatedAt: z.string().min(1),
});

export function validateBriefRun(input: unknown): BriefRun {
  const parsed = BRIEF_RUN_SCHEMA.parse(input);
  return {
    ...parsed,
    confidence: createWidthedConfidence(parsed.confidence),
  };
}
