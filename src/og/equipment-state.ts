import { z } from "zod";

import type { AccessPolicy } from "../registration.js";
import {
  EQUIPMENT_KINDS,
  OG_ACCESS_POLICY_SCHEMA,
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
  equipmentDid: z
    .string()
    .min(1)
    .refine((val) => /^equip_[0-9a-f]{16}$/.test(val), {
      message: "equipmentDid must be in format equip_<16-hex-chars>",
    }),
  wellDid: z
    .string()
    .min(1)
    .refine((val) => val.startsWith("well_"), {
      message: "wellDid must start with well_ prefix",
    }),
  equipmentKind: z.enum(EQUIPMENT_KINDS as [EquipmentKind, ...EquipmentKind[]]),
  stateSnapshot: z.record(z.unknown()),
  telemetryStreamRefs: z.array(z.string().min(1)),
  sourceCitation: z.string().min(1),
  extractedAt: z.string().min(1),
  asOf: z.string().min(1),
  accessPolicy: OG_ACCESS_POLICY_SCHEMA,
});
