/**
 * Actor-record atom tests (ADR-015, Gate B §2.5.4).
 */

import { describe, expect, it } from "vitest";

import {
  ACTOR_RECORD_SCHEMA,
  ICC_ACTOR_RECORD_FIXTURE,
  createActorRecord,
} from "../actor-record.js";

describe("actor-record — ICC fixture", () => {
  it("validates ICC licensed-source actor", () => {
    expect(ACTOR_RECORD_SCHEMA.safeParse(ICC_ACTOR_RECORD_FIXTURE).success).toBe(true);
    expect(ICC_ACTOR_RECORD_FIXTURE.actorId).toBe("did:hauska:actor:org:icc");
    expect(ICC_ACTOR_RECORD_FIXTURE.sourceLicensing?.licenseRef).toBe("icc-code-connect-poc");
    expect(ICC_ACTOR_RECORD_FIXTURE.sourceLicensing?.meterFreeTier).toBe(true);
    expect(ICC_ACTOR_RECORD_FIXTURE.sourceLicensing?.derivedOk).toBe(false);
  });
});

describe("actor-record — licensed-source refine", () => {
  it("rejects licensed-source without sourceLicensing", () => {
    const bad = {
      ...ICC_ACTOR_RECORD_FIXTURE,
      sourceLicensing: undefined,
    };
    expect(ACTOR_RECORD_SCHEMA.safeParse(bad).success).toBe(false);
  });

  it("rejects licensed-source with incomplete sourceLicensing", () => {
    const bad = {
      ...ICC_ACTOR_RECORD_FIXTURE,
      sourceLicensing: {
        licenseRef: "icc-code-connect-poc",
        meterFreeTier: true,
        purgeOnWindDown: true,
        // derivedOk missing
      },
    };
    expect(ACTOR_RECORD_SCHEMA.safeParse(bad).success).toBe(false);
  });

  it("allows non-licensed org without sourceLicensing", () => {
    const cityOrg = createActorRecord({
      entityType: "actor-record",
      actorId: "did:hauska:actor:org:bastrop",
      actorType: "organization",
      displayName: "City of Bastrop",
      trustLevel: "verified-org",
      tenantKind: "city",
      accessPolicy: "platform-internal",
    });
    expect(cityOrg.tenantKind).toBe("city");
    expect(cityOrg.sourceLicensing).toBeUndefined();
  });
});
