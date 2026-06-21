/**
 * Model-attribution stamp for the rich raw ledger (F3).
 *
 * Stamped on deposit; agreement, posterior, and per-model reliability
 * are derived at read — never persisted here.
 */

import { z } from "zod";

export const SAMPLING_PARAMS_SCHEMA = z
  .object({
    temperature: z.number().optional(),
    topP: z.number().min(0).max(1).optional(),
    maxTokens: z.number().int().positive().optional(),
    seed: z.number().int().optional(),
  })
  .catchall(z.unknown())
  .readonly();

export type SamplingParams = z.infer<typeof SAMPLING_PARAMS_SCHEMA>;

/**
 * Ledger deposit stamp joining a judgment to the model, prompt, context,
 * sampling configuration, and retrieved atom set used at write time.
 */
export interface ModelAttributionStamp {
  readonly modelId: string;
  readonly modelVersion: string;
  readonly promptTemplateVersion: string;
  readonly contextTemplateVersion: string;
  readonly samplingParams: SamplingParams;
  readonly retrievedAtomSetId: string;
}

export const MODEL_ATTRIBUTION_STAMP_SCHEMA = z
  .object({
    modelId: z.string().min(1),
    modelVersion: z.string().min(1),
    promptTemplateVersion: z.string().min(1),
    contextTemplateVersion: z.string().min(1),
    samplingParams: SAMPLING_PARAMS_SCHEMA,
    retrievedAtomSetId: z.string().min(1),
  })
  .readonly();

export function createModelAttributionStamp(
  input: z.input<typeof MODEL_ATTRIBUTION_STAMP_SCHEMA>,
): ModelAttributionStamp {
  return MODEL_ATTRIBUTION_STAMP_SCHEMA.parse(input) as ModelAttributionStamp;
}
