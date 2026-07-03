import { renderOrbitCarousel } from "../renderer/canvasRenderer";
import {
  createExportCanvas,
  createExportFileName,
  downloadBlob,
  EXPORT_FPS,
  getSupportedWebmMimeType,
} from "./exportSettings";
import type { ExportRenderInput } from "./exportSettings";

export async function exportOrbitCarouselWebm(input: ExportRenderInput) {
  const mimeType = getSupportedWebmMimeType();
  const { canvas, context, frame } = createExportCanvas(input.settings);
  const captureStream = canvas.captureStream?.bind(canvas);

  if (!mimeType || !captureStream) {
    throw new Error("WebM recording is unavailable in this browser.");
  }

  renderOrbitCarousel({
    context,
    frame,
    progress: 0,
    rig: input.rig,
    settings: input.settings,
    slotImages: input.slotImages,
  });

  const stream = captureStream(EXPORT_FPS);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
  });
  const chunks: BlobPart[] = [];
  const durationMs = input.settings.durationSeconds * 1000;

  const finished = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = () => {
      reject(new Error("WebM recording failed."));
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());

      if (chunks.length === 0) {
        reject(new Error("WebM recording produced no video data."));
        return;
      }

      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  recorder.start();

  await renderExportLoop({
    durationMs,
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
  });

  recorder.stop();
  const blob = await finished;
  downloadBlob(blob, createExportFileName(input, "webm"));
}

interface RenderExportLoopOptions {
  draw: (progress: number) => void;
  durationMs: number;
}

function renderExportLoop({ draw, durationMs }: RenderExportLoopOptions) {
  return new Promise<void>((resolve) => {
    let startTime: number | null = null;

    const tick = (time: number) => {
      if (startTime === null) {
        startTime = time;
      }

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      draw(progress);

      if (elapsed < durationMs) {
        requestAnimationFrame(tick);
        return;
      }

      requestAnimationFrame(() => resolve());
    };

    requestAnimationFrame(tick);
  });
}
