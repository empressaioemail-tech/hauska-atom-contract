/**
 * Alias atom and lineage edges — F-15 item 3 / Track 2.10.
 */

import { describe, expect, it } from "vitest";

import {
  TRACK2_ALIAS_FIXTURE,
  TRACK2_LINEAGE_MERGED,
} from "../../conformance/track2-alias.js";
import {
  AliasParseError,
  acceptNodeWithoutLineage,
  parseAliasAtom,
  parseLineageEdge,
} from "../alias.js";
import { mint } from "../node-id.js";

describe("AliasAtom", () => {
  it("accepts the conformance fixture with a validity era", () => {
    expect(TRACK2_ALIAS_FIXTURE.entityType).toBe("identity.alias");
    expect(TRACK2_ALIAS_FIXTURE.aliasKey).toBe("48021:34137");
    expect(TRACK2_ALIAS_FIXTURE.validTo).toBeNull();
  });

  it("refuses an alias without an era", () => {
    expect(() =>
      parseAliasAtom({
        entityType: "identity.alias",
        aliasKey: "48021:34137",
        nodeId: mint(),
        authority: "bastrop-cad",
        knowledgeAt: "2026-08-27T00:00:00.000Z",
      }),
    ).toThrow(AliasParseError);
  });
});

describe("Lineage edges", () => {
  it("accepts mergedInto as an edge", () => {
    expect(TRACK2_LINEAGE_MERGED.kind).toBe("mergedInto");
    expect(parseLineageEdge({
      kind: "dividedInto",
      from: mint(),
      to: mint(),
    }).kind).toBe("dividedInto");
    expect(parseLineageEdge({
      kind: "unmerged",
      from: mint(),
      to: mint(),
    }).kind).toBe("unmerged");
  });

  it("a node type with a mergedInto field does not compile", () => {
    acceptNodeWithoutLineage({ id: mint() });
    // @ts-expect-error — lineage is an edge; no mergedInto column on the node
    acceptNodeWithoutLineage({ id: mint(), mergedInto: mint() });
  });
});
