import {
  createExportCanvas,
  ExportProcessError,
  normalizeExportFileName,
  throwIfExportCancelled,
  validateExportMedia,
} from "./exportSettings";
import type {
  ExportArtifact,
  ExportOptions,
  ExportRenderInput,
} from "./exportSettings";

export async function exportRigPng(
  input: ExportRenderInput,
  options: ExportOptions,
): Promise<ExportArtifact> {
  validateExportMedia(input, "png");
  throwIfExportCancelled(options.signal);
  const startedAt = performance.now();
  const { canvas, context, frame } = createExportCanvas(input.settings, options.quality);

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

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) {
        reject(
          new ExportProcessError(
            "png-encoding",
            "The browser could not encode the rendered frame as a PNG image.",
          ),
        );
        return;
      }

      resolve(pngBlob);
    }, "image/png");
  });

  throwIfExportCancelled(options.signal);
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
}
