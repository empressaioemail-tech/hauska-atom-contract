import { deriveEvtNodeId } from "./node-id.js";
import type { AnticipatoryAtom } from "./anticipatory-atom.js";
import type { WouldAffectEdge } from "./would-affect-edge.js";

const SAMPLE_SOURCE = "legislative-tracker";
const SAMPLE_EXTERNAL_ID = "tx-hb-1234-2026";

export const SAMPLE_EVT_NODE_ID = deriveEvtNodeId(
  SAMPLE_SOURCE,
  SAMPLE_EXTERNAL_ID,
);

/** Anticipatory atom with future valid_from — valid round-trip fixture. */
export const SAMPLE_ANTICIPATORY_ATOM: AnticipatoryAtom = {
  family: "event",
  claim_type: "anticipatory.legislative_item",
  valid_from: "2027-01-15T00:00:00.000Z",
  confidence: { basis: "asserted", estimate: 0.6 },
  source: SAMPLE_SOURCE,
  external_id: SAMPLE_EXTERNAL_ID,
};

export const SAMPLE_WOULD_AFFECT_EDGE: WouldAffectEdge = {
  type: "would_affect",
  sourceNodeId: SAMPLE_EVT_NODE_ID,
  targetSubjectId: "parcel_abc123def456",
  effectiveDate: "2027-06-01",
  immutable: true,
};
