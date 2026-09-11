/**
 * Display vocabulary — the human face of every atom (OPS-23 R-6, P-167).
 *
 * Import from `@empressaio/atom-contract/display`.
 *
 * One versioned subpath producing the display strings that every surface
 * (the Property Explorer panel, the feasibility PDF, and the Smart Site MCP
 * connector) renders for the same claim, so the row moves strings between
 * repos instead of letting them diverge into copies. See `buildable.ts`
 * (the buildable/setback card, PDF, and agreement-token vocabulary,
 * previously five byte-identical copies across hauska-map and
 * hauska-engine) and `wire.ts` (the Smart Site MCP wire-token vocabulary
 * table, previously owned only by legacy-design-tools).
 */
export * from "./buildable.js";
export * from "./wire.js";
