import type { FilmStripRigSettings, RigPreset } from "./types";

const sharedOwned = [
  "background",
  "cardHeight",
  "cardWidth",
  "centerScale",
  "cornerRadius",
  "durationSeconds",
  "edgeOpacity",
  "gap",
  "perspective",
  "tilt",
] as const satisfies readonly (keyof FilmStripRigSettings)[];

const editorialFlow: RigPreset<FilmStripRigSettings> = {
  description: "Balanced editorial spacing with a calm pace and restrained perspective.",
  id: "editorial-flow",
  name: "Editorial Flow",
  ownedProperties: sharedOwned,
  previewStyle: { accent: "#a9c7bd", colors: ["#d7d5cf", "#5d706b"] },
  rigId: "film-strip",
  schemaId: "film-strip-settings",
  settingsPatch: {
    background: { gradientEnd: "#26332f", gradientStart: "#b8b9b2", mode: "gradient", solidColor: "#202825" },
    cardHeight: 0.6,
    cardWidth: 0.3,
    centerScale: 0.12,
    cornerRadius: 18,
    durationSeconds: 8.5,
    edgeOpacity: 0.44,
    gap: 0.04,
    perspective: 0.42,
    tilt: -3,
  },
  version: 1,
};

const cinematicSweep: RigPreset<FilmStripRigSettings> = {
  description: "Wide frames, deeper edge fade, and a slower midnight sweep.",
  id: "cinematic-sweep",
  name: "Cinematic Sweep",
  ownedProperties: sharedOwned,
  previewStyle: { accent: "#6b8f91", colors: ["#070a0b", "#263338"] },
  rigId: "film-strip",
  schemaId: "film-strip-settings",
  settingsPatch: {
    background: { gradientEnd: "#263338", gradientStart: "#070a0b", mode: "gradient", solidColor: "#0b0f11" },
    cardHeight: 0.64,
    cardWidth: 0.36,
    centerScale: 0.22,
    cornerRadius: 20,
    durationSeconds: 11,
    edgeOpacity: 0.24,
    gap: 0.03,
    perspective: 0.68,
    tilt: 4,
  },
  version: 1,
};

const socialStream: RigPreset<FilmStripRigSettings> = {
  description: "A tighter, faster portrait stream with taller cards and clean contrast.",
  id: "social-stream",
  name: "Social Stream",
  ownedProperties: [...sharedOwned, "frameRatio"],
  previewStyle: { accent: "#70e0bf", colors: ["#101513", "#44675d"] },
  rigId: "film-strip",
  schemaId: "film-strip-settings",
  settingsPatch: {
    background: { gradientEnd: "#315249", gradientStart: "#0d1210", mode: "gradient", solidColor: "#101513" },
    cardHeight: 0.72,
    cardWidth: 0.36,
    centerScale: 0.18,
    cornerRadius: 24,
    durationSeconds: 6.2,
    edgeOpacity: 0.38,
    frameRatio: "9:16",
    gap: 0.02,
    perspective: 0.5,
    tilt: -2,
  },
  version: 1,
};

const flatGallery: RigPreset<FilmStripRigSettings> = {
  description: "Near-flat geometry, consistent scale, and a bright studio field.",
  id: "flat-gallery",
  name: "Flat Gallery",
  ownedProperties: sharedOwned,
  previewStyle: { accent: "#a3aaa4", colors: ["#f0efe9", "#c9ccc7"] },
  rigId: "film-strip",
  schemaId: "film-strip-settings",
  settingsPatch: {
    background: { gradientEnd: "#d1d4cf", gradientStart: "#f0efe9", mode: "solid", solidColor: "#eeede7" },
    cardHeight: 0.56,
    cardWidth: 0.28,
    centerScale: 0.02,
    cornerRadius: 12,
    durationSeconds: 9,
    edgeOpacity: 0.82,
    gap: 0.05,
    perspective: 0.04,
    tilt: 0,
  },
  version: 1,
};

export const filmStripPresets = [
  editorialFlow,
  cinematicSweep,
  socialStream,
  flatGallery,
] as const;
