/**
 * ADR-025 O&G ontology schema conformance — sample fixtures must parse.
 */

import { describe, expect, it } from "vitest";

import { OBLIGATION_SCHEMA } from "../../obligation.js";
import { OG_DEFAULT_ACCESS_POLICY } from "../common.js";
import { COMPLETION_SCHEMA } from "../completion.js";
import { EQUIPMENT_STATE_SCHEMA } from "../equipment-state.js";
import {
  SAMPLE_COMPLETION,
  SAMPLE_EQUIPMENT_STATE,
  SAMPLE_MINERAL_LEASE,
  SAMPLE_OWNERSHIP_INTEREST,
  SAMPLE_PAD,
  SAMPLE_PRODUCTION_TIMESERIES,
  SAMPLE_RRC_LEASE,
  SAMPLE_TRACT,
  SAMPLE_WELL,
  SAMPLE_WELLBORE,
  SAMPLE_ZONE,
  SAMPLE_POOLED_UNIT,
  SAMPLE_ALLOCATION_WELL_UNIT,
} from "../fixtures.js";
import { MINERAL_LEASE_SCHEMA } from "../mineral-lease.js";
import { OWNERSHIP_INTEREST_SCHEMA } from "../ownership-interest.js";
import { PAD_SCHEMA } from "../pad.js";
import { PRODUCTION_TIMESERIES_SCHEMA } from "../production-timeseries.js";
import { RRC_LEASE_SCHEMA } from "../rrc-lease.js";
import { TRACT_SCHEMA } from "../tract.js";
import { WELL_SCHEMA } from "../well.js";
import { WELLBORE_SCHEMA } from "../wellbore.js";
import { ZONE_SCHEMA } from "../zone.js";
import { createOgAssertedConfidence } from "../common.js";
import { REVENUE_ALLOCATION_UNIT_SCHEMA } from "../revenue-allocation-unit.js";
import { INSTRUMENT_TYPES } from "../../encumbrances/common.js";

describe("O&G fixtures — Zod validation", () => {
  it("validates well with legible DID", () => {
    expect(WELL_SCHEMA.safeParse(SAMPLE_WELL).success).toBe(true);
  });

  it("validates wellbore", () => {
    expect(WELLBORE_SCHEMA.safeParse(SAMPLE_WELLBORE).success).toBe(true);
  });

  it("validates completion with perforated intervals", () => {
    expect(COMPLETION_SCHEMA.safeParse(SAMPLE_COMPLETION).success).toBe(true);
  });

  it("validates zone", () => {
    expect(ZONE_SCHEMA.safeParse(SAMPLE_ZONE).success).toBe(true);
  });

  it("validates pad with derived grouping", () => {
    expect(PAD_SCHEMA.safeParse(SAMPLE_PAD).success).toBe(true);
  });

  it("validates production-timeseries modeling reporting split", () => {
    expect(PRODUCTION_TIMESERIES_SCHEMA.safeParse(SAMPLE_PRODUCTION_TIMESERIES).success).toBe(
      true,
    );
  });

  it("validates equipment-state", () => {
    expect(EQUIPMENT_STATE_SCHEMA.safeParse(SAMPLE_EQUIPMENT_STATE).success).toBe(true);
  });

  it("validates mineral-lease with clause extracts", () => {
    expect(MINERAL_LEASE_SCHEMA.safeParse(SAMPLE_MINERAL_LEASE).success).toBe(true);
  });

  it("validates rrc-lease with legible DID", () => {
    expect(RRC_LEASE_SCHEMA.safeParse(SAMPLE_RRC_LEASE).success).toBe(true);
  });

  it("validates tract", () => {
    expect(TRACT_SCHEMA.safeParse(SAMPLE_TRACT).success).toBe(true);
  });

  it("validates ownership-interest with gaps", () => {
    expect(OWNERSHIP_INTEREST_SCHEMA.safeParse(SAMPLE_OWNERSHIP_INTEREST).success).toBe(
      true,
    );
  });

  it("validates revenue-allocation-unit with pooled-unit basis", () => {
    expect(REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(SAMPLE_POOLED_UNIT).success).toBe(
      true,
    );
  });

  it("validates revenue-allocation-unit with allocation-well basis", () => {
    expect(
      REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(SAMPLE_ALLOCATION_WELL_UNIT).success,
    ).toBe(true);
  });
});

describe("obligation (core) — Zod validation", () => {
  it("validates obligation fixture with domain-neutral anchor", () => {
    const sampleObligation = {
      entityType: "obligation" as const,
      obligationDid: "oblg_0123456789abcdef",
      obligationType: "delay-rental" as const,
      anchorDid: "mlease_0123456789abcdef",
      anchorKind: "mineral-lease",
      owedToActorDid: "actor_lessor_001",
      dueDate: "2025-01-01",
      recurrence: "annual",
      amount: 5000,
      status: "upcoming" as const,
      confidence: createOgAssertedConfidence(0.9),
      sourceCitation: "Lease clause extract",
      extractedAt: "2024-03-01T12:00:00Z",
      asOf: "2024-02-20",
      accessPolicy: "tenant-private" as const,
    };
    expect(OBLIGATION_SCHEMA.safeParse(sampleObligation).success).toBe(true);
  });

  it("requires anchorDid on obligation", () => {
    const bad = {
      entityType: "obligation",
      obligationDid: "oblg_0123456789abcdef",
      obligationType: "delay-rental",
      dueDate: "2025-01-01",
      status: "upcoming",
      confidence: createOgAssertedConfidence(0.9),
      sourceCitation: "Lease clause extract",
      extractedAt: "2024-03-01T12:00:00Z",
      accessPolicy: "tenant-private",
    };
    const result = OBLIGATION_SCHEMA.safeParse(bad);
    expect(result.success).toBe(false);
  });
});

describe("O&G access policy", () => {
  it("applies correct default access policies per ADR-025", () => {
    expect(OG_DEFAULT_ACCESS_POLICY.well).toBe("public-free");
    expect(OG_DEFAULT_ACCESS_POLICY["equipment-state"]).toBe("tenant-private");
    expect(OG_DEFAULT_ACCESS_POLICY["mineral-lease"]).toBe("tenant-private");
    expect(OG_DEFAULT_ACCESS_POLICY["ownership-interest"]).toBe("tenant-private");
    expect(OG_DEFAULT_ACCESS_POLICY["rrc-lease"]).toBe("public-free");
    expect(OG_DEFAULT_ACCESS_POLICY.tract).toBe("public-free");
    expect(OG_DEFAULT_ACCESS_POLICY["revenue-allocation-unit"]).toBe("public-free");
    expect(OG_DEFAULT_ACCESS_POLICY.obligation).toBe("tenant-private");
  });

  it("requires sourceCitation on all O&G atoms", () => {
    const badWell = { ...SAMPLE_WELL, sourceCitation: "" };
    expect(WELL_SCHEMA.safeParse(badWell).success).toBe(false);

    const badTract = { ...SAMPLE_TRACT, sourceCitation: "" };
    expect(TRACT_SCHEMA.safeParse(badTract).success).toBe(false);
  });

  it("requires extractedAt on all O&G atoms", () => {
    const badWellbore = { ...SAMPLE_WELLBORE, extractedAt: "" };
    expect(WELLBORE_SCHEMA.safeParse(badWellbore).success).toBe(false);
  });

  it("allows empty perforated intervals on completion", () => {
    const completionWithEmpty = {
      ...SAMPLE_COMPLETION,
      perforatedIntervals: [],
    };
    const result = COMPLETION_SCHEMA.safeParse(completionWithEmpty);
    expect(result.success).toBe(true);
  });

  it("allows empty wellDids array on pad", () => {
    const padWithEmpty = { ...SAMPLE_PAD, wellDids: [] };
    const result = PAD_SCHEMA.safeParse(padWithEmpty);
    expect(result.success).toBe(true);
  });

  it("requires anchorKind and anchorDid on production-timeseries", () => {
    const badStream = {
      ...SAMPLE_PRODUCTION_TIMESERIES,
      anchorKind: undefined,
    };
    const result = PRODUCTION_TIMESERIES_SCHEMA.safeParse(badStream);
    expect(result.success).toBe(false);
  });

  it("validates mineral-lease status enum", () => {
    const validStatuses = ["active", "expired", "released", "hbp", "disputed"];
    for (const status of validStatuses) {
      const lease = { ...SAMPLE_MINERAL_LEASE, status };
      expect(MINERAL_LEASE_SCHEMA.safeParse(lease).success).toBe(true);
    }
  });

  it("requires evidencedByInstrumentDids on mineral-lease", () => {
    const badLease = {
      ...SAMPLE_MINERAL_LEASE,
      evidencedByInstrumentDids: [],
    };
    const result = MINERAL_LEASE_SCHEMA.safeParse(badLease);
    expect(result.success).toBe(false);
  });

  it("validates ownership-interest discriminated type", () => {
    const validTypes = [
      "mineral",
      "royalty",
      "overriding-royalty",
      "working",
      "surface",
      "npri",
    ];
    for (const interestType of validTypes) {
      const interest = { ...SAMPLE_OWNERSHIP_INTEREST, interestType };
      expect(OWNERSHIP_INTEREST_SCHEMA.safeParse(interest).success).toBe(true);
    }
  });

  it("requires confidence on ownership-interest", () => {
    const badInterest = {
      ...SAMPLE_OWNERSHIP_INTEREST,
      confidence: undefined,
    };
    const result = OWNERSHIP_INTEREST_SCHEMA.safeParse(badInterest);
    expect(result.success).toBe(false);
  });
});

describe("O&G quality gate", () => {
  it("rejects bare scalar confidence", () => {
    const badInterest = {
      ...SAMPLE_OWNERSHIP_INTEREST,
      confidence: 0.85,
    };
    const result = OWNERSHIP_INTEREST_SCHEMA.safeParse(badInterest);
    expect(result.success).toBe(false);
  });

  it("accepts WidthedConfidence via createOgAssertedConfidence", () => {
    const confidence = createOgAssertedConfidence(0.9);
    expect(confidence.estimate).toBe(0.9);
    expect(confidence.provenance).toBe("asserted");
    expect(confidence.n).toBe(0);
    expect(confidence.intervalWidth).toBe(1);
  });
});

describe("revenue-allocation-unit validation (C1b)", () => {
  it("requires allocationMethod on every tractParticipation factor", () => {
    const badUnit = {
      ...SAMPLE_POOLED_UNIT,
      tractParticipations: [
        {
          tractDid: "tract_reeves-123",
          factor: 0.65,
          source: "Unit Designation 2023-001",
          confidence: createOgAssertedConfidence(0.9),
        },
      ],
    };
    const result = REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(badUnit);
    expect(result.success).toBe(false);
  });

  it("requires source on every tractParticipation factor", () => {
    const badUnit = {
      ...SAMPLE_POOLED_UNIT,
      tractParticipations: [
        {
          tractDid: "tract_reeves-123",
          factor: 0.65,
          allocationMethod: "stated-fraction",
          confidence: createOgAssertedConfidence(0.9),
        },
      ],
    };
    const result = REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(badUnit);
    expect(result.success).toBe(false);
  });

  it("validates all allocation methods", () => {
    const methods = [
      "stated-fraction",
      "acreage",
      "lateral-length",
      "take-points",
      "acre-feet",
      "oil-in-place",
      "other",
    ];
    for (const method of methods) {
      const unit = {
        ...SAMPLE_POOLED_UNIT,
        tractParticipations: [
          {
            tractDid: "tract_reeves-123",
            factor: 0.65,
            allocationMethod: method,
            source: "Unit Designation 2023-001",
            confidence: createOgAssertedConfidence(0.9),
          },
        ],
      };
      expect(REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(unit).success).toBe(true);
    }
  });

  it("validates unit basis discriminator", () => {
    const bases = ["pooled-unit", "allocation-well", "psa"];
    for (const basis of bases) {
      let unit;
      if (basis === "pooled-unit" || basis === "psa") {
        unit = { ...SAMPLE_POOLED_UNIT, basis };
      } else {
        unit = { ...SAMPLE_ALLOCATION_WELL_UNIT, basis };
      }
      expect(REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(unit).success).toBe(true);
    }
  });

  it("requires sourceInstrumentDids for pooled-unit basis", () => {
    const badUnit = {
      ...SAMPLE_POOLED_UNIT,
      sourceInstrumentDids: undefined,
    };
    const result = REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(badUnit);
    expect(result.success).toBe(false);
  });

  it("requires sourcePlatCid for allocation-well basis", () => {
    const badUnit = {
      ...SAMPLE_ALLOCATION_WELL_UNIT,
      sourcePlatCid: undefined,
    };
    const result = REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(badUnit);
    expect(result.success).toBe(false);
  });

  it("rejects psa basis with neither sourceInstrumentDids nor sourceNote", () => {
    const psaUnit = {
      entityType: "revenue-allocation-unit" as const,
      unitDid: "unit_abcdef1234567890",
      basis: "psa" as const,
      wellDids: ["well_42001300010000"],
      operatorActorDid: "actor_operator_001",
      effectiveFrom: "2023-06-01",
      tractParticipations: [
        {
          tractDid: "tract_Reeves-123",
          factor: 0.5,
          allocationMethod: "stated-fraction" as const,
          source: "PSA Agreement 2023-06-01",
          confidence: createOgAssertedConfidence(0.85),
        },
        {
          tractDid: "tract_Reeves-124",
          factor: 0.5,
          allocationMethod: "stated-fraction" as const,
          source: "PSA Agreement 2023-06-01",
          confidence: createOgAssertedConfidence(0.85),
        },
      ],
      sourceCitation: "Operator-provided PSA summary",
      extractedAt: "2024-03-01T12:00:00Z",
      asOf: "2024-02-20",
      accessPolicy: "tenant-private" as const,
    };
    const result = REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(psaUnit);
    expect(result.success).toBe(false);
  });

  it("accepts psa basis with sourceNote only (no instruments)", () => {
    const psaUnit = {
      entityType: "revenue-allocation-unit" as const,
      unitDid: "unit_abcdef1234567890",
      basis: "psa" as const,
      wellDids: ["well_42001300010000"],
      operatorActorDid: "actor_operator_001",
      effectiveFrom: "2023-06-01",
      tractParticipations: [
        {
          tractDid: "tract_Reeves-123",
          factor: 0.5,
          allocationMethod: "stated-fraction" as const,
          source: "PSA Agreement 2023-06-01",
          confidence: createOgAssertedConfidence(0.85),
        },
        {
          tractDid: "tract_Reeves-124",
          factor: 0.5,
          allocationMethod: "stated-fraction" as const,
          source: "PSA Agreement 2023-06-01",
          confidence: createOgAssertedConfidence(0.85),
        },
      ],
      sourceNote: "Unrecorded PSA between operator and working interest owners",
      sourceCitation: "Operator-provided PSA summary",
      extractedAt: "2024-03-01T12:00:00Z",
      asOf: "2024-02-20",
      accessPolicy: "tenant-private" as const,
    };
    const result = REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(psaUnit);
    expect(result.success).toBe(true);
  });
});

describe("INSTRUMENT_TYPES extension (C1b)", () => {
  it("includes O&G lease types", () => {
    expect(INSTRUMENT_TYPES).toContain("oil-gas-lease");
    expect(INSTRUMENT_TYPES).toContain("mineral-deed");
    expect(INSTRUMENT_TYPES).toContain("assignment");
    expect(INSTRUMENT_TYPES).toContain("division-order");
  });

  it("includes recorded unit family", () => {
    expect(INSTRUMENT_TYPES).toContain("unit-designation");
    expect(INSTRUMENT_TYPES).toContain("declaration-of-pooling");
    expect(INSTRUMENT_TYPES).toContain("ratification-of-unit");
    expect(INSTRUMENT_TYPES).toContain("amendment-of-unit-designation");
    expect(INSTRUMENT_TYPES).toContain("release-of-unit");
  });
});

describe("O&G negative validation tests (C1c finding #9)", () => {
  it("rejects pooled-unit carrying sourcePlatCid (cross-basis leakage)", () => {
    const badUnit = {
      ...SAMPLE_POOLED_UNIT,
      sourcePlatCid: "bafyk_plat_should_not_exist",
    };
    const result = REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(badUnit);
    expect(result.success).toBe(false);
  });

  it("rejects allocation-well carrying sourceInstrumentDids (cross-basis leakage)", () => {
    const badUnit = {
      ...SAMPLE_ALLOCATION_WELL_UNIT,
      sourceInstrumentDids: ["instr_should_not_exist"],
    };
    const result = REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(badUnit);
    expect(result.success).toBe(false);
  });

  it("rejects bare scalar confidence on obligation", () => {
    const badObligation = {
      entityType: "obligation",
      obligationDid: "oblg_0123456789abcdef",
      obligationType: "delay-rental",
      anchorDid: "mlease_0123456789abcdef",
      dueDate: "2025-01-01",
      status: "upcoming",
      confidence: 0.9,
      sourceCitation: "Lease clause extract",
      extractedAt: "2024-03-01T12:00:00Z",
      accessPolicy: "tenant-private",
    };
    const result = OBLIGATION_SCHEMA.safeParse(badObligation);
    expect(result.success).toBe(false);
  });

  it("rejects bare scalar confidence on tractParticipations", () => {
    const badUnit = {
      ...SAMPLE_POOLED_UNIT,
      tractParticipations: [
        {
          tractDid: "tract_reeves-123",
          factor: 0.65,
          allocationMethod: "stated-fraction",
          source: "Unit Designation 2023-001",
          confidence: 0.9,
        },
      ],
    };
    const result = REVENUE_ALLOCATION_UNIT_SCHEMA.safeParse(badUnit);
    expect(result.success).toBe(false);
  });

  it("rejects bare scalar confidence on clauseExtracts", () => {
    const badLease = {
      ...SAMPLE_MINERAL_LEASE,
      clauseExtracts: [
        {
          clauseType: "shut-in",
          extractedText: "Lessee may pay shut-in royalty...",
          confidence: 0.9,
          sourceCitation: "Instrument page 3",
          sourceInstrumentDid: "instr_recorded_001",
          pageRef: "3",
        },
      ],
    };
    const result = MINERAL_LEASE_SCHEMA.safeParse(badLease);
    expect(result.success).toBe(false);
  });

  it("rejects invalid accessPolicy", () => {
    const badWell = { ...SAMPLE_WELL, accessPolicy: "invalid-policy" };
    const result = WELL_SCHEMA.safeParse(badWell);
    expect(result.success).toBe(false);
  });

  it("rejects wellDid with invalid prefix", () => {
    const badWell = { ...SAMPLE_WELL, wellDid: "banana_42001300010000" };
    const result = WELL_SCHEMA.safeParse(badWell);
    expect(result.success).toBe(false);
  });

  it("rejects wellDid not matching derived ID from apiNumber14", () => {
    const badWell = { ...SAMPLE_WELL, wellDid: "well_99999999999999" };
    const result = WELL_SCHEMA.safeParse(badWell);
    expect(result.success).toBe(false);
  });

  it("rejects ownership-interest with neither anchorTractDid nor anchorLeaseDid", () => {
    const badInterest = {
      ...SAMPLE_OWNERSHIP_INTEREST,
      anchorTractDid: undefined,
      anchorLeaseDid: undefined,
    };
    const result = OWNERSHIP_INTEREST_SCHEMA.safeParse(badInterest);
    expect(result.success).toBe(false);
  });

  it("rejects derived production stream without required fields", () => {
    const badStream = {
      ...SAMPLE_PRODUCTION_TIMESERIES,
      streamKind: "derived-allocation",
    };
    const result = PRODUCTION_TIMESERIES_SCHEMA.safeParse(badStream);
    expect(result.success).toBe(false);
  });

  it("accepts derived production stream with all required fields", () => {
    const goodStream = {
      ...SAMPLE_PRODUCTION_TIMESERIES,
      streamKind: "derived-allocation",
      derivationMethod: "well-level allocation from lease total",
      confidence: createOgAssertedConfidence(0.8),
      derivesFromStreamDid: "prodts_fedcba9876543210",
    };
    const result = PRODUCTION_TIMESERIES_SCHEMA.safeParse(goodStream);
    expect(result.success).toBe(true);
  });
});
