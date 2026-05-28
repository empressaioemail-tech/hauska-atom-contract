import { z } from "zod";

import { USER_REF_SCHEMA, WORKSPACE_ATOM_METADATA_SCHEMA, type UserRef, type WorkspaceAtomMetadata } from "./common.js";

export type WorkspaceAttachmentKind = "link" | "image" | "pdf" | "note";

export interface WorkspaceAttachment extends WorkspaceAtomMetadata {
  entityType: "workspace-attachment";
  workspaceDid: string;
  kind: WorkspaceAttachmentKind;
  uri?: string;
  body?: string;
  uploader: UserRef;
}

export const WORKSPACE_ATTACHMENT_KIND_SCHEMA = z.enum([
  "link",
  "image",
  "pdf",
  "note",
]);

export const WORKSPACE_ATTACHMENT_SCHEMA = WORKSPACE_ATOM_METADATA_SCHEMA.extend({
  entityType: z.literal("workspace-attachment"),
  workspaceDid: z.string().min(1),
  kind: WORKSPACE_ATTACHMENT_KIND_SCHEMA,
  uri: z.string().url().optional(),
  body: z.string().min(1).optional(),
  uploader: USER_REF_SCHEMA,
}).superRefine((value, ctx) => {
  if (value.kind === "note" && !value.body) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["body"],
      message: "note attachments require body",
    });
  }
  if (value.kind !== "note" && !value.uri) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["uri"],
      message: `${value.kind} attachments require uri`,
    });
  }
});

export function validateWorkspaceAttachment(input: unknown): WorkspaceAttachment {
  return WORKSPACE_ATTACHMENT_SCHEMA.parse(input);
}
