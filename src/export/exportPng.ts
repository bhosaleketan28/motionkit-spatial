import {
  normalizeExportError,
  runExportPreflight,
} from "./exportCapability";
import {
  createExportCanvas,
  ExportProcessError,
  normalizeExportFileName,
  throwIfExportCancelled,
} from "./exportSettings";
import type {
  ExportArtifact,
  ExportOptions,
  ExportRenderInput,
} from "./exportSettings";

const PNG_ENCODING_TIMEOUT_MS = 15_000;

export async function exportRigPng(
  input: ExportRenderInput,
  options: ExportOptions,
): Promise<ExportArtifact> {
  const preflight = runExportPreflight({
    exportInProgress: false,
    format: "png",
    fps: options.fps,
    input,
    quality: options.quality,
  });
  if (preflight.blockingError) {
    throw preflight.blockingError;
  }
  throwIfExportCancelled(options.signal);

  const startedAt = performance.now();
  const { canvas, context, frame } = createExportCanvas(input.settings, options.quality);

  try {
    if (!canvas.width || !canvas.height || !frame.width || !frame.height) {
      throw new ExportProcessError("INVALID_EXPORT_SETTINGS");
    }

    options.onProgress({
      elapsedMs: 0,
      phase: "preparing",
      progress: 0.12,
      remainingMs: 700,
    });
    input.rig.render({
      context,
      frame,
      progress: 0,
      settings: input.settings,
      slotCount: input.rig.slotCount,
      slotImages: input.slotImages,
    });
    options.onProgress({
      elapsedMs: performance.now() - startedAt,
      phase: "rendering",
      progress: 0.42,
      remainingMs: 400,
    });
    throwIfExportCancelled(options.signal);
    options.onProgress({
      elapsedMs: performance.now() - startedAt,
      phase: "encoding",
      progress: 0.68,
      remainingMs: null,
    });

    const blob = await encodePng(canvas, options.signal);
    throwIfExportCancelled(options.signal);
    if (!blob.size) {
      throw new ExportProcessError("EMPTY_OUTPUT");
    }
    options.onProgress({
      elapsedMs: performance.now() - startedAt,
      phase: "finalizing",
      progress: 0.94,
      remainingMs: null,
    });

    return {
      blob,
      durationSeconds: input.settings.durationSeconds,
      fileName: normalizeExportFileName(options.fileName, "png"),
      format: "png",
      fps: null,
      frame,
      mimeType: "image/png",
    };
  } catch (error) {
    throw normalizeExportError(error);
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

function encodePng(canvas: HTMLCanvasElement, signal: AbortSignal) {
  return new Promise<Blob>((resolve, reject) => {
    let settled = false;
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      signal.removeEventListener("abort", handleAbort);
      action();
    };
    const handleAbort = () =>
      finish(() => reject(new ExportProcessError("EXPORT_CANCELLED")));
    const timeout = window.setTimeout(
      () => finish(() => reject(new ExportProcessError("UNKNOWN_EXPORT_ERROR"))),
      PNG_ENCODING_TIMEOUT_MS,
    );

    signal.addEventListener("abort", handleAbort, { once: true });
    if (signal.aborted) {
      handleAbort();
      return;
    }

    try {
      canvas.toBlob((pngBlob) => {
        finish(() => {
          if (!pngBlob || !pngBlob.size) {
            reject(new ExportProcessError("EMPTY_OUTPUT"));
            return;
          }
          resolve(pngBlob);
        });
      }, "image/png");
    } catch (error) {
      finish(() => reject(normalizeExportError(error)));
    }
  });
}
