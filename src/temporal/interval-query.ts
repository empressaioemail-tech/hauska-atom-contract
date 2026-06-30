/**
 * Interval / as-of query helpers for temporal atoms.
 *
 * Current-state queries that filter `valid_from <= now` silently exclude
 * anticipatory atoms whose valid_from is in the future. These helpers make
 * that exclusion explicit and offer an opt-in to surface anticipatory atoms.
 */

import { isAnticipatoryClaimType, isIsoTimestamp } from "./common.js";

export interface TemporalAtomSlice {
  readonly claim_type: string;
  readonly valid_from: string;
}

export interface FilterAtomsForAsOfOptions {
  /** Reference instant for the query. Defaults to `new Date()`. */
  readonly asOf?: Date;
  /**
   * When true, anticipatory atoms with future valid_from are included and
   * tagged. When false (default), they are excluded from current-state
   * results — never silently dropped without the caller opting in.
   */
  readonly includeAnticipatory?: boolean;
}

export interface FilteredTemporalAtom<T extends TemporalAtomSlice> {
  readonly atom: T;
  /** True when valid_from is after asOf (anticipatory, not yet effective). */
  readonly isFutureAnticipatory: boolean;
}

/**
 * Returns true when the atom is visible at `asOf`.
 *
 * - Non-anticipatory: requires `valid_from <= asOf`.
 * - Anticipatory with `includeAnticipatory`: always visible (flagged if future).
 * - Anticipatory without `includeAnticipatory`: excluded when valid_from > asOf.
 */
export function isAtomVisibleAtAsOf(
  atom: TemporalAtomSlice,
  options: FilterAtomsForAsOfOptions = {},
): boolean {
  const asOf = options.asOf ?? new Date();
  if (!isIsoTimestamp(atom.valid_from)) return false;

  const validFromMs = Date.parse(atom.valid_from);
  const isFuture = validFromMs > asOf.getTime();

  if (isAnticipatoryClaimType(atom.claim_type)) {
    if (options.includeAnticipatory) return true;
    return !isFuture;
  }

  return !isFuture;
}

/**
 * Filter atoms for an as-of query. Anticipatory atoms with future
 * valid_from are either included (with `isFutureAnticipatory: true`) or
 * explicitly excluded — never silently dropped from a result set the
 * caller believed was complete.
 */
export function filterAtomsForAsOf<T extends TemporalAtomSlice>(
  atoms: ReadonlyArray<T>,
  options: FilterAtomsForAsOfOptions = {},
): ReadonlyArray<FilteredTemporalAtom<T>> {
  const asOf = options.asOf ?? new Date();
  const results: FilteredTemporalAtom<T>[] = [];

  for (const atom of atoms) {
    if (!isIsoTimestamp(atom.valid_from)) continue;

    const validFromMs = Date.parse(atom.valid_from);
    const isFutureAnticipatory =
      isAnticipatoryClaimType(atom.claim_type) && validFromMs > asOf.getTime();

    if (!isAtomVisibleAtAsOf(atom, options)) continue;

    results.push({ atom, isFutureAnticipatory });
  }

  return results;
}
