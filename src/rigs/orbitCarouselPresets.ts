import type { OrbitRigSettings, RigPreset } from "./types";

const cinematic: RigPreset<OrbitRigSettings> = {
  description: "Measured pacing, deeper falloff, and a midnight editorial field.",
  id: "cinematic",
  name: "Cinematic",
  ownedProperties: [
    "background",
    "cardSize",
    "cornerRadius",
    "depthFade",
    "durationSeconds",
    "spread",
  ],
  previewStyle: {
    accent: "#8fc6d8",
    colors: ["#07090d", "#203448"],
  },
  rigId: "orbit-carousel",
  schemaId: "orbit-carousel-settings",
  settingsPatch: {
    background: {
      gradientEnd: "#203448",
      gradientStart: "#07090d",
      mode: "gradient",
      solidColor: "#111820",
    },
    cardSize: 0.38,
    cornerRadius: 20,
    depthFade: 0.68,
    durationSeconds: 9.5,
    spread: 0.78,
  },
  version: 1,
};

const cleanStudio: RigPreset<OrbitRigSettings> = {
  description: "Neutral studio contrast with balanced spacing and restrained depth.",
  id: "clean-studio",
  name: "Clean Studio",
  ownedProperties: [
    "background",
    "cardSize",
    "cornerRadius",
    "depthFade",
    "durationSeconds",
    "spread",
  ],
  previewStyle: {
    accent: "#bfc5bd",
    colors: ["#e7e8e3", "#b9bfba"],
  },
  rigId: "orbit-carousel",
  schemaId: "orbit-carousel-settings",
  settingsPatch: {
    background: {
      gradientEnd: "#c6cbc6",
      gradientStart: "#f0f0eb",
      mode: "gradient",
      solidColor: "#e7e8e3",
    },
    cardSize: 0.34,
    cornerRadius: 16,
    depthFade: 0.28,
    durationSeconds: 8,
    spread: 0.64,
  },
  version: 1,
};

const launchGlow: RigPreset<OrbitRigSettings> = {
  description: "Faster launch energy with a saturated nocturnal gradient and wide orbit.",
  id: "launch-glow",
  name: "Launch Glow",
  ownedProperties: [
    "background",
    "cardSize",
    "cornerRadius",
    "depthFade",
    "durationSeconds",
    "spread",
  ],
  previewStyle: {
    accent: "#70e0bf",
    colors: ["#170d2d", "#0d5360"],
  },
  rigId: "orbit-carousel",
  schemaId: "orbit-carousel-settings",
  settingsPatch: {
    background: {
      gradientEnd: "#0d5360",
      gradientStart: "#170d2d",
      mode: "gradient",
      solidColor: "#102c35",
    },
    cardSize: 0.37,
    cornerRadius: 28,
    depthFade: 0.72,
    durationSeconds: 6.8,
    spread: 0.86,
  },
  version: 1,
};

const minimalLight: RigPreset<OrbitRigSettings> = {
  description: "A quiet light canvas with compact cards and minimal depth treatment.",
  id: "minimal-light",
  name: "Minimal Light",
  ownedProperties: [
    "background",
    "cardSize",
    "cornerRadius",
    "depthFade",
    "durationSeconds",
    "spread",
  ],
  previewStyle: {
    accent: "#8f9a91",
    colors: ["#f2f1eb", "#d8d8d1"],
  },
  rigId: "orbit-carousel",
  schemaId: "orbit-carousel-settings",
  settingsPatch: {
    background: {
      gradientEnd: "#d8d8d1",
      gradientStart: "#f2f1eb",
      mode: "solid",
      solidColor: "#f2f1eb",
    },
    cardSize: 0.28,
    cornerRadius: 12,
    depthFade: 0.16,
    durationSeconds: 10,
    spread: 0.58,
  },
  version: 1,
};

export const orbitCarouselPresets = [
  cinematic,
  cleanStudio,
  launchGlow,
  minimalLight,
] as const;
