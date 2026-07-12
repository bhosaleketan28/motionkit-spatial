import type { RigPreset, StackFlowRigSettings } from "./types";

const owned = [
  "backOpacity", "backScale", "background", "cardHeight", "cardWidth", "cornerRadius", "durationSeconds",
  "frontExitDistance", "rotationStep", "stackAxis", "stackDepth", "stackOffset", "transitionSoftness",
] as const satisfies readonly (keyof StackFlowRigSettings)[];

export const stackFlowPresets = [
  {
    description: "A tactile diagonal deck with measured depth and a visible front exit.",
    id: "layered-deck",
    name: "Layered Deck",
    ownedProperties: owned,
    previewStyle: { accent: "#77d2b4", colors: ["#101714", "#405e55"] },
    rigId: "stack-flow",
    schemaId: "stack-flow-settings",
    settingsPatch: {
      backOpacity: 0.3, backScale: 0.72, background: { gradientEnd: "#263a33", gradientStart: "#0e1412", mode: "gradient", solidColor: "#141b18" },
      cardHeight: 0.66, cardWidth: 0.42, cornerRadius: 22, durationSeconds: 8, frontExitDistance: 0.18,
      rotationStep: 3, stackAxis: "diagonal", stackDepth: 0.75, stackOffset: 0.045, transitionSoftness: 0.76,
    },
    version: 1,
  },
  {
    description: "A vertical editorial pile with gentle rotation and slower sequencing.",
    id: "editorial-stack",
    name: "Editorial Stack",
    ownedProperties: owned,
    previewStyle: { accent: "#c5a878", colors: ["#181510", "#5e4c32"] },
    rigId: "stack-flow",
    schemaId: "stack-flow-settings",
    settingsPatch: {
      backOpacity: 0.38, backScale: 0.76, background: { gradientEnd: "#342b1e", gradientStart: "#12110e", mode: "gradient", solidColor: "#191612" },
      cardHeight: 0.68, cardWidth: 0.4, cornerRadius: 16, durationSeconds: 10.5, frontExitDistance: 0.14,
      rotationStep: 1.5, stackAxis: "vertical", stackDepth: 0.68, stackOffset: 0.04, transitionSoftness: 0.86,
    },
    version: 1,
  },
  {
    description: "Faster horizontal cards with stronger separation for social compositions.",
    id: "social-cards",
    name: "Social Cards",
    ownedProperties: [...owned, "frameRatio"],
    previewStyle: { accent: "#8c9fd2", colors: ["#111624", "#3d4c74"] },
    rigId: "stack-flow",
    schemaId: "stack-flow-settings",
    settingsPatch: {
      backOpacity: 0.25, backScale: 0.68, background: { gradientEnd: "#28365a", gradientStart: "#0c101c", mode: "gradient", solidColor: "#111625" },
      cardHeight: 0.62, cardWidth: 0.46, cornerRadius: 26, durationSeconds: 6, frameRatio: "9:16", frontExitDistance: 0.24,
      rotationStep: 4, stackAxis: "horizontal", stackDepth: 0.82, stackOffset: 0.052, transitionSoftness: 0.62,
    },
    version: 1,
  },
  {
    description: "A restrained near-flat pile with high back-card legibility.",
    id: "minimal-pile",
    name: "Minimal Pile",
    ownedProperties: owned,
    previewStyle: { accent: "#a1aaa4", colors: ["#edede7", "#c9cdc8"] },
    rigId: "stack-flow",
    schemaId: "stack-flow-settings",
    settingsPatch: {
      backOpacity: 0.72, backScale: 0.88, background: { gradientEnd: "#d4d8d2", gradientStart: "#efeee8", mode: "solid", solidColor: "#ebeae4" },
      cardHeight: 0.62, cardWidth: 0.4, cornerRadius: 10, durationSeconds: 9, frontExitDistance: 0.08,
      rotationStep: 0.5, stackAxis: "diagonal", stackDepth: 0.42, stackOffset: 0.03, transitionSoftness: 0.9,
    },
    version: 1,
  },
] as const satisfies readonly RigPreset<StackFlowRigSettings>[];
