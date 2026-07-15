import { renderStackFlow } from "../renderer/stackFlowRenderer";
import { generateStackFlowDemoMedia } from "./essentialRigDemos";
import { isBackground, isInRange, isRecord, isSupportedRatio } from "./settingsValidation";
import { stackFlowPresets } from "./stackFlowPresets";
import type { StackFlowRigDefinition, StackFlowRigSettings } from "./types";

export const stackFlowRig: StackFlowRigDefinition = {
  accessibilityDescription: "Six cards form a layered deck and advance through the front position one at a time.",
  capabilities: { looping: true, supportsBackground: true, supportsDirection: true, supportsShapes: false, supportsTransparentBackground: true },
  category: "Layered motion",
  defaultRatio: "1:1",
  defaultSettings: {
    backOpacity: 0.3, backScale: 0.72,
    background: { gradientEnd: "#263a33", gradientStart: "#0e1412", mode: "gradient", solidColor: "#141b18" },
    cardHeight: 0.66, cardWidth: 0.42, cornerRadius: 22, direction: "forward", durationSeconds: 8,
    frameRatio: "1:1", frontExitDistance: 0.18, rotationStep: 3, stackAxis: "diagonal",
    stackDepth: 0.75, stackOffset: 0.045, transitionSoftness: 0.76,
  },
  exportMetadata: { defaultDuration: 8, fileNamePrefix: "hoppy-stack-flow", supportsTransparentBackground: true },
  family: "stack",
  gallery: { description: "Layered cards advance through one front position—ideal for sequences." },
  generateDemoMedia: generateStackFlowDemoMedia,
  id: "stack-flow",
  inspectorControls: [
    { fineStep: 0.05, key: "durationSeconds", kind: "number", label: "Loop duration", largeStep: 1, max: 20, min: 3, precision: 1, section: "motion", sliderStep: 0.1, step: 0.1, unit: "s", unitLabel: "seconds" },
    { key: "direction", kind: "choice", label: "Direction", options: [{ label: "Forward", value: "forward" }, { label: "Reverse", value: "reverse" }], section: "motion" },
    { key: "stackAxis", kind: "choice", label: "Stack axis", options: [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }, { label: "Diagonal", value: "diagonal" }], section: "motion" },
    { fineStep: 0.1, key: "frontExitDistance", kind: "number", label: "Front exit distance", largeStep: 5, max: 28, min: 4, precision: 1, scale: 100, section: "motion", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "transitionSoftness", kind: "number", label: "Transition softness", largeStep: 10, max: 100, min: 0, precision: 1, scale: 100, section: "motion", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "cardWidth", kind: "number", label: "Card width", largeStep: 5, max: 52, min: 30, precision: 1, scale: 100, section: "layout", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "cardHeight", kind: "number", label: "Card height", largeStep: 5, max: 76, min: 48, precision: 1, scale: 100, section: "layout", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "stackOffset", kind: "number", label: "Stack offset", largeStep: 2, max: 8, min: 1.5, precision: 1, scale: 100, section: "layout", sliderStep: 0.1, step: 0.5, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "stackDepth", kind: "number", label: "Stack depth", largeStep: 10, max: 100, min: 20, precision: 1, scale: 100, section: "depth", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "backScale", kind: "number", label: "Back scale", largeStep: 5, max: 95, min: 55, precision: 1, scale: 100, section: "depth", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "backOpacity", kind: "number", label: "Back opacity", largeStep: 10, max: 90, min: 15, precision: 1, scale: 100, section: "depth", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "rotationStep", kind: "number", label: "Rotation step", largeStep: 3, max: 8, min: -8, precision: 1, section: "layout", sliderStep: 0.5, step: 0.5, unit: "°", unitLabel: "degrees" },
    { fineStep: 0.5, key: "cornerRadius", kind: "number", label: "Corner radius", largeStep: 5, max: 40, min: 0, precision: 1, section: "appearance", sliderStep: 1, step: 1, unit: "px", unitLabel: "pixels" },
  ],
  inspectorSections: [
    { defaultOpen: true, id: "motion", label: "Motion" },
    { defaultOpen: true, id: "layout", label: "Stack layout" },
    { defaultOpen: false, id: "depth", label: "Depth & focus" },
    { defaultOpen: false, id: "appearance", label: "Card appearance" },
    { defaultOpen: false, id: "background", label: "Background" },
    { defaultOpen: false, id: "export", label: "Output summary" },
  ],
  isSettings: isStackFlowSettings,
  longDescription: "Six cards use stable authored stack geometry, continuous cyclic ordering, and a controlled front-card exit.",
  mediaRequirements: {
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"], maxFileBytes: 25 * 1024 * 1024,
    maxItems: 6, minItems: 2, preferredDimensions: "Portrait or editorial card frames at 1200 px or larger work best.", requiredForExport: 2, requiredForPng: 1,
  },
  maturity: "production",
  name: "Stack Flow",
  presetCompatibility: { schemaId: "stack-flow-settings", version: 1 },
  presets: stackFlowPresets,
  preview: { accent: "#77d2b4", durationSeconds: 8, generateMedia: generateStackFlowDemoMedia, mediaCount: 6, ratio: "16:9", render: renderStackFlow, settingsOverride: { backScale: 0.78, cardHeight: 0.58, cardWidth: 0.34, frameRatio: "16:9", frontExitDistance: 0.12, stackOffset: 0.04 }, staticProgress: 0.43 },
  render: renderStackFlow,
  shortDescription: "Layered sequences with tactile depth and deliberate pacing.",
  slotCount: 6,
  slotLabels: ["Card 1", "Card 2", "Card 3", "Card 4", "Card 5", "Card 6"],
  supportedRatios: ["16:9", "9:16", "1:1"],
  tags: ["layered", "depth", "deck", "looping"],
  version: 1,
};

function isStackFlowSettings(value: unknown): value is StackFlowRigSettings {
  return isRecord(value) && isBackground(value.background) && isInRange(value.durationSeconds, 3, 20) &&
    (value.direction === "forward" || value.direction === "reverse") &&
    (value.stackAxis === "horizontal" || value.stackAxis === "vertical" || value.stackAxis === "diagonal") &&
    isInRange(value.cardWidth, 0.3, 0.52) && isInRange(value.cardHeight, 0.48, 0.76) &&
    isInRange(value.stackOffset, 0.015, 0.08) && isInRange(value.stackDepth, 0.2, 1) &&
    isInRange(value.backScale, 0.55, 0.95) && isInRange(value.backOpacity, 0.15, 0.9) &&
    isInRange(value.frontExitDistance, 0.04, 0.28) && isInRange(value.rotationStep, -8, 8) &&
    isInRange(value.transitionSoftness, 0, 1) && isInRange(value.cornerRadius, 0, 40) &&
    isSupportedRatio(value.frameRatio, stackFlowRig.supportedRatios);
}
