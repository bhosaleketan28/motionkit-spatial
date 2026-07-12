import type { RigRenderInput, StackFlowRigSettings } from "../rigs/types";
import type { SpatialMediaCardLayout } from "./canvasCard";
import { drawSpatialMediaCard } from "./canvasCard";
import { drawBackground, drawFrameGuide } from "./canvasRenderer";
import { lerp, positiveModulo, smoothstep } from "./motionGeometry";

interface StackTarget {
  alpha: number;
  depth: number;
  rotation: number;
  scale: number;
  x: number;
  y: number;
}

interface StackCardLayout extends SpatialMediaCardLayout {
  depth: number;
}

export function renderStackFlow({
  context,
  frame,
  progress,
  renderFrameGuide = false,
  selectedSlotIndex,
  settings,
  slotCount,
  slotImages = [],
}: RigRenderInput<StackFlowRigSettings>) {
  context.clearRect(0, 0, frame.width, frame.height);
  drawBackground(context, frame.width, frame.height, settings.background);
  if (renderFrameGuide) drawFrameGuide(context, frame);

  getStackLayouts(frame.width, frame.height, slotCount, progress, settings)
    .sort((left, right) => left.depth - right.depth || right.index - left.index)
    .forEach((card) => {
      drawSpatialMediaCard(context, card, slotImages[card.index] ?? null, settings.cornerRadius, card.index === selectedSlotIndex);
    });
}

function getStackLayouts(
  width: number,
  height: number,
  slotCount: number,
  progress: number,
  settings: StackFlowRigSettings,
): StackCardLayout[] {
  const targets = getStackTargets(width, height, slotCount, settings);
  const direction = settings.direction === "forward" ? 1 : -1;
  const phase = progress * slotCount * direction;
  const cardWidth = width * settings.cardWidth * (settings.frameRatio === "9:16" ? 1.52 : settings.frameRatio === "1:1" ? 1.12 : 1);
  const cardHeight = height * settings.cardHeight * (settings.frameRatio === "9:16" ? 0.82 : settings.frameRatio === "1:1" ? 0.94 : 1);
  const exitVector = getExitVector(settings.stackAxis);

  return Array.from({ length: slotCount }, (_, index) => {
    const queue = positiveModulo(index + phase, slotCount);
    const baseIndex = Math.floor(queue);
    const nextIndex = (baseIndex + 1) % slotCount;
    const rawAmount = queue - baseIndex;
    const eased = smoothstep(0, 1, rawAmount);
    const amount = lerp(rawAmount, eased, settings.transitionSoftness);
    const start = targets[baseIndex];
    const end = targets[nextIndex];
    const exitArc = baseIndex === 0 ? Math.sin(amount * Math.PI) * settings.frontExitDistance : 0;
    return {
      alpha: lerp(start.alpha, end.alpha, amount),
      depth: lerp(start.depth, end.depth, amount),
      height: cardHeight,
      index,
      rotation: lerp(start.rotation, end.rotation, amount),
      scale: lerp(start.scale, end.scale, amount),
      width: cardWidth,
      x: lerp(start.x, end.x, amount) + exitVector.x * exitArc * width,
      y: lerp(start.y, end.y, amount) + exitVector.y * exitArc * height,
    };
  });
}

function getStackTargets(width: number, height: number, slotCount: number, settings: StackFlowRigSettings): StackTarget[] {
  const axis = getStackVector(settings.stackAxis);
  const offsetX = width * settings.stackOffset * axis.x;
  const offsetY = height * settings.stackOffset * axis.y;
  const rotationStep = settings.rotationStep * Math.PI / 180;
  const centerX = width * (settings.frameRatio === "16:9" ? 0.48 : 0.5);
  const centerY = height * (settings.frameRatio === "9:16" ? 0.46 : 0.5);
  return Array.from({ length: slotCount }, (_, index) => {
    const amount = index / Math.max(1, slotCount - 1);
    return {
      alpha: lerp(1, settings.backOpacity, amount),
      depth: 1 - amount,
      rotation: rotationStep * index * (settings.stackAxis === "vertical" ? 0.45 : 1),
      scale: lerp(1, settings.backScale, amount * settings.stackDepth),
      x: centerX + offsetX * index * settings.stackDepth,
      y: centerY + offsetY * index * settings.stackDepth,
    };
  });
}

function getStackVector(axis: StackFlowRigSettings["stackAxis"]) {
  if (axis === "horizontal") return { x: 1, y: 0.12 };
  if (axis === "vertical") return { x: 0.08, y: 1 };
  return { x: 0.76, y: 0.62 };
}

function getExitVector(axis: StackFlowRigSettings["stackAxis"]) {
  if (axis === "horizontal") return { x: -1, y: -0.06 };
  if (axis === "vertical") return { x: 0.08, y: -1 };
  return { x: -0.78, y: -0.58 };
}
