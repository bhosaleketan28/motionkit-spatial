import type { GridWallRigSettings, RigRenderInput } from "../rigs/types";
import { drawSpatialMediaCard } from "./canvasCard";
import { drawBackground, drawFrameGuide } from "./canvasRenderer";
import { positiveModulo } from "./motionGeometry";

interface GridTileLayout {
  alpha: number;
  focus: number;
  height: number;
  index: number;
  rotation: number;
  scale: number;
  width: number;
  x: number;
  y: number;
}

export function renderGridWall({
  context,
  frame,
  progress,
  renderFrameGuide = false,
  selectedSlotIndex,
  settings,
  slotCount,
  slotImages = [],
}: RigRenderInput<GridWallRigSettings>) {
  context.clearRect(0, 0, frame.width, frame.height);
  drawBackground(context, frame.width, frame.height, settings.background);
  if (renderFrameGuide) drawFrameGuide(context, frame);

  getGridLayouts(frame.width, frame.height, slotCount, progress, settings)
    .sort((left, right) => left.focus - right.focus || left.index - right.index)
    .forEach((tile) => {
      drawSpatialMediaCard(
        context,
        tile,
        slotImages[tile.index] ?? null,
        settings.cornerRadius,
        tile.index === selectedSlotIndex,
      );
    });
}

function getGridLayouts(
  width: number,
  height: number,
  slotCount: number,
  progress: number,
  settings: GridWallRigSettings,
): GridTileLayout[] {
  const portrait = settings.frameRatio === "9:16";
  const square = settings.frameRatio === "1:1";
  const columns = portrait ? 2 : square ? 2 : 3;
  const rows = Math.ceil(slotCount / columns);
  const tileWidth = width * settings.tileWidth * (portrait ? 1.45 : square ? 1.18 : 1);
  const tileHeight = height * settings.tileHeight * (portrait ? 0.76 : square ? 0.78 : 1);
  const gapX = width * settings.horizontalGap;
  const gapY = height * settings.verticalGap;
  const gridWidth = columns * tileWidth + (columns - 1) * gapX;
  const gridHeight = rows * tileHeight + (rows - 1) * gapY;
  const direction = settings.direction === "forward" ? 1 : -1;
  const phase = positiveModulo(progress * slotCount * direction, slotCount);
  const loopAngle = progress * Math.PI * 2 * direction;
  const driftX = Math.sin(loopAngle) * width * settings.driftAmount * (portrait ? 0.24 : 0.42);
  const driftY = Math.cos(loopAngle) * height * settings.driftAmount * (portrait ? 0.42 : 0.18);

  return Array.from({ length: slotCount }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const directDistance = Math.abs(index - phase);
    const cyclicDistance = Math.min(directDistance, slotCount - directDistance);
    const focus = Math.exp(-cyclicDistance * cyclicDistance * 2.4);
    const scale = settings.gridScale * (1 + focus * settings.focusScale);
    const centerPull = focus * settings.focusDepth;
    const baseX = width / 2 - gridWidth / 2 + tileWidth / 2 + column * (tileWidth + gapX);
    const baseY = height / 2 - gridHeight / 2 + tileHeight / 2 + row * (tileHeight + gapY);
    return {
      alpha: settings.edgeOpacity + (1 - settings.edgeOpacity) * (0.42 + focus * 0.58),
      focus,
      height: tileHeight,
      index,
      rotation: (column - (columns - 1) / 2) * settings.focusDepth * 0.018,
      scale,
      width: tileWidth,
      x: baseX + driftX * (0.62 + row * 0.1) + (width / 2 - baseX) * centerPull * 0.08,
      y: baseY + driftY * (0.62 + column * 0.08) + (height / 2 - baseY) * centerPull * 0.08 - focus * height * settings.focusDepth * 0.025,
    };
  });
}
