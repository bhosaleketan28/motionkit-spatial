import type { MotionRigDefinition } from "./types";

export const orbitCarouselRig: MotionRigDefinition = {
  id: "orbit-carousel",
  name: "Orbit Carousel",
  description: "Four cards orbit around a calm center point with a soft depth illusion.",
  mediaSlotCount: 4,
  defaultFrameRatio: "1:1",
  defaults: {
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
  },
};
