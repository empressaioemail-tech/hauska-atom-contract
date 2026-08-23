#!/usr/bin/env node
/**
 * Emit a SQL CHECK fragment from atom-contract ACCESS_POLICY_VALUES.
 * substrate-req-property-002 — single contract-derived vocabulary source.
 *
 * Reads `src/conformance/common.ts` so the script runs without a prior build.
 * CI equality is enforced by access-policy-vocabulary.test.ts.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMON_TS = join(__dirname, "../src/conformance/common.ts");

/**
 * @returns {string[]}
 */
export function loadAccessPolicyValuesFromSource() {
  const source = readFileSync(COMMON_TS, "utf8");
  const block = source.match(
    /export const ACCESS_POLICY_VALUES[^[]*\[([\s\S]*?)\];/,
  );
  if (!block) {
    throw new Error(
      `ACCESS_POLICY_VALUES array not found in ${COMMON_TS}`,
    );
  }
  const values = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (values.length === 0) {
    throw new Error("ACCESS_POLICY_VALUES parsed empty");
  }
  return values;
}

/**
 * @param {string[]} values
 * @param {string} [column]
 */
export function emitAccessPolicyCheckSql(values, column = "access_policy") {
  const quoted = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(", ");
  return `CHECK (${column} IN (${quoted}))`;
}

import { pathToFileURL } from "node:url";

function main() {
  const values = loadAccessPolicyValuesFromSource();
  const sql = emitAccessPolicyCheckSql(values);
  process.stdout.write(sql + "\n");
}

const invokedDirectly =
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main();
}
