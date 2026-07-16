import type { AnyRigSettings, FrameRatio, FrameSize, RegisteredRigDefinition } from "../rigs/types";

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

export type ExportErrorCode =
  | "UNSUPPORTED_BROWSER"
  | "UNSUPPORTED_FORMAT"
  | "MEDIA_NOT_READY"
  | "CANVAS_TOO_LARGE"
  | "INVALID_EXPORT_SETTINGS"
  | "RECORDER_START_FAILED"
  | "RECORDING_INTERRUPTED"
  | "EMPTY_OUTPUT"
  | "MEMORY_PRESSURE"
  | "EXPORT_CANCELLED"
  | "UNKNOWN_EXPORT_ERROR";

export class ExportProcessError extends Error {
  code: ExportErrorCode;

  constructor(code: ExportErrorCode, options?: { cause?: unknown }) {
    super(code, options);
    this.code = code;
    this.name = "ExportProcessError";
  }
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
  canvas.width = frame.width;
  canvas.height = frame.height;
  if (canvas.width !== frame.width || canvas.height !== frame.height || !canvas.width || !canvas.height) {
    throw new ExportProcessError("CANVAS_TOO_LARGE");
  }
  const context = canvas.getContext("2d");

  if (!context) {
    throw new ExportProcessError("UNSUPPORTED_BROWSER");
  }

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

  const prefix = input.rig.exportMetadata.fileNamePrefix.startsWith("hoppy-")
    ? input.rig.exportMetadata.fileNamePrefix
    : `hoppy-${input.rig.exportMetadata.fileNamePrefix}`;
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

  return `${baseName || "hoppy-export"}.${extension}`;
}

export function throwIfExportCancelled(signal: AbortSignal) {
  if (signal.aborted) {
    throw new ExportProcessError("EXPORT_CANCELLED");
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  if (!blob.size) {
    throw new ExportProcessError("EMPTY_OUTPUT");
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  let revoked = false;
  let revokeTimer: number | null = null;
  const cleanup = () => {
    if (revokeTimer !== null) {
      window.clearTimeout(revokeTimer);
      revokeTimer = null;
    }
    if (!revoked) {
      revoked = true;
      URL.revokeObjectURL(url);
    }
  };

  try {
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    revokeTimer = window.setTimeout(cleanup, 1000);
  } catch (cause) {
    cleanup();
    throw new ExportProcessError("UNKNOWN_EXPORT_ERROR", { cause });
  } finally {
    link.remove();
  }

  return cleanup;
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
