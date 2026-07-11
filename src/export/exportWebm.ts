import { renderOrbitCarousel } from "../renderer/canvasRenderer";
import {
  createExportCanvas,
  ExportProcessError,
  getSupportedWebmMimeType,
  normalizeExportFileName,
  throwIfExportCancelled,
  validateExportMedia,
} from "./exportSettings";
import type {
  ExportArtifact,
  ExportOptions,
  ExportRenderInput,
} from "./exportSettings";

export async function exportOrbitCarouselWebm(
  input: ExportRenderInput,
  options: ExportOptions,
): Promise<ExportArtifact> {
  validateExportMedia(input);
  throwIfExportCancelled(options.signal);

  const startedAt = performance.now();
  const mimeType = getSupportedWebmMimeType();
  const { canvas, context, frame } = createExportCanvas(input.settings, options.quality);
  const captureStream = canvas.captureStream?.bind(canvas);

  options.onProgress({
    elapsedMs: 0,
    phase: "preparing",
    progress: 0.03,
    remainingMs: input.settings.durationSeconds * 1000 + 1200,
  });

  if (!mimeType || !captureStream || typeof MediaRecorder === "undefined") {
    throw new ExportProcessError(
      "unsupported-browser",
      "WebM recording is unavailable in this browser. Review the explicit PNG snapshot option instead.",
    );
  }

  renderOrbitCarousel({
    context,
    frame,
    progress: 0,
    rig: input.rig,
    settings: input.settings,
    slotImages: input.slotImages,
  });

  throwIfExportCancelled(options.signal);
  const stream = captureStream(options.fps);
  const stopTracks = () => stream.getTracks().forEach((track) => track.stop());
  let recorder: MediaRecorder;

  try {
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: options.quality === "high" ? 16_000_000 : 8_000_000,
    });
  } catch {
    stopTracks();
    throw new ExportProcessError(
      "recorder-startup",
      "The browser reported WebM support but could not create the recorder. You may explicitly choose a PNG snapshot instead.",
    );
  }

  const chunks: BlobPart[] = [];
  let recorderStarted = false;
  let rejectRecorderFailure: (error: ExportProcessError) => void = () => undefined;
  const recorderFailure = new Promise<never>((_, reject) => {
    rejectRecorderFailure = reject;
  });
  const recordingFinished = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = () => {
      const error = new ExportProcessError(
        "encoding",
        "The browser recorder failed while encoding the WebM file.",
      );
      rejectRecorderFailure(error);
      reject(error);
    };

    recorder.onstop = () => {
      if (chunks.length === 0) {
        reject(
          new ExportProcessError(
            "encoding",
            "WebM encoding stopped before any video data was produced.",
          ),
        );
        return;
      }

      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  const stopRecorder = () => {
    if (recorderStarted && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        // The recorder may already be stopping after a browser-level failure.
      }
    }
  };
  const handleAbort = () => {
    stopRecorder();
    stopTracks();
  };
  options.signal.addEventListener("abort", handleAbort, { once: true });

  try {
    try {
      recorder.start(250);
      recorderStarted = true;
    } catch {
      throw new ExportProcessError(
        "recorder-startup",
        "The WebM recorder could not start. No file was created; you may explicitly choose a PNG snapshot instead.",
      );
    }

    const durationMs = input.settings.durationSeconds * 1000;
    await Promise.race([
      renderExportLoop({
        durationMs,
        signal: options.signal,
        draw: (progress) => {
          renderOrbitCarousel({
            context,
            frame,
            progress,
            rig: input.rig,
            settings: input.settings,
            slotImages: input.slotImages,
          });
        },
        onProgress: (progress, elapsedMs) => {
          options.onProgress({
            elapsedMs: performance.now() - startedAt,
            phase: "rendering",
            progress: 0.08 + progress * 0.72,
            remainingMs: Math.max(0, durationMs - elapsedMs) + 1000,
          });
        },
      }),
      recorderFailure,
    ]);

    throwIfExportCancelled(options.signal);
    options.onProgress({
      elapsedMs: performance.now() - startedAt,
      phase: "encoding",
      progress: 0.84,
      remainingMs: null,
    });
    stopRecorder();
    const blob = await recordingFinished;
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
      fileName: normalizeExportFileName(options.fileName, "webm"),
      format: "webm",
      fps: options.fps,
      frame,
      mimeType,
    };
  } catch (error) {
    stopRecorder();
    if (recorderStarted) {
      await recordingFinished.catch(() => undefined);
    }
    if (options.signal.aborted) {
      throw new ExportProcessError("cancelled", "Export cancelled. No partial file was downloaded.");
    }
    if (error instanceof ExportProcessError) {
      throw error;
    }
    throw new ExportProcessError(
      "encoding",
      "The WebM export ended unexpectedly while rendering or encoding.",
    );
  } finally {
    options.signal.removeEventListener("abort", handleAbort);
    stopTracks();
  }
}

interface RenderExportLoopOptions {
  draw: (progress: number) => void;
  durationMs: number;
  onProgress: (progress: number, elapsedMs: number) => void;
  signal: AbortSignal;
}

function renderExportLoop({
  draw,
  durationMs,
  onProgress,
  signal,
}: RenderExportLoopOptions) {
  return new Promise<void>((resolve, reject) => {
    let animationFrame: number | null = null;
    let startTime: number | null = null;

    const cleanup = () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
      signal.removeEventListener("abort", handleAbort);
    };
    const handleAbort = () => {
      cleanup();
      reject(new ExportProcessError("cancelled", "Export cancelled. No partial file was downloaded."));
    };
    const tick = (time: number) => {
      if (signal.aborted) {
        handleAbort();
        return;
      }

      if (startTime === null) {
        startTime = time;
      }

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      draw(progress);
      onProgress(progress, elapsed);

      if (elapsed < durationMs) {
        animationFrame = requestAnimationFrame(tick);
        return;
      }

      cleanup();
      resolve();
    };

    signal.addEventListener("abort", handleAbort, { once: true });
    animationFrame = requestAnimationFrame(tick);
  });
}
