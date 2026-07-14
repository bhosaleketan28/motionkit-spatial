import type { FrameSize, OrbitRigSettings, RigRenderInput } from "../rigs/types";
import { createMotionSpectrumGradient, drawCoverImage } from "./canvasCard";
import { getOrbitCardLayouts } from "./geometry";
import { createCardPath } from "./shapePaths";

const placeholderPalettes = [
  { fill: "#64d6b5", accent: "#dff8ef", deep: "#287861", text: "#111719" },
  { fill: "#ef8b72", accent: "#fbe4dc", deep: "#9c4d3d", text: "#111719" },
  { fill: "#8ca9f5", accent: "#e5ebff", deep: "#4f67a8", text: "#111719" },
  { fill: "#e5bd67", accent: "#f8edcf", deep: "#98702c", text: "#111719" },
];

export function renderOrbitCarousel({
  context,
  frame,
  progress,
  renderFrameGuide = false,
  selectedSlotIndex,
  settings,
  slotCount,
  slotImages = [],
}: RigRenderInput<OrbitRigSettings>) {
  const { width, height } = frame;

  context.clearRect(0, 0, width, height);
  drawBackground(context, width, height, settings.background);

  if (renderFrameGuide) {
    drawFrameGuide(context, frame);
  }

  const cards = getOrbitCardLayouts({
    frame,
    slotCount,
    progress,
    settings,
  });

  cards.forEach((card) => {
    const cardOptions = {
      alpha: card.alpha,
      rotation: card.rotation,
      radius: settings.cornerRadius * card.scale,
      depth: card.depth,
      shape: settings.cardShape,
      xScale: card.xScale,
    };
    const slotImage = slotImages[card.index];

    if (slotImage) {
      drawImageCard(context, slotImage, card.x, card.y, card.width, card.height, cardOptions);
    } else {
      drawPlaceholderCard(context, card.index, card.x, card.y, card.width, card.height, cardOptions);
    }

    if (card.index === selectedSlotIndex) {
      drawSelectedCardOutline(context, card.x, card.y, card.width, card.height, cardOptions);
    }
  });
}

function drawSelectedCardOutline(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  options: CardDrawOptions,
) {
  const inset = Math.max(5, width * 0.018);
  context.save();
  context.globalAlpha = Math.max(0.42, options.alpha);
  context.translate(centerX, centerY);
  context.rotate(options.rotation);
  context.scale(options.xScale, 1);
  context.strokeStyle = createMotionSpectrumGradient(context, -width / 2, -height / 2, width, height);
  context.lineWidth = Math.max(4, width * 0.012);
  createCardPath(
    context,
    options.shape,
    -width / 2 - inset,
    -height / 2 - inset,
    width + inset * 2,
    height + inset * 2,
    options.radius + inset,
  );
  context.stroke();
  context.restore();
}

export function drawBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: OrbitRigSettings["background"],
) {
  if (background.mode === "transparent") {
    return;
  }

  if (background.mode === "gradient") {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, background.gradientStart);
    gradient.addColorStop(1, background.gradientEnd);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    return;
  }

  context.fillStyle = background.solidColor;
  context.fillRect(0, 0, width, height);
}

export function drawFrameGuide(context: CanvasRenderingContext2D, frame: FrameSize) {
  context.save();
  context.strokeStyle = "rgba(30, 34, 38, 0.13)";
  context.lineWidth = 3;
  context.strokeRect(24, 24, frame.width - 48, frame.height - 48);
  context.restore();
}

function drawPlaceholderCard(
  context: CanvasRenderingContext2D,
  index: number,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  options: CardDrawOptions,
) {
  const palette = placeholderPalettes[index % placeholderPalettes.length];
  const left = -width / 2;
  const top = -height / 2;

  context.save();
  context.globalAlpha = options.alpha;
  context.translate(centerX, centerY);
  context.rotate(options.rotation);
  context.scale(options.xScale, 1);
  context.shadowColor = `rgba(22, 28, 35, ${0.08 + options.depth * 0.24})`;
  context.shadowBlur = 14 + options.depth * 42;
  context.shadowOffsetY = 8 + options.depth * 28;

  createCardPath(context, options.shape, left, top, width, height, options.radius);
  context.fillStyle = "#fffdf8";
  context.fill();

  context.shadowColor = "transparent";
  context.clip();

  context.fillStyle = "#fffdf8";
  context.fillRect(left, top, width, height);

  drawCardHeader(context, left, top, width, height, palette);
  drawCardHero(context, left, top, width, height, palette, index);
  drawCardBody(context, left, top, width, height, palette, index);

  const wash = 1 - options.depth;
  if (wash > 0.08) {
    context.fillStyle = `rgba(246, 241, 232, ${wash * 0.28})`;
    context.fillRect(left, top, width, height);
  }

  createCardPath(context, options.shape, left + 1, top + 1, width - 2, height - 2, options.radius);
  context.strokeStyle = "rgba(31, 37, 41, 0.12)";
  context.lineWidth = Math.max(1.5, width * 0.006);
  context.lineJoin = "round";
  context.stroke();

  context.restore();
}

function drawImageCard(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  options: CardDrawOptions,
) {
  const left = -width / 2;
  const top = -height / 2;

  context.save();
  context.globalAlpha = options.alpha;
  context.translate(centerX, centerY);
  context.rotate(options.rotation);
  context.scale(options.xScale, 1);
  context.shadowColor = `rgba(22, 28, 35, ${0.08 + options.depth * 0.24})`;
  context.shadowBlur = 14 + options.depth * 42;
  context.shadowOffsetY = 8 + options.depth * 28;

  createCardPath(context, options.shape, left, top, width, height, options.radius);
  context.fillStyle = "#fffdf8";
  context.fill();

  context.shadowColor = "transparent";
  context.clip();
  drawImageCover(context, image, left, top, width, height);

  const topShade = context.createLinearGradient(left, top, left, top + height * 0.28);
  topShade.addColorStop(0, "rgba(0, 0, 0, 0.16)");
  topShade.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = topShade;
  context.fillRect(left, top, width, height * 0.28);

  const wash = 1 - options.depth;
  if (wash > 0.08) {
    context.fillStyle = `rgba(246, 241, 232, ${wash * 0.24})`;
    context.fillRect(left, top, width, height);
  }

  createCardPath(context, options.shape, left + 1, top + 1, width - 2, height - 2, options.radius);
  context.strokeStyle = "rgba(255, 255, 255, 0.42)";
  context.lineWidth = Math.max(1.5, width * 0.006);
  context.lineJoin = "round";
  context.stroke();

  context.restore();
}

interface CardDrawOptions {
  alpha: number;
  depth: number;
  radius: number;
  rotation: number;
  shape: OrbitRigSettings["cardShape"];
  xScale: number;
}

export function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  drawCoverImage(context, image, x, y, width, height);
}

function drawCardHeader(
  context: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  palette: (typeof placeholderPalettes)[number],
) {
  const pad = width * 0.08;
  const dotSize = width * 0.028;

  context.fillStyle = "#f4f1ea";
  context.fillRect(left, top, width, height * 0.13);

  for (let i = 0; i < 3; i += 1) {
    context.beginPath();
    context.fillStyle = i === 0 ? palette.fill : "rgba(31, 37, 41, 0.16)";
    context.arc(left + pad + i * dotSize * 2.1, top + height * 0.065, dotSize, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = "rgba(31, 37, 41, 0.16)";
  roundedRect(context, left + width * 0.68, top + height * 0.047, width * 0.2, height * 0.035, height * 0.018);
  context.fill();
}

function drawCardHero(
  context: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  palette: (typeof placeholderPalettes)[number],
  index: number,
) {
  const heroX = left + width * 0.08;
  const heroY = top + height * 0.18;
  const heroW = width * 0.84;
  const heroH = height * 0.34;
  const gradient = context.createLinearGradient(heroX, heroY, heroX + heroW, heroY + heroH);

  gradient.addColorStop(0, palette.accent);
  gradient.addColorStop(0.65, palette.fill);
  gradient.addColorStop(1, palette.deep);

  roundedRect(context, heroX, heroY, heroW, heroH, width * 0.04);
  context.fillStyle = gradient;
  context.fill();

  context.fillStyle = "rgba(255, 255, 255, 0.26)";
  context.beginPath();
  context.arc(heroX + heroW * 0.78, heroY + heroH * 0.42, heroW * 0.23, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(255, 255, 255, 0.68)";
  roundedRect(context, heroX + heroW * 0.09, heroY + heroH * 0.14, heroW * 0.38, heroH * 0.08, heroH * 0.04);
  context.fill();

  context.fillStyle = "rgba(255, 255, 255, 0.42)";
  roundedRect(context, heroX + heroW * 0.09, heroY + heroH * 0.31, heroW * (0.48 + index * 0.04), heroH * 0.06, heroH * 0.03);
  context.fill();
}

function drawCardBody(
  context: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  palette: (typeof placeholderPalettes)[number],
  index: number,
) {
  const pad = width * 0.08;
  const bodyTop = top + height * 0.58;
  const lineH = height * 0.025;
  const rowGap = height * 0.06;

  context.fillStyle = palette.text;
  context.globalAlpha *= 0.86;
  context.font = `${Math.max(18, width * 0.066)}px Inter, system-ui, sans-serif`;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(
    ["Overview", "Asset library", "Campaign pulse", "Launch plan"][index % 4],
    left + pad,
    bodyTop,
  );
  context.globalAlpha /= 0.86;

  context.fillStyle = "rgba(31, 37, 41, 0.16)";
  roundedRect(context, left + pad, bodyTop + rowGap, width * 0.58, lineH, lineH / 2);
  context.fill();
  roundedRect(context, left + pad, bodyTop + rowGap * 1.55, width * 0.42, lineH, lineH / 2);
  context.fill();

  context.fillStyle = "rgba(31, 37, 41, 0.08)";
  roundedRect(context, left + pad, top + height * 0.78, width * 0.84, height * 0.12, width * 0.035);
  context.fill();

  context.fillStyle = palette.fill;
  roundedRect(context, left + pad * 1.45, top + height * 0.815, width * 0.18, height * 0.045, height * 0.022);
  context.fill();

  context.fillStyle = "rgba(31, 37, 41, 0.2)";
  roundedRect(context, left + width * 0.38, top + height * 0.83, width * 0.36, height * 0.018, height * 0.009);
  context.fill();

  context.fillStyle = palette.text;
  context.globalAlpha *= 0.58;
  context.font = `${Math.max(12, width * 0.04)}px Inter, system-ui, sans-serif`;
  context.fillText("Luma Field", left + width * 0.66, top + height * 0.905);
  context.globalAlpha /= 0.58;
}

export function roundedRect(
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
