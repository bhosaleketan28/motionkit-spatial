import {
  detectExportCapability,
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

const RECORDER_START_TIMEOUT_MS = 2500;
const RECORDER_STOP_TIMEOUT_MS = 5000;
const RENDER_WATCHDOG_GRACE_MS = 5000;

export async function exportRigWebm(
  input: ExportRenderInput,
  options: ExportOptions,
): Promise<ExportArtifact> {
  const capability = detectExportCapability();
  const preflight = runExportPreflight({
    capability,
    exportInProgress: false,
    format: "webm",
    fps: options.fps,
    input,
    quality: options.quality,
    requestedMimeType: capability.mimeType,
  });
  if (preflight.blockingError) {
    throw preflight.blockingError;
  }
  if (!preflight.mimeType) {
    throw new ExportProcessError("UNSUPPORTED_FORMAT");
  }
  throwIfExportCancelled(options.signal);

  const startedAt = performance.now();
  const mimeType = preflight.mimeType;
  const { canvas, context, frame } = createExportCanvas(input.settings, options.quality);
  let stream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  const chunks: Blob[] = [];
  let stopRequested = false;
  let recorderStarted = false;
  let startTimeout: number | null = null;
  let stopTimeout: number | null = null;
  let startSettled = false;
  let finishedSettled = false;
  let failureSettled = false;
  let resolveStart: () => void = () => undefined;
  let rejectStart: (error: ExportProcessError) => void = () => undefined;
  let resolveFinished: (blob: Blob) => void = () => undefined;
  let rejectFinished: (error: ExportProcessError) => void = () => undefined;
  let rejectFailure: (error: ExportProcessError) => void = () => undefined;

  const recorderStart = new Promise<void>((resolve, reject) => {
    resolveStart = resolve;
    rejectStart = reject;
  });
  const recordingFinished = new Promise<Blob>((resolve, reject) => {
    resolveFinished = resolve;
    rejectFinished = reject;
  });
  const recorderFailure = new Promise<never>((_, reject) => {
    rejectFailure = reject;
  });
  void recorderStart.catch(() => undefined);
  void recordingFinished.catch(() => undefined);
  void recorderFailure.catch(() => undefined);

  const settleStartWithError = (error: ExportProcessError) => {
    if (startSettled) return;
    startSettled = true;
    rejectStart(error);
  };
  const settleFinishedWithError = (error: ExportProcessError) => {
    if (finishedSettled) return;
    finishedSettled = true;
    rejectFinished(error);
  };
  const failRecording = (error: ExportProcessError) => {
    settleStartWithError(error);
    settleFinishedWithError(error);
    if (!failureSettled) {
      failureSettled = true;
      rejectFailure(error);
    }
  };
  const clearRecorderTimers = () => {
    if (startTimeout !== null) {
      window.clearTimeout(startTimeout);
      startTimeout = null;
    }
    if (stopTimeout !== null) {
      window.clearTimeout(stopTimeout);
      stopTimeout = null;
    }
  };
  const stopTracks = () => {
    stream?.getTracks().forEach((track) => track.stop());
  };
  const stopRecorder = () => {
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        // A recorder error or stop event may already be completing shutdown.
      }
    }
  };
  const handleRecorderStart = () => {
    if (startTimeout !== null) {
      window.clearTimeout(startTimeout);
      startTimeout = null;
    }
    if (!startSettled) {
      startSettled = true;
      recorderStarted = true;
      resolveStart();
    }
  };
  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };
  const handleRecorderError = () => {
    failRecording(new ExportProcessError("RECORDING_INTERRUPTED"));
  };
  const handleRecorderStop = () => {
    if (stopTimeout !== null) {
      window.clearTimeout(stopTimeout);
      stopTimeout = null;
    }
    if (options.signal.aborted) {
      failRecording(new ExportProcessError("EXPORT_CANCELLED"));
      return;
    }
    if (!stopRequested) {
      failRecording(new ExportProcessError("RECORDING_INTERRUPTED"));
      return;
    }
    if (finishedSettled) return;
    const blob = new Blob(chunks, { type: mimeType });
    finishedSettled = true;
    if (!chunks.length || !blob.size) {
      rejectFinished(new ExportProcessError("EMPTY_OUTPUT"));
      return;
    }
    resolveFinished(blob);
  };
  const handleAbort = () => {
    failRecording(new ExportProcessError("EXPORT_CANCELLED"));
    stopRecorder();
    stopTracks();
  };

  try {
    options.onProgress({
      elapsedMs: 0,
      phase: "preparing",
      progress: 0.03,
      remainingMs: input.settings.durationSeconds * 1000 + 1200,
    });
    input.rig.render({
      context,
      frame,
      progress: 0,
      settings: input.settings,
      slotCount: input.rig.slotCount,
      slotImages: input.slotImages,
    });
    throwIfExportCancelled(options.signal);

    try {
      stream = canvas.captureStream(options.fps);
    } catch (error) {
      throw normalizeExportError(error, "UNSUPPORTED_BROWSER");
    }
    if (!stream || stream.getVideoTracks().length === 0) {
      throw new ExportProcessError("RECORDING_INTERRUPTED");
    }

    try {
      recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: options.quality === "high" ? 16_000_000 : 8_000_000,
      });
    } catch (error) {
      throw normalizeExportError(error, "RECORDER_START_FAILED");
    }

    recorder.addEventListener("start", handleRecorderStart);
    recorder.addEventListener("dataavailable", handleDataAvailable);
    recorder.addEventListener("error", handleRecorderError);
    recorder.addEventListener("stop", handleRecorderStop);
    options.signal.addEventListener("abort", handleAbort, { once: true });

    startTimeout = window.setTimeout(() => {
      failRecording(new ExportProcessError("RECORDER_START_FAILED"));
      stopRecorder();
    }, RECORDER_START_TIMEOUT_MS);
    try {
      recorder.start(250);
    } catch (error) {
      throw normalizeExportError(error, "RECORDER_START_FAILED");
    }
    await recorderStart;
    throwIfExportCancelled(options.signal);

    const durationMs = input.settings.durationSeconds * 1000;
    await Promise.race([
      renderExportLoop({
        durationMs,
        signal: options.signal,
        draw: (progress) => {
          input.rig.render({
            context,
            frame,
            progress,
            settings: input.settings,
            slotCount: input.rig.slotCount,
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
    stopRequested = true;
    stopTimeout = window.setTimeout(() => {
      failRecording(new ExportProcessError("RECORDING_INTERRUPTED"));
      stopRecorder();
    }, RECORDER_STOP_TIMEOUT_MS);
    stopRecorder();
    const blob = await recordingFinished;
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
      fileName: normalizeExportFileName(options.fileName, "webm"),
      format: "webm",
      fps: options.fps,
      frame,
      mimeType,
    };
  } catch (error) {
    stopRecorder();
    if (options.signal.aborted) {
      throw new ExportProcessError("EXPORT_CANCELLED");
    }
    throw normalizeExportError(error, recorderStarted ? "RECORDING_INTERRUPTED" : "RECORDER_START_FAILED");
  } finally {
    clearRecorderTimers();
    options.signal.removeEventListener("abort", handleAbort);
    if (recorder) {
      recorder.removeEventListener("start", handleRecorderStart);
      recorder.removeEventListener("dataavailable", handleDataAvailable);
      recorder.removeEventListener("error", handleRecorderError);
      recorder.removeEventListener("stop", handleRecorderStop);
    }
    stopRecorder();
    stopTracks();
    chunks.length = 0;
    canvas.width = 1;
    canvas.height = 1;
    recorder = null;
    stream = null;
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
    let settled = false;
    const watchdog = window.setTimeout(
      () => finish(() => reject(new ExportProcessError("RECORDING_INTERRUPTED"))),
      durationMs + RENDER_WATCHDOG_GRACE_MS,
    );
    const cleanup = () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      window.clearTimeout(watchdog);
      signal.removeEventListener("abort", handleAbort);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      action();
    };
    const handleAbort = () =>
      finish(() => reject(new ExportProcessError("EXPORT_CANCELLED")));
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        finish(() => reject(new ExportProcessError("RECORDING_INTERRUPTED")));
      }
    };
    const tick = (time: number) => {
      if (signal.aborted) {
        handleAbort();
        return;
      }
      if (document.visibilityState !== "visible") {
        handleVisibilityChange();
        return;
      }

      if (startTime === null) {
        startTime = time;
      }

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      try {
        draw(progress);
        onProgress(progress, elapsed);
      } catch (error) {
        finish(() => reject(normalizeExportError(error)));
        return;
      }

      if (elapsed < durationMs) {
        animationFrame = requestAnimationFrame(tick);
        return;
      }

      finish(resolve);
    };

    signal.addEventListener("abort", handleAbort, { once: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (signal.aborted) {
      handleAbort();
      return;
    }
    if (document.visibilityState !== "visible") {
      handleVisibilityChange();
      return;
    }
    animationFrame = requestAnimationFrame(tick);
  });
}
