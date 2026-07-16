import {
  ExportProcessError,
  getExportFrameSize,
} from "./exportSettings";
import type {
  ExportErrorCode,
  ExportFormat,
  ExportFps,
  ExportQuality,
  ExportRenderInput,
} from "./exportSettings";

export const WEBM_MIME_TYPES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
] as const;

const MAX_CANVAS_DIMENSION = 8192;
const MAX_CANVAS_PIXELS = 16_777_216;
const MAX_EXPORT_DURATION_SECONDS = 120;

export type ExportWarningCode =
  | "MOBILE_RESOURCE_DEMAND"
  | "HIGH_FRAME_RATE_DEMAND"
  | "MIME_SUPPORT_UNCONFIRMED";

export interface ExportWarning {
  code: ExportWarningCode;
  message: string;
  title: string;
}

export interface ExportCapability {
  canvas2dAvailable: boolean;
  captureStreamAvailable: boolean;
  label:
    | "Ready for WebM export"
    | "WebM supported with limited codec options"
    | "WebM unavailable; PNG snapshot only";
  mediaRecorderAvailable: boolean;
  message: string;
  mimeSupportCheckAvailable: boolean;
  mimeType: string | null;
  status: "ready" | "limited" | "png-only";
  webmSupported: boolean;
}

export interface ExportPreflightOptions {
  capability?: ExportCapability;
  exportInProgress: boolean;
  format: ExportFormat;
  fps: ExportFps;
  input: ExportRenderInput;
  quality: ExportQuality;
  requestedMimeType?: string | null;
  visibilityState?: DocumentVisibilityState;
}

export interface ExportPreflightResult {
  blockingError?: ExportProcessError;
  canExport: boolean;
  mimeType: string | null;
  warnings: ExportWarning[];
}

export type ExportRecoveryAction =
  | "RETRY"
  | "LOWER_RESOLUTION"
  | "USE_30_FPS"
  | "SWITCH_TO_PNG"
  | "REVIEW_MEDIA"
  | "RETURN_TO_SETTINGS"
  | "DISMISS";

export interface ExportErrorPresentation {
  actions: ExportRecoveryAction[];
  explanation: string;
  label: string;
  title: string;
}

export function detectExportCapability(): ExportCapability {
  const mediaRecorderAvailable = typeof MediaRecorder !== "undefined";
  const canvas = document.createElement("canvas");
  const canvas2dAvailable = Boolean(canvas.getContext("2d"));
  const captureStreamAvailable = typeof canvas.captureStream === "function";
  const mimeSupportCheckAvailable =
    mediaRecorderAvailable && typeof MediaRecorder.isTypeSupported === "function";
  const mimeType = getSupportedWebmMimeType();
  const webmSupported =
    canvas2dAvailable &&
    mediaRecorderAvailable &&
    captureStreamAvailable &&
    Boolean(mimeType);

  canvas.width = 1;
  canvas.height = 1;

  if (!webmSupported) {
    return {
      canvas2dAvailable,
      captureStreamAvailable,
      label: "WebM unavailable; PNG snapshot only",
      mediaRecorderAvailable,
      message:
        "This browser cannot complete the required WebM checks. PNG still-frame export remains available.",
      mimeSupportCheckAvailable,
      mimeType: null,
      status: "png-only",
      webmSupported: false,
    };
  }

  if (mimeType !== WEBM_MIME_TYPES[0] || !mimeSupportCheckAvailable) {
    return {
      canvas2dAvailable,
      captureStreamAvailable,
      label: "WebM supported with limited codec options",
      mediaRecorderAvailable,
      message: mimeSupportCheckAvailable
        ? "WebM export is available using a supported browser codec."
        : "WebM recording is available, but this browser cannot confirm codec support in advance.",
      mimeSupportCheckAvailable,
      mimeType,
      status: "limited",
      webmSupported: true,
    };
  }

  return {
    canvas2dAvailable,
    captureStreamAvailable,
    label: "Ready for WebM export",
    mediaRecorderAvailable,
    message: "Canvas recording and the preferred VP9 WebM codec are available.",
    mimeSupportCheckAvailable,
    mimeType,
    status: "ready",
    webmSupported: true,
  };
}

export function getSupportedWebmMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return null;
  }

  if (typeof MediaRecorder.isTypeSupported !== "function") {
    return WEBM_MIME_TYPES[WEBM_MIME_TYPES.length - 1];
  }

  return WEBM_MIME_TYPES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? null;
}

export function runExportPreflight({
  capability = detectExportCapability(),
  exportInProgress,
  format,
  fps,
  input,
  quality,
  requestedMimeType,
  visibilityState = document.visibilityState,
}: ExportPreflightOptions): ExportPreflightResult {
  const warnings = getExportWarnings({ capability, format, fps, quality });
  const mimeType = format === "webm" ? requestedMimeType ?? capability.mimeType : null;
  const blockingCode = getBlockingErrorCode({
    capability,
    exportInProgress,
    format,
    fps,
    input,
    mimeType,
    quality,
    visibilityState,
  });

  return {
    ...(blockingCode ? { blockingError: new ExportProcessError(blockingCode) } : {}),
    canExport: !blockingCode,
    mimeType,
    warnings,
  };
}

export function normalizeExportError(
  error: unknown,
  fallback: ExportErrorCode = "UNKNOWN_EXPORT_ERROR",
) {
  if (error instanceof ExportProcessError) {
    return error;
  }

  const name = error instanceof Error ? error.name.toLowerCase() : "";
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const looksLikeMemoryPressure =
    name.includes("memory") ||
    name.includes("quota") ||
    message.includes("memory") ||
    message.includes("allocation");

  return new ExportProcessError(looksLikeMemoryPressure ? "MEMORY_PRESSURE" : fallback, {
    cause: error,
  });
}

export function getExportErrorPresentation(code: ExportErrorCode): ExportErrorPresentation {
  const presentations: Record<ExportErrorCode, ExportErrorPresentation> = {
    UNSUPPORTED_BROWSER: {
      actions: ["SWITCH_TO_PNG", "DISMISS"],
      explanation: "The required browser recording features are not available for this WebM export.",
      label: "Capability check",
      title: "WebM recording is not available here",
    },
    UNSUPPORTED_FORMAT: {
      actions: ["SWITCH_TO_PNG", "RETURN_TO_SETTINGS", "DISMISS"],
      explanation: "This browser could not confirm support for the selected WebM codec.",
      label: "Format check",
      title: "This WebM format is not available",
    },
    MEDIA_NOT_READY: {
      actions: ["REVIEW_MEDIA", "RETURN_TO_SETTINGS", "DISMISS"],
      explanation: "One or more required images are empty, still loading, or could not be decoded.",
      label: "Media check",
      title: "Some media needs attention",
    },
    CANVAS_TOO_LARGE: {
      actions: ["LOWER_RESOLUTION", "RETURN_TO_SETTINGS", "DISMISS"],
      explanation: "The requested canvas is larger than the safe export limit used by Hoppy.",
      label: "Canvas check",
      title: "This resolution is too large to export safely",
    },
    INVALID_EXPORT_SETTINGS: {
      actions: ["RETURN_TO_SETTINGS", "DISMISS"],
      explanation: "The selected duration, frame rate, ratio, or export state is not valid right now.",
      label: "Settings check",
      title: "Review the export settings",
    },
    RECORDER_START_FAILED: {
      actions: ["RETRY", "USE_30_FPS", "SWITCH_TO_PNG", "DISMISS"],
      explanation: "The browser passed preflight but did not start its video recorder in time.",
      label: "Recorder check",
      title: "Video recording could not start",
    },
    RECORDING_INTERRUPTED: {
      actions: ["RETRY", "USE_30_FPS", "SWITCH_TO_PNG", "DISMISS"],
      explanation: "Recording stopped before Hoppy completed the full motion loop.",
      label: "Recording stopped",
      title: "The WebM recording was interrupted",
    },
    EMPTY_OUTPUT: {
      actions: ["RETRY", "SWITCH_TO_PNG", "RETURN_TO_SETTINGS", "DISMISS"],
      explanation: "The browser finished without producing a usable output file.",
      label: "Output check",
      title: "No export file was created",
    },
    MEMORY_PRESSURE: {
      actions: ["LOWER_RESOLUTION", "USE_30_FPS", "SWITCH_TO_PNG", "DISMISS"],
      explanation: "The browser ran short of available memory while creating this output.",
      label: "Resource check",
      title: "This export needs fewer browser resources",
    },
    EXPORT_CANCELLED: {
      actions: ["RETURN_TO_SETTINGS", "DISMISS"],
      explanation: "The export stopped safely and no partial file was downloaded.",
      label: "Cancelled",
      title: "Export cancelled",
    },
    UNKNOWN_EXPORT_ERROR: {
      actions: ["RETRY", "RETURN_TO_SETTINGS", "DISMISS"],
      explanation: "Hoppy could not finish this export. Your media and settings are unchanged.",
      label: "Export stopped",
      title: "The export could not finish",
    },
  };

  return presentations[code];
}

function getBlockingErrorCode({
  capability,
  exportInProgress,
  format,
  fps,
  input,
  mimeType,
  quality,
  visibilityState,
}: {
  capability: ExportCapability;
  exportInProgress: boolean;
  format: ExportFormat;
  fps: ExportFps;
  input: ExportRenderInput;
  mimeType: string | null;
  quality: ExportQuality;
  visibilityState: DocumentVisibilityState;
}): ExportErrorCode | null {
  if (exportInProgress || typeof input.rig.render !== "function") {
    return "INVALID_EXPORT_SETTINGS";
  }

  if (!input.rig.isSettings(input.settings)) {
    return "INVALID_EXPORT_SETTINGS";
  }

  const duration = input.settings.durationSeconds;
  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    duration > MAX_EXPORT_DURATION_SECONDS ||
    !input.rig.supportedRatios.includes(input.settings.frameRatio) ||
    (format === "webm" && fps !== 30 && fps !== 60)
  ) {
    return "INVALID_EXPORT_SETTINGS";
  }

  const frame = getExportFrameSize(input.settings.frameRatio, quality);
  if (
    !Number.isInteger(frame.width) ||
    !Number.isInteger(frame.height) ||
    frame.width <= 0 ||
    frame.height <= 0
  ) {
    return "INVALID_EXPORT_SETTINGS";
  }
  if (
    frame.width > MAX_CANVAS_DIMENSION ||
    frame.height > MAX_CANVAS_DIMENSION ||
    frame.width * frame.height > MAX_CANVAS_PIXELS
  ) {
    return "CANVAS_TOO_LARGE";
  }

  if (!capability.canvas2dAvailable) {
    return "UNSUPPORTED_BROWSER";
  }

  const requiredMedia = format === "png"
    ? input.rig.mediaRequirements.requiredForPng
    : input.rig.mediaRequirements.requiredForExport;
  const readyMedia = input.slotImages.filter(
    (image) => image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
  ).length;
  if (input.slotImages.length !== input.rig.slotCount || readyMedia < requiredMedia) {
    return "MEDIA_NOT_READY";
  }

  if (format === "png") {
    return null;
  }
  if (!capability.mediaRecorderAvailable || !capability.captureStreamAvailable) {
    return "UNSUPPORTED_BROWSER";
  }
  if (!mimeType) {
    return "UNSUPPORTED_FORMAT";
  }
  if (
    capability.mimeSupportCheckAvailable &&
    !MediaRecorder.isTypeSupported(mimeType)
  ) {
    return "UNSUPPORTED_FORMAT";
  }
  if (visibilityState !== "visible") {
    return "INVALID_EXPORT_SETTINGS";
  }

  return null;
}

function getExportWarnings({
  capability,
  format,
  fps,
  quality,
}: {
  capability: ExportCapability;
  format: ExportFormat;
  fps: ExportFps;
  quality: ExportQuality;
}) {
  const warnings: ExportWarning[] = [];
  const isMobileViewport = window.innerWidth <= 680;

  if (format === "webm" && fps === 60 && quality === "high") {
    warnings.push({
      code: "HIGH_FRAME_RATE_DEMAND",
      message: "Hoppy will keep 60 FPS and high resolution, but this combination may need more memory and take longer.",
      title: "Demanding video settings",
    });
  }
  if (isMobileViewport && (quality === "high" || (format === "webm" && fps === 60))) {
    warnings.push({
      code: "MOBILE_RESOURCE_DEMAND",
      message: "Keep Hoppy visible during export. This configuration may be demanding on a phone or tablet.",
      title: "Higher mobile resource use",
    });
  }
  if (format === "webm" && capability.webmSupported && !capability.mimeSupportCheckAvailable) {
    warnings.push({
      code: "MIME_SUPPORT_UNCONFIRMED",
      message: "The browser can record WebM but cannot confirm its codec before recording begins.",
      title: "Codec support will be confirmed at start",
    });
  }

  return warnings;
}
