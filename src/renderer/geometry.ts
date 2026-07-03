import type { FrameSize, MotionRigControlDefaults } from "../rigs/types";

export interface OrbitCardLayout {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  xScale: number;
  scale: number;
  alpha: number;
  depth: number;
  rotation: number;
}

interface OrbitLayoutOptions {
  frame: FrameSize;
  slotCount: number;
  progress: number;
  settings: MotionRigControlDefaults;
}

export function getFrameSize(ratio: string): FrameSize {
  if (ratio === "16:9") {
    return { width: 1600, height: 900 };
  }

  if (ratio === "9:16") {
    return { width: 900, height: 1600 };
  }

  return { width: 1200, height: 1200 };
}

export function getOrbitCardLayouts({
  frame,
  slotCount,
  progress,
  settings,
}: OrbitLayoutOptions): OrbitCardLayout[] {
  const directionMultiplier = settings.direction === "clockwise" ? 1 : -1;
  const centerX = frame.width / 2;
  const centerY = frame.height / 2 + shortAxisOffset(frame);
  const shortSide = Math.min(frame.width, frame.height);
  const orbitRadiusX = shortSide * settings.spread * 0.52;
  const orbitRadiusY = shortSide * settings.spread * 0.16;
  const baseWidth = shortSide * settings.cardSize;
  const baseHeight = settings.cardShape === "rectangle" ? baseWidth * 1.28 : baseWidth;
  const phase = progress * Math.PI * 2 * directionMultiplier;

  return Array.from({ length: slotCount }, (_, index) => {
    const angle = phase + (index / slotCount) * Math.PI * 2;
    const orbitX = Math.cos(angle);
    const orbitY = Math.sin(angle);
    const rawDepth = (orbitY + 1) / 2;
    const depth = easeInOut(rawDepth);
    const backness = 1 - depth;
    const sideTurn = Math.abs(orbitX);
    const scale = 0.52 + depth * 0.66;
    const alpha = clamp(1 - backness * (settings.depthFade + 0.3), 0.28, 1);
    const perspectivePull = backness * shortSide * 0.1;
    const x = centerX + orbitX * (orbitRadiusX - perspectivePull);
    const y =
      centerY +
      orbitY * orbitRadiusY +
      (depth - 0.5) * shortSide * 0.18 -
      backness * shortSide * 0.04;
    const xScale = clamp(0.62 + depth * 0.3 - sideTurn * 0.1, 0.5, 1);
    const rotation = orbitX * (0.12 - depth * 0.035);

    return {
      index,
      x,
      y,
      width: baseWidth * scale,
      height: baseHeight * scale,
      xScale,
      scale,
      alpha,
      depth,
      rotation,
    };
  }).sort((a, b) => a.depth - b.depth);
}

function shortAxisOffset(frame: FrameSize) {
  if (frame.height > frame.width) {
    return frame.height * 0.02;
  }

  return 0;
}

function easeInOut(value: number) {
  return value * value * (3 - 2 * value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
