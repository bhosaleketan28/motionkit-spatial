import type { RigPreset, WavePathRigSettings } from "./types";

const owned = [
  "background", "cardHeight", "cardWidth", "centerScale", "cornerRadius", "durationSeconds", "edgeOpacity",
  "gap", "pathTilt", "perspective", "tangentRotation", "waveAmplitude", "waveFrequency",
] as const satisfies readonly (keyof WavePathRigSettings)[];

export const wavePathPresets = [
  {
    description: "A broad, slow wave with cinematic scale and directional rotation.",
    id: "cinematic-wave",
    name: "Cinematic Wave",
    ownedProperties: owned,
    previewStyle: { accent: "#70d2bc", colors: ["#0d1717", "#315f58"] },
    rigId: "wave-path",
    schemaId: "wave-path-settings",
    settingsPatch: {
      background: { gradientEnd: "#24443f", gradientStart: "#091111", mode: "gradient", solidColor: "#101918" },
      cardHeight: 0.58, cardWidth: 0.3, centerScale: 0.2, cornerRadius: 22, durationSeconds: 10, edgeOpacity: 0.26,
      gap: 0.04, pathTilt: -3, perspective: 0.62, tangentRotation: 0.72, waveAmplitude: 0.22, waveFrequency: 1,
    },
    version: 1,
  },
  {
    description: "A shallow editorial ribbon with wide readable frames and calm pacing.",
    id: "editorial-ribbon",
    name: "Editorial Ribbon",
    ownedProperties: owned,
    previewStyle: { accent: "#d0a071", colors: ["#17130f", "#614734"] },
    rigId: "wave-path",
    schemaId: "wave-path-settings",
    settingsPatch: {
      background: { gradientEnd: "#38291f", gradientStart: "#100e0c", mode: "gradient", solidColor: "#191410" },
      cardHeight: 0.54, cardWidth: 0.34, centerScale: 0.1, cornerRadius: 16, durationSeconds: 11.5, edgeOpacity: 0.42,
      gap: 0.06, pathTilt: 2, perspective: 0.3, tangentRotation: 0.38, waveAmplitude: 0.12, waveFrequency: 1,
    },
    version: 1,
  },
  {
    description: "A quicker portrait flow with a tighter, more expressive wave.",
    id: "social-flow",
    name: "Social Flow",
    ownedProperties: [...owned, "frameRatio"],
    previewStyle: { accent: "#8da6da", colors: ["#0f1422", "#3d527d"] },
    rigId: "wave-path",
    schemaId: "wave-path-settings",
    settingsPatch: {
      background: { gradientEnd: "#293d66", gradientStart: "#0b0f1a", mode: "gradient", solidColor: "#101625" },
      cardHeight: 0.62, cardWidth: 0.34, centerScale: 0.16, cornerRadius: 26, durationSeconds: 6, edgeOpacity: 0.3,
      frameRatio: "9:16", gap: 0.02, pathTilt: -5, perspective: 0.46, tangentRotation: 0.82, waveAmplitude: 0.26, waveFrequency: 1.5,
    },
    version: 1,
  },
  {
    description: "Flat horizontal travel with no wave amplitude and consistent card weight.",
    id: "flat-path",
    name: "Flat Path",
    ownedProperties: owned,
    previewStyle: { accent: "#a1aaa4", colors: ["#eeede7", "#cbd0ca"] },
    rigId: "wave-path",
    schemaId: "wave-path-settings",
    settingsPatch: {
      background: { gradientEnd: "#d6dad4", gradientStart: "#efeee8", mode: "solid", solidColor: "#ebeae5" },
      cardHeight: 0.54, cardWidth: 0.28, centerScale: 0.02, cornerRadius: 10, durationSeconds: 9, edgeOpacity: 0.82,
      gap: 0.05, pathTilt: 0, perspective: 0, tangentRotation: 0, waveAmplitude: 0, waveFrequency: 1,
    },
    version: 1,
  },
] as const satisfies readonly RigPreset<WavePathRigSettings>[];
