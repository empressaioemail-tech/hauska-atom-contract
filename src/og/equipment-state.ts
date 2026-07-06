import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import {
  EQUIPMENT_KINDS,
  type EquipmentKind,
} from "./common.js";

/**
 * Equipment-state atom instance per ADR-025 — artificial lift and surface
 * equipment condition (operations lens, operator-overlay data).
 * DID format: equip_<hash> (hashed derivation from source, externalId).
 */
export interface EquipmentStateAtomInstance {
  entityType: "equipment-state";
  equipmentDid: string;
  wellDid: string;
  equipmentKind: EquipmentKind;
  stateSnapshot: Record<string, unknown>;
  telemetryStreamRefs: ReadonlyArray<string>;
  sourceCitation: string;
  extractedAt: string;
  asOf: string;
  accessPolicy: AccessPolicy;
}

export const EQUIPMENT_STATE_SCHEMA = z.object({
  entityType: z.literal("equipment-state"),
  equipmentDid: z.string().min(1),
  wellDid: z.string().min(1),
  equipmentKind: z.enum(EQUIPMENT_KINDS as [EquipmentKind, ...EquipmentKind[]]),
  stateSnapshot: z.record(z.unknown()),
  telemetryStreamRefs: z.array(z.string().min(1)),
  sourceCitation: z.string().min(1),
  extractedAt: z.string().min(1),
  asOf: z.string().min(1),
  accessPolicy: z.enum([
    "public-free",
    "public-paid",
    "platform-internal",
    "tenant-private",
    "tenant-shared",
  ]),
});
