import type { RigDemoMedia } from "./types";

const DEMO_LABELS = [
  "Luma overview",
  "Luma library",
  "Luma insights",
  "Luma launch plan",
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
  const line = "#d8ddd8";

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
  context.fillText("CAMPAIGN OS", 660, 104);

  context.fillStyle = "#fffefa";
  roundRect(context, 54, 164, 792, 938, 34);
  context.fill();

  drawDemoScreen(context, index % 4, { accent, ink, line, muted, pale });

  return canvas.toDataURL("image/png");
}

function drawDemoScreen(
  context: CanvasRenderingContext2D,
  index: number,
  colors: { accent: string; ink: string; line: string; muted: string; pale: string },
) {
  const { accent, ink, line, muted, pale } = colors;
  const title = ["Summer release", "Asset library", "Campaign pulse", "Launch plan"][index];
  const kicker = ["OVERVIEW", "CONTENT", "INSIGHTS", "SCHEDULE"][index];

  context.fillStyle = muted;
  context.font = "700 20px Inter, system-ui, sans-serif";
  context.fillText(kicker, 96, 228);
  context.fillStyle = ink;
  context.font = "760 54px Inter, system-ui, sans-serif";
  context.fillText(title, 96, 292);
  context.fillStyle = muted;
  context.font = "500 23px Inter, system-ui, sans-serif";
  context.fillText("A focused workspace for the next product story.", 96, 336);

  if (index === 0) {
    drawMetricCard(context, 96, 390, 216, 166, "72%", "Ready", accent, pale, ink, muted);
    drawMetricCard(context, 332, 390, 216, 166, "18", "Assets", "#8ca9f5", "#e5ebff", ink, muted);
    drawMetricCard(context, 568, 390, 236, 166, "4", "Markets", "#ef8b72", "#fbe4dc", ink, muted);
    drawDemoPanel(context, 96, 594, 708, 402, line);
    drawPanelLabel(context, "Release readiness", "Updated just now", 132, 650, ink, muted);
    [0.82, 0.68, 0.54].forEach((value, row) => {
      const y = 724 + row * 82;
      context.fillStyle = [accent, "#8ca9f5", "#ef8b72"][row];
      roundRect(context, 132, y, 28, 28, 8);
      context.fill();
      context.fillStyle = ink;
      context.font = "650 22px Inter, system-ui, sans-serif";
      context.fillText(["Product story", "Launch assets", "Regional review"][row], 180, y + 23);
      context.fillStyle = "#e6e9e4";
      roundRect(context, 180, y + 40, 520, 12, 6);
      context.fill();
      context.fillStyle = [accent, "#8ca9f5", "#ef8b72"][row];
      roundRect(context, 180, y + 40, 520 * value, 12, 6);
      context.fill();
    });
  } else if (index === 1) {
    const tiles = [
      [96, 390, 442, 304, accent],
      [558, 390, 246, 304, "#151c20"],
      [96, 714, 246, 282, "#8ca9f5"],
      [362, 714, 442, 282, "#e5bd67"],
    ] as const;
    tiles.forEach(([x, y, width, height, fill], tileIndex) => {
      context.fillStyle = fill;
      roundRect(context, x, y, width, height, 26);
      context.fill();
      context.fillStyle = tileIndex === 1 ? "#edf2ef" : "rgba(17, 23, 25, 0.78)";
      context.font = "700 22px Inter, system-ui, sans-serif";
      context.fillText(["Hero system", "Motion study", "Social cut", "Retail story"][tileIndex], x + 28, y + height - 36);
      context.fillStyle = tileIndex === 1 ? accent : "rgba(255,255,255,0.58)";
      context.beginPath();
      context.arc(x + width * 0.66, y + height * 0.43, Math.min(width, height) * 0.18, 0, Math.PI * 2);
      context.fill();
    });
  } else if (index === 2) {
    drawMetricCard(context, 96, 390, 216, 166, "+24%", "Reach", accent, pale, ink, muted);
    drawMetricCard(context, 332, 390, 216, 166, "3.8×", "Return", "#8ca9f5", "#e5ebff", ink, muted);
    drawMetricCard(context, 568, 390, 236, 166, "91", "Quality", "#e5bd67", "#f8edcf", ink, muted);
    drawDemoPanel(context, 96, 594, 708, 402, line);
    drawPanelLabel(context, "Weekly momentum", "Last 8 weeks", 132, 650, ink, muted);
    const bars = [0.35, 0.48, 0.42, 0.62, 0.58, 0.74, 0.68, 0.9];
    bars.forEach((value, barIndex) => {
      const height = 230 * value;
      context.fillStyle = barIndex === bars.length - 1 ? accent : pale;
      roundRect(context, 140 + barIndex * 76, 930 - height, 42, height, 14);
      context.fill();
    });
  } else {
    drawDemoPanel(context, 96, 390, 708, 606, line);
    drawPanelLabel(context, "Release sequence", "June 17–28", 132, 450, ink, muted);
    const rows = [
      ["Narrative lock", "JUN 17", "Done", accent],
      ["Asset production", "JUN 20", "Active", "#8ca9f5"],
      ["Regional handoff", "JUN 24", "Review", "#e5bd67"],
      ["Public release", "JUN 28", "Next", "#ef8b72"],
    ] as const;
    rows.forEach(([label, date, status, color], rowIndex) => {
      const y = 520 + rowIndex * 108;
      context.fillStyle = color;
      context.beginPath();
      context.arc(146, y + 20, 13, 0, Math.PI * 2);
      context.fill();
      if (rowIndex < rows.length - 1) {
        context.fillStyle = line;
        context.fillRect(143, y + 38, 6, 72);
      }
      context.fillStyle = ink;
      context.font = "680 25px Inter, system-ui, sans-serif";
      context.fillText(label, 184, y + 29);
      context.fillStyle = muted;
      context.font = "600 18px Inter, system-ui, sans-serif";
      context.fillText(date, 184, y + 62);
      context.fillStyle = pale;
      roundRect(context, 638, y, 126, 42, 21);
      context.fill();
      context.fillStyle = ink;
      context.font = "700 18px Inter, system-ui, sans-serif";
      context.fillText(status, 668, y + 28);
    });
  }
}

function drawMetricCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  value: string,
  label: string,
  accent: string,
  pale: string,
  ink: string,
  muted: string,
) {
  context.fillStyle = pale;
  roundRect(context, x, y, width, height, 24);
  context.fill();
  context.fillStyle = accent;
  roundRect(context, x + 22, y + 22, 44, 9, 5);
  context.fill();
  context.fillStyle = ink;
  context.font = "760 42px Inter, system-ui, sans-serif";
  context.fillText(value, x + 22, y + 92);
  context.fillStyle = muted;
  context.font = "620 20px Inter, system-ui, sans-serif";
  context.fillText(label, x + 22, y + 130);
}

function drawDemoPanel(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  line: string,
) {
  context.fillStyle = "#f8f8f4";
  context.strokeStyle = line;
  context.lineWidth = 2;
  roundRect(context, x, y, width, height, 26);
  context.fill();
  context.stroke();
}

function drawPanelLabel(
  context: CanvasRenderingContext2D,
  title: string,
  detail: string,
  x: number,
  y: number,
  ink: string,
  muted: string,
) {
  context.fillStyle = ink;
  context.font = "700 27px Inter, system-ui, sans-serif";
  context.fillText(title, x, y);
  context.fillStyle = muted;
  context.font = "560 19px Inter, system-ui, sans-serif";
  context.fillText(detail, x + 460, y);
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
