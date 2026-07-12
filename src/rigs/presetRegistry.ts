import { rigRegistry } from "./registry";
import { isPresetCompatible } from "./presetSystem";
import type { OrbitCarouselRigDefinition, OrbitRigSettings, RigPreset } from "./types";

export const presetRegistry: readonly RigPreset<OrbitRigSettings>[] = rigRegistry.flatMap(
  (rig) => rig.presets.filter((preset) => isPresetCompatible(rig, preset)),
);

const presetByRigAndId = new Map(
  presetRegistry.map((preset) => [`${preset.rigId}:${preset.id}`, preset]),
);

export function getPresetsForRig(rig: OrbitCarouselRigDefinition) {
  return presetRegistry.filter((preset) => preset.rigId === rig.id);
}

export function getPresetById(
  rig: OrbitCarouselRigDefinition,
  presetId: string | null | undefined,
) {
  if (!presetId) {
    return null;
  }
  return presetByRigAndId.get(`${rig.id}:${presetId}`) ?? null;
}
