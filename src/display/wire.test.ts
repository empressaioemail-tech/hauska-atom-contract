/**
 * P-167 self-tests for the wire vocabulary table, required by the OPS-23
 * mission: every token is unique, the documented entry count cannot go
 * stale unnoticed (the source table's own comment said "19 entries" while
 * the table had grown to 34 — see
 * `_inbox/2026-09-11_ops23_wave1_verify_p167.md` finding 4), and a snapshot
 * of the full string table makes any future edit a visible diff.
 */
import { describe, it, expect } from "vitest";
import { VOCABULARY, DOCUMENTED_VOCABULARY_COUNT, type VocabularyEntry } from "./wire.js";

describe("VOCABULARY self-tests", () => {
  it("every token is unique", () => {
    const tokens = VOCABULARY.map((entry: VocabularyEntry) => entry.token);
    const unique = new Set(tokens);
    expect(unique.size).toBe(tokens.length);
  });

  it("the documented entry count matches the real count (never lets the comment go stale again)", () => {
    expect(VOCABULARY.length).toBe(DOCUMENTED_VOCABULARY_COUNT);
  });

  it("every entry carries a non-empty token, displayText, and meaning", () => {
    for (const entry of VOCABULARY) {
      expect(entry.token.length).toBeGreaterThan(0);
      expect(entry.displayText.length).toBeGreaterThan(0);
      expect(entry.meaning.length).toBeGreaterThan(0);
    }
  });

  it("the full string table is snapshotted so an edit is a visible diff", () => {
    expect(VOCABULARY).toMatchSnapshot();
  });
});
