import { renderOrbitCarousel } from "../renderer/canvasRenderer";
import { generateOrbitCarouselDemoMedia } from "./orbitCarouselDemo";
import { orbitCarouselPresets } from "./orbitCarouselPresets";
import type { OrbitCarouselRigDefinition, OrbitRigSettings } from "./types";

export const orbitCarouselRig: OrbitCarouselRigDefinition = {
  capabilities: {
    looping: true,
    supportsBackground: true,
    supportsDirection: true,
    supportsShapes: true,
    supportsTransparentBackground: true,
  },
  category: "Spatial carousel",
  defaultRatio: "1:1",
  defaultSettings: {
    background: {
      gradientEnd: "#1d2b3f",
      gradientStart: "#0c0f16",
      mode: "gradient",
      solidColor: "#12151c",
    },
    cardShape: "rectangle",
    durationSeconds: 8,
    spread: 0.72,
    depthFade: 0.48,
    cardSize: 0.34,
    cornerRadius: 24,
    direction: "clockwise",
    frameRatio: "1:1",
  },
  exportMetadata: {
    defaultDuration: 8,
    fileNamePrefix: "orbit-carousel",
    supportsTransparentBackground: true,
  },
  family: "orbit",
  gallery: {
    description: "A spatial orbit with depth-led scale and perspective.",
  },
  generateDemoMedia: generateOrbitCarouselDemoMedia,
  id: "orbit-carousel",
  inspectorSections: [
    { defaultOpen: true, id: "motion", label: "Motion" },
    { defaultOpen: true, id: "appearance", label: "Appearance" },
    { defaultOpen: true, id: "background", label: "Background" },
    { defaultOpen: false, id: "export", label: "Export summary" },
  ],
  inspectorControls: [
    { fineStep: 0.05, key: "durationSeconds", kind: "number", label: "Loop duration", largeStep: 1, max: 20, min: 4, precision: 1, section: "motion", sliderStep: 0.1, step: 0.1, unit: "s", unitLabel: "seconds" },
    { fineStep: 0.1, key: "spread", kind: "number", label: "Spread", largeStep: 10, max: 100, min: 38, precision: 1, scale: 100, section: "motion", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "depthFade", kind: "number", label: "Depth fade", largeStep: 10, max: 85, min: 5, precision: 1, scale: 100, section: "motion", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { key: "direction", kind: "choice", label: "Direction", options: [{ label: "Clockwise", value: "clockwise" }, { label: "Counter", value: "counter-clockwise" }], section: "motion" },
    { fineStep: 0.1, key: "cardSize", kind: "number", label: "Card size", largeStep: 5, max: 44, min: 22, precision: 1, scale: 100, section: "appearance", sliderStep: 1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.5, key: "cornerRadius", kind: "number", label: "Corner radius", largeStep: 5, max: 32, min: 0, precision: 1, section: "appearance", sliderStep: 1, step: 1, unit: "px", unitLabel: "pixels" },
    { key: "cardShape", kind: "choice", label: "Card shape", options: [{ label: "Rectangle", value: "rectangle" }, { label: "Square", value: "square" }, { label: "Circle", value: "circle" }, { label: "Star", value: "star" }], section: "appearance" },
  ],
  isSettings: isOrbitRigSettings,
  longDescription:
    "Four media cards orbit a calm center point with procedural depth, scale, opacity, and perspective cues.",
  mediaRequirements: {
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFileBytes: 25 * 1024 * 1024,
    maxItems: 4,
    minItems: 1,
    preferredDimensions: "Portrait images around 900 × 1160 work best.",
    requiredForExport: 4,
    requiredForPng: 4,
  },
  maturity: "production",
  name: "Orbit Carousel",
  presetCompatibility: {
    schemaId: "orbit-carousel-settings",
    version: 1,
  },
  presets: orbitCarouselPresets,
  preview: {
    accent: "#70e0bf",
    durationSeconds: 8,
    generateMedia: generateOrbitCarouselDemoMedia,
    mediaCount: 4,
    ratio: "16:9",
    render: renderOrbitCarousel,
    settingsOverride: { frameRatio: "16:9" },
    staticProgress: 0.18,
  },
  render: renderOrbitCarousel,
  shortDescription: "Four-image spatial loop",
  slotCount: 4,
  slotLabels: ["Slot 1", "Slot 2", "Slot 3", "Slot 4"],
  supportedRatios: ["1:1", "16:9", "9:16"],
  tags: ["spatial", "looping", "perspective", "multi-card"],
  version: 1,
};

function isOrbitRigSettings(value: unknown): value is OrbitRigSettings {
  if (!isRecord(value) || !isRecord(value.background)) {
    return false;
  }

  const background = value.background;
  return (
    isFiniteNumberInRange(value.durationSeconds, 4, 20) &&
    isFiniteNumberInRange(value.spread, 0.38, 1) &&
    isFiniteNumberInRange(value.depthFade, 0.05, 0.85) &&
    isFiniteNumberInRange(value.cardSize, 0.22, 0.44) &&
    isFiniteNumberInRange(value.cornerRadius, 0, 32) &&
    (value.direction === "clockwise" || value.direction === "counter-clockwise") &&
    (["rectangle", "square", "circle", "star"] as unknown[]).includes(value.cardShape) &&
    orbitCarouselRig.supportedRatios.includes(value.frameRatio as OrbitRigSettings["frameRatio"]) &&
    (["transparent", "solid", "gradient"] as unknown[]).includes(background.mode) &&
    isHex(background.solidColor) &&
    isHex(background.gradientStart) &&
    isHex(background.gradientEnd)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumberInRange(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isHex(value: unknown) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}
