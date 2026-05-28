import { describe, expect, it } from "vitest";

import { BRIEF_RUN_SCHEMA } from "../brief-run.js";
import {
  SAMPLE_BRIEF_RUN,
  SAMPLE_PROPERTY_WORKSPACE,
  SAMPLE_WORKSPACE_ATTACHMENT_LINK,
  SAMPLE_WORKSPACE_ATTACHMENT_NOTE,
  SAMPLE_WORKSPACE_SHARE_EDGE,
} from "../fixtures.js";
import { PROPERTY_WORKSPACE_SCHEMA } from "../property-workspace.js";
import { WORKSPACE_ATTACHMENT_SCHEMA } from "../workspace-attachment.js";
import { WORKSPACE_SHARE_EDGE_SCHEMA } from "../workspace-share-edge.js";

describe("workspace fixtures - schema validation", () => {
  it("validates property-workspace", () => {
    expect(PROPERTY_WORKSPACE_SCHEMA.safeParse(SAMPLE_PROPERTY_WORKSPACE).success).toBe(
      true,
    );
  });

  it("validates brief-run", () => {
    expect(BRIEF_RUN_SCHEMA.safeParse(SAMPLE_BRIEF_RUN).success).toBe(true);
  });

  it("validates workspace-attachment link and note", () => {
    expect(
      WORKSPACE_ATTACHMENT_SCHEMA.safeParse(SAMPLE_WORKSPACE_ATTACHMENT_LINK).success,
    ).toBe(true);
    expect(
      WORKSPACE_ATTACHMENT_SCHEMA.safeParse(SAMPLE_WORKSPACE_ATTACHMENT_NOTE).success,
    ).toBe(true);
  });

  it("validates workspace-share-edge", () => {
    expect(WORKSPACE_SHARE_EDGE_SCHEMA.safeParse(SAMPLE_WORKSPACE_SHARE_EDGE).success).toBe(
      true,
    );
  });
});

describe("workspace schema guardrails", () => {
  it("rejects non-note attachment without uri", () => {
    const invalid = {
      ...SAMPLE_WORKSPACE_ATTACHMENT_LINK,
      uri: undefined,
    };
    expect(WORKSPACE_ATTACHMENT_SCHEMA.safeParse(invalid).success).toBe(false);
  });

  it("rejects note attachment without body", () => {
    const invalid = {
      ...SAMPLE_WORKSPACE_ATTACHMENT_NOTE,
      body: undefined,
    };
    expect(WORKSPACE_ATTACHMENT_SCHEMA.safeParse(invalid).success).toBe(false);
  });

  it("rejects share edge when from and to users are equal", () => {
    const invalid = {
      ...SAMPLE_WORKSPACE_SHARE_EDGE,
      toUserDid: SAMPLE_WORKSPACE_SHARE_EDGE.fromUserDid,
    };
    expect(WORKSPACE_SHARE_EDGE_SCHEMA.safeParse(invalid).success).toBe(false);
  });
});
