import type { GridWallRigSettings, RigPreset } from "./types";

const owned = [
  "background", "cornerRadius", "driftAmount", "durationSeconds", "edgeOpacity", "focusDepth",
  "focusScale", "gridScale", "horizontalGap", "tileHeight", "tileWidth", "verticalGap",
] as const satisfies readonly (keyof GridWallRigSettings)[];

export const gridWallPresets = [
  {
    description: "Measured editorial spacing with a clear rotating focal tile.",
    id: "editorial-wall",
    name: "Editorial Wall",
    ownedProperties: owned,
    previewStyle: { accent: "#78d6b8", colors: ["#111916", "#496a60"] },
    rigId: "grid-wall",
    schemaId: "grid-wall-settings",
    settingsPatch: {
      background: { gradientEnd: "#25342f", gradientStart: "#101513", mode: "gradient", solidColor: "#151c19" },
      cornerRadius: 18, driftAmount: 0.1, durationSeconds: 9, edgeOpacity: 0.56, focusDepth: 0.42,
      focusScale: 0.14, gridScale: 0.92, horizontalGap: 0.025, tileHeight: 0.34, tileWidth: 0.27, verticalGap: 0.035,
    },
    version: 1,
  },
  {
    description: "Tighter product tiles with stronger focus depth and slower drift.",
    id: "product-matrix",
    name: "Product Matrix",
    ownedProperties: owned,
    previewStyle: { accent: "#d5a474", colors: ["#171411", "#6d4f39"] },
    rigId: "grid-wall",
    schemaId: "grid-wall-settings",
    settingsPatch: {
      background: { gradientEnd: "#35271f", gradientStart: "#12100f", mode: "gradient", solidColor: "#191513" },
      cornerRadius: 24, driftAmount: 0.06, durationSeconds: 11, edgeOpacity: 0.42, focusDepth: 0.68,
      focusScale: 0.2, gridScale: 0.9, horizontalGap: 0.018, tileHeight: 0.36, tileWidth: 0.28, verticalGap: 0.026,
    },
    version: 1,
  },
  {
    description: "A quicker portrait-ready mosaic with compact gaps and brighter rhythm.",
    id: "social-mosaic",
    name: "Social Mosaic",
    ownedProperties: [...owned, "frameRatio"],
    previewStyle: { accent: "#8fa8dc", colors: ["#111725", "#405478"] },
    rigId: "grid-wall",
    schemaId: "grid-wall-settings",
    settingsPatch: {
      background: { gradientEnd: "#243553", gradientStart: "#0d111b", mode: "gradient", solidColor: "#111827" },
      cornerRadius: 22, driftAmount: 0.16, durationSeconds: 6.5, edgeOpacity: 0.5, focusDepth: 0.48,
      focusScale: 0.16, frameRatio: "9:16", gridScale: 0.94, horizontalGap: 0.02, tileHeight: 0.31, tileWidth: 0.28, verticalGap: 0.025,
    },
    version: 1,
  },
  {
    description: "Near-flat tiles, restrained focus, and a light architectural field.",
    id: "flat-grid",
    name: "Flat Grid",
    ownedProperties: owned,
    previewStyle: { accent: "#9ca8a2", colors: ["#ecece6", "#c9cec8"] },
    rigId: "grid-wall",
    schemaId: "grid-wall-settings",
    settingsPatch: {
      background: { gradientEnd: "#d7dbd5", gradientStart: "#eeeeea", mode: "solid", solidColor: "#e9e9e3" },
      cornerRadius: 10, driftAmount: 0.02, durationSeconds: 10, edgeOpacity: 0.9, focusDepth: 0.08,
      focusScale: 0.04, gridScale: 0.92, horizontalGap: 0.035, tileHeight: 0.32, tileWidth: 0.26, verticalGap: 0.045,
    },
    version: 1,
  },
] as const satisfies readonly RigPreset<GridWallRigSettings>[];
