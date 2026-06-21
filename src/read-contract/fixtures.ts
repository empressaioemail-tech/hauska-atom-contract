import { createReadContract, createThreeAxisConfidence } from "./read-contract.js";
import { createModelAttributionStamp } from "./model-attribution.js";
import type { ReadContract, ThreeAxisConfidence } from "./read-contract.js";
import { createWidthedConfidence } from "./common.js";
import { createConsequenceAxis } from "./consequence.js";

export const SAMPLE_WIDTHED_ASSERTED = createWidthedConfidence({
  estimate: 0.72,
  n: 0,
  intervalWidth: 0.35,
  provenance: "asserted",
});

export const SAMPLE_WIDTHED_BACKTEST = createWidthedConfidence({
  estimate: 0.81,
  n: 142,
  intervalWidth: 0.12,
  provenance: "backtest",
});

export const SAMPLE_CONSEQUENCE_ROUTINE = createConsequenceAxis({
  derivation: {
    source: "asce7-risk-category",
    asce7RiskCategory: "II",
    ibcOccupancyGroup: "B",
  },
  stratum: "routine",
  assertedAt: "2026-06-21T12:00:00.000Z",
});

export const SAMPLE_THREE_AXIS: ThreeAxisConfidence = createThreeAxisConfidence({
  calibratedConfidence: SAMPLE_WIDTHED_BACKTEST,
  assertedConfidence: SAMPLE_WIDTHED_ASSERTED,
  consequence: SAMPLE_CONSEQUENCE_ROUTINE,
});

export const SAMPLE_MODEL_ATTRIBUTION = createModelAttributionStamp({
  modelId: "hauska-reasoning-default",
  modelVersion: "2026-06-01",
  promptTemplateVersion: "plan-review-v3",
  contextTemplateVersion: "site-context-v2",
  samplingParams: { temperature: 0.2, topP: 0.95, maxTokens: 4096 },
  retrievedAtomSetId: "atom-set:bastrop-udc:2024:parcel-demo",
});

export const SAMPLE_READ_CONTRACT: ReadContract = createReadContract({
  axes: SAMPLE_THREE_AXIS,
  assembledAt: "2026-06-21T12:00:00.000Z",
  modelAttribution: SAMPLE_MODEL_ATTRIBUTION,
});
