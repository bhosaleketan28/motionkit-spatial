import type { AnyRigSettings, RegisteredRigDefinition } from "../rigs/types";

const previewMediaCache = new Map<string, Promise<Array<HTMLImageElement | null>>>();

export function getRigPreviewSettings(rig: RegisteredRigDefinition): AnyRigSettings {
  const settings = {
    ...rig.defaultSettings,
    ...rig.preview.settingsOverride,
    background: {
      ...rig.defaultSettings.background,
      ...rig.preview.backgroundOverride,
      ...rig.preview.settingsOverride.background,
    },
    frameRatio: rig.preview.ratio,
  };
  return rig.isSettings(settings) ? settings : {
    ...rig.defaultSettings,
    background: { ...rig.defaultSettings.background },
  };
}

export function getRigPreviewMedia(rig: RegisteredRigDefinition) {
  const cacheKey = `${rig.id}@${rig.version}:${rig.preview.mediaCount}`;
  const cached = previewMediaCache.get(cacheKey);
  if (cached) return cached;

  const loading = Promise.all(
    rig.preview.generateMedia().slice(0, rig.preview.mediaCount).map((media) => decodeImage(media.src)),
  );
  previewMediaCache.set(cacheKey, loading);
  return loading;
}

function decodeImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0 ? image : null);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}
