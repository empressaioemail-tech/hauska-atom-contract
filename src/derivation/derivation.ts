/**
 * Derivation and derivesFrom — instrument contract item 2.3.
 *
 * derivesFrom is required on Derivation and absent on Record.
 * A materialised row's identity is (selectorAtomId, storeVersion, method).
 */

export type DerivesFrom = {
  readonly selectorAtomId: string;
  readonly storeVersion: string;
  readonly method: string;
};

export type Derivation = {
  readonly class: "Derivation";
  readonly formula: string;
  readonly inputs: readonly string[];
  readonly derivesFrom: DerivesFrom;
};

export class DerivationParseError extends Error {
  readonly code = "DERIVES_FROM_REQUIRED" as const;

  constructor(
    message: string,
    readonly input: unknown,
  ) {
    super(message);
    this.name = "DerivationParseError";
  }
}

export function parseDerivesFrom(input: unknown): DerivesFrom {
  if (!input || typeof input !== "object") {
    throw new DerivationParseError("Derivation requires derivesFrom", input);
  }
  const row = input as Record<string, unknown>;
  if (
    typeof row.selectorAtomId !== "string" ||
    row.selectorAtomId.length === 0 ||
    typeof row.storeVersion !== "string" ||
    row.storeVersion.length === 0 ||
    typeof row.method !== "string" ||
    row.method.length === 0
  ) {
    throw new DerivationParseError(
      "derivesFrom requires selectorAtomId, storeVersion, method",
      input,
    );
  }
  return {
    selectorAtomId: row.selectorAtomId,
    storeVersion: row.storeVersion,
    method: row.method,
  };
}

export function parseDerivation(input: unknown): Derivation {
  if (!input || typeof input !== "object") {
    throw new DerivationParseError("Derivation required", input);
  }
  const row = input as Record<string, unknown>;
  if (row.class !== "Derivation") {
    throw new DerivationParseError("Derivation class required", input);
  }
  if (typeof row.formula !== "string" || row.formula.length === 0) {
    throw new DerivationParseError("Derivation requires formula", input);
  }
  if (!Array.isArray(row.inputs)) {
    throw new DerivationParseError("Derivation requires inputs", input);
  }
  return {
    class: "Derivation",
    formula: row.formula,
    inputs: row.inputs.map(String),
    derivesFrom: parseDerivesFrom(row.derivesFrom),
  };
}

/** Runtime export so the Factory shim check observes `Derivation` on the module. */
export const Derivation = Object.freeze({
  parse: parseDerivation,
  parseDerivesFrom,
});
