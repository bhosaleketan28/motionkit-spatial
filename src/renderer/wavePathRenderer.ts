import type { RigRenderInput, WavePathRigSettings } from "../rigs/types";
import type { SpatialMediaCardLayout } from "./canvasCard";
import { drawSpatialMediaCard } from "./canvasCard";
import { drawBackground, drawFrameGuide } from "./canvasRenderer";
import { positiveModulo } from "./motionGeometry";

interface WaveCardLayout extends SpatialMediaCardLayout {
  depth: number;
}

export function renderWavePath({
  context,
  frame,
  progress,
  renderFrameGuide = false,
  selectedSlotIndex,
  settings,
  slotCount,
  slotImages = [],
}: RigRenderInput<WavePathRigSettings>) {
  context.clearRect(0, 0, frame.width, frame.height);
  drawBackground(context, frame.width, frame.height, settings.background);
  if (renderFrameGuide) drawFrameGuide(context, frame);

  getWaveLayouts(frame.width, frame.height, slotCount, progress, settings)
    .sort((left, right) => left.depth - right.depth || left.index - right.index)
    .forEach((card) => {
      drawSpatialMediaCard(context, card, slotImages[card.index] ?? null, settings.cornerRadius, card.index === selectedSlotIndex);
    });
}

function getWaveLayouts(
  width: number,
  height: number,
  slotCount: number,
  progress: number,
  settings: WavePathRigSettings,
): WaveCardLayout[] {
  const portrait = settings.frameRatio === "9:16";
  const square = settings.frameRatio === "1:1";
  const cardWidth = width * settings.cardWidth * (portrait ? 1.62 : square ? 1.2 : 1);
  const cardHeight = height * settings.cardHeight * (portrait ? 0.76 : square ? 0.9 : 1);
  const direction = settings.direction === "left" ? -1 : 1;
  const trackStart = -cardWidth * 1.2;
  const trackEnd = width + cardWidth * 1.2;
  const trackWidth = trackEnd - trackStart;
  const amplitude = height * settings.waveAmplitude * (portrait ? 1.2 : square ? 0.94 : 1);
  const tilt = Math.tan(settings.pathTilt * Math.PI / 180);

  return Array.from({ length: slotCount }, (_, index) => {
    const spacingOffset = index * settings.gap / Math.max(1, slotCount);
    const pathProgress = positiveModulo(index / slotCount + spacingOffset + progress * direction, 1);
    const x = trackStart + pathProgress * trackWidth;
    const waveAngle = pathProgress * Math.PI * 2 * settings.waveFrequency;
    const waveY = Math.sin(waveAngle) * amplitude;
    const tiltY = tilt * (x - width / 2) * 0.3;
    const tangentY = Math.cos(waveAngle) * amplitude * Math.PI * 2 * settings.waveFrequency + tilt * trackWidth * 0.3;
    const tangentAngle = Math.atan2(tangentY, trackWidth);
    const centerDistance = Math.min(1, Math.abs(x - width / 2) / (width * 0.64));
    const center = 1 - centerDistance;
    const depth = 0.3 + center * 0.7;
    return {
      alpha: settings.edgeOpacity + (1 - settings.edgeOpacity) * Math.pow(center, 0.68),
      depth,
      height: cardHeight,
      index,
      rotation: tangentAngle * settings.tangentRotation,
      scale: 1 + center * settings.centerScale + center * settings.perspective * 0.08,
      width: cardWidth,
      x,
      y: height / 2 + waveY + tiltY - center * settings.perspective * height * 0.018,
    };
  });
}
