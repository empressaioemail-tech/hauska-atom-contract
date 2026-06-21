/**
 * Calibrated Spine read-contract types (F4 / F6 / K6).
 *
 * Import from `@hauska/atom-contract/read-contract`. Every
 * confidence-emitting surface (MCP, cortex-api, Cortex, extension,
 * map) should depend on these shapes rather than inventing local
 * scalar confidence fields.
 */

export * from "./common.js";
export * from "./consequence.js";
export * from "./model-attribution.js";
export * from "./read-contract.js";
export * from "./fixtures.js";
