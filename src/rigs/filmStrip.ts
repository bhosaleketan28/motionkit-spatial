import { renderFilmStrip } from "../renderer/filmStripRenderer";
import { generateFilmStripDemoMedia } from "./filmStripDemo";
import { filmStripPresets } from "./filmStripPresets";
import type { FilmStripRigDefinition, FilmStripRigSettings } from "./types";

export const filmStripRig: FilmStripRigDefinition = {
  accessibilityDescription: "Media frames move continuously through a horizontal editorial strip with center emphasis.",
  capabilities: {
    looping: true,
    supportsBackground: true,
    supportsDirection: true,
    supportsShapes: false,
    supportsTransparentBackground: true,
  },
  category: "Spatial Motion",
  defaultRatio: "16:9",
  defaultSettings: {
    background: {
      gradientEnd: "#26332f",
      gradientStart: "#111615",
      mode: "gradient",
      solidColor: "#151b19",
    },
    cardHeight: 0.6,
    cardWidth: 0.3,
    centerScale: 0.14,
    cornerRadius: 18,
    direction: "left",
    durationSeconds: 8,
    edgeOpacity: 0.42,
    frameRatio: "16:9",
    gap: 0.04,
    perspective: 0.44,
    tilt: -3,
  },
  exportMetadata: {
    defaultDuration: 8,
    fileNamePrefix: "motionkit-film-strip",
    supportsTransparentBackground: true,
  },
  family: "stream",
  gallery: { description: "Frames stream horizontally with editorial pacing—ideal for stories." },
  generateDemoMedia: generateFilmStripDemoMedia,
  id: "film-strip",
  inspectorControls: [
    { fineStep: 0.05, key: "durationSeconds", kind: "number", label: "Loop duration", largeStep: 1, max: 20, min: 3, precision: 1, section: "motion", sliderStep: 0.1, step: 0.1, unit: "s", unitLabel: "seconds" },
    { key: "direction", kind: "choice", label: "Direction", options: [{ label: "Left", value: "left" }, { label: "Right", value: "right" }], section: "motion" },
    { fineStep: 0.1, key: "tilt", kind: "number", label: "Tilt", largeStep: 5, max: 12, min: -12, precision: 1, section: "motion", sliderStep: 1, step: 1, unit: "°", unitLabel: "degrees" },
    { fineStep: 0.1, key: "cardWidth", kind: "number", label: "Card width", largeStep: 5, max: 55, min: 20, precision: 1, scale: 100, section: "layout", sliderStep: 0.1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "cardHeight", kind: "number", label: "Card height", largeStep: 5, max: 78, min: 35, precision: 1, scale: 100, section: "layout", sliderStep: 0.1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "gap", kind: "number", label: "Gap", largeStep: 5, max: 12, min: 0, precision: 1, scale: 100, section: "layout", sliderStep: 0.1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "perspective", kind: "number", label: "Perspective", largeStep: 10, max: 80, min: 0, precision: 1, scale: 100, section: "depth", sliderStep: 0.1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "centerScale", kind: "number", label: "Center scale", largeStep: 5, max: 28, min: 0, precision: 1, scale: 100, section: "depth", sliderStep: 0.1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.1, key: "edgeOpacity", kind: "number", label: "Edge opacity", largeStep: 10, max: 100, min: 15, precision: 1, scale: 100, section: "depth", sliderStep: 0.1, step: 1, unit: "%", unitLabel: "percent" },
    { fineStep: 0.5, key: "cornerRadius", kind: "number", label: "Corner radius", largeStep: 5, max: 40, min: 0, precision: 1, section: "appearance", sliderStep: 1, step: 1, unit: "px", unitLabel: "pixels" },
  ],
  inspectorSections: [
    { defaultOpen: true, id: "motion", label: "Motion" },
    { defaultOpen: true, id: "layout", label: "Strip layout" },
    { defaultOpen: false, id: "depth", label: "Depth & focus" },
    { defaultOpen: false, id: "appearance", label: "Card appearance" },
    { defaultOpen: false, id: "background", label: "Background" },
    { defaultOpen: false, id: "export", label: "Output summary" },
  ],
  isSettings: isFilmStripSettings,
  longDescription:
    "A continuous editorial track of six media frames with ratio-aware spacing, controlled perspective, and center emphasis.",
  mediaRequirements: {
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFileBytes: 25 * 1024 * 1024,
    maxItems: 6,
    minItems: 2,
    preferredDimensions: "Landscape or portrait editorial frames at 1200 px or larger work best.",
    requiredForExport: 2,
    requiredForPng: 1,
  },
  maturity: "production",
  name: "Film Strip",
  presetCompatibility: { schemaId: "film-strip-settings", version: 1 },
  presets: filmStripPresets,
  preview: {
    accent: "#9bc9ba",
    durationSeconds: 8,
    generateMedia: generateFilmStripDemoMedia,
    mediaCount: 6,
    ratio: "16:9",
    render: renderFilmStrip,
    settingsOverride: { cardHeight: 0.54, cardWidth: 0.25, centerScale: 0.1, frameRatio: "16:9", gap: 0.07, perspective: 0.34 },
    staticProgress: 0.34,
  },
  render: renderFilmStrip,
  shortDescription: "A cinematic horizontal stream of media frames.",
  slotCount: 6,
  slotLabels: ["Frame 1", "Frame 2", "Frame 3", "Frame 4", "Frame 5", "Frame 6"],
  supportedRatios: ["16:9", "9:16", "1:1"],
  tags: ["editorial", "cinematic", "looping", "horizontal"],
  version: 1,
};

function isFilmStripSettings(value: unknown): value is FilmStripRigSettings {
  if (!isRecord(value) || !isRecord(value.background)) return false;
  const background = value.background;
  return (
    isInRange(value.durationSeconds, 3, 20) &&
    isInRange(value.cardWidth, 0.2, 0.55) &&
    isInRange(value.cardHeight, 0.35, 0.78) &&
    isInRange(value.gap, 0, 0.12) &&
    isInRange(value.perspective, 0, 0.8) &&
    isInRange(value.tilt, -12, 12) &&
    isInRange(value.centerScale, 0, 0.28) &&
    isInRange(value.edgeOpacity, 0.15, 1) &&
    isInRange(value.cornerRadius, 0, 40) &&
    (value.direction === "left" || value.direction === "right") &&
    filmStripRig.supportedRatios.includes(value.frameRatio as FilmStripRigSettings["frameRatio"]) &&
    (background.mode === "transparent" || background.mode === "solid" || background.mode === "gradient") &&
    isHex(background.solidColor) &&
    isHex(background.gradientStart) &&
    isHex(background.gradientEnd)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isInRange(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isHex(value: unknown) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}
