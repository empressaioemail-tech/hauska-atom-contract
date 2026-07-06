/**
 * Sample fixtures for O&G atom types per ADR-025.
 * Used in conformance tests and as documentation examples.
 */

import { createOgAssertedConfidence } from "./common.js";
import type { WellAtomInstance } from "./well.js";
import type { WellboreAtomInstance } from "./wellbore.js";
import type { CompletionAtomInstance } from "./completion.js";
import type { ZoneAtomInstance } from "./zone.js";
import type { PadAtomInstance } from "./pad.js";
import type { ProductionTimeseriesAtomInstance } from "./production-timeseries.js";
import type { EquipmentStateAtomInstance } from "./equipment-state.js";
import type { MineralLeaseAtomInstance } from "./mineral-lease.js";
import type { RrcLeaseAtomInstance } from "./rrc-lease.js";
import type { TractAtomInstance } from "./tract.js";
import type { OwnershipInterestAtomInstance } from "./ownership-interest.js";

export const SAMPLE_WELL: WellAtomInstance = {
  entityType: "well",
  wellDid: "well_42001300010000",
  apiNumber14: "42-001-30001-0000",
  wellName: "Sample Well #1",
  wellNumber: "1",
  wellType: "oil",
  status: "active",
  spudDate: "2024-01-15",
  completionDate: "2024-02-20",
  totalDepth: 8500,
  surfaceLocation: { latitude: 31.5, longitude: -102.1, datum: "WGS84" },
  bottomholeLocation: { latitude: 31.49, longitude: -102.08, datum: "WGS84" },
  fieldRef: { fieldName: "Sample Field", fieldNumber: "12345" },
  district: "08",
  sourceCitation: "RRC PDQ 2024-Q1",
  extractedAt: "2024-03-01T12:00:00Z",
  asOf: "2024-02-20",
  accessPolicy: "public-free",
};

export const SAMPLE_WELLBORE: WellboreAtomInstance = {
  entityType: "wellbore",
  wellboreDid: "wbore_a1b2c3d4e5f6g7h8",
  wellDid: "well_42001300010000",
  sidetrackSequence: 0,
  directionalSurveyCid: "bafyk1234567890abcdef",
  lateralPathRef: "bafyk0987654321fedcba",
  kickoffDepth: 7200,
  measuredDepth: 12500,
  sourceCitation: "RRC W-2 2024-001",
  extractedAt: "2024-03-01T12:00:00Z",
  asOf: "2024-02-20",
  accessPolicy: "public-free",
};

export const SAMPLE_COMPLETION: CompletionAtomInstance = {
  entityType: "completion",
  completionDid: "cmpl_1a2b3c4d5e6f7g8h",
  wellboreDid: "wbore_a1b2c3d4e5f6g7h8",
  completionDate: "2024-02-20",
  perforatedIntervals: [
    { topDepth: 8200, bottomDepth: 8300, zoneDid: "zone_wolfcamp_a" },
    { topDepth: 8400, bottomDepth: 8500, zoneDid: "zone_wolfcamp_b" },
  ],
  sourceCitation: "RRC W-2 2024-001",
  extractedAt: "2024-03-01T12:00:00Z",
  asOf: "2024-02-20",
  accessPolicy: "public-free",
};

export const SAMPLE_ZONE: ZoneAtomInstance = {
  entityType: "zone",
  zoneDid: "zone_wolfcamp_a",
  formationName: "Wolfcamp A",
  tops: 8150,
  sourceCitation: "Texas Geological Survey 2023",
  extractedAt: "2024-01-01T00:00:00Z",
  asOf: "2023-12-31",
  accessPolicy: "public-free",
};

export const SAMPLE_PAD: PadAtomInstance = {
  entityType: "pad",
  padDid: "pad_sample_001",
  wellDids: ["well_42001300010000", "well_42001300020000"],
  surfaceLocation: { latitude: 31.5, longitude: -102.1, datum: "WGS84" },
  derivationMethod: "proximity-clustering-100m",
  sourceCitation: "Derived from RRC well locations",
  extractedAt: "2024-03-01T12:00:00Z",
  asOf: "2024-02-20",
  accessPolicy: "public-free",
};

export const SAMPLE_PRODUCTION_TIMESERIES: ProductionTimeseriesAtomInstance = {
  entityType: "production-timeseries",
  streamDid: "prodts_lease_oil_001",
  anchorKind: "rrc-lease",
  anchorDid: "rrclease_08-12345",
  product: "oil",
  granularity: "monthly",
  sourceAdapter: "RRC-PDQ-EBCDIC",
  sourceCitation: "RRC PDQ 2024-Q1",
  extractedAt: "2024-03-01T12:00:00Z",
  asOf: "2024-02-29",
  accessPolicy: "public-free",
};

export const SAMPLE_EQUIPMENT_STATE: EquipmentStateAtomInstance = {
  entityType: "equipment-state",
  equipmentDid: "equip_rodpump_001",
  wellDid: "well_42001300010000",
  equipmentKind: "rod-pump",
  stateSnapshot: { strokesPerMinute: 12, fillage: 0.85, runtime: "active" },
  telemetryStreamRefs: ["stream_scada_001"],
  sourceCitation: "SCADA historian",
  extractedAt: "2024-03-15T08:00:00Z",
  asOf: "2024-03-15T08:00:00Z",
  accessPolicy: "tenant-private",
};

export const SAMPLE_MINERAL_LEASE: MineralLeaseAtomInstance = {
  entityType: "mineral-lease",
  leaseDid: "mlease_sample_001",
  lessorActorDids: ["actor_lessor_001"],
  lesseeActorDid: "actor_lessee_001",
  evidencedByInstrumentDids: ["instr_recorded_001"],
  primaryTerm: "3 years",
  effectiveDate: "2022-01-01",
  royaltyFraction: 0.25,
  bonusPerAcre: 500,
  clauseExtracts: [
    {
      clauseType: "shut-in",
      extractedText: "Lessee may pay shut-in royalty...",
      confidence: createOgAssertedConfidence(0.9),
      sourceCitation: "Instrument page 3",
      sourceInstrumentDid: "instr_recorded_001",
      pageRef: "3",
    },
  ],
  tractDids: ["tract_reeves-123"],
  status: "hbp",
  sourceCitation: "County records + landman book",
  extractedAt: "2024-03-01T12:00:00Z",
  asOf: "2024-02-20",
  accessPolicy: "tenant-private",
};

export const SAMPLE_RRC_LEASE: RrcLeaseAtomInstance = {
  entityType: "rrc-lease",
  rrcLeaseDid: "rrclease_08-12345",
  leaseNumber: "12345",
  leaseName: "Sample Lease",
  district: "08",
  fieldRef: { fieldName: "Sample Field", fieldNumber: "12345" },
  operatorActorDid: "actor_operator_001",
  wellCount: 5,
  status: "active",
  acreage: 640,
  sourceCitation: "RRC Public Query 2024-Q1",
  extractedAt: "2024-03-01T12:00:00Z",
  asOf: "2024-02-29",
  accessPolicy: "public-free",
};

export const SAMPLE_TRACT: TractAtomInstance = {
  entityType: "tract",
  tractDid: "tract_reeves-123",
  legalDescription: "Section 12, Block 50, Township 5 South",
  plssOrSurveyRef: "TTRR Survey",
  abstractNumber: "123",
  county: "Reeves",
  state: "TX",
  acreage: 640,
  sourceCitation: "County records",
  extractedAt: "2024-03-01T12:00:00Z",
  asOf: "2024-02-20",
  accessPolicy: "public-free",
};

export const SAMPLE_OWNERSHIP_INTEREST: OwnershipInterestAtomInstance = {
  entityType: "ownership-interest",
  interestDid: "intr_sample_001",
  interestType: "mineral",
  ownerActorDid: "actor_owner_001",
  anchorTractDid: "tract_reeves-123",
  decimalInterest: 0.125,
  fraction: "1/8",
  effectiveFrom: "2020-01-01",
  derivedFromInstrumentDids: ["instr_deed_001", "instr_deed_002"],
  gaps: ["Missing link between 1995 and 2000"],
  confidence: createOgAssertedConfidence(0.85),
  sourceCitation: "Run sheet analysis",
  extractedAt: "2024-03-01T12:00:00Z",
  asOf: "2024-02-20",
  accessPolicy: "tenant-private",
};
