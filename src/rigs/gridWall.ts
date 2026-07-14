import { renderGridWall } from "../renderer/gridWallRenderer";
import { generateGridWallDemoMedia } from "./essentialRigDemos";
import { gridWallPresets } from "./gridWallPresets";
import { isBackground, isInRange, isRecord, isSupportedRatio } from "./settingsValidation";
import type { GridWallRigDefinition, GridWallRigSettings } from "./types";

export const gridWallRig: GridWallRigDefinition = {
  accessibilityDescription: "Six media tiles form a ratio-aware architectural grid with a smoothly changing focal tile.",
  capabilities: { looping: true, supportsBackground: true, supportsDirection: true, supportsShapes: false, supportsTransparentBackground: true },
  category: "Modular motion",
  defaultRatio: "16:9",
  defaultSettings: {
    background: { gradientEnd: "#25342f", gradientStart: "#101513", mode: "gradient", solidColor: "#151c19" },
    cornerRadius: 18,
    direction: "forward",
    driftAmount: 0.1,
    durationSeconds: 9,
    edgeOpacity: 0.56,
    focusDepth: 0.42,
    focusScale: 0.14,
    frameRatio: "16:9",
    gridScale: 0.92,
    horizontalGap: 0.025,
    tileHeight: 0.34,
    tileWidth: 0.27,
    verticalGap: 0.035,
  },
  exportMetadata: { defaultDuration: 9, fileNamePrefix: "motionkit-grid-wall", supportsTransparentBackground: true },
  family: "grid",
  gallery: {
    description: "Tiles hold a clear grid while focus drifts—ideal for systems and portfolios.",
    featured: true,
  },
  generateDemoMedia: generateGridWallDemoMedia,
  id: "grid-wall",
  inspectorControls: [
    { fineStep: 0.05, key: "durationSeconds", kind: "number", label: "Loop duration", largeStep: 1, max: 20, min: 3, precision: 1, section: "motion", sliderStep: 0.1, step: 0.1, unit: "s", unitLabel: "seconds" },
    { key: "direction", kind: "choice", label: "Direction", options: [{ label: "Forward", value: "forward" }, { label: "Reverse", value: "reverse" }], section: "motion" },
    { fineStep: 0.1, key: "driftAmount", kind: "number", label: "Drift amount", largeStep: 5, max: 24, min: 0, precision: 1, scale: 100, section: "motion", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "focusScale", kind: "number", label: "Focus scale", largeStep: 5, max: 24, min: 0, precision: 1, scale: 100, section: "depth", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "focusDepth", kind: "number", label: "Focus depth", largeStep: 10, max: 80, min: 0, precision: 1, scale: 100, section: "depth", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "tileWidth", kind: "number", label: "Tile width", largeStep: 5, max: 31, min: 20, precision: 1, scale: 100, section: "layout", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "tileHeight", kind: "number", label: "Tile height", largeStep: 5, max: 40, min: 25, precision: 1, scale: 100, section: "layout", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "horizontalGap", kind: "number", label: "Horizontal gap", largeStep: 2, max: 6, min: 1, precision: 1, scale: 100, section: "layout", sliderStep: 0.1, step: 0.5, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "verticalGap", kind: "number", label: "Vertical gap", largeStep: 2, max: 8, min: 1, precision: 1, scale: 100, section: "layout", sliderStep: 0.1, step: 0.5, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "gridScale", kind: "number", label: "Grid scale", largeStep: 5, max: 100, min: 76, precision: 1, scale: 100, section: "layout", sliderStep: 0.5, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "edgeOpacity", kind: "number", label: "Edge opacity", largeStep: 10, max: 100, min: 20, precision: 1, scale: 100, section: "depth", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.5, key: "cornerRadius", kind: "number", label: "Corner radius", largeStep: 5, max: 36, min: 0, precision: 1, section: "appearance", sliderStep: 1, step: 1, unit: "px", unitLabel: "pixels" },
  ],
  inspectorSections: [
    { defaultOpen: true, id: "motion", label: "Motion" },
    { defaultOpen: true, id: "layout", label: "Grid layout" },
    { defaultOpen: false, id: "depth", label: "Depth & focus" },
    { defaultOpen: false, id: "appearance", label: "Card appearance" },
    { defaultOpen: false, id: "background", label: "Background" },
    { defaultOpen: false, id: "export", label: "Output summary" },
  ],
  isSettings: isGridWallSettings,
  longDescription: "Six tiles move as a stable ratio-aware wall with authored drift and a deterministic focal rhythm.",
  mediaRequirements: {
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"], maxFileBytes: 25 * 1024 * 1024,
    maxItems: 6, minItems: 3, preferredDimensions: "Landscape or portrait campaign frames at 1200 px or larger work best.", requiredForExport: 3, requiredForPng: 1,
  },
  maturity: "production",
  name: "Grid Wall",
  presetCompatibility: { schemaId: "grid-wall-settings", version: 1 },
  presets: gridWallPresets,
  preview: { accent: "#78d6b8", durationSeconds: 9, generateMedia: generateGridWallDemoMedia, mediaCount: 6, ratio: "16:9", render: renderGridWall, settingsOverride: { focusDepth: 0.56, focusScale: 0.2, frameRatio: "16:9", gridScale: 0.88 }, staticProgress: 0.28 },
  render: renderGridWall,
  shortDescription: "Brand systems, portfolios, and modular visual narratives.",
  slotCount: 6,
  slotLabels: ["Tile 1", "Tile 2", "Tile 3", "Tile 4", "Tile 5", "Tile 6"],
  supportedRatios: ["16:9", "9:16", "1:1"],
  tags: ["editorial", "modular", "multi-card", "rhythmic"],
  version: 1,
};

function isGridWallSettings(value: unknown): value is GridWallRigSettings {
  return isRecord(value) && isBackground(value.background) &&
    isInRange(value.durationSeconds, 3, 20) && (value.direction === "forward" || value.direction === "reverse") &&
    isInRange(value.tileWidth, 0.2, 0.31) && isInRange(value.tileHeight, 0.25, 0.4) &&
    isInRange(value.horizontalGap, 0.01, 0.06) && isInRange(value.verticalGap, 0.01, 0.08) &&
    isInRange(value.gridScale, 0.76, 1) && isInRange(value.focusScale, 0, 0.24) &&
    isInRange(value.focusDepth, 0, 0.8) && isInRange(value.driftAmount, 0, 0.24) &&
    isInRange(value.cornerRadius, 0, 36) && isInRange(value.edgeOpacity, 0.2, 1) &&
    isSupportedRatio(value.frameRatio, gridWallRig.supportedRatios);
}
