import type { RigDemoMedia } from "./types";

interface DemoFrame {
  accent: string;
  kicker: string;
  label: string;
  title: string;
  variant: "cover" | "interface" | "product" | "metrics" | "quote" | "closing";
}

interface DemoTheme {
  background: string;
  foreground: string;
  frames: readonly DemoFrame[];
  name: string;
  paper: string;
}

const atlasSystem: DemoTheme = {
  background: "#17201e",
  foreground: "#f0f2eb",
  name: "ATLAS SYSTEM",
  paper: "#dfe2d8",
  frames: [
    { accent: "#75d8b8", kicker: "ATLAS / 01", label: "Campaign cover", title: "Systems in motion", variant: "cover" },
    { accent: "#d9aa76", kicker: "MODULE / 02", label: "Interface detail", title: "Built in layers", variant: "interface" },
    { accent: "#91a9cf", kicker: "OBJECT / 03", label: "Product image", title: "One clear object", variant: "product" },
    { accent: "#d2c06f", kicker: "SIGNAL / 04", label: "Metrics panel", title: "+42% recall", variant: "metrics" },
    { accent: "#bd9fca", kicker: "NOTE / 05", label: "Editorial quote", title: "Structure creates freedom.", variant: "quote" },
    { accent: "#72c7c4", kicker: "ATLAS / 06", label: "Closing identity", title: "Map the next move", variant: "closing" },
  ],
};

const formaOne: DemoTheme = {
  background: "#1b1b19",
  foreground: "#f5f1e8",
  name: "FORMA ONE",
  paper: "#e5ded1",
  frames: [
    { accent: "#e18e6d", kicker: "FORMA / HERO", label: "Hero product", title: "A quieter device", variant: "product" },
    { accent: "#79b89f", kicker: "FEATURE / 02", label: "Feature detail", title: "Precision, simplified", variant: "interface" },
    { accent: "#879dcc", kicker: "PROOF / 03", label: "Metrics", title: "18 hrs / charge", variant: "metrics" },
    { accent: "#d5b96f", kicker: "VOICE / 04", label: "Customer quote", title: "Useful from the first touch.", variant: "quote" },
    { accent: "#9f8db8", kicker: "FORMA / END", label: "Closing frame", title: "Designed to disappear", variant: "closing" },
  ],
};

const monoEditions: DemoTheme = {
  background: "#151718",
  foreground: "#f1f0e9",
  name: "MONO EDITIONS",
  paper: "#deddd5",
  frames: [
    { accent: "#aeb7ad", kicker: "EDITION / 01", label: "Edition cover", title: "Material notes", variant: "cover" },
    { accent: "#cf8f76", kicker: "IMAGE / 02", label: "Image-led frame", title: "Warm geometry", variant: "product" },
    { accent: "#8299ad", kicker: "FEATURE / 03", label: "Feature frame", title: "Bound by rhythm", variant: "interface" },
    { accent: "#c3ad75", kicker: "QUOTE / 04", label: "Editorial quote", title: "Objects carry memory.", variant: "quote" },
    { accent: "#89aa9b", kicker: "INDEX / 05", label: "Numerical highlight", title: "06 studies", variant: "metrics" },
    { accent: "#9b8aab", kicker: "EDITION / 06", label: "Closing frame", title: "Volume one, complete", variant: "closing" },
  ],
};

const currentStudio: DemoTheme = {
  background: "#10191a",
  foreground: "#eff3ed",
  name: "CURRENT STUDIO",
  paper: "#d9e0d9",
  frames: [
    { accent: "#68cfba", kicker: "CURRENT / 01", label: "Studio cover", title: "Follow the signal", variant: "cover" },
    { accent: "#de9675", kicker: "FIELD / 02", label: "Campaign image", title: "Colour in transit", variant: "product" },
    { accent: "#829fd0", kicker: "FLOW / 03", label: "Interface study", title: "A fluid system", variant: "interface" },
    { accent: "#d7c06f", kicker: "PULSE / 04", label: "Performance signal", title: "2.4× movement", variant: "metrics" },
    { accent: "#a891bb", kicker: "VOICE / 05", label: "Studio note", title: "Motion reveals structure.", variant: "quote" },
    { accent: "#75bfa2", kicker: "CURRENT / 06", label: "Closing identity", title: "Stay in motion", variant: "closing" },
  ],
};

export function generateGridWallDemoMedia() {
  return generateTheme(atlasSystem);
}

export function generateFocusDeckDemoMedia() {
  return generateTheme(formaOne);
}

export function generateStackFlowDemoMedia() {
  return generateTheme(monoEditions);
}

export function generateWavePathDemoMedia() {
  return generateTheme(currentStudio);
}

function generateTheme(theme: DemoTheme): RigDemoMedia[] {
  return theme.frames.map((frame, index) => ({
    label: frame.label,
    src: createFrame(theme, frame, index),
  }));
}

function createFrame(theme: DemoTheme, frame: DemoFrame, index: number) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 1200;
  canvas.height = 900;
  if (!context) return "";

  context.fillStyle = theme.paper;
  context.fillRect(0, 0, 1200, 900);
  context.fillStyle = theme.background;
  roundedRect(context, 34, 34, 1132, 832, 18);
  context.fill();

  context.fillStyle = frame.accent;
  context.font = "700 22px Inter, system-ui, sans-serif";
  context.fillText(frame.kicker, 78, 92);
  context.fillStyle = "rgba(240,243,237,0.48)";
  context.font = "600 18px Inter, system-ui, sans-serif";
  context.textAlign = "right";
  context.fillText(`${theme.name} / ${String(index + 1).padStart(2, "0")}`, 1118, 92);
  context.textAlign = "left";

  drawArtwork(context, frame.variant, frame.accent, theme.background);

  context.fillStyle = theme.foreground;
  context.font = frame.variant === "metrics" ? "760 72px Inter, system-ui, sans-serif" : "730 58px Inter, system-ui, sans-serif";
  wrapText(context, frame.title, 78, 728, 840, 66);
  context.fillStyle = "rgba(240,243,237,0.48)";
  context.font = "520 19px Inter, system-ui, sans-serif";
  context.fillText("An original MotionKit Spatial study in image, rhythm, and form.", 80, 826);
  return canvas.toDataURL("image/png");
}

function drawArtwork(
  context: CanvasRenderingContext2D,
  variant: DemoFrame["variant"],
  accent: string,
  dark: string,
) {
  const x = 78;
  const y = 132;
  const width = 1044;
  const height = 488;
  context.fillStyle = accent;
  roundedRect(context, x, y, width, height, 16);
  context.fill();

  if (variant === "cover" || variant === "closing") {
    context.strokeStyle = dark;
    context.lineWidth = 5;
    for (let ring = 0; ring < 4; ring += 1) {
      context.beginPath();
      context.ellipse(x + width * 0.58, y + height * 0.5, 110 + ring * 56, 62 + ring * 35, -0.22, 0, Math.PI * 2);
      context.stroke();
    }
    context.fillStyle = dark;
    context.beginPath();
    context.arc(x + width * 0.58, y + height * 0.5, 38, 0, Math.PI * 2);
    context.fill();
  } else if (variant === "interface") {
    context.fillStyle = "rgba(245,244,238,0.9)";
    roundedRect(context, x + 74, y + 54, width - 148, height - 108, 22);
    context.fill();
    context.fillStyle = dark;
    roundedRect(context, x + 112, y + 96, width * 0.28, height - 192, 14);
    context.fill();
    for (let row = 0; row < 4; row += 1) {
      context.fillStyle = row === 0 ? accent : "rgba(23,28,28,0.18)";
      roundedRect(context, x + width * 0.47, y + 108 + row * 66, width * (0.34 - row * 0.025), 24, 12);
      context.fill();
    }
  } else if (variant === "product") {
    context.fillStyle = dark;
    roundedRect(context, x + width * 0.36, y + 42, width * 0.28, height - 84, 110);
    context.fill();
    context.strokeStyle = "rgba(255,255,255,0.55)";
    context.lineWidth = 3;
    roundedRect(context, x + width * 0.41, y + 88, width * 0.18, height - 176, 76);
    context.stroke();
  } else if (variant === "metrics") {
    const values = [0.32, 0.48, 0.64, 0.52, 0.79, 0.92];
    values.forEach((value, index) => {
      const barHeight = value * height * 0.7;
      context.fillStyle = index === values.length - 1 ? dark : "rgba(20,25,24,0.30)";
      roundedRect(context, x + 88 + index * 150, y + height - 54 - barHeight, 86, barHeight, 43);
      context.fill();
    });
  } else {
    context.fillStyle = dark;
    context.font = "italic 650 60px Georgia, serif";
    wrapText(context, `“${variant === "quote" ? "Clarity travels further." : "Move with intent."}”`, x + 92, y + 166, width - 184, 76);
    context.fillStyle = "rgba(18,24,23,0.5)";
    context.font = "700 18px Inter, system-ui, sans-serif";
    context.fillText("MOTIONKIT RESEARCH OFFICE", x + 96, y + height - 72);
  }
}

function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > maxWidth) {
      context.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else line = next;
  });
  context.fillText(line, x, cursorY);
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}
