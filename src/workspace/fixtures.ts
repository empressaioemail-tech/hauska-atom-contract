import type { BriefRun } from "./brief-run.js";
import type { PropertyWorkspace } from "./property-workspace.js";
import type { WorkspaceAttachment } from "./workspace-attachment.js";
import type { WorkspaceShareEdge } from "./workspace-share-edge.js";

export const SAMPLE_PROPERTY_WORKSPACE: PropertyWorkspace = {
  entityType: "property-workspace",
  did: "did:hauska:workspace:123-main-st",
  createdAt: "2026-05-28T10:00:00Z",
  updatedAt: "2026-05-28T10:00:00Z",
  accessPolicy: "tenant-private",
  address: {
    line1: "123 Main St",
    city: "Austin",
    stateOrProvince: "TX",
    postalCode: "78701",
    countryCode: "US",
  },
  listingUrls: ["https://www.example.com/listings/123-main-st"],
  owner: {
    did: "did:hauska:user:owner-1",
    displayName: "Owner User",
    role: "owner",
  },
  collaborators: [
    {
      did: "did:hauska:user:collab-1",
      displayName: "Collaborator User",
      role: "analyst",
    },
  ],
};

export const SAMPLE_BRIEF_RUN: BriefRun = {
  entityType: "brief-run",
  did: "did:hauska:brief-run:123-main-st-run-1",
  createdAt: "2026-05-28T10:05:00Z",
  updatedAt: "2026-05-28T10:05:00Z",
  accessPolicy: "tenant-private",
  workspaceDid: SAMPLE_PROPERTY_WORKSPACE.did,
  runInputs: {
    objective: "Summarize constraints and opportunities",
    targetAudience: "broker",
  },
  citationRefs: [
    {
      citationDid: "did:hauska:workspace-attachment:listing-link-1",
      sourceType: "attachment",
    },
  ],
  confidence: 0.91,
  generatedAt: "2026-05-28T10:05:00Z",
};

export const SAMPLE_WORKSPACE_ATTACHMENT_LINK: WorkspaceAttachment = {
  entityType: "workspace-attachment",
  did: "did:hauska:workspace-attachment:listing-link-1",
  createdAt: "2026-05-28T10:02:00Z",
  updatedAt: "2026-05-28T10:02:00Z",
  accessPolicy: "tenant-private",
  workspaceDid: SAMPLE_PROPERTY_WORKSPACE.did,
  kind: "link",
  uri: "https://www.example.com/listings/123-main-st",
  uploader: {
    did: "did:hauska:user:owner-1",
    role: "owner",
  },
};

export const SAMPLE_WORKSPACE_ATTACHMENT_NOTE: WorkspaceAttachment = {
  entityType: "workspace-attachment",
  did: "did:hauska:workspace-attachment:note-1",
  createdAt: "2026-05-28T10:03:00Z",
  updatedAt: "2026-05-28T10:03:00Z",
  accessPolicy: "tenant-private",
  workspaceDid: SAMPLE_PROPERTY_WORKSPACE.did,
  kind: "note",
  body: "Seller confirms recent roof replacement in 2024.",
  uploader: {
    did: "did:hauska:user:collab-1",
    role: "analyst",
  },
};

export const SAMPLE_WORKSPACE_SHARE_EDGE: WorkspaceShareEdge = {
  entityType: "workspace-share-edge",
  did: "did:hauska:workspace-share-edge:owner-to-broker-1",
  createdAt: "2026-05-28T10:04:00Z",
  updatedAt: "2026-05-28T10:04:00Z",
  accessPolicy: "tenant-private",
  fromUserDid: "did:hauska:user:owner-1",
  toUserDid: "did:hauska:user:broker-1",
  workspaceDid: SAMPLE_PROPERTY_WORKSPACE.did,
  sharedAt: "2026-05-28T10:04:00Z",
  consentFlags: {
    ownerGranted: true,
    recipientAccepted: true,
    canReshare: false,
  },
};
