/**
 * NodeId mint/parse tests — F-15 item 2 / Track 2.1.
 */

import { describe, expect, it } from "vitest";
import { expectTypeOf } from "vitest";

import { TRACK2_NODE_ID_FIXTURE } from "../../conformance/track2-node-id.js";
import {
  NODE_ID_PATTERN,
  NodeIdParseError,
  bindNodeIdForWrite,
  isCountyPropAliasKey,
  isNodeId,
  mint,
  parse,
  type NodeId,
} from "../node-id.js";

describe("NodeId — mint", () => {
  it("returns a value matching NODE_ID_PATTERN", () => {
    const id = mint();
    expect(NODE_ID_PATTERN.test(id)).toBe(true);
    expect(isNodeId(id)).toBe(true);
  });

  it("returns distinct values on successive calls", () => {
    const a = mint();
    const b = mint();
    expect(a).not.toBe(b);
  });
});

describe("NodeId — parse", () => {
  it("accepts a minted id round-trip", () => {
    const id = mint();
    expect(parse(String(id))).toBe(id);
  });

  it("accepts the conformance fixture", () => {
    expect(parse(String(TRACK2_NODE_ID_FIXTURE))).toBe(TRACK2_NODE_ID_FIXTURE);
  });

  it("rejects empty string with typed refusal", () => {
    expect(() => parse("")).toThrow(NodeIdParseError);
    try {
      parse("");
    } catch (err) {
      expect(err).toBeInstanceOf(NodeIdParseError);
      expect((err as NodeIdParseError).code).toBe("malformed_node_id");
    }
  });

  it("refuses {fips}:{propId} as a node id and accepts it only as an alias key", () => {
    expect(() => parse("48021:34137")).toThrow(NodeIdParseError);
    expect(isNodeId("48021:34137")).toBe(false);
    expect(isCountyPropAliasKey("48021:34137")).toBe(true);
  });

  it("rejects natural-key shapes (violation fixtures)", () => {
    const violations = [
      "48209:156346",
      "txgio:prop_123",
      "did:hauska:parcel-node:48021:27303",
      "evt_deadbeefdeadbeef",
      "nid_tooshort",
      "nid_" + "g".repeat(32),
      "NID_" + "a".repeat(32),
    ];
    for (const bad of violations) {
      expect(() => parse(bad)).toThrow(NodeIdParseError);
      expect(isNodeId(bad)).toBe(false);
    }
  });
});

describe("NodeId — write signature (compile-time)", () => {
  it("mint() is assignable to NodeId", () => {
    expectTypeOf(mint()).toEqualTypeOf<NodeId>();
  });

  it("bare string is not assignable to NodeId", () => {
    expectTypeOf("48021:34137").not.toEqualTypeOf<NodeId>();
  });

  it("string literal fails to compile as NodeId", () => {
    // @ts-expect-error — a raw string does not type-check as a node id
    const _bad: NodeId = "48021:34137";
    expect(typeof _bad).toBe("string");
  });

  it("bindNodeIdForWrite accepts NodeId only", () => {
    expectTypeOf(bindNodeIdForWrite).parameter(0).toEqualTypeOf<NodeId>();
    expectTypeOf(bindNodeIdForWrite(mint())).toEqualTypeOf<{
      readonly nodeId: NodeId;
    }>();
  });
});
