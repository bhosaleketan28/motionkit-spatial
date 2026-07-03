import { renderOrbitCarousel } from "../renderer/canvasRenderer";
import { createExportCanvas, createExportFileName, downloadBlob } from "./exportSettings";
import type { ExportRenderInput } from "./exportSettings";

export async function exportOrbitCarouselPng(input: ExportRenderInput) {
  const { canvas, context, frame } = createExportCanvas(input.settings);

  renderOrbitCarousel({
    context,
    frame,
    progress: 0,
    rig: input.rig,
    settings: input.settings,
    slotImages: input.slotImages,
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) {
        reject(new Error("PNG export failed."));
        return;
      }

      resolve(pngBlob);
    }, "image/png");
  });

  downloadBlob(blob, createExportFileName(input, "png"));
}
