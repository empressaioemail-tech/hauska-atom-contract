/**
 * Conformance fixture — Track 2.11 selector predicate, including the
 * Factory flood selectors from F-16/F-18 close item 8.
 */

import {
  FLOOD_ZONE_SELECTORS,
  parseSelector,
  type SelectorPredicate,
} from "../selector/selector-predicate.js";

export const TRACK2_FLOOD_SELECTORS: {
  readonly A: SelectorPredicate;
  readonly AE: SelectorPredicate;
  readonly AO: SelectorPredicate;
  readonly X: SelectorPredicate;
} = {
  A: parseSelector(FLOOD_ZONE_SELECTORS.A),
  AE: parseSelector(FLOOD_ZONE_SELECTORS.AE),
  AO: parseSelector(FLOOD_ZONE_SELECTORS.AO),
  X: parseSelector(FLOOD_ZONE_SELECTORS.X),
};
