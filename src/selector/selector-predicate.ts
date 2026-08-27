/**
 * Selector predicate — instrument contract item 2.11.
 *
 * Closed discriminated union: spatial containment, set membership,
 * equality, range, and composition. `match` is exhaustive.
 */

export type SpatialContains = {
  readonly kind: "spatial-contains";
  readonly geom: unknown;
};

export type SetMember = {
  readonly kind: "set-member";
  readonly set: readonly unknown[];
};

export type Equality = {
  readonly kind: "eq";
  readonly field: string;
  readonly value: unknown;
};

export type Range = {
  readonly kind: "range";
  readonly field: string;
  readonly min: unknown;
  readonly max: unknown;
};

export type And = {
  readonly kind: "and";
  readonly clauses: readonly SelectorPredicate[];
};

export type Or = {
  readonly kind: "or";
  readonly clauses: readonly SelectorPredicate[];
};

export type Composition = And | Or;

export type SelectorPredicate =
  | SpatialContains
  | SetMember
  | Equality
  | Range
  | And
  | Or;

export const SELECTOR_KINDS = [
  "spatial-contains",
  "set-member",
  "eq",
  "range",
  "and",
  "or",
] as const;

export type SelectorKind = (typeof SELECTOR_KINDS)[number];

export type SelectorHandlers<T> = {
  [K in SelectorPredicate["kind"]]: (
    pred: Extract<SelectorPredicate, { kind: K }>,
  ) => T;
};

export class SelectorParseError extends Error {
  readonly code: string;

  constructor(
    message: string,
    readonly input: unknown,
    code = "SELECTOR_FIELD",
  ) {
    super(message);
    this.name = "SelectorParseError";
    this.code = code;
  }
}

export function parseSelector(input: unknown): SelectorPredicate {
  if (!input || typeof input !== "object") {
    throw new SelectorParseError(
      "selector predicate is not a closed-union kind",
      input,
      "SELECTOR_KIND",
    );
  }
  const pred = input as Record<string, unknown>;
  const kind = pred.kind;
  if (kind === "spatial-contains") {
    if (pred.geom == null) {
      throw new SelectorParseError("spatial-contains requires geom", input);
    }
    return { kind: "spatial-contains", geom: pred.geom };
  }
  if (kind === "set-member") {
    if (!Array.isArray(pred.set)) {
      throw new SelectorParseError("set-member requires set", input);
    }
    return { kind: "set-member", set: pred.set };
  }
  if (kind === "eq") {
    if (pred.field == null || pred.value === undefined) {
      throw new SelectorParseError("eq requires field and value", input);
    }
    return { kind: "eq", field: String(pred.field), value: pred.value };
  }
  if (kind === "range") {
    if (pred.field == null || pred.min === undefined || pred.max === undefined) {
      throw new SelectorParseError("range requires field, min, max", input);
    }
    return {
      kind: "range",
      field: String(pred.field),
      min: pred.min,
      max: pred.max,
    };
  }
  if (kind === "and" || kind === "or") {
    if (!Array.isArray(pred.clauses)) {
      throw new SelectorParseError(`${kind} requires clauses`, input);
    }
    return kind === "and"
      ? { kind: "and", clauses: pred.clauses.map((c) => parseSelector(c)) }
      : { kind: "or", clauses: pred.clauses.map((c) => parseSelector(c)) };
  }
  throw new SelectorParseError(
    "selector predicate is not a closed-union kind",
    input,
    "SELECTOR_KIND",
  );
}

export function match<T>(
  pred: SelectorPredicate,
  handlers: SelectorHandlers<T>,
): T {
  switch (pred.kind) {
    case "spatial-contains":
      return handlers["spatial-contains"](pred);
    case "set-member":
      return handlers["set-member"](pred);
    case "eq":
      return handlers.eq(pred);
    case "range":
      return handlers.range(pred);
    case "and":
      return handlers.and(pred);
    case "or":
      return handlers.or(pred);
    default: {
      const _exhaustive: never = pred;
      throw new SelectorParseError(
        `unhandled selector kind ${String(_exhaustive)}`,
        pred,
        "SELECTOR_KIND",
      );
    }
  }
}

/** Factory flood selectors from F-16/F-18 close item 8. */
export const FLOOD_ZONE_SELECTORS = {
  A: { kind: "eq", field: "fld_zone", value: "A" },
  AE: { kind: "eq", field: "fld_zone", value: "AE" },
  AO: { kind: "eq", field: "fld_zone", value: "AO" },
  X: { kind: "eq", field: "fld_zone", value: "X" },
} as const satisfies Record<"A" | "AE" | "AO" | "X", Equality>;

/** Runtime export so the Factory shim check observes `SelectorPredicate` on the module. */
export const SelectorPredicate = Object.freeze({
  kinds: SELECTOR_KINDS,
  parse: parseSelector,
  match,
  floodZones: FLOOD_ZONE_SELECTORS,
});
