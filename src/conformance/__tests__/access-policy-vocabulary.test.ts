/**
 * ACCESS_POLICY vocabulary drift guard — substrate-req-property-002.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { ACCESS_POLICY_SCHEMA, ACCESS_POLICY_VALUES } from "../index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EMIT_SCRIPT = join(
  __dirname,
  "../../../scripts/emit-access-policy-check.mjs",
);

describe("accessPolicy vocabulary — export === schema enum", () => {
  it("ACCESS_POLICY_VALUES matches ACCESS_POLICY_SCHEMA.options", () => {
    const schemaValues = [...ACCESS_POLICY_SCHEMA.options].sort();
    const exported = [...ACCESS_POLICY_VALUES].sort();
    expect(exported).toEqual(schemaValues);
  });

  it("includes tenant-shared (ADR-017 fifth value)", () => {
    expect(ACCESS_POLICY_VALUES).toContain("tenant-shared");
  });

  it("violation fixture: removing tenant-shared would drift from schema", () => {
    const drifted = ACCESS_POLICY_VALUES.filter((v) => v !== "tenant-shared");
    const schemaValues = [...ACCESS_POLICY_SCHEMA.options].sort();
    expect([...drifted].sort()).not.toEqual(schemaValues);
  });
});

describe("accessPolicy CHECK emitter script", () => {
  it("emit script output includes every exported value", async () => {
    const mod = await import(
      "../../../scripts/emit-access-policy-check.mjs"
    );
    const values = mod.loadAccessPolicyValuesFromSource();
    expect(values.sort()).toEqual([...ACCESS_POLICY_VALUES].sort());
    const sql = mod.emitAccessPolicyCheckSql(values);
    for (const v of ACCESS_POLICY_VALUES) {
      expect(sql).toContain(`'${v}'`);
    }
    expect(sql).toMatch(/^CHECK \(access_policy IN \(/);
  });

  it("emit script file exists on documented path", () => {
    const text = readFileSync(EMIT_SCRIPT, "utf8");
    expect(text).toContain("ACCESS_POLICY_VALUES");
  });
});
