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
