import type { RigDemoMedia } from "./types";

const FRAMES = [
  { kicker: "NORTHLINE / 01", title: "Form follows motion", accent: "#c8e7dc", dark: "#18201f" },
  { kicker: "MATERIAL STUDY", title: "Quiet utility", accent: "#d2a77f", dark: "#211b18" },
  { kicker: "FIELD NOTES", title: "Built for the interval", accent: "#a8b6ce", dark: "#171b22" },
  { kicker: "RELEASE SIGNAL", title: "+38% attention", accent: "#d8ca91", dark: "#211f17" },
  { kicker: "EDITORIAL / 05", title: "Less noise. More form.", accent: "#b8c7bd", dark: "#18201c" },
  { kicker: "NORTHLINE / END", title: "Move with intent", accent: "#70e0bf", dark: "#111816" },
] as const;

export function generateFilmStripDemoMedia(): RigDemoMedia[] {
  return FRAMES.map((frame, index) => ({
    label: ["Opening statement", "Product detail", "Editorial image", "Campaign metrics", "Brand quote", "Closing frame"][index],
    src: createNorthlineFrame(index, frame),
  }));
}

function createNorthlineFrame(index: number, frame: (typeof FRAMES)[number]) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 1200;
  canvas.height = 900;
  if (!context) return "";

  context.fillStyle = "#e9e6df";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = frame.dark;
  context.fillRect(34, 34, 1132, 832);

  context.fillStyle = frame.accent;
  context.font = "700 22px Inter, system-ui, sans-serif";
  context.letterSpacing = "2px";
  context.fillText(frame.kicker, 84, 98);
  context.letterSpacing = "0px";
  context.fillStyle = "rgba(244,245,240,0.5)";
  context.font = "600 18px Inter, system-ui, sans-serif";
  context.fillText(`NORTHLINE EDITORIAL  /  ${String(index + 1).padStart(2, "0")}`, 830, 98);

  drawFrameArtwork(context, index, frame.accent, frame.dark);

  context.fillStyle = "#f3f4ef";
  context.font = index === 3 ? "760 74px Inter, system-ui, sans-serif" : "740 60px Inter, system-ui, sans-serif";
  wrapText(context, frame.title, 84, 720, 720, 70);
  context.fillStyle = "rgba(244,245,240,0.52)";
  context.font = "520 20px Inter, system-ui, sans-serif";
  context.fillText("A study in movement, material, and modern product stories.", 88, 826);

  return canvas.toDataURL("image/png");
}

function drawFrameArtwork(
  context: CanvasRenderingContext2D,
  index: number,
  accent: string,
  dark: string,
) {
  const x = 84;
  const y = 144;
  const width = 1032;
  const height = 480;

  context.fillStyle = accent;
  roundRect(context, x, y, width, height, 14);
  context.fill();

  if (index === 0 || index === 5) {
    context.fillStyle = dark;
    context.beginPath();
    context.ellipse(x + width * 0.58, y + height * 0.52, width * 0.28, height * 0.3, -0.32, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(255,255,255,0.72)";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x + width * 0.58, y + height * 0.52, height * 0.22, 0, Math.PI * 2);
    context.stroke();
  } else if (index === 1) {
    context.fillStyle = "#f1eee6";
    roundRect(context, x + 80, y + 64, width * 0.42, height - 128, 22);
    context.fill();
    context.fillStyle = dark;
    roundRect(context, x + width * 0.57, y + 96, width * 0.28, height - 192, 100);
    context.fill();
    context.strokeStyle = "rgba(255,255,255,0.38)";
    context.lineWidth = 2;
    context.stroke();
  } else if (index === 2) {
    context.fillStyle = "rgba(18,22,27,0.9)";
    context.fillRect(x, y + height * 0.54, width, height * 0.46);
    for (let column = 0; column < 6; column += 1) {
      context.fillStyle = column % 2 === 0 ? "rgba(255,255,255,0.7)" : "rgba(18,22,27,0.42)";
      context.fillRect(x + 72 + column * 154, y + 70 + (column % 2) * 34, 92, 220);
    }
  } else if (index === 3) {
    const values = [0.42, 0.58, 0.51, 0.74, 0.68, 0.9];
    values.forEach((value, barIndex) => {
      const barHeight = height * 0.68 * value;
      context.fillStyle = barIndex === values.length - 1 ? dark : "rgba(24,25,20,0.34)";
      roundRect(context, x + 92 + barIndex * 150, y + height - 58 - barHeight, 82, barHeight, 41);
      context.fill();
    });
  } else {
    context.fillStyle = dark;
    context.font = "italic 660 58px Georgia, serif";
    wrapText(context, "“Clarity is a form of momentum.”", x + 92, y + 150, width - 184, 74);
    context.fillStyle = "rgba(24,32,28,0.55)";
    context.font = "700 19px Inter, system-ui, sans-serif";
    context.fillText("NORTHLINE DESIGN OFFICE", x + 98, y + height - 84);
  }
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) {
      context.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = test;
    }
  });
  context.fillText(line, x, lineY);
}

function roundRect(
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
