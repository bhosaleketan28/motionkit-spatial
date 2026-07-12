import { filmStripRig } from "./filmStrip";
import { focusDeckRig } from "./focusDeck";
import { gridWallRig } from "./gridWall";
import { orbitCarouselRig } from "./orbitCarousel";
import { stackFlowRig } from "./stackFlow";
import { validateRigPresetCollection } from "./presetSystem";
import { RIG_FAMILIES } from "./types";
import type { AnyRigSettings, RegisteredRigDefinition } from "./types";
import { wavePathRig } from "./wavePath";

export const DEFAULT_RIG_ID = orbitCarouselRig.id;

export const rigRegistry: readonly RegisteredRigDefinition[] = validateRigRegistry([
  orbitCarouselRig,
  filmStripRig,
  gridWallRig,
  focusDeckRig,
  stackFlowRig,
  wavePathRig,
]);

const rigById = new Map(rigRegistry.map((rig) => [rig.id, rig]));

export function getDefaultRig() {
  return orbitCarouselRig;
}

export function getRigById(rigId: string | null | undefined): RegisteredRigDefinition {
  return (rigId ? rigById.get(rigId) : undefined) ?? getDefaultRig();
}

export function hasRig(rigId: string | null | undefined) {
  return Boolean(rigId && rigById.has(rigId));
}

function validateRigRegistry(rigs: RegisteredRigDefinition[]) {
  const ids = new Set<string>();

  rigs.forEach((rig) => {
    if (!rig.id || ids.has(rig.id)) {
      throw new Error(`Rig registry contains an invalid or duplicate id: ${rig.id || "(empty)"}.`);
    }
    if (!RIG_FAMILIES.includes(rig.family) || rig.maturity !== "production") {
      throw new Error(`${rig.name} must provide a valid production motion family and maturity.`);
    }
    if (!rig.gallery.description.trim()) {
      throw new Error(`${rig.name} must provide gallery metadata.`);
    }
    if (!rig.accessibilityDescription.trim()) {
      throw new Error(`${rig.name} must provide an accessibility description.`);
    }
    if (!rig.tags.length) {
      throw new Error(`${rig.name} must provide at least one gallery tag.`);
    }
    const tags = new Set<string>();
    rig.tags.forEach((tag) => {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag) || tags.has(tag)) {
        throw new Error(`${rig.name} contains an invalid or duplicate tag: ${tag || "(empty)"}.`);
      }
      tags.add(tag);
    });
    if (rig.slotCount < 1 || rig.slotLabels.length !== rig.slotCount) {
      throw new Error(`${rig.name} must provide one label for each media slot.`);
    }
    if (
      rig.mediaRequirements.maxItems !== rig.slotCount ||
      rig.mediaRequirements.minItems < 1 ||
      rig.mediaRequirements.minItems > rig.mediaRequirements.maxItems ||
      rig.mediaRequirements.requiredForExport > rig.slotCount ||
      rig.mediaRequirements.requiredForPng < 1 ||
      rig.mediaRequirements.requiredForPng > rig.slotCount
    ) {
      throw new Error(`${rig.name} media requirements do not match its slot contract.`);
    }
    if (!rig.supportedRatios.includes(rig.defaultRatio)) {
      throw new Error(`${rig.name} default ratio must be included in supported ratios.`);
    }
    if (!rig.isSettings(rig.defaultSettings)) {
      throw new Error(`${rig.name} default settings do not satisfy its settings validator.`);
    }
    if (rig.presets.length !== 4) {
      throw new Error(`${rig.name} must provide exactly four production presets.`);
    }
    const previewSettings = {
      ...rig.defaultSettings,
      ...rig.preview.settingsOverride,
      background: {
        ...rig.defaultSettings.background,
        ...rig.preview.backgroundOverride,
        ...(rig.preview.settingsOverride as Partial<AnyRigSettings>).background,
      },
      frameRatio: rig.preview.ratio,
    };
    if (
      !Number.isFinite(rig.preview.durationSeconds) ||
      rig.preview.durationSeconds <= 0 ||
      !rig.supportedRatios.includes(rig.preview.ratio) ||
      rig.preview.mediaCount < rig.mediaRequirements.minItems ||
      rig.preview.mediaCount > rig.slotCount ||
      rig.preview.staticProgress < 0 ||
      rig.preview.staticProgress > 1 ||
      (rig.preview.accent !== undefined && !/^#[0-9a-f]{6}$/i.test(rig.preview.accent)) ||
      typeof rig.preview.generateMedia !== "function" ||
      typeof rig.preview.render !== "function" ||
      !rig.isSettings(previewSettings)
    ) {
      throw new Error(`${rig.name} preview metadata is invalid or incompatible.`);
    }
    const controlKeys = new Set<string>();
    rig.inspectorControls.forEach((control) => {
      const sectionExists = rig.inspectorSections.some((section) => section.id === control.section);
      const defaultValue = (rig.defaultSettings as unknown as Record<string, unknown>)[control.key];
      if (!sectionExists || controlKeys.has(control.key) || defaultValue === undefined) {
        throw new Error(`${rig.name} has an invalid inspector control: ${control.key}.`);
      }
      if (control.kind === "number") {
        const displayValue = Number(defaultValue) * (control.scale ?? 1);
        if (!Number.isFinite(displayValue) || displayValue < control.min || displayValue > control.max) {
          throw new Error(`${rig.name} inspector range does not include the default for ${control.key}.`);
        }
      } else if (!control.options.some((option) => option.value === defaultValue)) {
        throw new Error(`${rig.name} inspector options do not include the default for ${control.key}.`);
      }
      controlKeys.add(control.key);
    });
    if (rig.defaultSettings.durationSeconds !== rig.exportMetadata.defaultDuration) {
      throw new Error(`${rig.name} export duration must match its default settings.`);
    }
    if (
      rig.capabilities.supportsTransparentBackground !==
      rig.exportMetadata.supportsTransparentBackground
    ) {
      throw new Error(`${rig.name} transparency capabilities are inconsistent.`);
    }
    validateRigPresetCollection(rig);
    ids.add(rig.id);
  });

  return rigs;
}
