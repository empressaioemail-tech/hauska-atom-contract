import { z } from "zod";

import type { AccessPolicy } from "../registration.js";

export const WORKSPACE_ATOM_ENTITY_TYPES = [
  "property-workspace",
  "brief-run",
  "workspace-attachment",
  "workspace-share-edge",
] as const;

export type WorkspaceAtomEntityType = (typeof WORKSPACE_ATOM_ENTITY_TYPES)[number];

export const USER_REF_SCHEMA = z.object({
  did: z.string().min(1),
  displayName: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
});

export type UserRef = z.infer<typeof USER_REF_SCHEMA>;

export const ACCESS_POLICY_SCHEMA = z.enum([
  "public-free",
  "public-paid",
  "platform-internal",
  "tenant-private",
  "tenant-shared",
]);

export const WORKSPACE_ATOM_METADATA_SCHEMA = z.object({
  did: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  accessPolicy: ACCESS_POLICY_SCHEMA,
});

export interface WorkspaceAtomMetadata {
  did: string;
  createdAt: string;
  updatedAt: string;
  accessPolicy: AccessPolicy;
}
