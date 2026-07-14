import type { RigDemoMedia } from "./types";

const DEMO_LABELS = [
  "Luma campaign hero",
  "Luma material story",
  "Luma campaign proof",
  "Luma release sequence",
];

export function generateOrbitCarouselDemoMedia(): RigDemoMedia[] {
  return DEMO_LABELS.map((label, index) => ({
    label,
    src: createDemoImageDataUrl(index),
  }));
}

function createDemoImageDataUrl(index: number) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const accent = ["#64d6b5", "#ef8b72", "#8ca9f5", "#e5bd67"][index % 4];
  const pale = ["#dff8ef", "#fbe4dc", "#e5ebff", "#f8edcf"][index % 4];
  const ink = "#111719";
  const muted = "#6f7775";

  canvas.width = 900;
  canvas.height = 1160;

  if (!context) {
    return "";
  }

  context.fillStyle = "#f1f0ea";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = ink;
  roundRect(context, 54, 48, 792, 92, 28);
  context.fill();
  context.fillStyle = accent;
  context.beginPath();
  context.arc(100, 94, 18, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#f9faf7";
  context.font = "700 28px Inter, system-ui, sans-serif";
  context.fillText("LUMA FIELD", 134, 104);
  context.fillStyle = "#9ca4a1";
  context.font = "600 20px Inter, system-ui, sans-serif";
  context.fillText("CAMPAIGN STUDY", 610, 104);

  context.fillStyle = "#fffefa";
  roundRect(context, 54, 164, 792, 938, 34);
  context.fill();

  drawDemoScreen(context, index % 4, { accent, ink, muted, pale });

  return canvas.toDataURL("image/png");
}

function drawDemoScreen(
  context: CanvasRenderingContext2D,
  index: number,
  colors: { accent: string; ink: string; muted: string; pale: string },
) {
  const { accent, ink, muted, pale } = colors;
  const title = ["Light, held in form", "Material in colour", "+38% attention", "Four moments, one story"][index];
  const kicker = ["CAMPAIGN HERO", "MATERIAL STORY", "CAMPAIGN PROOF", "RELEASE SEQUENCE"][index];

  context.fillStyle = muted;
  context.font = "700 20px Inter, system-ui, sans-serif";
  context.fillText(kicker, 96, 228);
  context.fillStyle = ink;
  context.font = "760 54px Inter, system-ui, sans-serif";
  context.fillText(title, 96, 292);
  context.fillStyle = muted;
  context.font = "500 23px Inter, system-ui, sans-serif";
  context.fillText("A luminous object study for a considered summer release.", 96, 336);

  if (index === 0) {
    const field = context.createLinearGradient(96, 390, 804, 996);
    field.addColorStop(0, accent);
    field.addColorStop(1, pale);
    context.fillStyle = field;
    roundRect(context, 96, 390, 708, 606, 28);
    context.fill();
    context.fillStyle = "rgba(255,255,255,0.32)";
    context.beginPath();
    context.ellipse(450, 675, 250, 190, -0.25, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = ink;
    roundRect(context, 346, 480, 208, 398, 96);
    context.fill();
    context.strokeStyle = "rgba(255,255,255,0.62)";
    context.lineWidth = 4;
    roundRect(context, 378, 530, 144, 286, 66);
    context.stroke();
    context.fillStyle = "rgba(17,23,25,0.62)";
    context.font = "700 19px Inter, system-ui, sans-serif";
    context.fillText("OBJECT 01 / LUMINOUS FIELD", 132, 950);
  } else if (index === 1) {
    const tiles = [
      [96, 390, 442, 332, accent, "COLOUR"],
      [558, 390, 246, 332, ink, "SHADOW"],
      [96, 742, 246, 254, "#8ca9f5", "LIGHT"],
      [362, 742, 442, 254, "#e5bd67", "FORM"],
    ] as const;
    tiles.forEach(([x, y, width, height, fill, label], tileIndex) => {
      context.fillStyle = fill;
      roundRect(context, x, y, width, height, 26);
      context.fill();
      context.fillStyle = tileIndex === 1 ? "#edf2ef" : "rgba(17, 23, 25, 0.78)";
      context.font = "760 23px Inter, system-ui, sans-serif";
      context.fillText(label, x + 28, y + height - 34);
      context.fillStyle = tileIndex === 1 ? accent : "rgba(255,255,255,0.58)";
      context.beginPath();
      context.arc(x + width * 0.62, y + height * 0.42, Math.min(width, height) * 0.22, 0, Math.PI * 2);
      context.fill();
    });
  } else if (index === 2) {
    context.fillStyle = ink;
    roundRect(context, 96, 390, 708, 606, 28);
    context.fill();
    context.strokeStyle = accent;
    context.lineWidth = 18;
    [120, 176, 232].forEach((radius) => {
      context.beginPath();
      context.arc(450, 695, radius, -Math.PI * 0.9, Math.PI * 0.62);
      context.stroke();
    });
    context.fillStyle = "#f7f7f1";
    context.font = "780 112px Inter, system-ui, sans-serif";
    context.fillText("+38%", 178, 728);
    context.fillStyle = "rgba(247,247,241,0.58)";
    context.font = "650 22px Inter, system-ui, sans-serif";
    context.fillText("VIEWER ATTENTION / MOTION STUDY", 188, 790);
  } else {
    const moments = [
      ["01", "Reveal", accent],
      ["02", "Detail", "#8ca9f5"],
      ["03", "Proof", "#ef8b72"],
      ["04", "Release", "#e5bd67"],
    ] as const;
    moments.forEach(([number, label, color], momentIndex) => {
      const y = 390 + momentIndex * 150;
      context.fillStyle = color;
      roundRect(context, 96, y, 708, 126, 24);
      context.fill();
      context.fillStyle = ink;
      context.font = "780 42px Inter, system-ui, sans-serif";
      context.fillText(number, 132, y + 78);
      context.font = "720 28px Inter, system-ui, sans-serif";
      context.fillText(label, 246, y + 75);
    });
  }
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}
