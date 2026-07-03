import type { CardShape } from "../rigs/types";

export function createCardPath(
  context: CanvasRenderingContext2D,
  shape: CardShape,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  if (shape === "circle") {
    createCirclePath(context, x, y, width, height);
    return;
  }

  if (shape === "star") {
    createStarPath(context, x, y, width, height);
    return;
  }

  createRoundedRectPath(context, x, y, width, height, radius);
}

export function createRoundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

export function createCirclePath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const radius = Math.min(width, height) / 2;

  context.beginPath();
  context.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2);
  context.closePath();
}

export function createStarPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius * 0.58;

  context.beginPath();

  for (let point = 0; point < 10; point += 1) {
    const radius = point % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const pointX = centerX + Math.cos(angle) * radius;
    const pointY = centerY + Math.sin(angle) * radius;

    if (point === 0) {
      context.moveTo(pointX, pointY);
    } else {
      context.lineTo(pointX, pointY);
    }
  }

  context.closePath();
}
