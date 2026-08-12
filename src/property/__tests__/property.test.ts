/**
 * Property reasoning atom kind tests — master WDLL 3.2–3.6.
 */

import { describe, expect, it } from "vitest";

import { REASONING_CHAIN_SCHEMA } from "../../reasoning-chain.js";
import { BUILDABLE_ENVELOPE_SCHEMA } from "../buildable-envelope.js";
import {
  BUILDABLE_ENVELOPE_ABSENCE_KINDS,
  toBuildableEnvelopeAbsenceKind,
} from "../common.js";
import { BUILDING_FOOTPRINT_SCHEMA } from "../building-footprint.js";
import {
  BASTROP_CITY_EASEMENT_FIXTURE,
  BASTROP_COUNTY_EASEMENT_ABSENCE_FIXTURE,
  BASTROP_COUNTY_FOOTPRINT_ABSENCE_FIXTURE,
  BASTROP_ML_FOOTPRINT_FIXTURE,
  BASTROP_PARCEL_FOOTPRINT_ABSENCE_FIXTURE,
  BASTROP_TERRAIN_EXPORT_FIXTURE,
  BEXAR_NULL_ZONING_FACT_FIXTURE,
  BASTROP_SPRING_STREET_ROAD_FIXTURE,
  COMAL_SETBACK_RULE_FIXTURE,
  FALLBACK_SETBACK_RULE_FIXTURE,
  HAYS_BUILDABLE_ENVELOPE_FIXTURE,
  BASTROP_ENVELOPE_SUPERSEDED_DECLINE_FIXTURE,
  BASTROP_ENVELOPE_UNZONED_DECLINE_FIXTURE,
  buildEnvelopeDeclineFixture,
  HAYS_ZONING_FACT_FIXTURE,
  BASTROP_PARCEL_NODE_FIXTURE,
  BASTROP_PARCEL_NODE_ABSENCE_FIXTURE,
  BASTROP_PARCEL_NODE_INCOMPLETE_FIXTURE,
  COUNTY_COVERAGE_PARCEL_NODE_ABSENCE_FIXTURE,
  TRAVIS_CROSSWALK_PARCEL_NODE_FIXTURE,
  NEGATIVE_EASEMENT_NON_PUBLIC_POLICY,
  NEGATIVE_ENVELOPE_NO_INPUT_REFS,
  NEGATIVE_ENVELOPE_ABSENCE_NO_VERIFIED,
  NEGATIVE_ENVELOPE_VERIFIED_WITHOUT_ABSENCE,
  NEGATIVE_FOOTPRINT_ABSENT_NO_VERIFIED,
  NEGATIVE_FOOTPRINT_ML_NO_ODC_BY,
  NEGATIVE_PARCEL_NODE_ABSENT_NO_VERIFIED,
  NEGATIVE_PARCEL_NODE_INLINE_GEOMETRY,
  NEGATIVE_PARCEL_NODE_NON_PUBLIC_POLICY,
  NEGATIVE_PARCEL_NODE_REF_AND_ABSENCE,
  NEGATIVE_PARCEL_NODE_REF_MISMATCH,
  NEGATIVE_SETBACK_BARE_STRING_CITATION,
  NEGATIVE_SETBACK_FALLBACK_NO_ABSENCE,
  NEGATIVE_TERRAIN_NO_DEM_REF,
  NEGATIVE_ZONING_DISTRICT_AND_ABSENCE,
  TRAVIS_PREFIX_SETBACK_RULE_FIXTURE,
  BASTROP_FLOOD_SFHA_FIXTURE,
  HAYS_FLOOD_OUTSIDE_SFHA_FIXTURE,
  BASTROP_FLOOD_NO_COVERAGE_FIXTURE,
  COUNTY_FLOOD_VERIFIED_ABSENCE_FIXTURE,
  NEGATIVE_FLOOD_SFHA_AND_ABSENCE,
  NEGATIVE_FLOOD_ABSENT_NO_VERIFIED,
  NEGATIVE_FLOOD_ABSENT_WITH_CLAIM,
  BASTROP_CAD_ROLL_FIXTURE,
  BASTROP_CAD_ROLL_JOIN_HOLD_FIXTURE,
  COUNTY_CAD_ROLL_ABSENCE_FIXTURE,
  NEGATIVE_CAD_ROLL_OWNER_ON_JOIN_HOLD,
  NEGATIVE_CAD_ROLL_EMPTY_PRESENT,
  BASTROP_LAND_USE_FIXTURE,
  BASTROP_OWNER_FACT_FIXTURE,
  BASTROP_OWNER_WITHHELD_FIXTURE,
  NEGATIVE_OWNER_FACT_BARE_MAILING,
  NEGATIVE_OWNER_FACT_PUBLIC_FREE,
  BASTROP_LAND_USE_NO_CODE_FIXTURE,
  NEGATIVE_LAND_USE_EMPTY_PRESENT,
  NEGATIVE_LAND_USE_COTALITY_TIER,
  BASTROP_RAIL_NEAR_FIXTURE,
  BASTROP_RAIL_OUTSIDE_BUFFER_FIXTURE,
  BASTROP_RAIL_NO_GEOMETRY_FIXTURE,
  NEGATIVE_RAIL_CORRIDOR_NEAR_AND_ABSENCE,
  NEGATIVE_RAIL_CORRIDOR_NEAR_INCOMPLETE,
  BASTROP_PIPELINE_NEAR_FIXTURE,
  BASTROP_PIPELINE_OUTSIDE_BUFFER_FIXTURE,
  BASTROP_PIPELINE_NO_GEOMETRY_FIXTURE,
  NEGATIVE_PIPELINE_NEAR_AND_ABSENCE,
  NEGATIVE_PIPELINE_NEAR_INCOMPLETE,
  BASTROP_WELL_ON_PARCEL_FIXTURE,
  BASTROP_WELL_NEAR_PARCEL_FIXTURE,
  BASTROP_WELL_ABSENCE_FIXTURE,
  NEGATIVE_WELL_NEAR_NO_DISTANCE,
  NEGATIVE_WELL_PUBLIC_PAID,
  BASTROP_SPECIAL_DISTRICT_OUTSIDE_FIXTURE,
  BASTROP_SPECIAL_DISTRICT_PRESENT_FIXTURE,
} from "../fixtures.js";
import { countyCoverageParcelNodeId } from "../common.js";
import {
  PARCEL_TERRAIN_MODEL_SCHEMA,
  TERRAIN_DEFAULT_ACCESS_POLICY,
} from "../parcel-terrain-model.js";
import {
  PARCEL_NODE_SCHEMA,
  parcelNodeAtomDid,
  createParcelNode,
} from "../parcel-node.js";
import { ROAD_NODE_SCHEMA } from "../road-node.js";
import { SETBACK_RULE_SCHEMA } from "../setback-rule.js";
import { UTILITY_EASEMENT_SCHEMA } from "../utility-easement.js";
import { ZONING_FACT_SCHEMA } from "../zoning-fact.js";
import { FLOOD_HAZARD_FACT_SCHEMA, createFloodHazardFact } from "../flood-hazard-fact.js";
import {
  RAIL_CORRIDOR_FACT_SCHEMA,
  createRailCorridorFact,
} from "../rail-corridor-fact.js";
import {
  RRC_PIPELINE_FACT_SCHEMA,
  createRrcPipelineFact,
} from "../rrc-pipeline-fact.js";
import { CAD_PARCEL_ROLL_SCHEMA, createCadParcelRoll } from "../cad-parcel-roll.js";
import { LAND_USE_FACT_SCHEMA, createLandUseFact } from "../land-use-fact.js";
import { OWNER_FACT_SCHEMA, createOwnerFact } from "../owner-fact.js";
import {
  SPECIAL_DISTRICT_FACT_SCHEMA,
  createSpecialDistrictFact,
} from "../special-district-fact.js";
import { WELL_FACT_SCHEMA, createWellFact } from "../well-fact.js";

describe("property — parcel-node (Rail 1 anchor)", () => {
  it("validates Bastrop 48021:27303 with a resolved geometry pointer", () => {
    expect(PARCEL_NODE_SCHEMA.safeParse(BASTROP_PARCEL_NODE_FIXTURE).success).toBe(
      true,
    );
    expect(BASTROP_PARCEL_NODE_FIXTURE.parcelNodeId).toBe("48021:27303");
    expect(BASTROP_PARCEL_NODE_FIXTURE.keyKind).toBe("prop_id");
    expect(BASTROP_PARCEL_NODE_FIXTURE.geometryStoreRef?.store).toBe(
      "txgio_parcel",
    );
    expect(BASTROP_PARCEL_NODE_FIXTURE.geometryLoaded).toBe(true);
    expect(BASTROP_PARCEL_NODE_FIXTURE.accessPolicy).toBe("public-free");
    expect(BASTROP_PARCEL_NODE_FIXTURE.atomTier).toBe("data");
  });

  it("carries no ring body — geometry stays in txgio_parcel (Geometry Law rule 1)", () => {
    const keys = Object.keys(BASTROP_PARCEL_NODE_FIXTURE);
    expect(keys).not.toContain("geometry");
    expect(keys).not.toContain("parcelGeometry");
    expect(keys).not.toContain("ring");
    expect(JSON.stringify(BASTROP_PARCEL_NODE_FIXTURE)).not.toMatch(
      /"coordinates"/,
    );
  });

  it("rejects an inlined ring on the store pointer", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse(NEGATIVE_PARCEL_NODE_INLINE_GEOMETRY).success,
    ).toBe(false);
  });

  it("records crosswalk key kind rather than faking a prop_id join", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse(TRAVIS_CROSSWALK_PARCEL_NODE_FIXTURE).success,
    ).toBe(true);
    expect(TRAVIS_CROSSWALK_PARCEL_NODE_FIXTURE.keyKind).toBe("geo_id_crosswalk");
    expect(
      TRAVIS_CROSSWALK_PARCEL_NODE_FIXTURE.divergenceObservationCount,
    ).toBe(2);
  });

  it("validates county-coverage verified absence (satisfied-absent)", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse(COUNTY_COVERAGE_PARCEL_NODE_ABSENCE_FIXTURE)
        .success,
    ).toBe(true);
    expect(COUNTY_COVERAGE_PARCEL_NODE_ABSENCE_FIXTURE.parcelNodeId).toBe(
      countyCoverageParcelNodeId("48301"),
    );
    expect(
      COUNTY_COVERAGE_PARCEL_NODE_ABSENCE_FIXTURE.verifiedAbsence?.evaluated,
    ).toBe(true);
    expect(
      COUNTY_COVERAGE_PARCEL_NODE_ABSENCE_FIXTURE.verifiedAbsence?.provenanceScope
        .length,
    ).toBeGreaterThan(0);
    expect(COUNTY_COVERAGE_PARCEL_NODE_ABSENCE_FIXTURE.geometryLoaded).toBe(false);
  });

  it("validates per-parcel absence in a loaded county", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse(BASTROP_PARCEL_NODE_ABSENCE_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_PARCEL_NODE_ABSENCE_FIXTURE.absence?.kind).toBe(
      "no-parcel-geometry",
    );
    expect(BASTROP_PARCEL_NODE_ABSENCE_FIXTURE.geometryStoreRef).toBeUndefined();
  });

  it("validates the MultiPolygon truncation finding", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse(BASTROP_PARCEL_NODE_INCOMPLETE_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_PARCEL_NODE_INCOMPLETE_FIXTURE.absence?.kind).toBe(
      "geometry-incomplete",
    );
  });

  it("fails closed: absent tier without verifiedAbsence", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse(NEGATIVE_PARCEL_NODE_ABSENT_NO_VERIFIED)
        .success,
    ).toBe(false);
  });

  it("rejects a resolved pointer and a typed absence together", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse(NEGATIVE_PARCEL_NODE_REF_AND_ABSENCE).success,
    ).toBe(false);
  });

  it("rejects a pointer naming a different parcel", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse(NEGATIVE_PARCEL_NODE_REF_MISMATCH).success,
    ).toBe(false);
  });

  it("rejects a paywalled parcel identity", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse(NEGATIVE_PARCEL_NODE_NON_PUBLIC_POLICY).success,
    ).toBe(false);
  });

  it("keeps the published MCP DID convention", () => {
    expect(parcelNodeAtomDid("48021:27303")).toBe(
      "did:hauska:parcel-node:48021:27303",
    );
    expect(BASTROP_PARCEL_NODE_FIXTURE.atomDid).toBe(
      parcelNodeAtomDid(BASTROP_PARCEL_NODE_FIXTURE.parcelNodeId),
    );
  });

  it("rejects an atomDid that does not embed its parcelNodeId", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse({
        ...BASTROP_PARCEL_NODE_FIXTURE,
        atomDid: "did:hauska:parcel-node:48021:27999",
      }).success,
    ).toBe(false);
  });

  it("rejects a parcelNodeId outside the county it claims", () => {
    expect(
      PARCEL_NODE_SCHEMA.safeParse({
        ...BASTROP_PARCEL_NODE_FIXTURE,
        countyFips: "48453",
      }).success,
    ).toBe(false);
  });

  it("createParcelNode round-trips a valid anchor", () => {
    const atom = createParcelNode(BASTROP_PARCEL_NODE_FIXTURE);
    expect(atom.entityType).toBe("parcel-node");
    expect(atom.parcelNodeId).toBe("48021:27303");
  });
});

describe("property — zoning-fact (WDLL 3.3)", () => {
  it("validates Hays County RS district fixture 48209:156346", () => {
    expect(ZONING_FACT_SCHEMA.safeParse(HAYS_ZONING_FACT_FIXTURE).success).toBe(true);
    expect(HAYS_ZONING_FACT_FIXTURE.parcelNodeId).toBe("48209:156346");
    expect(HAYS_ZONING_FACT_FIXTURE.district).toBe("RS");
    expect(HAYS_ZONING_FACT_FIXTURE.accessPolicy).toBe("public-free");
    expect(HAYS_ZONING_FACT_FIXTURE.atomTier).toBe("data");
  });

  it("validates Bexar null-zoning honest-absence 48029:410119", () => {
    expect(ZONING_FACT_SCHEMA.safeParse(BEXAR_NULL_ZONING_FACT_FIXTURE).success).toBe(
      true,
    );
    expect(BEXAR_NULL_ZONING_FACT_FIXTURE.absence?.kind).toBe("no-zoning-stamp");
    expect(BEXAR_NULL_ZONING_FACT_FIXTURE.district).toBeUndefined();
  });

  it("rejects both district and absence", () => {
    expect(
      ZONING_FACT_SCHEMA.safeParse(NEGATIVE_ZONING_DISTRICT_AND_ABSENCE).success,
    ).toBe(false);
  });

  it("allows asserted readContract snapshot with placeholder calibrated axis", () => {
    const axes = HAYS_ZONING_FACT_FIXTURE.readContract?.axes;
    expect(axes?.calibratedConfidence.provenance).toBe("asserted");
    expect(axes?.assertedConfidence.provenance).toBe("asserted");
  });
});

describe("property — setback-rule (WDLL 3.4/3.5)", () => {
  it("validates Comal exact-match with typed sourceCodeAtomRef", () => {
    expect(SETBACK_RULE_SCHEMA.safeParse(COMAL_SETBACK_RULE_FIXTURE).success).toBe(true);
    expect(COMAL_SETBACK_RULE_FIXTURE.sourceCodeAtomRef.role).toBe("rule");
    expect(typeof COMAL_SETBACK_RULE_FIXTURE.sourceCodeAtomRef).toBe("object");
    expect(COMAL_SETBACK_RULE_FIXTURE.matchBasis).toBe("exact");
    expect(COMAL_SETBACK_RULE_FIXTURE.fieldProvenance?.front?.atomDid).toBeTruthy();
  });

  it("validates Travis prefix-match fixture", () => {
    expect(SETBACK_RULE_SCHEMA.safeParse(TRAVIS_PREFIX_SETBACK_RULE_FIXTURE).success).toBe(
      true,
    );
    expect(TRAVIS_PREFIX_SETBACK_RULE_FIXTURE.matchBasis).toBe("prefix");
  });

  it("validates fallback with honest-absence", () => {
    expect(SETBACK_RULE_SCHEMA.safeParse(FALLBACK_SETBACK_RULE_FIXTURE).success).toBe(
      true,
    );
    expect(FALLBACK_SETBACK_RULE_FIXTURE.absence?.kind).toBe("setback-fallback");
  });

  it("rejects bare string sourceCodeAtomRef (not AtomInputRef)", () => {
    expect(
      SETBACK_RULE_SCHEMA.safeParse(NEGATIVE_SETBACK_BARE_STRING_CITATION).success,
    ).toBe(false);
  });

  it("rejects fallback matchBasis without honest-absence", () => {
    expect(
      SETBACK_RULE_SCHEMA.safeParse(NEGATIVE_SETBACK_FALLBACK_NO_ABSENCE).success,
    ).toBe(false);
  });
});

describe("property — buildable-envelope (WDLL 3.6)", () => {
  it("validates derived envelope for 48209:156346 with full input chain", () => {
    expect(BUILDABLE_ENVELOPE_SCHEMA.safeParse(HAYS_BUILDABLE_ENVELOPE_FIXTURE).success).toBe(
      true,
    );
    const chain = HAYS_BUILDABLE_ENVELOPE_FIXTURE.reasoningChain;
    expect(chain.derivationMethod).toBe("buildable-envelope-inset-v1");
    expect(chain.inputAtomRefs.length).toBe(4);
    expect(
      REASONING_CHAIN_SCHEMA.safeParse(HAYS_BUILDABLE_ENVELOPE_FIXTURE.reasoningChain)
        .success,
    ).toBe(true);
  });

  it("uses not-applicable PropertyConsequence on envelope readContract", () => {
    const consequence = HAYS_BUILDABLE_ENVELOPE_FIXTURE.readContract?.axes.consequence;
    expect(consequence?.kind).toBe("not-applicable");
  });

  it("has no labeling x district multiply field", () => {
    const keys = Object.keys(HAYS_BUILDABLE_ENVELOPE_FIXTURE);
    expect(keys).not.toContain("labeling");
    expect(keys).not.toContain("district");
    expect(JSON.stringify(HAYS_BUILDABLE_ENVELOPE_FIXTURE)).not.toMatch(
      /labeling.*district|district.*labeling/,
    );
  });

  it("rejects derived without inputAtomRefs", () => {
    expect(
      BUILDABLE_ENVELOPE_SCHEMA.safeParse(NEGATIVE_ENVELOPE_NO_INPUT_REFS).success,
    ).toBe(false);
    expect(REASONING_CHAIN_SCHEMA.safeParse(NEGATIVE_ENVELOPE_NO_INPUT_REFS.reasoningChain).success).toBe(
      false,
    );
  });

  it("validates live decline fixtures with absence + verifiedAbsence", () => {
    expect(
      BUILDABLE_ENVELOPE_SCHEMA.safeParse(BASTROP_ENVELOPE_SUPERSEDED_DECLINE_FIXTURE)
        .success,
    ).toBe(true);
    expect(BASTROP_ENVELOPE_SUPERSEDED_DECLINE_FIXTURE.absence?.kind).toBe(
      "superseded-prop-id",
    );
    expect(
      BASTROP_ENVELOPE_SUPERSEDED_DECLINE_FIXTURE.verifiedAbsence?.provenanceScope
        .length,
    ).toBeGreaterThan(0);
    expect(
      BUILDABLE_ENVELOPE_SCHEMA.safeParse(BASTROP_ENVELOPE_UNZONED_DECLINE_FIXTURE)
        .success,
    ).toBe(true);
  });

  it("round-trips every live decline code through the contract absence shape", () => {
    expect(BUILDABLE_ENVELOPE_ABSENCE_KINDS).toHaveLength(14);
    for (const kind of BUILDABLE_ENVELOPE_ABSENCE_KINDS) {
      const fixture = buildEnvelopeDeclineFixture(kind);
      const parsed = BUILDABLE_ENVELOPE_SCHEMA.safeParse(fixture);
      expect(parsed.success, `kind ${kind} must parse`).toBe(true);
      if (parsed.success) {
        expect(parsed.data.absence?.kind).toBe(kind);
        expect(parsed.data.verifiedAbsence?.evaluated).toBe(true);
      }
      expect(toBuildableEnvelopeAbsenceKind(kind)).toBe(kind);
    }
    expect(toBuildableEnvelopeAbsenceKind("not-a-real-code")).toBe(
      "other-verify-fail",
    );
  });

  it("fails closed: absence without verifiedAbsence", () => {
    expect(
      BUILDABLE_ENVELOPE_SCHEMA.safeParse(NEGATIVE_ENVELOPE_ABSENCE_NO_VERIFIED)
        .success,
    ).toBe(false);
  });

  it("fails closed: verifiedAbsence without absence kind", () => {
    expect(
      BUILDABLE_ENVELOPE_SCHEMA.safeParse(NEGATIVE_ENVELOPE_VERIFIED_WITHOUT_ABSENCE)
        .success,
    ).toBe(false);
  });

  it("keeps positive envelope requiring full input chain (no silent weaken)", () => {
    const declineShapeWithNoSetback = {
      ...HAYS_BUILDABLE_ENVELOPE_FIXTURE,
      reasoningChain: {
        ...HAYS_BUILDABLE_ENVELOPE_FIXTURE.reasoningChain,
        inputAtomRefs: [
          {
            atomDid: HAYS_ZONING_FACT_FIXTURE.atomDid,
            role: "fact" as const,
            entityType: "zoning-fact",
          },
        ],
      },
    };
    expect(BUILDABLE_ENVELOPE_SCHEMA.safeParse(declineShapeWithNoSetback).success).toBe(
      false,
    );
  });
});

describe("property — parcel-terrain-model (terrain-export WDLL)", () => {
  it("validates Bastrop 48021:27303 multi-format fixture", () => {
    expect(
      PARCEL_TERRAIN_MODEL_SCHEMA.safeParse(BASTROP_TERRAIN_EXPORT_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_TERRAIN_EXPORT_FIXTURE.parcelNodeId).toBe("48021:27303");
    expect(BASTROP_TERRAIN_EXPORT_FIXTURE.accessPolicy).toBe(
      TERRAIN_DEFAULT_ACCESS_POLICY,
    );
    expect(BASTROP_TERRAIN_EXPORT_FIXTURE.accessPolicy).toBe("public-paid");
    expect(BASTROP_TERRAIN_EXPORT_FIXTURE.artifacts.ifc?.ifcSchemaVersion).toBe(
      "IFC4",
    );
    expect(BASTROP_TERRAIN_EXPORT_FIXTURE.artifacts.ifc?.geometryPrimitive).toBe(
      "IfcTriangulatedFaceSet",
    );
    expect(BASTROP_TERRAIN_EXPORT_FIXTURE.artifacts.glb?.triangleCount).toBe(
      BASTROP_TERRAIN_EXPORT_FIXTURE.artifacts.ifc?.triangleCount,
    );
    expect(BASTROP_TERRAIN_EXPORT_FIXTURE.artifacts["dxf-contour"]?.contourIntervalMeters).toBe(
      1,
    );
    expect(BASTROP_TERRAIN_EXPORT_FIXTURE.artifacts["landxml-tin"]?.deferred).toBe(
      true,
    );
  });

  it("requires DEM reference-field input", () => {
    expect(
      PARCEL_TERRAIN_MODEL_SCHEMA.safeParse(NEGATIVE_TERRAIN_NO_DEM_REF).success,
    ).toBe(false);
  });

  it("carries asserted USGS confidence provenance", () => {
    expect(BASTROP_TERRAIN_EXPORT_FIXTURE.confidence.provenance).toBe("asserted");
    expect(BASTROP_TERRAIN_EXPORT_FIXTURE.sourceCitation).toBe("USGS 3DEP");
  });
});

describe("property — road-node (27c WDLL 3 / R1)", () => {
  it("validates Bastrop Spring Street fixture 48021:road:123456789", () => {
    expect(ROAD_NODE_SCHEMA.safeParse(BASTROP_SPRING_STREET_ROAD_FIXTURE).success).toBe(
      true,
    );
    expect(BASTROP_SPRING_STREET_ROAD_FIXTURE.roadNodeId).toBe("48021:road:123456789");
    expect(BASTROP_SPRING_STREET_ROAD_FIXTURE.displayName).toBe("Spring Street");
    expect(BASTROP_SPRING_STREET_ROAD_FIXTURE.row.provenance.kind).toBe(
      "approximate-assumed-per-class",
    );
    expect(BASTROP_SPRING_STREET_ROAD_FIXTURE.attachPoints.length).toBeGreaterThan(0);
  });
});

describe("property — building-footprint (ADR-029 / T3)", () => {
  it("validates Bastrop ML-derived footprint 48021:27303 with ODC-By citation", () => {
    expect(BUILDING_FOOTPRINT_SCHEMA.safeParse(BASTROP_ML_FOOTPRINT_FIXTURE).success).toBe(
      true,
    );
    expect(BASTROP_ML_FOOTPRINT_FIXTURE.sourceTier).toBe("ml-derived");
    expect(BASTROP_ML_FOOTPRINT_FIXTURE.accessPolicy).toBe("public-free");
    expect(BASTROP_ML_FOOTPRINT_FIXTURE.sourceCitation).toMatch(/ODC-By/i);
  });

  it("validates county-coverage verified absence row", () => {
    expect(
      BUILDING_FOOTPRINT_SCHEMA.safeParse(BASTROP_COUNTY_FOOTPRINT_ABSENCE_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_COUNTY_FOOTPRINT_ABSENCE_FIXTURE.parcelNodeId).toBe(
      countyCoverageParcelNodeId("48021"),
    );
    expect(BASTROP_COUNTY_FOOTPRINT_ABSENCE_FIXTURE.verifiedAbsence?.evaluated).toBe(true);
    expect(
      BASTROP_COUNTY_FOOTPRINT_ABSENCE_FIXTURE.verifiedAbsence?.provenanceScope.length,
    ).toBeGreaterThan(0);
  });

  it("validates per-parcel absence when source exists but no feature", () => {
    expect(
      BUILDING_FOOTPRINT_SCHEMA.safeParse(BASTROP_PARCEL_FOOTPRINT_ABSENCE_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_PARCEL_FOOTPRINT_ABSENCE_FIXTURE.absence?.kind).toBe(
      "no-footprint-feature",
    );
    expect(BASTROP_PARCEL_FOOTPRINT_ABSENCE_FIXTURE.footprintGeometry).toBeUndefined();
  });

  it("rejects ml-derived without ODC-By in sourceCitation", () => {
    expect(
      BUILDING_FOOTPRINT_SCHEMA.safeParse(NEGATIVE_FOOTPRINT_ML_NO_ODC_BY).success,
    ).toBe(false);
  });

  it("rejects sourceTier absent without verifiedAbsence", () => {
    expect(
      BUILDING_FOOTPRINT_SCHEMA.safeParse(NEGATIVE_FOOTPRINT_ABSENT_NO_VERIFIED).success,
    ).toBe(false);
  });
});

describe("property — utility-easement (ADR-029 / T3)", () => {
  it("validates City of Bastrop GIS easement fixture", () => {
    expect(UTILITY_EASEMENT_SCHEMA.safeParse(BASTROP_CITY_EASEMENT_FIXTURE).success).toBe(
      true,
    );
    expect(BASTROP_CITY_EASEMENT_FIXTURE.easementClass).toBe("utility");
    expect(BASTROP_CITY_EASEMENT_FIXTURE.accessPolicy).toBe("public-free");
    expect(BASTROP_CITY_EASEMENT_FIXTURE.easementGeometry?.type).toBe("LineString");
  });

  it("validates county-coverage easement verified absence", () => {
    expect(
      UTILITY_EASEMENT_SCHEMA.safeParse(BASTROP_COUNTY_EASEMENT_ABSENCE_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_COUNTY_EASEMENT_ABSENCE_FIXTURE.sourceTier).toBe("absent");
  });

  it("rejects non-public accessPolicy on utility-easement", () => {
    expect(
      UTILITY_EASEMENT_SCHEMA.safeParse(NEGATIVE_EASEMENT_NON_PUBLIC_POLICY).success,
    ).toBe(false);
  });
});

describe("property — flood-hazard-fact", () => {
  it("validates Bastrop SFHA true Zone AE present finding", () => {
    expect(FLOOD_HAZARD_FACT_SCHEMA.safeParse(BASTROP_FLOOD_SFHA_FIXTURE).success).toBe(
      true,
    );
    expect(BASTROP_FLOOD_SFHA_FIXTURE.inSpecialFloodHazardArea).toBe(true);
    expect(BASTROP_FLOOD_SFHA_FIXTURE.floodZone).toBe("AE");
  });

  it("validates outside-SFHA as present with SFHA false (not absence)", () => {
    expect(
      FLOOD_HAZARD_FACT_SCHEMA.safeParse(HAYS_FLOOD_OUTSIDE_SFHA_FIXTURE).success,
    ).toBe(true);
    expect(HAYS_FLOOD_OUTSIDE_SFHA_FIXTURE.inSpecialFloodHazardArea).toBe(false);
    expect(HAYS_FLOOD_OUTSIDE_SFHA_FIXTURE.absence).toBeUndefined();
  });

  it("validates per-parcel no-flood-coverage absence", () => {
    expect(
      FLOOD_HAZARD_FACT_SCHEMA.safeParse(BASTROP_FLOOD_NO_COVERAGE_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_FLOOD_NO_COVERAGE_FIXTURE.absence?.kind).toBe("no-flood-coverage");
  });

  it("validates county verified absence fail-closed", () => {
    expect(
      FLOOD_HAZARD_FACT_SCHEMA.safeParse(COUNTY_FLOOD_VERIFIED_ABSENCE_FIXTURE).success,
    ).toBe(true);
    expect(COUNTY_FLOOD_VERIFIED_ABSENCE_FIXTURE.sourceTier).toBe("absent");
  });

  it("rejects SFHA finding and absence together", () => {
    expect(
      FLOOD_HAZARD_FACT_SCHEMA.safeParse(NEGATIVE_FLOOD_SFHA_AND_ABSENCE).success,
    ).toBe(false);
  });

  it("rejects absent tier without verifiedAbsence", () => {
    expect(
      FLOOD_HAZARD_FACT_SCHEMA.safeParse(NEGATIVE_FLOOD_ABSENT_NO_VERIFIED).success,
    ).toBe(false);
  });

  it("rejects absent tier with flood zone claim fields", () => {
    expect(
      FLOOD_HAZARD_FACT_SCHEMA.safeParse(NEGATIVE_FLOOD_ABSENT_WITH_CLAIM).success,
    ).toBe(false);
  });

  it("createFloodHazardFact round-trips a valid atom", () => {
    const atom = createFloodHazardFact(BASTROP_FLOOD_SFHA_FIXTURE);
    expect(atom.entityType).toBe("flood-hazard-fact");
  });
});

describe("property — cad-parcel-roll", () => {
  it("validates Bastrop full CAD roll row with owner match", () => {
    expect(CAD_PARCEL_ROLL_SCHEMA.safeParse(BASTROP_CAD_ROLL_FIXTURE).success).toBe(
      true,
    );
    expect(BASTROP_CAD_ROLL_FIXTURE.joinPassedOwnerMatchGate).toBe(true);
    expect(BASTROP_CAD_ROLL_FIXTURE.propertyUseCode).toBe("A1");
  });

  it("validates join-hold absence without owner fields", () => {
    expect(
      CAD_PARCEL_ROLL_SCHEMA.safeParse(BASTROP_CAD_ROLL_JOIN_HOLD_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_CAD_ROLL_JOIN_HOLD_FIXTURE.absence?.kind).toBe("join-hold");
    expect(BASTROP_CAD_ROLL_JOIN_HOLD_FIXTURE.ownerName).toBeUndefined();
  });

  it("validates county verified absence", () => {
    expect(
      CAD_PARCEL_ROLL_SCHEMA.safeParse(COUNTY_CAD_ROLL_ABSENCE_FIXTURE).success,
    ).toBe(true);
  });

  it("rejects owner fields when joinPassedOwnerMatchGate is false", () => {
    expect(
      CAD_PARCEL_ROLL_SCHEMA.safeParse(NEGATIVE_CAD_ROLL_OWNER_ON_JOIN_HOLD).success,
    ).toBe(false);
  });

  it("rejects empty present row without absence", () => {
    expect(
      CAD_PARCEL_ROLL_SCHEMA.safeParse(NEGATIVE_CAD_ROLL_EMPTY_PRESENT).success,
    ).toBe(false);
  });

  it("createCadParcelRoll round-trips a valid atom", () => {
    const atom = createCadParcelRoll(BASTROP_CAD_ROLL_FIXTURE);
    expect(atom.entityType).toBe("cad-parcel-roll");
  });
});

describe("property — land-use-fact", () => {
  it("validates Bastrop A1 land use from CAD property_use_code", () => {
    expect(LAND_USE_FACT_SCHEMA.safeParse(BASTROP_LAND_USE_FIXTURE).success).toBe(true);
    expect(BASTROP_LAND_USE_FIXTURE.landUseCode).toBe("A1");
  });

  it("validates no-land-use-code honest absence", () => {
    expect(
      LAND_USE_FACT_SCHEMA.safeParse(BASTROP_LAND_USE_NO_CODE_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_LAND_USE_NO_CODE_FIXTURE.absence?.kind).toBe("no-land-use-code");
  });

  it("rejects present tier without landUseCode or absence", () => {
    expect(
      LAND_USE_FACT_SCHEMA.safeParse(NEGATIVE_LAND_USE_EMPTY_PRESENT).success,
    ).toBe(false);
  });

  it("rejects cotality sourceTier — never wired", () => {
    expect(
      LAND_USE_FACT_SCHEMA.safeParse(NEGATIVE_LAND_USE_COTALITY_TIER).success,
    ).toBe(false);
  });

  it("createLandUseFact round-trips a valid atom", () => {
    const atom = createLandUseFact(BASTROP_LAND_USE_FIXTURE);
    expect(atom.entityType).toBe("land-use-fact");
  });
});

describe("property — owner-fact (the paid facet)", () => {
  it("createOwnerFact round-trips a valid present atom", () => {
    const atom = createOwnerFact(BASTROP_OWNER_FACT_FIXTURE);
    expect(atom.entityType).toBe("owner-fact");
    expect(atom.ownerName).toBe("SAMPLE OWNER LLC");
    expect(atom.accessPolicy).toBe("public-paid");
  });

  it("REJECTS public-free — owner identity cannot ship on the free tier", () => {
    expect(
      OWNER_FACT_SCHEMA.safeParse(NEGATIVE_OWNER_FACT_PUBLIC_FREE).success,
    ).toBe(false);
  });

  it("REJECTS a mailing address with no owner name (dangling PII fragment)", () => {
    expect(
      OWNER_FACT_SCHEMA.safeParse(NEGATIVE_OWNER_FACT_BARE_MAILING).success,
    ).toBe(false);
  });

  it("accepts a statutory owner-withheld absence as an ESTABLISHED absence", () => {
    const atom = createOwnerFact(BASTROP_OWNER_WITHHELD_FIXTURE);
    expect(atom.absence?.kind).toBe("owner-withheld");
    expect(atom.ownerName).toBeUndefined();
  });

  it("REJECTS owner claim fields coexisting with an absence", () => {
    expect(
      OWNER_FACT_SCHEMA.safeParse({
        ...BASTROP_OWNER_WITHHELD_FIXTURE,
        ownerName: "SHOULD NOT BE HERE",
      }).success,
    ).toBe(false);
  });

  it("REJECTS a present tier carrying no owner name and no absence", () => {
    const { ownerName: _omitted, ...rest } = BASTROP_OWNER_FACT_FIXTURE;
    expect(OWNER_FACT_SCHEMA.safeParse(rest).success).toBe(false);
  });

  it("carries exemption FLAGS, never raw exemption codes", () => {
    const atom = createOwnerFact(BASTROP_OWNER_FACT_FIXTURE);
    expect(atom.exemptionFlags).toEqual({
      homestead: false,
      seniorOrDisability: false,
      agricultural: false,
      veteran: false,
    });
    // A raw `exemptionCodes` field must not be representable on this atom.
    expect(Object.keys(atom)).not.toContain("exemptionCodes");
    expect(
      OWNER_FACT_SCHEMA.safeParse({
        ...BASTROP_OWNER_FACT_FIXTURE,
        exemptionFlags: { homestead: "HS" },
      }).success,
    ).toBe(false);
  });

  it("REJECTS a cotality source tier (Cotality is extinguished)", () => {
    expect(
      OWNER_FACT_SCHEMA.safeParse({
        ...BASTROP_OWNER_FACT_FIXTURE,
        sourceTier: "cotality",
      }).success,
    ).toBe(false);
  });

  it("requires verifiedAbsence on the absent tier", () => {
    expect(
      OWNER_FACT_SCHEMA.safeParse({
        ...BASTROP_OWNER_WITHHELD_FIXTURE,
        sourceTier: "absent",
        absence: undefined,
      }).success,
    ).toBe(false);
  });
});

describe("property — rail-corridor-fact", () => {
  it("validates near-corridor present with status/class and crossings", () => {
    expect(
      RAIL_CORRIDOR_FACT_SCHEMA.safeParse(BASTROP_RAIL_NEAR_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_RAIL_NEAR_FIXTURE.corridorStatus).toBe("active");
    expect(BASTROP_RAIL_NEAR_FIXTURE.bufferMeters).toBe(152.4);
  });

  it("validates outside-buffer as present nearRailCorridor false (not absence)", () => {
    expect(
      RAIL_CORRIDOR_FACT_SCHEMA.safeParse(BASTROP_RAIL_OUTSIDE_BUFFER_FIXTURE)
        .success,
    ).toBe(true);
    expect(BASTROP_RAIL_OUTSIDE_BUFFER_FIXTURE.nearRailCorridor).toBe(false);
    expect(BASTROP_RAIL_OUTSIDE_BUFFER_FIXTURE.absence).toBeUndefined();
  });

  it("validates no-parcel-geometry absence", () => {
    expect(
      RAIL_CORRIDOR_FACT_SCHEMA.safeParse(BASTROP_RAIL_NO_GEOMETRY_FIXTURE)
        .success,
    ).toBe(true);
  });

  it("rejects near finding and absence together", () => {
    expect(
      RAIL_CORRIDOR_FACT_SCHEMA.safeParse(NEGATIVE_RAIL_CORRIDOR_NEAR_AND_ABSENCE)
        .success,
    ).toBe(false);
  });

  it("rejects nearRailCorridor true without nearestCorridorDistanceMeters", () => {
    expect(
      RAIL_CORRIDOR_FACT_SCHEMA.safeParse(NEGATIVE_RAIL_CORRIDOR_NEAR_INCOMPLETE)
        .success,
    ).toBe(false);
  });

  it("createRailCorridorFact round-trips a valid atom", () => {
    const atom = createRailCorridorFact({
      ...BASTROP_RAIL_NEAR_FIXTURE,
      atGradeCrossings: BASTROP_RAIL_NEAR_FIXTURE.atGradeCrossings
        ? [...BASTROP_RAIL_NEAR_FIXTURE.atGradeCrossings]
        : undefined,
    });
    expect(atom.entityType).toBe("rail-corridor-fact");
  });

  it("accepts unknown corridorStatus and corridorClass", () => {
    const parsed = RAIL_CORRIDOR_FACT_SCHEMA.safeParse({
      ...BASTROP_RAIL_NEAR_FIXTURE,
      corridorStatus: "unknown",
      corridorClass: "unknown",
      atGradeCrossings: BASTROP_RAIL_NEAR_FIXTURE.atGradeCrossings
        ? [...BASTROP_RAIL_NEAR_FIXTURE.atGradeCrossings]
        : undefined,
    });
    expect(parsed.success).toBe(true);
  });
});

describe("property — rrc-pipeline-fact", () => {
  it("validates near-pipeline present with identity fields and distance", () => {
    expect(
      RRC_PIPELINE_FACT_SCHEMA.safeParse(BASTROP_PIPELINE_NEAR_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_PIPELINE_NEAR_FIXTURE.nearPipeline).toBe(true);
    expect(BASTROP_PIPELINE_NEAR_FIXTURE.bufferMeters).toBe(152.4);
    expect(BASTROP_PIPELINE_NEAR_FIXTURE.t4permit).toBe("T-01234");
  });

  it("validates outside-buffer as present nearPipeline false (not absence)", () => {
    expect(
      RRC_PIPELINE_FACT_SCHEMA.safeParse(BASTROP_PIPELINE_OUTSIDE_BUFFER_FIXTURE)
        .success,
    ).toBe(true);
    expect(BASTROP_PIPELINE_OUTSIDE_BUFFER_FIXTURE.nearPipeline).toBe(false);
    expect(BASTROP_PIPELINE_OUTSIDE_BUFFER_FIXTURE.absence).toBeUndefined();
  });

  it("validates no-parcel-geometry absence", () => {
    expect(
      RRC_PIPELINE_FACT_SCHEMA.safeParse(BASTROP_PIPELINE_NO_GEOMETRY_FIXTURE)
        .success,
    ).toBe(true);
  });

  it("rejects near finding and absence together", () => {
    expect(
      RRC_PIPELINE_FACT_SCHEMA.safeParse(NEGATIVE_PIPELINE_NEAR_AND_ABSENCE)
        .success,
    ).toBe(false);
  });

  it("rejects nearPipeline true without nearestPipelineDistanceMeters", () => {
    expect(
      RRC_PIPELINE_FACT_SCHEMA.safeParse(NEGATIVE_PIPELINE_NEAR_INCOMPLETE)
        .success,
    ).toBe(false);
  });

  it("createRrcPipelineFact round-trips a valid atom", () => {
    const atom = createRrcPipelineFact({ ...BASTROP_PIPELINE_NEAR_FIXTURE });
    expect(atom.entityType).toBe("rrc-pipeline-fact");
  });
});

describe("property — SourceAttribution absence", () => {
  it("grep-equivalent: no SourceAttribution export in property module", async () => {
    const mod = await import("../index.js");
    expect(Object.keys(mod)).not.toContain("SourceAttribution");
    expect(Object.keys(mod)).not.toContain("SourceLicensingTerms");
  });
});

describe("property — well-fact (RRC operations lens)", () => {
  it("validates on-parcel producing oil well", () => {
    expect(WELL_FACT_SCHEMA.safeParse(BASTROP_WELL_ON_PARCEL_FIXTURE).success).toBe(
      true,
    );
    expect(BASTROP_WELL_ON_PARCEL_FIXTURE.parcelRelation).toBe("on-parcel");
  });

  it("validates near-parcel plugged injection well with distance", () => {
    expect(
      WELL_FACT_SCHEMA.safeParse(BASTROP_WELL_NEAR_PARCEL_FIXTURE).success,
    ).toBe(true);
    expect(BASTROP_WELL_NEAR_PARCEL_FIXTURE.wellStatus).toBe("plugged-abandoned");
  });

  it("validates no-well-on-or-near honest absence with legible radius", () => {
    expect(WELL_FACT_SCHEMA.safeParse(BASTROP_WELL_ABSENCE_FIXTURE).success).toBe(
      true,
    );
    expect(BASTROP_WELL_ABSENCE_FIXTURE.proximityRadiusMeters).toBe(152);
  });

  it("rejects near-parcel without proximityDistanceMeters", () => {
    expect(
      WELL_FACT_SCHEMA.safeParse(NEGATIVE_WELL_NEAR_NO_DISTANCE).success,
    ).toBe(false);
  });

  it("rejects public-paid — well-fact is public-free", () => {
    expect(WELL_FACT_SCHEMA.safeParse(NEGATIVE_WELL_PUBLIC_PAID).success).toBe(
      false,
    );
  });

  it("createWellFact round-trips a valid atom", () => {
    const atom = createWellFact(BASTROP_WELL_ON_PARCEL_FIXTURE);
    expect(atom.entityType).toBe("well-fact");
  });

  it("accepts unknown wellStatus and wellType", () => {
    const parsed = WELL_FACT_SCHEMA.safeParse({
      ...BASTROP_WELL_ON_PARCEL_FIXTURE,
      wellStatus: "unknown",
      wellType: "unknown",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("property — special-district-fact", () => {
  it("createSpecialDistrictFact round-trips a present PIP membership", () => {
    const atom = createSpecialDistrictFact(BASTROP_SPECIAL_DISTRICT_PRESENT_FIXTURE);
    expect(atom.entityType).toBe("special-district-fact");
    expect(atom.membershipBasis).toBe("point-in-polygon");
  });

  it("accepts scoped outside-source absence without district fields", () => {
    const atom = createSpecialDistrictFact(BASTROP_SPECIAL_DISTRICT_OUTSIDE_FIXTURE);
    expect(atom.absence?.kind).toBe("outside-tceq-source-boundaries");
    expect(atom.districtId).toBeUndefined();
  });

  it("REJECTS proximity membership basis", () => {
    expect(
      SPECIAL_DISTRICT_FACT_SCHEMA.safeParse({
        ...BASTROP_SPECIAL_DISTRICT_PRESENT_FIXTURE,
        membershipBasis: "proximity",
      }).success,
    ).toBe(false);
  });

  it("REJECTS district fields coexisting with absence", () => {
    expect(
      SPECIAL_DISTRICT_FACT_SCHEMA.safeParse({
        ...BASTROP_SPECIAL_DISTRICT_OUTSIDE_FIXTURE,
        districtId: "123",
      }).success,
    ).toBe(false);
  });
});

describe("property — SourceAttribution absence", () => {
  it("grep-equivalent: no SourceAttribution export in property module", async () => {
    const mod = await import("../index.js");
    expect(Object.keys(mod)).not.toContain("SourceAttribution");
    expect(Object.keys(mod)).not.toContain("SourceLicensingTerms");
  });
});
