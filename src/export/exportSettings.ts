import type { MotionRigDefinition, OrbitRigSettings } from "../rigs/types";
import { getFrameSize } from "../renderer/geometry";

export const EXPORT_FPS = 60;

export const WEBM_MIME_TYPES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

export type ExportStatus = "ready" | "exporting" | "done" | "fallback" | "error";

export interface ExportRenderInput {
  rig: MotionRigDefinition;
  settings: OrbitRigSettings;
  slotImages: Array<HTMLImageElement | null>;
}

export function createExportCanvas(settings: OrbitRigSettings) {
  const frame = getFrameSize(settings.frameRatio);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  canvas.width = frame.width;
  canvas.height = frame.height;

  return { canvas, context, frame };
}

export function getSupportedWebmMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return null;
  }

  return WEBM_MIME_TYPES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? null;
}

export function createExportFileName(
  input: Pick<ExportRenderInput, "rig" | "settings">,
  extension: "png" | "webm",
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

  return `motionkit-${input.rig.id}-${ratio}-${dateStamp}-${timeStamp}.${extension}`;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
