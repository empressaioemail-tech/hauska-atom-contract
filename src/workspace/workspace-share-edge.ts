import { z } from "zod";

import { WORKSPACE_ATOM_METADATA_SCHEMA, type WorkspaceAtomMetadata } from "./common.js";

export interface WorkspaceShareConsentFlags {
  ownerGranted: boolean;
  recipientAccepted: boolean;
  canReshare: boolean;
}

export interface WorkspaceShareEdge extends WorkspaceAtomMetadata {
  entityType: "workspace-share-edge";
  fromUserDid: string;
  toUserDid: string;
  workspaceDid: string;
  sharedAt: string;
  consentFlags: WorkspaceShareConsentFlags;
}

export const WORKSPACE_SHARE_CONSENT_FLAGS_SCHEMA = z.object({
  ownerGranted: z.boolean(),
  recipientAccepted: z.boolean(),
  canReshare: z.boolean(),
});

export const WORKSPACE_SHARE_EDGE_SCHEMA = WORKSPACE_ATOM_METADATA_SCHEMA.extend({
  entityType: z.literal("workspace-share-edge"),
  fromUserDid: z.string().min(1),
  toUserDid: z.string().min(1),
  workspaceDid: z.string().min(1),
  sharedAt: z.string().min(1),
  consentFlags: WORKSPACE_SHARE_CONSENT_FLAGS_SCHEMA,
}).refine((value) => value.fromUserDid !== value.toUserDid, {
  message: "fromUserDid and toUserDid must differ",
  path: ["toUserDid"],
});

export function validateWorkspaceShareEdge(input: unknown): WorkspaceShareEdge {
  return WORKSPACE_SHARE_EDGE_SCHEMA.parse(input);
}
