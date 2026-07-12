import type { BaseRigSettings, RigDefinition, RigPreset } from "./types";

export type PresetApplicationState = "applied" | "modified";

export type ApplyPresetResult<Settings extends BaseRigSettings> =
  | { ok: true; settings: Settings }
  | { error: string; ok: false };

export function isPresetCompatible<Settings extends BaseRigSettings>(
  rig: RigDefinition<Settings>,
  preset: RigPreset<Settings>,
) {
  return (
    preset.rigId === rig.id &&
    preset.schemaId === rig.presetCompatibility.schemaId &&
    preset.version === rig.presetCompatibility.version
  );
}

export function applyRigPreset<Settings extends BaseRigSettings>(
  rig: RigDefinition<Settings>,
  preset: RigPreset<Settings>,
  currentSettings: Settings,
): ApplyPresetResult<Settings> {
  if (!rig.presets.some((registeredPreset) => registeredPreset === preset)) {
    return {
      error: `${preset.name || "Preset"} is not registered for ${rig.name}.`,
      ok: false,
    };
  }
  const contractIssue = getPresetContractIssue(rig, preset);
  if (contractIssue) {
    return { error: contractIssue, ok: false };
  }

  const nextSettings = { ...currentSettings };
  preset.ownedProperties.forEach((property) => {
    nextSettings[property] = cloneValue(preset.settingsPatch[property]) as Settings[typeof property];
  });

  if (!rig.isSettings(nextSettings)) {
    return {
      error: `${preset.name} contains settings that are not valid for ${rig.name}.`,
      ok: false,
    };
  }

  return { ok: true, settings: nextSettings };
}

export function getPresetApplicationState<Settings extends BaseRigSettings>(
  preset: RigPreset<Settings>,
  settings: Settings,
): PresetApplicationState {
  return preset.ownedProperties.every((property) =>
    valuesEqual(settings[property], preset.settingsPatch[property]),
  )
    ? "applied"
    : "modified";
}

export function validateRigPresetCollection<Settings extends BaseRigSettings>(
  rig: RigDefinition<Settings>,
) {
  const ids = new Set<string>();
  rig.presets.forEach((preset) => {
    if (!preset.id || ids.has(preset.id)) {
      throw new Error(`${rig.name} contains an invalid or duplicate preset id: ${preset.id || "(empty)"}.`);
    }
    const issue = getPresetContractIssue(rig, preset);
    if (issue) {
      throw new Error(issue);
    }
    ids.add(preset.id);
  });
}

function getPresetContractIssue<Settings extends BaseRigSettings>(
  rig: RigDefinition<Settings>,
  preset: RigPreset<Settings>,
) {
  if (!isPresetCompatible(rig, preset)) {
    return `${preset.name || "Preset"} is not compatible with ${rig.name}.`;
  }
  if (!preset.name || !preset.description || !preset.ownedProperties.length) {
    return `${rig.name} preset ${preset.id || "(empty)"} is missing required metadata.`;
  }
  if (
    !isHex(preset.previewStyle.accent) ||
    !preset.previewStyle.colors.every(isHex)
  ) {
    return `${preset.name} has invalid preview colors.`;
  }

  const owned = new Set<PropertyKey>();
  for (const property of preset.ownedProperties) {
    if (
      owned.has(property) ||
      !Object.prototype.hasOwnProperty.call(rig.defaultSettings, property) ||
      !Object.prototype.hasOwnProperty.call(preset.settingsPatch, property)
    ) {
      return `${preset.name} has an invalid owned property: ${String(property)}.`;
    }
    owned.add(property);
  }

  for (const property of Object.keys(preset.settingsPatch)) {
    if (!owned.has(property)) {
      return `${preset.name} updates ${property} without declaring ownership.`;
    }
  }

  const candidate = { ...rig.defaultSettings };
  preset.ownedProperties.forEach((property) => {
    candidate[property] = cloneValue(preset.settingsPatch[property]) as Settings[typeof property];
  });
  return rig.isSettings(candidate)
    ? null
    : `${preset.name} contains settings that are not valid for ${rig.name}.`;
}

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cloneValue(child)]),
    );
  }
  return value;
}

function valuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => valuesEqual(value, right[index]));
  }
  if (isRecord(left) && isRecord(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && valuesEqual(left[key], right[key]))
    );
  }
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHex(value: unknown) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}
