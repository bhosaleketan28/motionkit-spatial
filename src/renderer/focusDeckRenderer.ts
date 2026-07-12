import type { FocusDeckRigSettings, RigRenderInput } from "../rigs/types";
import type { SpatialMediaCardLayout } from "./canvasCard";
import { drawSpatialMediaCard } from "./canvasCard";
import { drawBackground, drawFrameGuide } from "./canvasRenderer";
import { lerp, positiveModulo, smoothstep } from "./motionGeometry";

interface DeckTarget {
  alpha: number;
  depth: number;
  rotation: number;
  scale: number;
  x: number;
  y: number;
}

interface FocusCardLayout extends SpatialMediaCardLayout {
  depth: number;
}

export function renderFocusDeck({
  context,
  frame,
  progress,
  renderFrameGuide = false,
  selectedSlotIndex,
  settings,
  slotCount,
  slotImages = [],
}: RigRenderInput<FocusDeckRigSettings>) {
  context.clearRect(0, 0, frame.width, frame.height);
  drawBackground(context, frame.width, frame.height, settings.background);
  if (renderFrameGuide) drawFrameGuide(context, frame);

  getFocusLayouts(frame.width, frame.height, slotCount, progress, settings)
    .sort((left, right) => left.depth - right.depth || left.index - right.index)
    .forEach((card) => {
      drawSpatialMediaCard(context, card, slotImages[card.index] ?? null, settings.cornerRadius, card.index === selectedSlotIndex);
    });
}

function getFocusLayouts(
  width: number,
  height: number,
  slotCount: number,
  progress: number,
  settings: FocusDeckRigSettings,
): FocusCardLayout[] {
  const targets = getDeckTargets(width, height, slotCount, settings);
  const direction = settings.direction === "forward" ? 1 : -1;
  const phase = progress * slotCount * direction;
  const heroWidth = width * settings.heroWidth * (settings.frameRatio === "9:16" ? 1.46 : settings.frameRatio === "1:1" ? 1.12 : 1);
  const heroHeight = height * settings.heroHeight * (settings.frameRatio === "9:16" ? 0.82 : settings.frameRatio === "1:1" ? 0.92 : 1);

  return Array.from({ length: slotCount }, (_, index) => {
    const queue = positiveModulo(index - phase, slotCount);
    const baseIndex = Math.floor(queue);
    const nextIndex = (baseIndex + 1) % slotCount;
    const rawAmount = queue - baseIndex;
    const eased = smoothstep(0, 1, rawAmount);
    const amount = lerp(rawAmount, eased, settings.transitionSoftness);
    const start = targets[baseIndex];
    const end = targets[nextIndex];
    const depth = lerp(start.depth, end.depth, amount);
    const heroBoost = Math.max(0, depth) * settings.heroEmphasis;
    return {
      alpha: lerp(start.alpha, end.alpha, amount),
      depth,
      height: heroHeight,
      index,
      rotation: lerp(start.rotation, end.rotation, amount),
      scale: lerp(start.scale, end.scale, amount) * (1 + heroBoost),
      width: heroWidth,
      x: lerp(start.x, end.x, amount),
      y: lerp(start.y, end.y, amount) - heroBoost * height * 0.018,
    };
  });
}

function getDeckTargets(width: number, height: number, slotCount: number, settings: FocusDeckRigSettings): DeckTarget[] {
  const portrait = settings.frameRatio === "9:16";
  const square = settings.frameRatio === "1:1";
  const spreadX = width * settings.supportSpread;
  const spreadY = height * settings.supportSpread;
  const supportScale = settings.supportScale;
  const depthStep = settings.deckDepth / Math.max(1, slotCount - 1);
  const rotation = settings.sideRotation * Math.PI / 180;
  const hero: DeckTarget = {
    alpha: 1,
    depth: 1,
    rotation: 0,
    scale: 1,
    x: width * (portrait ? 0.5 : 0.48),
    y: height * (portrait ? 0.39 : square ? 0.47 : 0.5),
  };
  const normalized = portrait
    ? [
      [-0.38, 0.4, -0.7], [0.38, 0.4, 0.7], [-0.2, 0.66, -0.36], [0.2, 0.66, 0.36],
    ]
    : square
      ? [[-0.58, -0.2, -0.72], [0.58, -0.1, 0.72], [-0.5, 0.42, -0.5], [0.5, 0.46, 0.5]]
      : [[-0.75, -0.14, -0.78], [0.78, -0.06, 0.78], [-0.64, 0.42, -0.48], [0.66, 0.38, 0.48]];
  return [hero, ...normalized.slice(0, slotCount - 1).map(([x, y, rotate], index) => ({
    alpha: Math.max(settings.edgeOpacity, 0.88 - index * 0.11),
    depth: 0.42 - index * depthStep,
    rotation: rotation * rotate,
    scale: supportScale * (1 - index * settings.deckDepth * 0.045),
    x: width / 2 + x * spreadX,
    y: height / 2 + y * spreadY,
  }))];
}
