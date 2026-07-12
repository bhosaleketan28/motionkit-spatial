export interface Point2D {
  x: number;
  y: number;
}

export interface PositionedItem extends Point2D {
  index: number;
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export function wrapProgress(progress: number) {
  return positiveModulo(progress, 1);
}

export function normalizedLoopOffset(progress: number, direction = 1) {
  return wrapProgress(progress) * (direction < 0 ? -1 : 1);
}

export function directionMultiplier(direction: string) {
  return direction === "right" || direction === "clockwise" || direction === "forward" ? 1 : -1;
}

export function easeInOutCubic(progress: number) {
  const value = clamp(progress);
  return value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
}

export function easeOutCubic(progress: number) {
  return 1 - (1 - clamp(progress)) ** 3;
}

export function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

export function inverseLerp(start: number, end: number, value: number) {
  return start === end ? 0 : (value - start) / (end - start);
}

export function mapRange(value: number, inStart: number, inEnd: number, outStart: number, outEnd: number) {
  return lerp(outStart, outEnd, inverseLerp(inStart, inEnd, value));
}

export function smoothstep(edgeStart: number, edgeEnd: number, value: number) {
  const amount = clamp(inverseLerp(edgeStart, edgeEnd, value));
  return amount * amount * (3 - 2 * amount);
}

export function interpolateScale(minScale: number, maxScale: number, amount: number) {
  return lerp(minScale, maxScale, clamp(amount));
}

export function interpolateOpacity(minOpacity: number, maxOpacity: number, amount: number) {
  return clamp(lerp(minOpacity, maxOpacity, clamp(amount)));
}

export function interpolateAngle(start: number, end: number, amount: number) {
  const turn = Math.PI * 2;
  const delta = positiveModulo(end - start + Math.PI, turn) - Math.PI;
  return start + delta * amount;
}

export function repeatingHorizontalPositions(count: number, step: number, offset: number, centerX = 0) {
  return repeatingPositions(count, step, offset).map(({ index, position }) => ({ index, x: centerX + position, y: 0 }));
}

export function repeatingVerticalPositions(count: number, step: number, offset: number, centerY = 0) {
  return repeatingPositions(count, step, offset).map(({ index, position }) => ({ index, x: 0, y: centerY + position }));
}

function repeatingPositions(count: number, step: number, offset: number) {
  const length = Math.max(step, step * count);
  return Array.from({ length: count }, (_, index) => {
    const base = (index - (count - 1) / 2) * step + offset;
    return { index, position: positiveModulo(base + length / 2, length) - length / 2 };
  });
}

export function wrappedItemOrdering(items: PositionedItem[]) {
  return [...items].sort((left, right) => left.x - right.x || left.y - right.y || left.index - right.index);
}

export function filterVisibleRange(items: PositionedItem[], bounds: { bottom: number; left: number; right: number; top: number }, margin = 0) {
  return items.filter((item) =>
    item.x >= bounds.left - margin &&
    item.x <= bounds.right + margin &&
    item.y >= bounds.top - margin &&
    item.y <= bounds.bottom + margin,
  );
}

export function normalizedCenterDistance(value: number, center: number, range: number) {
  return clamp(Math.abs(value - center) / Math.max(0.0001, range));
}

export function scaleFromCenterDistance(distance: number, centerScale: number, edgeScale: number) {
  return lerp(centerScale, edgeScale, smoothstep(0, 1, clamp(distance)));
}

export function opacityFromCenterDistance(distance: number, centerOpacity: number, edgeOpacity: number) {
  return clamp(lerp(centerOpacity, edgeOpacity, smoothstep(0, 1, clamp(distance))));
}

export function sortByDepth<T>(items: T[], getDepth: (item: T) => number) {
  return [...items].sort((left, right) => getDepth(left) - getDepth(right));
}

export function perspectiveCompression(depth: number, strength: number) {
  return 1 / (1 + Math.max(0, depth) * Math.max(0, strength));
}

export function gridCellLayout(count: number, columns: number, cellWidth: number, cellHeight: number, gapX = 0, gapY = gapX) {
  const safeColumns = Math.max(1, Math.floor(columns));
  return Array.from({ length: count }, (_, index) => ({
    index,
    x: (index % safeColumns) * (cellWidth + gapX),
    y: Math.floor(index / safeColumns) * (cellHeight + gapY),
  }));
}

export function stackDepthLayout(count: number, offsetX: number, offsetY: number, scaleStep: number) {
  return Array.from({ length: count }, (_, index) => ({
    depth: index,
    index,
    scale: Math.max(0, 1 - index * scaleStep),
    x: index * offsetX,
    y: index * offsetY,
  }));
}

export function radialPlacement(count: number, radiusX: number, radiusY = radiusX, phase = 0) {
  return Array.from({ length: count }, (_, index) => {
    const angle = phase + (index / Math.max(1, count)) * Math.PI * 2;
    return { angle, index, x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY };
  });
}

export function fanPlacement(count: number, radius: number, startAngle: number, endAngle: number) {
  return Array.from({ length: count }, (_, index) => {
    const amount = count <= 1 ? 0.5 : index / (count - 1);
    const angle = lerp(startAngle, endAngle, amount);
    return { angle, index, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
}

export function sampleCurvedPath(start: Point2D, control: Point2D, end: Point2D, progress: number) {
  const amount = clamp(progress);
  const inverse = 1 - amount;
  const x = inverse * inverse * start.x + 2 * inverse * amount * control.x + amount * amount * end.x;
  const y = inverse * inverse * start.y + 2 * inverse * amount * control.y + amount * amount * end.y;
  const tangentX = 2 * inverse * (control.x - start.x) + 2 * amount * (end.x - control.x);
  const tangentY = 2 * inverse * (control.y - start.y) + 2 * amount * (end.y - control.y);
  return { angle: Math.atan2(tangentY, tangentX), x, y };
}

export function sampleWavePath(progress: number, width: number, amplitude: number, cycles = 1, phase = 0) {
  const amount = wrapProgress(progress);
  const angle = amount * Math.PI * 2 * cycles + phase;
  return {
    angle: Math.atan2(amplitude * Math.cos(angle) * Math.PI * 2 * cycles, width),
    x: amount * width,
    y: Math.sin(angle) * amplitude,
  };
}
