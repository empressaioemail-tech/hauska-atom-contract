/**
 * P-167 (OPS-23 R-6). Moved verbatim from legacy-design-tools
 * `artifacts/smartsite-mcp/src/vocabulary.ts` (origin/main 55c4ad44, the
 * P-91 v3 table): the disposition enum, the refusal codes, the two Open
 * failure sentences, citationsDegraded, confidence "seed", edge role
 * side_corner, and frame quality gis-approximate. No display string below
 * was reworded in the move; only the import mechanism changed (see next
 * paragraph) and the stale entry-count comment was corrected (see
 * `DOCUMENTED_VOCABULARY_COUNT`, enforced by a test that counts).
 *
 * The nine display constants this table used to import as VALUES from the
 * MCP server's own `mcp-app.ts` (STATE_WORDS, OPEN_DID_NOT_REACH_ME,
 * NOT_ON_FILE_PREFIX, NO_BAKED_SNAPSHOT_PREFIX, UPGRADE_TO_OPEN,
 * NOT_IMPLEMENTED_PREFIX, CITATION_DEGRADED, EDGE_WORDS, envelopeHuman) are
 * moved in below, verbatim, so this module has no dependency on the MCP
 * server. This is now the one place these strings are owned; a consumer
 * (the panel included) imports the value from here rather than retyping it.
 */

/**
 * The panel's five-state PAINT vocabulary (originally typed against
 * mcp-app.ts's local `CellState`). Renamed here to make explicit that this
 * is the MCP panel's own paint-state enum, not the ledger's six-state cell
 * vocabulary (OPS-21, `_catalog/program_preambles/OPS-21.md`) — a
 * deliberately different, narrower concept this table happens to need for
 * one Record's key type. Not exported: nothing outside this module typed
 * against the original `CellState` name (vocabulary.ts imported only the
 * STATE_WORDS value, never the type), so the rename is invisible to every
 * existing importer.
 */
type PanelPaintState = "present" | "absent-verified" | "unknown" | "refused" | "unread";

/** mcp-app.ts:304. */
export const NOT_ON_FILE_PREFIX = "Not on file in";
/** mcp-app.ts:305. */
export const NO_BAKED_SNAPSHOT_PREFIX = "No baked snapshot yet for";
/** mcp-app.ts:307. */
export const UPGRADE_TO_OPEN = "Upgrade to open this parcel";
/** mcp-app.ts:333. */
export const NOT_IMPLEMENTED_PREFIX = "Not implemented";
/** mcp-app.ts:3023. */
export const OPEN_DID_NOT_REACH_ME = "Open did not reach me";

/**
 * mcp-app.ts:448-451. Maps exactly one token, `atom_path_pending`, to its
 * display sentence; every other reason passes through unchanged.
 */
export function envelopeHuman(reason: string | undefined): string | undefined {
  if (reason === "atom_path_pending") return "Withheld, setbacks unruled";
  return reason;
}

/**
 * P-153 sibling of `envelopeHuman` (folded into the package at P-167 step 2,
 * moved verbatim from mcp-app.ts:462-467), for a `state: "present"` envelope
 * overlay's `basis` (never its `reason` — a present overlay carries no
 * `reason`, so `envelopeHuman` never applies to it; see tool-honesty.ts's
 * `honestOverlay`). Mirrors hauska-map's equivalent panel copy (`buildable.ts`
 * in this same subpath) for the same underlying state: the buildable-envelope
 * polygon is drawn from a real district + setback table, while the
 * buildable-AREA figure stays withheld pending an atom.
 */
export function envelopeBasisHuman(basis: string | undefined): string | undefined {
  if (basis === "modelled-figure-withheld") {
    return "Buildable envelope modelled from setbacks — area withheld pending an atom";
  }
  return basis;
}

/** mcp-app.ts:523. D1: adjacency and role words. Keys are the wire enum; any other value prints verbatim. */
export const EDGE_WORDS: Record<string, string> = {
  front: "front",
  side: "side",
  rear: "rear",
  side_corner: "corner side",
  alley: "alley",
  ROW: "right of way",
  "neighbor-parcel": "neighbor",
  unmapped: "unmapped",
};

/** mcp-app.ts:550. F1: a section or overlay that claims a fact without an https citation says so; the text, never a link. */
export const CITATION_DEGRADED = "citation degraded";

/** mcp-app.ts:575. The five-state legend words, one per paint state. */
export const STATE_WORDS: Record<PanelPaintState, string> = {
  present: "present",
  "absent-verified": "absent, verified",
  unknown: "unknown",
  refused: "refused",
  unread: "unread",
};

export type VocabularyEntry = {
  /** The exact machine token as it appears in code or on the wire. */
  token: string;
  /** The exact string a lay reader gets. Sourced from the panel's own copy where one exists. */
  displayText: string;
  /** One line: what the token means, and where it matters, what it does not claim. */
  meaning: string;
};

/**
 * Wire-level section disposition words (tool-honesty.ts sectionDisposition
 * / ExternalBriefSectionDisposition). Distinct from the panel's five-state
 * PAINT vocabulary (STATE_WORDS / PanelPaintState above), though as of P-91
 * v3 item 1 the two now overlap: `unknown` and `absent-verified` are the
 * union's own display words, not the panel's earned-locally versions of
 * them (a section that CLAIMS one of those two is preserved as claimed, not
 * re-derived -- see tool-honesty.ts sectionDisposition). Cortex does not
 * emit either at section level today (confirmed against
 * artifacts/api-server's own R1BriefSectionDisposition type and the WDLL
 * item 5 ruling withholding absent-verified there), so in practice the wire
 * still only ever carries the original four; this table's other two rows
 * exist so the display text is correct the day a section does. Both rows
 * reuse STATE_WORDS' own strings rather than retype them, so the panel's
 * word and the wire's word for the same token cannot drift apart.
 */
export const WIRE_DISPOSITION_DISPLAY_TEXT: Record<
  "present" | "refused" | "absent" | "unread" | "unknown" | "absent-verified",
  string
> = {
  present: "Present",
  refused: "Refused",
  absent: "Reported absent",
  unread: "Not read",
  unknown: STATE_WORDS.unknown,
  "absent-verified": STATE_WORDS["absent-verified"],
};

/**
 * V5 (P-91 v3). Nothing in the wire shape prohibited computing an area or a
 * coverage ratio from draw.ring; a session did exactly that. This is the
 * stated policy, carried in the payload next to the geometry it governs
 * (see sanitizeExternalDraw), not left as a convention nobody reads.
 */
export const DERIVED_FIGURES_POLICY = {
  denies: [
    "area",
    "coverage_ratio",
    "lot_coverage_pct",
    "setback_distance",
    "buildable_area",
  ],
  reason:
    "ring, edges, and overlays are for rendering only. Do not compute an area, a coverage ratio, a percentage, or a distance from them; use a brief section's own figure, or say the figure is not on record.",
} as const;

function requireString(value: string | undefined, what: string): string {
  if (!value) {
    throw new Error(`vocabulary: ${what} produced no display string`);
  }
  return value;
}

/**
 * atom_path_pending's display text is read out of envelopeHuman, the same
 * function the panel calls, rather than retyped here. If that mapping is
 * ever removed, this throws at module load instead of silently shipping the
 * raw token as its own "display text".
 */
const ATOM_PATH_PENDING_DISPLAY_TEXT = requireString(
  envelopeHuman("atom_path_pending"),
  'envelopeHuman("atom_path_pending")',
);

/**
 * P-153 (Ruling B reversed for the polygon only), folded in at P-167 step 2.
 * A draw overlay's `basis`, not `reason` — this token names a `state:
 * "present"` overlay, never a refused one. Read through `envelopeBasisHuman`
 * above, same requireString-at-load-time posture as
 * ATOM_PATH_PENDING_DISPLAY_TEXT.
 */
const MODELLED_FIGURE_WITHHELD_DISPLAY_TEXT = requireString(
  envelopeBasisHuman("modelled-figure-withheld"),
  'envelopeBasisHuman("modelled-figure-withheld")',
);

/**
 * The real, current entry count of VOCABULARY below, checked by a test
 * (`wire.test.ts`) so this number cannot go stale the way the source
 * table's own comment did (it said "19 entries" while the table had grown
 * to 34; see `_inbox/2026-09-11_ops23_wave1_verify_p167.md` finding 4).
 */
export const DOCUMENTED_VOCABULARY_COUNT = 35;

/**
 * V1. 35 entries (`DOCUMENTED_VOCABULARY_COUNT`, enforced by a counting
 * test): the disposition enum, the panel-only paint additions
 * (absent-verified, unknown), the two Open failure sentences (kept
 * distinct, checked by tests), citationsDegraded, confidence "seed", frame
 * quality gis-approximate, edge role side_corner, the refusal/reason codes
 * read out of tool-honesty.ts, mcp-app.ts and their tests
 * (declined-in-bake, not-in-bake, atom_path_pending, upgrade_required,
 * parcel_not_found, baked_snapshot_not_found, parcel_batch_cap,
 * depth_not_implemented), the P-91 v3 Q1 near/street refusal codes, the
 * P-106 find_parcels refusal codes, the P-107 out_of_coverage miss class,
 * and the P-153 modelled-figure-withheld draw-overlay basis (folded in at
 * P-167 step 2). Every token here is grepped out of the source, not
 * invented; see the P-91 v3 handback for the grep trail.
 */
export const VOCABULARY: readonly VocabularyEntry[] = [
  {
    token: "present",
    displayText: WIRE_DISPOSITION_DISPLAY_TEXT.present,
    meaning:
      "The section or rail carries confirmed on-record data for this parcel.",
  },
  {
    token: "absent",
    displayText: WIRE_DISPOSITION_DISPLAY_TEXT.absent,
    meaning:
      "The source claims no record exists, not yet verified by provenance or a known vintage. A claim, not yet a confirmed absence.",
  },
  {
    token: "absent-verified",
    displayText: STATE_WORDS["absent-verified"],
    meaning:
      "Confirmed absent: the absence claim carries provenance or a known source vintage. A panel-side paint state, earned from a wire 'absent' claim, never asserted directly on the wire.",
  },
  {
    token: "unknown",
    displayText: STATE_WORDS.unknown,
    meaning:
      "Not a finding either way. The record neither confirms present nor earns a verified absence.",
  },
  {
    token: "refused",
    displayText: WIRE_DISPOSITION_DISPLAY_TEXT.refused,
    meaning:
      "The producer declined to answer on this read path. See the refusal code and reason for why.",
  },
  {
    token: "unread",
    displayText: WIRE_DISPOSITION_DISPLAY_TEXT.unread,
    meaning:
      "Not read on this call. Distinct from absent: nothing was checked, so there is no claim to report either way.",
  },
  {
    token: "citationsDegraded",
    displayText: CITATION_DEGRADED,
    meaning:
      "A present claim carries no verifiable https citation; the source exists but could not be linked.",
  },
  {
    token: "gis-approximate",
    displayText: "GIS-approximate",
    meaning:
      "frame.quality: the boundary ring is derived from public GIS parcel geometry, not a field survey. Printed distances are approximate, not surveyed.",
  },
  {
    token: "seed",
    displayText: "Seed confidence",
    meaning:
      "draw.confidence: a first-pass geometric estimate, not a calibrated confidence score, a percentage, or a probability.",
  },
  {
    token: "side_corner",
    displayText: requireString(EDGE_WORDS.side_corner, "EDGE_WORDS.side_corner"),
    meaning:
      "The property line runs along a corner lot's side yard, not its primary front or rear line.",
  },
  {
    token: "atom_path_pending",
    displayText: ATOM_PATH_PENDING_DISPLAY_TEXT,
    meaning:
      "Setbacks and the buildable envelope have not been ruled or baked for this jurisdiction yet; no distance or polygon exists to report.",
  },
  /**
   * P-153 (Ruling B reversed for the polygon only), folded in at P-167 step
   * 2. A draw overlay's `basis`, not `reason` — this token names a `state:
   * "present"` overlay, never a refused one. Mirrors hauska-map's equivalent
   * panel state (this subpath's `buildable.ts`) for the same parcels: the
   * polygon draws, the area figure stays withheld.
   */
  {
    token: "modelled-figure-withheld",
    displayText: MODELLED_FIGURE_WITHHELD_DISPLAY_TEXT,
    meaning:
      "draw overlay basis (present-state envelope only): the buildable-envelope polygon is drawn from a real, resolved district + setback table, but the buildable-area figure (sq ft or percent) stays withheld pending an atom. DERIVED_FIGURES_POLICY denies buildable_area regardless of this token.",
  },
  {
    token: "upgrade_required",
    displayText: UPGRADE_TO_OPEN,
    meaning:
      "The caller's tier does not include this depth of read. A plan upgrade or a 30-day unlock on the parcel is required.",
  },
  {
    token: "parcel_not_found",
    displayText: `${NOT_ON_FILE_PREFIX} <county>`,
    meaning:
      "No parcel record exists in this server's coverage for the given id. A genuine server-declared miss (missClass absent), distinct from 'open_did_not_reach_me', which is a client-side delivery failure and makes no claim about the parcel.",
  },
  {
    token: "baked_snapshot_not_found",
    displayText: `${NO_BAKED_SNAPSHOT_PREFIX} <parcelNodeId>`,
    meaning:
      "The parcel itself may exist, but the Smart Site facet snapshot has not been baked yet. parcelExists states whether the parcel itself was confirmed, independent of this snapshot miss.",
  },
  {
    token: "parcel_batch_cap",
    displayText: "Batch too large",
    meaning:
      "The request exceeded the array cap for this depth: 50 at stub, 25 at node.",
  },
  {
    token: "open_did_not_reach_me",
    displayText: OPEN_DID_NOT_REACH_ME,
    meaning:
      "Client-side only: the Open click produced no tool result within the host's timeout window. No claim was made about the parcel; this is not a miss, distinct from 'parcel_not_found'.",
  },
  {
    token: "depth_not_implemented",
    displayText: NOT_IMPLEMENTED_PREFIX,
    meaning:
      "hop1 and subgraph depths are not built yet. Not a data miss; the read path itself does not exist.",
  },
  {
    token: "declined-in-bake",
    displayText: "Declined in bake",
    meaning:
      "refusal.code: the producer evaluated this facet during the bake and declined it. refusal.declineReason carries the specific sub-reason (for example no-zoning-stamp).",
  },
  {
    token: "not-in-bake",
    displayText: "Not in bake",
    meaning:
      "refusal.code: this facet was never attempted in the bake that produced this snapshot.",
  },
  /**
   * P-91 v3 Q1. The five closed refusal codes radius-search and
   * street-search return as a 422 `serve_refused` body (gtmErrorClass.ts,
   * txgioRadiusSearch.ts, txgioStreetSearch.ts, read 2026-08-31). Every one
   * of these is a DECLARED REFUSAL, not an upstream fault: the producer
   * looked at the request and answered honestly that it will not (or
   * cannot) bound the result. tool-honesty.ts's declarePlaceSearchRefusal
   * reads the display text for these five back out of this table, so the
   * word the model sees and the word documented here cannot drift apart.
   * No numeric threshold (the radius max, the candidate ceiling) is
   * hardcoded into any meaning below: those values live in api-server, a
   * repo this package has no dependency on and cannot verify was not
   * bumped since this was written.
   */
  {
    token: "radius_invalid",
    displayText: "Invalid radius search input",
    meaning:
      "serve_refused reason (near): lat, lng, or radiusFt was missing, non-finite, or radiusFt was not a positive number. A caller-input problem on this specific call, not a claim about the area.",
  },
  {
    token: "radius_exceeds_max",
    displayText: "Radius exceeds the maximum",
    meaning:
      "serve_refused reason (near): radiusFt exceeded the stated maximum this search allows. Lower the radius and retry; not a claim that no parcels exist out there.",
  },
  {
    token: "radius_unbounded",
    displayText: "Too many parcels in that radius",
    meaning:
      "serve_refused reason (near): the candidate parcel count for that point and radius exceeded what this search can bound honestly. Too many parcels in that radius to answer, not that the search failed; narrow the radius or lower cap.",
  },
  {
    token: "bare_street_unbounded",
    displayText: "Street name needs a locality",
    meaning:
      "serve_refused reason (street): a bare street name with no city, ZIP, or countyFips was refused rather than run as an unbounded contains across every county in coverage. Add a city, ZIP, or countyFips and retry.",
  },
  {
    token: "bare_street_not_a_street",
    displayText: "Not a bare street name",
    meaning:
      "serve_refused reason (street): the query reads as a house-number-prefixed address, not a bare street name. Use find_parcel's plain query (or near) for one specific address instead of street.",
  },
  /**
   * P-106. find_parcels' declared refusals, same 422 serve_refused envelope as
   * the five above. Every one of these is the producer answering honestly
   * rather than failing. No numeric threshold appears in a meaning below: the
   * county list and the unmeasured ceiling live in api-server, which this
   * package has no dependency on and cannot verify was not changed since this
   * was written. The one number that matters travels in the refusal's own
   * `detail`, measured on the same snapshot as the answer would have been.
   */
  {
    token: "constraint_bound_missing",
    displayText: "A county is required",
    meaning:
      "serve_refused reason (find_parcels): no geographic bound was given. There is no statewide constraint search, because incorporation is dispositioned for a small share of Texas parcels and a statewide answer would imply coverage that does not exist. Give countyFips.",
  },
  {
    token: "constraint_county_out_of_scope",
    displayText: "No constraint index for that county",
    meaning:
      "serve_refused reason (find_parcels): the projection has never been built for that county. Refused rather than answered with an empty set, because an empty set reads as \"no parcels match\" and this is not that claim.",
  },
  {
    token: "constraint_single_address",
    displayText: "That is a lookup, not a search",
    meaning:
      "serve_refused reason (find_parcels): the query reads as one street address. Use find_parcel, singular, for a single address; find_parcels answers questions across parcels.",
  },
  {
    token: "constraint_filters_missing",
    displayText: "At least one filter is required",
    meaning:
      "serve_refused reason (find_parcels): a county with no filter is not a search. Give at least one {rail, op, value}.",
  },
  {
    token: "constraint_rail_unknown",
    displayText: "Unknown rail",
    meaning:
      "serve_refused reason (find_parcels): the named rail is not one this search carries. The refusal lists the rails that are.",
  },
  {
    token: "constraint_op_unsupported",
    displayText: "That operator does not apply to that rail",
    meaning:
      "serve_refused reason (find_parcels): an ordered comparison on a rail with no ordered value, a categorical match on a rail with no categorical value, or a flag test on a rail with no flag. A caller-input problem on this call, not a claim about the parcels.",
  },
  {
    token: "constraint_cap_invalid",
    displayText: "Invalid cap",
    meaning:
      "serve_refused reason (find_parcels): cap was outside the range this search allows.",
  },
  {
    token: "constraint_rail_unmeasured",
    displayText: "Too little of that rail is measured to search on it",
    meaning:
      "serve_refused reason (find_parcels): the filtered rail is unmeasured on more of the county than the configured ceiling allows, so a search over it would evaluate a small fraction of the county while presenting itself as a search. detail carries the measured percentage, the parcel counts it came from, and the ceiling. Not a claim that no parcels match.",
  },
  {
    token: "constraint_projection_missing",
    displayText: "The projection has no rows for that county",
    meaning:
      "serve_refused reason (find_parcels): the constraint index holds no parcels for that county, so there is nothing to filter. Refused rather than reported as zero matches, because zero matches and never built are different facts.",
  },
  /**
   * P-107 (OPS-16 A-072). find_parcel's missing miss class. Mirrors
   * SitusSearchMissClass in artifacts/api-server/src/lib/
   * txgioAddressResolve.ts (read 2026-09-04): a query whose parsed state is
   * a real, recognised state/territory other than the one the store covers
   * today returns this missClass on a normal 200, before the ordinary
   * search ever runs. Not a serve_refused refusal (find_parcel's query
   * mode has no 422 refusal path) so it is not a PlaceSearchRefusalCode
   * member; the wire carries it as `missClass`, same slot as `no-hit`, and
   * tool-honesty.ts's splitFindParcelHits reads this row's displayText
   * (never re-typed) plus its own hand-mirrored agentGuidance onto the
   * response when this token fires.
   */
  {
    token: "out_of_coverage",
    displayText: "Outside Smart Site coverage",
    meaning:
      "find_parcel missClass: the query resolved to a state Smart Site's parcel store has not reached yet. The honest opposite of 'no-hit': this is not a claim that the address is unverified or missing, only that coverage has not extended there. agentGuidance names what is covered today.",
  },
] as const;
