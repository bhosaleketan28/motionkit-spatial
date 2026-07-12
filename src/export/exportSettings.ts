import type { AnyRigSettings, FrameRatio, FrameSize, RegisteredRigDefinition } from "../rigs/types";

export const WEBM_MIME_TYPES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
] as const;

export type ExportStatus =
  | "ready"
  | "exporting"
  | "done"
  | "fallback"
  | "cancelled"
  | "error";

export type ExportFormat = "webm" | "png";
export type ExportFps = 30 | 60;
export type ExportQuality = "standard" | "high";
export type ExportPhase =
  | "preparing"
  | "rendering"
  | "encoding"
  | "finalizing"
  | "downloading"
  | "complete";

export interface ExportProgress {
  elapsedMs: number;
  phase: ExportPhase;
  progress: number;
  remainingMs: number | null;
}

export interface ExportOptions {
  fileName: string;
  fps: ExportFps;
  quality: ExportQuality;
  signal: AbortSignal;
  onProgress: (progress: ExportProgress) => void;
}

export interface ExportRenderInput {
  rig: RegisteredRigDefinition;
  settings: AnyRigSettings;
  slotImages: Array<HTMLImageElement | null>;
}

export interface ExportArtifact {
  blob: Blob;
  durationSeconds: number;
  fileName: string;
  format: ExportFormat;
  fps: ExportFps | null;
  frame: FrameSize;
  mimeType: string;
}

export interface ExportCapability {
  captureStreamAvailable: boolean;
  label:
    | "Ready for WebM export"
    | "WebM supported with limited codec options"
    | "WebM unavailable; PNG snapshot only";
  mediaRecorderAvailable: boolean;
  message: string;
  mimeType: string | null;
  status: "ready" | "limited" | "png-only";
  webmSupported: boolean;
}

export type ExportErrorCode =
  | "cancelled"
  | "unsupported-browser"
  | "recorder-startup"
  | "invalid-media"
  | "encoding"
  | "png-encoding"
  | "download";

export class ExportProcessError extends Error {
  code: ExportErrorCode;

  constructor(code: ExportErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "ExportProcessError";
  }
}

export function detectExportCapability(): ExportCapability {
  const mediaRecorderAvailable = typeof MediaRecorder !== "undefined";
  const canvas = document.createElement("canvas");
  const captureStreamAvailable = typeof canvas.captureStream === "function";
  const mimeType = getSupportedWebmMimeType();
  const webmSupported = mediaRecorderAvailable && captureStreamAvailable && Boolean(mimeType);

  if (!webmSupported) {
    return {
      captureStreamAvailable,
      label: "WebM unavailable; PNG snapshot only",
      mediaRecorderAvailable,
      message:
        "This browser cannot record a canvas WebM. You can explicitly export one PNG snapshot instead.",
      mimeType: null,
      status: "png-only",
      webmSupported: false,
    };
  }

  if (mimeType !== WEBM_MIME_TYPES[0]) {
    return {
      captureStreamAvailable,
      label: "WebM supported with limited codec options",
      mediaRecorderAvailable,
      message: `WebM export is available using ${formatCodecName(mimeType)}.`,
      mimeType,
      status: "limited",
      webmSupported: true,
    };
  }

  return {
    captureStreamAvailable,
    label: "Ready for WebM export",
    mediaRecorderAvailable,
    message: "Canvas recording and the preferred VP9 WebM codec are available.",
    mimeType,
    status: "ready",
    webmSupported: true,
  };
}

export function getSupportedWebmMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return null;
  }

  return WEBM_MIME_TYPES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? null;
}

export function getExportFrameSize(ratio: FrameRatio, quality: ExportQuality): FrameSize {
  const sizes: Record<ExportQuality, Record<FrameRatio, FrameSize>> = {
    standard: {
      "1:1": { width: 1080, height: 1080 },
      "16:9": { width: 1920, height: 1080 },
      "9:16": { width: 1080, height: 1920 },
    },
    high: {
      "1:1": { width: 1440, height: 1440 },
      "16:9": { width: 2560, height: 1440 },
      "9:16": { width: 1440, height: 2560 },
    },
  };

  return sizes[quality][ratio];
}

export function createExportCanvas(settings: AnyRigSettings, quality: ExportQuality) {
  const frame = getExportFrameSize(settings.frameRatio, quality);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new ExportProcessError(
      "unsupported-browser",
      "Canvas 2D is unavailable in this browser, so export cannot start.",
    );
  }

  canvas.width = frame.width;
  canvas.height = frame.height;

  return { canvas, context, frame };
}

export function createDefaultExportFileName(
  input: Pick<ExportRenderInput, "rig" | "settings">,
  extension: ExportFormat,
) {
  const now = new Date();
  const dateStamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const timeStamp = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  const ratio = input.settings.frameRatio.replace(":", "x");

  const prefix = input.rig.exportMetadata.fileNamePrefix.startsWith("motionkit-")
    ? input.rig.exportMetadata.fileNamePrefix
    : `motionkit-${input.rig.exportMetadata.fileNamePrefix}`;
  return `${prefix}-${ratio}-${dateStamp}-${timeStamp}.${extension}`;
}

export function normalizeExportFileName(fileName: string, extension: ExportFormat) {
  const baseName = fileName
    .trim()
    .replace(/\.(webm|png)$/i, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120)
    .trim();

  return `${baseName || "motionkit-export"}.${extension}`;
}

export function validateExportMedia(input: ExportRenderInput, format: ExportFormat) {
  const required = format === "png"
    ? input.rig.mediaRequirements.requiredForPng
    : input.rig.mediaRequirements.requiredForExport;
  if (input.slotImages.length !== input.rig.slotCount) {
    throw new ExportProcessError(
      "invalid-media",
      `${input.rig.name} requires ${required} valid image${required === 1 ? "" : "s"} before ${format.toUpperCase()} export.`,
    );
  }

  const validImageCount = input.slotImages.filter(
    (image) => image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
  ).length;

  if (validImageCount < required) {
    throw new ExportProcessError(
      "invalid-media",
      "One or more media slots are empty, still loading, or contain an image that could not be decoded.",
    );
  }
}

export function throwIfExportCancelled(signal: AbortSignal) {
  if (signal.aborted) {
    throw new ExportProcessError("cancelled", "Export cancelled. No file was downloaded.");
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  try {
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
  } catch {
    throw new ExportProcessError(
      "download",
      "The export was created, but the browser could not start the download.",
    );
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export function formatCodecName(mimeType: string | null) {
  if (!mimeType) return "Unavailable";
  if (mimeType.includes("vp9")) return "VP9";
  if (mimeType.includes("vp8")) return "VP8";
  return "Browser default WebM";
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
