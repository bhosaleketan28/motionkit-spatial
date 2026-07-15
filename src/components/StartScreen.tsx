import { useEffect, useRef, useState } from "react";
import { getRigPreviewMedia } from "../preview/rigPreviewRuntime";
import type { AnyRigSettings, RegisteredRigDefinition } from "../rigs/types";
import { CenterStage } from "./CenterStage";

interface StartScreenProps {
  errorMessage: string | null;
  isInert: boolean;
  onBrowseRigs: (trigger: HTMLElement) => void;
  onOpenDemo: () => void;
  onUploadFiles: (files: FileList) => void;
  noticeMessage?: string | null;
  prefersReducedMotion: boolean;
  rig: RegisteredRigDefinition;
  rigs: readonly RegisteredRigDefinition[];
  settings: AnyRigSettings;
}

export function StartScreen({
  errorMessage,
  isInert,
  onBrowseRigs,
  onOpenDemo,
  onUploadFiles,
  noticeMessage,
  prefersReducedMotion,
  rig,
  rigs,
  settings,
}: StartScreenProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(!prefersReducedMotion);
  const [previewImages, setPreviewImages] = useState<Array<HTMLImageElement | null>>(
    () => Array.from({ length: rig.slotCount }, () => null),
  );
  const previewSettings: AnyRigSettings = { ...settings, frameRatio: "16:9" };
  const presetCount = rigs.reduce((total, availableRig) => total + availableRig.presets.length, 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsPreviewPlaying(false);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    let cancelled = false;
    setPreviewImages(Array.from({ length: rig.slotCount }, () => null));
    void getRigPreviewMedia(rig).then((images) => {
      if (!cancelled) {
        setPreviewImages(Array.from({ length: rig.slotCount }, (_, index) => images[index] ?? null));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [rig]);

  return (
    <main aria-hidden={isInert} className="start-screen" inert={isInert}>
      <div className="start-preview" aria-hidden="true">
        <CenterStage
          isPlaying={isPreviewPlaying}
          isRenderingPaused={isInert}
          onChangeFrameRatio={() => undefined}
          onTogglePlay={() => undefined}
          rig={rig}
          settings={previewSettings}
          slotImages={previewImages}
          variant="onboarding"
        />
      </div>

      <header className="start-brand">
        <strong>Hoppy</strong>
        <span>Private alpha</span>
      </header>

      <div className="start-preview-control">
        <span aria-hidden="true" className={isPreviewPlaying ? "playing" : ""} />
        <button
          aria-pressed={isPreviewPlaying}
          type="button"
          onClick={() => setIsPreviewPlaying((current) => !current)}
        >
          {isPreviewPlaying ? "Pause motion" : "Play motion"}
        </button>
      </div>

      <section className="start-content" aria-labelledby="start-heading">
        <p className="eyebrow">For product, editorial & brand designers</p>
        <h1 id="start-heading">Turn static visuals into motion.</h1>
        <p>Create cinematic motion from your visuals.</p>

        <div className="start-actions">
          <input
            accept={rig.mediaRequirements.acceptedTypes.join(",")}
            className="media-slot-input"
            multiple
            onChange={(event) => {
              if (event.target.files) {
                onUploadFiles(event.target.files);
              }
              event.currentTarget.value = "";
            }}
            ref={inputRef}
            type="file"
          />
          <button className="primary-button" type="button" onClick={() => inputRef.current?.click()}>
            Add your images
          </button>
          <button className="secondary-button" type="button" onClick={onOpenDemo}>
            Try a showcase
          </button>
          <button className="start-browse-rigs" data-rig-gallery-trigger type="button" onClick={(event) => onBrowseRigs(event.currentTarget)}>
            Browse motion systems
          </button>
        </div>

        {errorMessage ? <p className="start-error" role="alert">{errorMessage}</p> : null}
        {noticeMessage ? <p className="start-notice" role="status">{noticeMessage}</p> : null}

        <ul className="start-confidence" aria-label="Product capabilities">
          <li><strong>{rigs.length}</strong><span>motion systems</span></li>
          <li><strong>{presetCount}</strong><span>curated presets</span></li>
          <li><strong>Local</strong><span>WebM export</span></li>
        </ul>
      </section>
    </main>
  );
}
