/**
 * Provenance class as a discriminated union — instrument contract item 2.2.
 *
 * Factory shim four: Record, Derivation, Assertion, Absence.
 * Model (19) adds Observation and Synthesis. Attention and Judgment are
 * reserved and are not constructible here.
 */

import type { AbsenceVerdict } from "../absence/absence-verdict.js";
import { parseAbsenceVerdict } from "../absence/absence-verdict.js";
import type { DerivesFrom } from "../derivation/derivation.js";
import { parseDerivesFrom } from "../derivation/derivation.js";

export const PROVENANCE_CLASSES = [
  "Record",
  "Derivation",
  "Assertion",
  "Absence",
  "Observation",
  "Synthesis",
] as const;

export type ProvenanceClassName = (typeof PROVENANCE_CLASSES)[number];

export type ProvenanceRecord = {
  readonly class: "Record";
  readonly sourceId: string;
  readonly fetchRef: string;
  readonly derivesFrom?: never;
};

export type ProvenanceDerivation = {
  readonly class: "Derivation";
  readonly formula: string;
  readonly inputs: readonly string[];
  readonly derivesFrom: DerivesFrom;
};

export type ProvenanceAssertion = {
  readonly class: "Assertion";
  readonly asserter: string;
};

export type ProvenanceAbsence = {
  readonly class: "Absence";
  readonly verdict: AbsenceVerdict;
};

export type ProvenanceObservation = {
  readonly class: "Observation";
  readonly measurement: string;
};

export type ProvenanceSynthesis = {
  readonly class: "Synthesis";
  readonly citations: readonly string[];
};

export type ProvenanceClass =
  | ProvenanceRecord
  | ProvenanceDerivation
  | ProvenanceAssertion
  | ProvenanceAbsence
  | ProvenanceObservation
  | ProvenanceSynthesis;

export class ProvenanceParseError extends Error {
  readonly code: string;

  constructor(
    message: string,
    readonly input: unknown,
    code = "PROVENANCE_FIELD",
  ) {
    super(message);
    this.name = "ProvenanceParseError";
    this.code = code;
  }
}

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") {
    throw new ProvenanceParseError("provenance class required", input, "PROVENANCE_REQUIRED");
  }
  return input as Record<string, unknown>;
}

export function parseProvenance(input: unknown): ProvenanceClass {
  const row = asRecord(input);
  const cls = row.class;
  if (cls === "Record") {
    if (row.derivesFrom != null) {
      throw new ProvenanceParseError(
        "Record must not carry derivesFrom",
        input,
        "DERIVES_FROM_ON_RECORD",
      );
    }
    if (typeof row.sourceId !== "string" || row.sourceId.length === 0) {
      throw new ProvenanceParseError("Record requires sourceId", input);
    }
    if (typeof row.fetchRef !== "string" || row.fetchRef.length === 0) {
      throw new ProvenanceParseError("Record requires fetchRef", input);
    }
    return { class: "Record", sourceId: row.sourceId, fetchRef: row.fetchRef };
  }
  if (cls === "Derivation") {
    if (typeof row.formula !== "string" || row.formula.length === 0) {
      throw new ProvenanceParseError("Derivation requires formula", input);
    }
    if (!Array.isArray(row.inputs)) {
      throw new ProvenanceParseError("Derivation requires inputs", input);
    }
    return {
      class: "Derivation",
      formula: row.formula,
      inputs: row.inputs.map(String),
      derivesFrom: parseDerivesFrom(row.derivesFrom),
    };
  }
  if (cls === "Assertion") {
    if (typeof row.asserter !== "string" || row.asserter.length === 0) {
      throw new ProvenanceParseError("Assertion requires asserter", input);
    }
    return { class: "Assertion", asserter: row.asserter };
  }
  if (cls === "Absence") {
    return { class: "Absence", verdict: parseAbsenceVerdict(row) };
  }
  if (cls === "Observation") {
    if (typeof row.measurement !== "string" || row.measurement.length === 0) {
      throw new ProvenanceParseError("Observation requires measurement", input);
    }
    return { class: "Observation", measurement: row.measurement };
  }
  if (cls === "Synthesis") {
    if (!Array.isArray(row.citations) || row.citations.length === 0) {
      throw new ProvenanceParseError("Synthesis requires citations", input);
    }
    return { class: "Synthesis", citations: row.citations.map(String) };
  }
  throw new ProvenanceParseError(
    `unknown provenance class ${String(cls)}`,
    input,
    "PROVENANCE_CLASS",
  );
}

/** Runtime export so the Factory shim check observes `ProvenanceClass` on the module. */
export const ProvenanceClass = Object.freeze({
  names: PROVENANCE_CLASSES,
  parse: parseProvenance,
});
