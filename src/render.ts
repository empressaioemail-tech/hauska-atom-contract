/**
 * Render-mode resolution.
 *
 * Ships the **type-level** render-mode contract only: `AtomMode` enum,
 * `supportedModes`, `defaultMode`, and a pure resolver that walks the
 * hardcoded fallback chain `card → compact → expanded → inline → focus`.
 * There is no React component, no `<AtomShell>`, no focus-store wiring —
 * those land with the React binding sibling package.
 */

import type { AtomMode } from "./registration.js";

/**
 * Hardcoded fallback chain. Pulled to module scope so consumers (tests,
 * docs) can introspect it without re-importing the resolver.
 */
export const FALLBACK_ORDER: ReadonlyArray<AtomMode> = [
  "card",
  "compact",
  "expanded",
  "inline",
  "focus",
];

/**
 * Resolve the mode a render binding should use.
 *
 * 1. If `requested` is supported, return it.
 * 2. Otherwise walk {@link FALLBACK_ORDER} and return the first supported.
 * 3. As a last resort return `defaultMode` (which the type system
 *    guarantees is in `supported`).
 *
 * @param supported - The atom's `supportedModes`.
 * @param defaultMode - The atom's `defaultMode`.
 * @param requested - Mode the caller asked for; `undefined` triggers
 *   fallback selection.
 */
export function resolveMode<TSupported extends ReadonlyArray<AtomMode>>(
  supported: TSupported,
  defaultMode: TSupported[number],
  requested?: AtomMode,
): AtomMode {
  if (requested !== undefined && supported.includes(requested)) {
    return requested;
  }
  for (const mode of FALLBACK_ORDER) {
    if (supported.includes(mode)) return mode;
  }
  return defaultMode;
}
