import { renderWavePath } from "../renderer/wavePathRenderer";
import { generateWavePathDemoMedia } from "./essentialRigDemos";
import { isBackground, isInRange, isRecord, isSupportedRatio } from "./settingsValidation";
import type { WavePathRigDefinition, WavePathRigSettings } from "./types";
import { wavePathPresets } from "./wavePathPresets";

export const wavePathRig: WavePathRigDefinition = {
  accessibilityDescription: "Six media cards travel continuously along an open wave path with tangent-led rotation and center depth.",
  capabilities: { looping: true, supportsBackground: true, supportsDirection: true, supportsShapes: false, supportsTransparentBackground: true },
  category: "Path motion",
  defaultRatio: "16:9",
  defaultSettings: {
    background: { gradientEnd: "#24443f", gradientStart: "#091111", mode: "gradient", solidColor: "#101918" },
    cardHeight: 0.58, cardWidth: 0.3, centerScale: 0.2, cornerRadius: 22, direction: "left", durationSeconds: 10,
    edgeOpacity: 0.26, frameRatio: "16:9", gap: 0.04, pathTilt: -3, perspective: 0.62,
    tangentRotation: 0.72, waveAmplitude: 0.22, waveFrequency: 1,
  },
  exportMetadata: { defaultDuration: 10, fileNamePrefix: "hoppy-wave-path", supportsTransparentBackground: true },
  family: "path",
  gallery: { description: "Cards travel an open curve with tangent motion—ideal for expressive campaigns." },
  generateDemoMedia: generateWavePathDemoMedia,
  id: "wave-path",
  inspectorControls: [
    { fineStep: 0.05, key: "durationSeconds", kind: "number", label: "Loop duration", largeStep: 1, max: 20, min: 3, precision: 1, section: "motion", sliderStep: 0.1, step: 0.1, unit: "s", unitLabel: "seconds" },
    { key: "direction", kind: "choice", label: "Direction", options: [{ label: "Left", value: "left" }, { label: "Right", value: "right" }], section: "motion" },
    { fineStep: 0.1, key: "waveAmplitude", kind: "number", label: "Wave amplitude", largeStep: 5, max: 30, min: 0, precision: 1, scale: 100, section: "motion", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.05, key: "waveFrequency", kind: "number", label: "Wave frequency", largeStep: 0.5, max: 2, min: 0.5, precision: 2, section: "motion", sliderStep: 0.05, step: 0.1, unit: "×", unitLabel: "cycles" },
    { fineStep: 0.1, key: "pathTilt", kind: "number", label: "Path tilt", largeStep: 5, max: 12, min: -12, precision: 1, section: "motion", sliderStep: 0.5, step: 1, unit: "°", unitLabel: "degrees" },
    { fineStep: 0.1, key: "tangentRotation", kind: "number", label: "Tangent rotation", largeStep: 10, max: 100, min: 0, precision: 1, scale: 100, section: "motion", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "cardWidth", kind: "number", label: "Card width", largeStep: 5, max: 42, min: 22, precision: 1, scale: 100, section: "layout", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "cardHeight", kind: "number", label: "Card height", largeStep: 5, max: 72, min: 42, precision: 1, scale: 100, section: "layout", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "gap", kind: "number", label: "Gap", largeStep: 5, max: 12, min: 0, precision: 1, scale: 100, section: "layout", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "perspective", kind: "number", label: "Perspective", largeStep: 10, max: 80, min: 0, precision: 1, scale: 100, section: "depth", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "centerScale", kind: "number", label: "Center scale", largeStep: 5, max: 28, min: 0, precision: 1, scale: 100, section: "depth", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "edgeOpacity", kind: "number", label: "Edge opacity", largeStep: 10, max: 100, min: 15, precision: 1, scale: 100, section: "depth", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.5, key: "cornerRadius", kind: "number", label: "Corner radius", largeStep: 5, max: 40, min: 0, precision: 1, section: "appearance", sliderStep: 1, step: 1, unit: "px", unitLabel: "pixels" },
  ],
  inspectorSections: [
    { defaultOpen: true, id: "motion", label: "Motion" },
    { defaultOpen: true, id: "layout", label: "Path layout" },
    { defaultOpen: false, id: "depth", label: "Depth & focus" },
    { defaultOpen: false, id: "appearance", label: "Card appearance" },
    { defaultOpen: false, id: "background", label: "Background" },
    { defaultOpen: false, id: "export", label: "Output summary" },
  ],
  isSettings: isWavePathSettings,
  longDescription: "Six frames travel along a non-circular normalized wave with ratio-aware amplitude, tangent rotation, and deterministic wrapping.",
  mediaRequirements: {
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"], maxFileBytes: 25 * 1024 * 1024,
    maxItems: 6, minItems: 2, preferredDimensions: "Campaign or portfolio frames at 1200 px or larger work best.", requiredForExport: 2, requiredForPng: 1,
  },
  maturity: "production",
  name: "Wave Path",
  presetCompatibility: { schemaId: "wave-path-settings", version: 1 },
  presets: wavePathPresets,
  preview: { accent: "#70d2bc", durationSeconds: 10, generateMedia: generateWavePathDemoMedia, mediaCount: 6, ratio: "16:9", render: renderWavePath, settingsOverride: { cardHeight: 0.5, cardWidth: 0.24, centerScale: 0.12, frameRatio: "16:9", gap: 0.07, perspective: 0.44, waveAmplitude: 0.26 }, staticProgress: 0.21 },
  render: renderWavePath,
  shortDescription: "Expressive campaigns with fluid, directional movement.",
  slotCount: 6,
  slotLabels: ["Frame 1", "Frame 2", "Frame 3", "Frame 4", "Frame 5", "Frame 6"],
  supportedRatios: ["16:9", "9:16", "1:1"],
  tags: ["flowing", "curved", "spatial", "cinematic"],
  version: 1,
};

function isWavePathSettings(value: unknown): value is WavePathRigSettings {
  return isRecord(value) && isBackground(value.background) && isInRange(value.durationSeconds, 3, 20) &&
    (value.direction === "left" || value.direction === "right") && isInRange(value.cardWidth, 0.22, 0.42) &&
    isInRange(value.cardHeight, 0.42, 0.72) && isInRange(value.gap, 0, 0.12) &&
    isInRange(value.waveAmplitude, 0, 0.3) && isInRange(value.waveFrequency, 0.5, 2) &&
    isInRange(value.pathTilt, -12, 12) && isInRange(value.perspective, 0, 0.8) &&
    isInRange(value.centerScale, 0, 0.28) && isInRange(value.edgeOpacity, 0.15, 1) &&
    isInRange(value.tangentRotation, 0, 1) && isInRange(value.cornerRadius, 0, 40) &&
    isSupportedRatio(value.frameRatio, wavePathRig.supportedRatios);
}
