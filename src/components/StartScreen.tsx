import { useEffect, useRef, useState } from "react";
import type { MotionRigDefinition, OrbitRigSettings } from "../rigs/types";
import { CenterStage } from "./CenterStage";

interface StartScreenProps {
  errorMessage: string | null;
  onLoadDemo: () => void;
  onUploadFiles: (files: FileList) => void;
  noticeMessage?: string | null;
  prefersReducedMotion: boolean;
  rig: MotionRigDefinition;
  settings: OrbitRigSettings;
}

export function StartScreen({
  errorMessage,
  onLoadDemo,
  onUploadFiles,
  noticeMessage,
  prefersReducedMotion,
  rig,
  settings,
}: StartScreenProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(!prefersReducedMotion);
  const previewSettings: OrbitRigSettings = { ...settings, frameRatio: "16:9" };

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsPreviewPlaying(false);
    }
  }, [prefersReducedMotion]);

  return (
    <main className="start-screen">
      <div className="start-preview" aria-hidden="true">
        <CenterStage
          isPlaying={isPreviewPlaying}
          onChangeFrameRatio={() => undefined}
          onTogglePlay={() => undefined}
          rig={rig}
          settings={previewSettings}
          slotImages={Array.from({ length: rig.mediaSlotCount }, () => null)}
          variant="onboarding"
        />
      </div>

      <header className="start-brand">
        <strong>MotionKit Spatial</strong>
        <span>Private alpha</span>
      </header>

      <button
        className="start-preview-toggle"
        type="button"
        onClick={() => setIsPreviewPlaying((current) => !current)}
      >
        {isPreviewPlaying ? "Pause preview" : "Play preview"}
      </button>

      <section className="start-content" aria-labelledby="start-heading">
        <p className="eyebrow">Orbit Carousel</p>
        <h1 id="start-heading">Create spatial motion from your screenshots.</h1>
        <p>Add 1–4 images, shape the orbit, and export a clean looping WebM.</p>

        <div className="start-actions">
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
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
          <button className="secondary-button" type="button" onClick={onLoadDemo}>
            Start with demo
          </button>
        </div>

        {errorMessage ? <p className="start-error" role="alert">{errorMessage}</p> : null}
        {noticeMessage ? <p className="start-notice" role="status">{noticeMessage}</p> : null}

        <ul className="start-metadata" aria-label="Orbit Carousel details">
          <li>Orbit Carousel</li>
          <li>1–4 local images</li>
          <li>Looping WebM</li>
          <li>1:1 · 16:9 · 9:16</li>
        </ul>
      </section>
    </main>
  );
}
