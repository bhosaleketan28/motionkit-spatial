export type PreviewQualityTier = "balanced" | "efficient" | "high";

interface PreviewQuality {
  galleryFps: number;
  galleryPixelRatio: number;
  stageFps: number | undefined;
  stagePixelRatio: number;
  tier: PreviewQualityTier;
}

export function getPreviewQuality(
  viewportWidth: number,
  devicePixelRatio: number,
): PreviewQuality {
  const safePixelRatio = Math.max(1, devicePixelRatio || 1);

  if (viewportWidth <= 680) {
    return {
      galleryFps: 16,
      galleryPixelRatio: 1,
      stageFps: 30,
      stagePixelRatio: Math.min(safePixelRatio, 1.5),
      tier: "efficient",
    };
  }

  if (viewportWidth <= 1024) {
    return {
      galleryFps: 18,
      galleryPixelRatio: Math.min(safePixelRatio, 1.5),
      stageFps: undefined,
      stagePixelRatio: Math.min(safePixelRatio, 2),
      tier: "balanced",
    };
  }

  return {
    galleryFps: 22,
    galleryPixelRatio: Math.min(safePixelRatio, 1.5),
    stageFps: undefined,
    stagePixelRatio: safePixelRatio,
    tier: "high",
  };
}
