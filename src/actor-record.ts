/**
 * Actor-record atom type per ADR-015.
 *
 * Typed target for {@link ObligationAtomInstance.owedToActorDid}. Licensing
 * commercial terms live on licensed-source organizations — NOT as a parallel
 * obligation or SourceAttribution type.
 */

import { z } from "zod";

import type { AccessPolicy } from "./registration.js";
import { ACCESS_POLICY_SCHEMA } from "./conformance/common.js";

export type ActorType = "person" | "agent" | "organization";

export const ACTOR_TYPES: ReadonlyArray<ActorType> = ["person", "agent", "organization"];

export type ActorTrustLevel =
  | "verified-human"
  | "verified-org"
  | "known-agent"
  | "unverified";

export const ACTOR_TRUST_LEVELS: ReadonlyArray<ActorTrustLevel> = [
  "verified-human",
  "verified-org",
  "known-agent",
  "unverified",
];

export type OrganizationTenantKind =
  | "city"
  | "firm"
  | "enterprise-customer"
  | "internal"
  | "public"
  | "licensed-source";

export const ORGANIZATION_TENANT_KINDS: ReadonlyArray<OrganizationTenantKind> = [
  "city",
  "firm",
  "enterprise-customer",
  "internal",
  "public",
  "licensed-source",
];

/**
 * Commercial terms for a licensed-source organization.
 * NOT an obligation record — rates the meter reads when minting
 * ObligationAtomInstance rows owed to this actor.
 */
export interface ActorLicensingTerms {
  perReferenceRateMinor?: number;
  currency?: string;
  revShareBps?: number;
  licenseRef: string;
  meterFreeTier: boolean;
  purgeOnWindDown: boolean;
  derivedOk: boolean;
}

export interface ActorRecordAtomInstance {
  entityType: "actor-record";
  /** DID — this is what ObligationAtomInstance.owedToActorDid holds. */
  actorId: string;
  actorType: ActorType;
  displayName: string;
  trustLevel: ActorTrustLevel;
  accessPolicy: AccessPolicy;
  agentVersion?: string;
  producerSurface?: string;
  principalActor?: string;
  tenantKind?: OrganizationTenantKind;
  jurisdictionalScope?: string;
  /** Required when tenantKind === "licensed-source". */
  sourceLicensing?: ActorLicensingTerms;
  sourceCitation?: string;
  extractedAt?: string;
}

export const ACTOR_LICENSING_TERMS_SCHEMA = z
  .object({
    perReferenceRateMinor: z.number().int().nonnegative().optional(),
    currency: z.string().min(1).optional(),
    revShareBps: z.number().int().min(0).max(10000).optional(),
    licenseRef: z.string().min(1),
    meterFreeTier: z.boolean(),
    purgeOnWindDown: z.boolean(),
    derivedOk: z.boolean(),
  })
  .readonly();

export const ACTOR_RECORD_SCHEMA = z
  .object({
    entityType: z.literal("actor-record"),
    actorId: z.string().min(1),
    actorType: z.enum(ACTOR_TYPES as [ActorType, ...ActorType[]]),
    displayName: z.string().min(1),
    trustLevel: z.enum(ACTOR_TRUST_LEVELS as [ActorTrustLevel, ...ActorTrustLevel[]]),
    accessPolicy: ACCESS_POLICY_SCHEMA,
    agentVersion: z.string().min(1).optional(),
    producerSurface: z.string().min(1).optional(),
    principalActor: z.string().min(1).optional(),
    tenantKind: z
      .enum(ORGANIZATION_TENANT_KINDS as [OrganizationTenantKind, ...OrganizationTenantKind[]])
      .optional(),
    jurisdictionalScope: z.string().min(1).optional(),
    sourceLicensing: ACTOR_LICENSING_TERMS_SCHEMA.optional(),
    sourceCitation: z.string().min(1).optional(),
    extractedAt: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tenantKind !== "licensed-source") {
      return;
    }
    if (data.sourceLicensing === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "licensed-source actors require sourceLicensing",
        path: ["sourceLicensing"],
      });
      return;
    }
    const licensing = data.sourceLicensing;
    const requiredFields: Array<keyof Pick<
      ActorLicensingTerms,
      "licenseRef" | "meterFreeTier" | "purgeOnWindDown" | "derivedOk"
    >> = ["licenseRef", "meterFreeTier", "purgeOnWindDown", "derivedOk"];
    for (const field of requiredFields) {
      if (licensing[field] === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `licensed-source sourceLicensing requires ${field}`,
          path: ["sourceLicensing", field],
        });
      }
    }
  });

export function createActorRecord(
  input: z.input<typeof ACTOR_RECORD_SCHEMA>,
): ActorRecordAtomInstance {
  return ACTOR_RECORD_SCHEMA.parse(input) as ActorRecordAtomInstance;
}

/** ICC Code Connect POC test account per Gate B §5.7. */
export const ICC_ACTOR_RECORD_FIXTURE: ActorRecordAtomInstance = {
  entityType: "actor-record",
  actorId: "did:hauska:actor:org:icc",
  actorType: "organization",
  displayName: "International Code Council",
  trustLevel: "verified-org",
  tenantKind: "licensed-source",
  accessPolicy: "platform-internal",
  sourceLicensing: {
    licenseRef: "icc-code-connect-poc",
    meterFreeTier: true,
    purgeOnWindDown: true,
    derivedOk: false,
  },
};
