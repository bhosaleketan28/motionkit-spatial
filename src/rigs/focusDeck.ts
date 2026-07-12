import { renderFocusDeck } from "../renderer/focusDeckRenderer";
import { generateFocusDeckDemoMedia } from "./essentialRigDemos";
import { focusDeckPresets } from "./focusDeckPresets";
import { isBackground, isInRange, isRecord, isSupportedRatio } from "./settingsValidation";
import type { FocusDeckRigDefinition, FocusDeckRigSettings } from "./types";

export const focusDeckRig: FocusDeckRigDefinition = {
  accessibilityDescription: "One dominant hero card transitions through five items while four smaller support cards remain arranged around it.",
  capabilities: { looping: true, supportsBackground: true, supportsDirection: true, supportsShapes: false, supportsTransparentBackground: true },
  category: "Presentation motion",
  defaultRatio: "16:9",
  defaultSettings: {
    background: { gradientEnd: "#33241e", gradientStart: "#11100f", mode: "gradient", solidColor: "#181411" },
    cornerRadius: 24, deckDepth: 0.58, direction: "forward", durationSeconds: 9, edgeOpacity: 0.34,
    frameRatio: "16:9", heroEmphasis: 0.1, heroHeight: 0.66, heroWidth: 0.44, sideRotation: 7,
    supportScale: 0.48, supportSpread: 0.38, transitionSoftness: 0.78,
  },
  exportMetadata: { defaultDuration: 9, fileNamePrefix: "motionkit-focus-deck", supportsTransparentBackground: true },
  family: "focus",
  gallery: { description: "A presentation-led hero card supported by a controlled deck." },
  generateDemoMedia: generateFocusDeckDemoMedia,
  id: "focus-deck",
  inspectorControls: [
    { fineStep: 0.05, key: "durationSeconds", kind: "number", label: "Loop duration", largeStep: 1, max: 20, min: 3, precision: 1, section: "motion", sliderStep: 0.1, step: 0.1, unit: "s", unitLabel: "seconds" },
    { key: "direction", kind: "choice", label: "Direction", options: [{ label: "Forward", value: "forward" }, { label: "Reverse", value: "reverse" }], section: "motion" },
    { fineStep: 0.1, key: "heroEmphasis", kind: "number", label: "Hero emphasis", largeStep: 5, max: 18, min: 0, precision: 1, scale: 100, section: "motion", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "transitionSoftness", kind: "number", label: "Transition softness", largeStep: 10, max: 100, min: 0, precision: 1, scale: 100, section: "motion", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "heroWidth", kind: "number", label: "Hero width", largeStep: 5, max: 52, min: 34, precision: 1, scale: 100, section: "appearance", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "heroHeight", kind: "number", label: "Hero height", largeStep: 5, max: 76, min: 50, precision: 1, scale: 100, section: "appearance", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "supportScale", kind: "number", label: "Support scale", largeStep: 5, max: 62, min: 34, precision: 1, scale: 100, section: "appearance", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "supportSpread", kind: "number", label: "Support spread", largeStep: 5, max: 52, min: 25, precision: 1, scale: 100, section: "appearance", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "deckDepth", kind: "number", label: "Deck depth", largeStep: 10, max: 80, min: 0, precision: 1, scale: 100, section: "appearance", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "sideRotation", kind: "number", label: "Side rotation", largeStep: 5, max: 14, min: 0, precision: 1, section: "appearance", sliderStep: 0.5, step: 1, unit: "°", unitLabel: "degrees" },
    { fineStep: 0.1, key: "edgeOpacity", kind: "number", label: "Edge opacity", largeStep: 10, max: 100, min: 15, precision: 1, scale: 100, section: "appearance", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.5, key: "cornerRadius", kind: "number", label: "Corner radius", largeStep: 5, max: 40, min: 0, precision: 1, section: "appearance", sliderStep: 1, step: 1, unit: "px", unitLabel: "pixels" },
  ],
  inspectorSections: [
    { defaultOpen: true, id: "motion", label: "Hero transition" },
    { defaultOpen: true, id: "appearance", label: "Deck geometry" },
    { defaultOpen: true, id: "background", label: "Background" },
    { defaultOpen: false, id: "export", label: "Export summary" },
  ],
  isSettings: isFocusDeckSettings,
  longDescription: "A dominant hero frame hands focus smoothly to a restrained asymmetric support deck without chaotic shuffling.",
  mediaRequirements: {
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"], maxFileBytes: 25 * 1024 * 1024,
    maxItems: 5, minItems: 2, preferredDimensions: "Product and presentation frames at 1200 px or larger work best.", requiredForExport: 2, requiredForPng: 1,
  },
  maturity: "production",
  name: "Focus Deck",
  presetCompatibility: { schemaId: "focus-deck-settings", version: 1 },
  presets: focusDeckPresets,
  preview: { accent: "#db9474", durationSeconds: 9, generateMedia: generateFocusDeckDemoMedia, mediaCount: 5, ratio: "16:9", render: renderFocusDeck, settingsOverride: { frameRatio: "16:9" }, staticProgress: 0.36 },
  render: renderFocusDeck,
  shortDescription: "A dominant hero with a supporting presentation deck.",
  slotCount: 5,
  slotLabels: ["Hero", "Support 1", "Support 2", "Support 3", "Support 4"],
  supportedRatios: ["16:9", "9:16", "1:1"],
  tags: ["hero", "product", "presentation", "cinematic"],
  version: 1,
};

function isFocusDeckSettings(value: unknown): value is FocusDeckRigSettings {
  return isRecord(value) && isBackground(value.background) && isInRange(value.durationSeconds, 3, 20) &&
    (value.direction === "forward" || value.direction === "reverse") && isInRange(value.heroWidth, 0.34, 0.52) &&
    isInRange(value.heroHeight, 0.5, 0.76) && isInRange(value.supportScale, 0.34, 0.62) &&
    isInRange(value.supportSpread, 0.25, 0.52) && isInRange(value.deckDepth, 0, 0.8) &&
    isInRange(value.heroEmphasis, 0, 0.18) && isInRange(value.transitionSoftness, 0, 1) &&
    isInRange(value.sideRotation, 0, 14) && isInRange(value.edgeOpacity, 0.15, 1) &&
    isInRange(value.cornerRadius, 0, 40) && isSupportedRatio(value.frameRatio, focusDeckRig.supportedRatios);
}
