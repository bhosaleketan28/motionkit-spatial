import type { FilmStripRigSettings, RigRenderInput } from "../rigs/types";
import { createMotionSpectrumGradient } from "./canvasCard";
import { drawBackground, drawFrameGuide, drawImageCover, roundedRect } from "./canvasRenderer";
import { positiveModulo } from "./motionGeometry";

interface FilmCardLayout {
  alpha: number;
  height: number;
  index: number;
  rotation: number;
  scale: number;
  width: number;
  x: number;
  y: number;
}

const placeholderColors = ["#d9d4ca", "#8da99d", "#b98565", "#8692a8", "#c4aa71", "#6d7975"];

export function renderFilmStrip({
  context,
  frame,
  progress,
  renderFrameGuide = false,
  selectedSlotIndex,
  settings,
  slotCount,
  slotImages = [],
}: RigRenderInput<FilmStripRigSettings>) {
  context.clearRect(0, 0, frame.width, frame.height);
  drawBackground(context, frame.width, frame.height, settings.background);

  if (renderFrameGuide) {
    drawFrameGuide(context, frame);
  }

  getFilmCardLayouts(frame.width, frame.height, slotCount, progress, settings)
    .sort((left, right) => left.scale - right.scale)
    .forEach((card) => {
      drawFilmCard(context, card, settings, slotImages[card.index] ?? null);
      if (card.index === selectedSlotIndex) {
        drawFilmSelection(context, card, settings.cornerRadius);
      }
    });
}

function getFilmCardLayouts(
  width: number,
  height: number,
  slotCount: number,
  progress: number,
  settings: FilmStripRigSettings,
): FilmCardLayout[] {
  const portrait = settings.frameRatio === "9:16";
  const square = settings.frameRatio === "1:1";
  const cardWidth = width * settings.cardWidth * (portrait ? 1.55 : square ? 1.15 : 1);
  const cardHeight = height * settings.cardHeight * (portrait ? 0.72 : square ? 0.9 : 1);
  const gap = width * settings.gap * (portrait ? 1.25 : 1);
  const step = cardWidth + gap;
  const trackLength = step * slotCount;
  const direction = settings.direction === "left" ? -1 : 1;
  const offset = progress * trackLength * direction;
  const centerX = width / 2;
  const centerY = height / 2;
  const tiltRadians = (settings.tilt * Math.PI) / 180;

  return Array.from({ length: slotCount }, (_, index) => {
    const base = (index - (slotCount - 1) / 2) * step + offset;
    const wrapped = positiveModulo(base + trackLength / 2, trackLength) - trackLength / 2;
    const centerProximity = 1 - Math.min(1, Math.abs(wrapped) / (width * (portrait ? 0.72 : 0.62)));
    const scale = 1 + centerProximity * settings.centerScale + centerProximity * settings.perspective * 0.08;
    const alpha = settings.edgeOpacity + (1 - settings.edgeOpacity) * Math.pow(centerProximity, 0.72);
    const yFromTilt = Math.tan(tiltRadians) * wrapped * 0.34;
    const yFromPerspective = -Math.pow(centerProximity, 2) * height * settings.perspective * 0.025;

    return {
      alpha,
      height: cardHeight,
      index,
      rotation: tiltRadians * 0.12,
      scale,
      width: cardWidth,
      x: centerX + wrapped,
      y: centerY + yFromTilt + yFromPerspective,
    };
  });
}

function drawFilmCard(
  context: CanvasRenderingContext2D,
  card: FilmCardLayout,
  settings: FilmStripRigSettings,
  image: HTMLImageElement | null,
) {
  const width = card.width * card.scale;
  const height = card.height * card.scale;
  const left = -width / 2;
  const top = -height / 2;
  const radius = Math.min(settings.cornerRadius * card.scale, width / 2, height / 2);

  context.save();
  context.globalAlpha = card.alpha;
  context.translate(card.x, card.y);
  context.rotate(card.rotation);
  context.shadowColor = "rgba(0, 0, 0, 0.34)";
  context.shadowBlur = 18 + card.scale * 16;
  context.shadowOffsetY = 10 + card.scale * 8;
  roundedRect(context, left, top, width, height, radius);
  context.fillStyle = "#111417";
  context.fill();
  context.shadowColor = "transparent";
  context.clip();

  if (image) {
    drawImageCover(context, image, left, top, width, height);
  } else {
    drawFilmPlaceholder(context, card.index, left, top, width, height);
  }

  const edgeShade = context.createLinearGradient(left, top, left + width, top + height);
  edgeShade.addColorStop(0, "rgba(255,255,255,0.10)");
  edgeShade.addColorStop(0.45, "rgba(255,255,255,0)");
  edgeShade.addColorStop(1, "rgba(0,0,0,0.18)");
  context.fillStyle = edgeShade;
  context.fillRect(left, top, width, height);

  roundedRect(context, left + 1, top + 1, width - 2, height - 2, Math.max(0, radius - 1));
  context.strokeStyle = "rgba(255,255,255,0.28)";
  context.lineWidth = Math.max(1.5, width * 0.004);
  context.stroke();
  context.restore();
}

function drawFilmPlaceholder(
  context: CanvasRenderingContext2D,
  index: number,
  left: number,
  top: number,
  width: number,
  height: number,
) {
  const accent = placeholderColors[index % placeholderColors.length];
  context.fillStyle = "#e7e3da";
  context.fillRect(left, top, width, height);
  context.fillStyle = accent;
  context.fillRect(left, top, width, height * 0.56);
  context.fillStyle = "rgba(255,255,255,0.22)";
  context.beginPath();
  context.arc(left + width * 0.7, top + height * 0.28, Math.min(width, height) * 0.19, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#161a1c";
  context.font = `700 ${Math.max(18, width * 0.055)}px Inter, system-ui, sans-serif`;
  context.textBaseline = "top";
  context.fillText(`FRAME ${String(index + 1).padStart(2, "0")}`, left + width * 0.08, top + height * 0.66);
  context.fillStyle = "rgba(22,26,28,0.34)";
  roundedRect(context, left + width * 0.08, top + height * 0.79, width * 0.58, height * 0.025, height * 0.012);
  context.fill();
  roundedRect(context, left + width * 0.08, top + height * 0.85, width * 0.38, height * 0.02, height * 0.01);
  context.fill();
}

function drawFilmSelection(
  context: CanvasRenderingContext2D,
  card: FilmCardLayout,
  cornerRadius: number,
) {
  const width = card.width * card.scale;
  const height = card.height * card.scale;
  const inset = Math.max(5, width * 0.012);
  context.save();
  context.globalAlpha = Math.max(0.56, card.alpha);
  context.translate(card.x, card.y);
  context.rotate(card.rotation);
  context.strokeStyle = createMotionSpectrumGradient(context, -width / 2, -height / 2, width, height);
  context.lineWidth = Math.max(4, width * 0.009);
  roundedRect(
    context,
    -width / 2 - inset,
    -height / 2 - inset,
    width + inset * 2,
    height + inset * 2,
    cornerRadius * card.scale + inset,
  );
  context.stroke();
  context.restore();
}
