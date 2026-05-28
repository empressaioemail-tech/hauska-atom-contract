import { z } from "zod";

import {
  USER_REF_SCHEMA,
  WORKSPACE_ATOM_METADATA_SCHEMA,
  type UserRef,
  type WorkspaceAtomMetadata,
} from "./common.js";

export interface PropertyAddressIdentity {
  line1: string;
  line2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string;
}

export interface PropertyWorkspace extends WorkspaceAtomMetadata {
  entityType: "property-workspace";
  address: PropertyAddressIdentity;
  listingUrls: ReadonlyArray<string>;
  owner: UserRef;
  collaborators: ReadonlyArray<UserRef>;
}

export const PROPERTY_ADDRESS_IDENTITY_SCHEMA = z.object({
  line1: z.string().min(1),
  line2: z.string().min(1).optional(),
  city: z.string().min(1),
  stateOrProvince: z.string().min(1),
  postalCode: z.string().min(1),
  countryCode: z.string().length(2),
});

export const PROPERTY_WORKSPACE_SCHEMA = WORKSPACE_ATOM_METADATA_SCHEMA.extend({
  entityType: z.literal("property-workspace"),
  address: PROPERTY_ADDRESS_IDENTITY_SCHEMA,
  listingUrls: z.array(z.string().url()).min(1),
  owner: USER_REF_SCHEMA,
  collaborators: z.array(USER_REF_SCHEMA),
});

export function validatePropertyWorkspace(input: unknown): PropertyWorkspace {
  return PROPERTY_WORKSPACE_SCHEMA.parse(input);
}
