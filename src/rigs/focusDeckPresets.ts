import type { FocusDeckRigSettings, RigPreset } from "./types";

const owned = [
  "background", "cornerRadius", "deckDepth", "durationSeconds", "edgeOpacity", "heroEmphasis",
  "heroHeight", "heroWidth", "sideRotation", "supportScale", "supportSpread", "transitionSoftness",
] as const satisfies readonly (keyof FocusDeckRigSettings)[];

export const focusDeckPresets = [
  {
    description: "A confident product hero with clear, restrained supporting frames.",
    id: "product-hero",
    name: "Product Hero",
    ownedProperties: owned,
    previewStyle: { accent: "#db9474", colors: ["#151210", "#6a4436"] },
    rigId: "focus-deck",
    schemaId: "focus-deck-settings",
    settingsPatch: {
      background: { gradientEnd: "#33241e", gradientStart: "#11100f", mode: "gradient", solidColor: "#181411" },
      cornerRadius: 24, deckDepth: 0.58, durationSeconds: 9, edgeOpacity: 0.34, heroEmphasis: 0.1,
      heroHeight: 0.66, heroWidth: 0.44, sideRotation: 7, supportScale: 0.48, supportSpread: 0.38, transitionSoftness: 0.78,
    },
    version: 1,
  },
  {
    description: "Slower case-study pacing with wider supporting evidence.",
    id: "case-study",
    name: "Case Study",
    ownedProperties: owned,
    previewStyle: { accent: "#8aa5c5", colors: ["#111722", "#3e536b"] },
    rigId: "focus-deck",
    schemaId: "focus-deck-settings",
    settingsPatch: {
      background: { gradientEnd: "#27364a", gradientStart: "#0d1118", mode: "gradient", solidColor: "#111722" },
      cornerRadius: 18, deckDepth: 0.46, durationSeconds: 12, edgeOpacity: 0.48, heroEmphasis: 0.06,
      heroHeight: 0.62, heroWidth: 0.48, sideRotation: 4, supportScale: 0.52, supportSpread: 0.42, transitionSoftness: 0.88,
    },
    version: 1,
  },
  {
    description: "Stronger asymmetry and quicker hand-offs for campaign storytelling.",
    id: "campaign-focus",
    name: "Campaign Focus",
    ownedProperties: owned,
    previewStyle: { accent: "#73d7b6", colors: ["#0e1714", "#355c50"] },
    rigId: "focus-deck",
    schemaId: "focus-deck-settings",
    settingsPatch: {
      background: { gradientEnd: "#25453b", gradientStart: "#0a1210", mode: "gradient", solidColor: "#101916" },
      cornerRadius: 28, deckDepth: 0.7, durationSeconds: 7, edgeOpacity: 0.28, heroEmphasis: 0.14,
      heroHeight: 0.7, heroWidth: 0.46, sideRotation: 11, supportScale: 0.44, supportSpread: 0.46, transitionSoftness: 0.64,
    },
    version: 1,
  },
  {
    description: "Low-depth presentation geometry on a bright neutral field.",
    id: "clean-presentation",
    name: "Clean Presentation",
    ownedProperties: owned,
    previewStyle: { accent: "#a5aaa3", colors: ["#f0efe9", "#cdd1ca"] },
    rigId: "focus-deck",
    schemaId: "focus-deck-settings",
    settingsPatch: {
      background: { gradientEnd: "#d7dad4", gradientStart: "#f0efe9", mode: "solid", solidColor: "#ecebe5" },
      cornerRadius: 12, deckDepth: 0.2, durationSeconds: 10, edgeOpacity: 0.78, heroEmphasis: 0.03,
      heroHeight: 0.62, heroWidth: 0.42, sideRotation: 2, supportScale: 0.5, supportSpread: 0.4, transitionSoftness: 0.9,
    },
    version: 1,
  },
] as const satisfies readonly RigPreset<FocusDeckRigSettings>[];
