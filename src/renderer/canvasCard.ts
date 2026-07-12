import type { Point2D } from "./motionGeometry";

export interface CardTransform {
  alpha?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  x: number;
  y: number;
}

export function withCardTransform(
  context: CanvasRenderingContext2D,
  transform: CardTransform,
  draw: () => void,
) {
  context.save();
  context.globalAlpha *= transform.alpha ?? 1;
  context.translate(transform.x, transform.y);
  context.rotate(transform.rotation ?? 0);
  context.scale(transform.scaleX ?? 1, transform.scaleY ?? 1);
  draw();
  context.restore();
}

export function applyCardShadow(
  context: CanvasRenderingContext2D,
  options: { blur: number; color: string; offsetX?: number; offsetY?: number },
) {
  context.shadowBlur = options.blur;
  context.shadowColor = options.color;
  context.shadowOffsetX = options.offsetX ?? 0;
  context.shadowOffsetY = options.offsetY ?? 0;
}

export function clearCardShadow(context: CanvasRenderingContext2D) {
  context.shadowBlur = 0;
  context.shadowColor = "transparent";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
}

export function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(Math.max(0, radius), width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

export function clipRoundedCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  roundedRectPath(context, x, y, width, height, radius);
  context.clip();
}

export function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource & { height: number; naturalHeight?: number; naturalWidth?: number; width: number },
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const imageRatio = imageWidth / imageHeight;
  const targetRatio = width / height;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;
  if (imageRatio > targetRatio) {
    sourceWidth = imageHeight * targetRatio;
    sourceX = (imageWidth - sourceWidth) / 2;
  } else {
    sourceHeight = imageWidth / targetRatio;
    sourceY = (imageHeight - sourceHeight) / 2;
  }
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

export function drawRoundedSelectionOutline(
  context: CanvasRenderingContext2D,
  center: Point2D,
  width: number,
  height: number,
  radius: number,
  color = "#8ff5cf",
) {
  const inset = Math.max(4, width * 0.012);
  context.save();
  context.translate(center.x, center.y);
  context.strokeStyle = color;
  context.shadowColor = color;
  context.shadowBlur = Math.max(10, width * 0.03);
  context.lineWidth = Math.max(3, width * 0.008);
  roundedRectPath(context, -width / 2 - inset, -height / 2 - inset, width + inset * 2, height + inset * 2, radius + inset);
  context.stroke();
  context.restore();
}

export interface SpatialMediaCardLayout {
  alpha: number;
  height: number;
  index: number;
  rotation: number;
  scale: number;
  width: number;
  x: number;
  y: number;
}

const spatialPlaceholderColors = ["#789e92", "#cc8f70", "#8498b7", "#c6aa6e", "#967eaa", "#72979c"];

export function drawSpatialMediaCard(
  context: CanvasRenderingContext2D,
  card: SpatialMediaCardLayout,
  image: HTMLImageElement | null,
  cornerRadius: number,
  selected = false,
) {
  const width = card.width * card.scale;
  const height = card.height * card.scale;
  const left = -width / 2;
  const top = -height / 2;
  const radius = Math.min(cornerRadius * card.scale, width / 2, height / 2);

  context.save();
  context.globalAlpha = clampAlpha(card.alpha);
  context.translate(card.x, card.y);
  context.rotate(card.rotation);
  applyCardShadow(context, {
    blur: 14 + card.scale * 14,
    color: "rgba(0, 0, 0, 0.32)",
    offsetY: 7 + card.scale * 7,
  });
  roundedRectPath(context, left, top, width, height, radius);
  context.fillStyle = "#111517";
  context.fill();
  clearCardShadow(context);
  context.clip();

  if (image) drawCoverImage(context, image, left, top, width, height);
  else drawSpatialPlaceholder(context, card.index, left, top, width, height);

  const finish = context.createLinearGradient(left, top, left + width, top + height);
  finish.addColorStop(0, "rgba(255,255,255,0.10)");
  finish.addColorStop(0.48, "rgba(255,255,255,0)");
  finish.addColorStop(1, "rgba(0,0,0,0.16)");
  context.fillStyle = finish;
  context.fillRect(left, top, width, height);
  roundedRectPath(context, left + 1, top + 1, width - 2, height - 2, Math.max(0, radius - 1));
  context.strokeStyle = "rgba(255,255,255,0.24)";
  context.lineWidth = Math.max(1.2, width * 0.004);
  context.stroke();
  context.restore();

  if (selected) drawSpatialSelection(context, card, cornerRadius);
}

function drawSpatialPlaceholder(
  context: CanvasRenderingContext2D,
  index: number,
  left: number,
  top: number,
  width: number,
  height: number,
) {
  const accent = spatialPlaceholderColors[index % spatialPlaceholderColors.length];
  context.fillStyle = "#e7e4dc";
  context.fillRect(left, top, width, height);
  context.fillStyle = accent;
  context.fillRect(left, top, width, height * 0.58);
  context.fillStyle = "rgba(255,255,255,0.2)";
  context.beginPath();
  context.arc(left + width * 0.7, top + height * 0.26, Math.min(width, height) * 0.18, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#171b1c";
  context.font = `700 ${Math.max(12, width * 0.06)}px Inter, system-ui, sans-serif`;
  context.textBaseline = "top";
  context.fillText(String(index + 1).padStart(2, "0"), left + width * 0.08, top + height * 0.68);
  context.fillStyle = "rgba(23,27,28,0.28)";
  roundedRectPath(context, left + width * 0.08, top + height * 0.82, width * 0.56, Math.max(3, height * 0.025), height * 0.02);
  context.fill();
}

function drawSpatialSelection(
  context: CanvasRenderingContext2D,
  card: SpatialMediaCardLayout,
  cornerRadius: number,
) {
  const width = card.width * card.scale;
  const height = card.height * card.scale;
  const inset = Math.max(4, width * 0.012);
  context.save();
  context.globalAlpha = Math.max(0.55, clampAlpha(card.alpha));
  context.translate(card.x, card.y);
  context.rotate(card.rotation);
  context.shadowColor = "rgba(126, 240, 199, 0.82)";
  context.shadowBlur = Math.max(12, width * 0.03);
  context.strokeStyle = "#8ff5cf";
  context.lineWidth = Math.max(3, width * 0.009);
  roundedRectPath(context, -width / 2 - inset, -height / 2 - inset, width + inset * 2, height + inset * 2, cornerRadius * card.scale + inset);
  context.stroke();
  context.restore();
}

function clampAlpha(value: number) {
  return Math.min(1, Math.max(0, value));
}
