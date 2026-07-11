import { orbitCarouselRig } from "./orbitCarousel";
import type { OrbitCarouselRigDefinition } from "./types";

export const DEFAULT_RIG_ID = orbitCarouselRig.id;

export const rigRegistry: readonly OrbitCarouselRigDefinition[] = validateRigRegistry([
  orbitCarouselRig,
]);

const rigById = new Map(rigRegistry.map((rig) => [rig.id, rig]));

export function getDefaultRig() {
  return orbitCarouselRig;
}

export function getRigById(rigId: string | null | undefined): OrbitCarouselRigDefinition {
  return (rigId ? rigById.get(rigId) : undefined) ?? getDefaultRig();
}

export function hasRig(rigId: string | null | undefined) {
  return Boolean(rigId && rigById.has(rigId));
}

function validateRigRegistry(rigs: OrbitCarouselRigDefinition[]) {
  const ids = new Set<string>();

  rigs.forEach((rig) => {
    if (!rig.id || ids.has(rig.id)) {
      throw new Error(`Rig registry contains an invalid or duplicate id: ${rig.id || "(empty)"}.`);
    }
    if (rig.slotCount < 1 || rig.slotLabels.length !== rig.slotCount) {
      throw new Error(`${rig.name} must provide one label for each media slot.`);
    }
    if (
      rig.mediaRequirements.maxItems !== rig.slotCount ||
      rig.mediaRequirements.minItems < 1 ||
      rig.mediaRequirements.minItems > rig.mediaRequirements.maxItems ||
      rig.mediaRequirements.requiredForExport > rig.slotCount
    ) {
      throw new Error(`${rig.name} media requirements do not match its slot contract.`);
    }
    if (!rig.supportedRatios.includes(rig.defaultRatio)) {
      throw new Error(`${rig.name} default ratio must be included in supported ratios.`);
    }
    if (!rig.isSettings(rig.defaultSettings)) {
      throw new Error(`${rig.name} default settings do not satisfy its settings validator.`);
    }
    if (rig.defaultSettings.durationSeconds !== rig.exportMetadata.defaultDuration) {
      throw new Error(`${rig.name} export duration must match its default settings.`);
    }
    if (
      rig.capabilities.supportsTransparentBackground !==
      rig.exportMetadata.supportsTransparentBackground
    ) {
      throw new Error(`${rig.name} transparency capabilities are inconsistent.`);
    }
    ids.add(rig.id);
  });

  return rigs;
}
