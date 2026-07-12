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
  generateDemoMedia: generateOrbitCarouselDemoMedia,
  id: "orbit-carousel",
  inspectorSections: [
    { defaultOpen: true, id: "motion", label: "Motion" },
    { defaultOpen: true, id: "appearance", label: "Appearance" },
    { defaultOpen: true, id: "background", label: "Background" },
    { defaultOpen: false, id: "export", label: "Export summary" },
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
  },
  name: "Orbit Carousel",
  presetCompatibility: {
    schemaId: "orbit-carousel-settings",
    version: 1,
  },
  presets: orbitCarouselPresets,
  render: renderOrbitCarousel,
  shortDescription: "Four-image spatial loop",
  slotCount: 4,
  slotLabels: ["Slot 1", "Slot 2", "Slot 3", "Slot 4"],
  supportedRatios: ["1:1", "16:9", "9:16"],
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
