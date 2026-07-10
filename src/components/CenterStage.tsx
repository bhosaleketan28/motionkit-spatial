import { useCallback, useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "../hooks/useAnimationFrame";
import { getFrameSize } from "../renderer/geometry";
import { renderOrbitCarousel } from "../renderer/canvasRenderer";
import type { FrameRatio, MotionRigDefinition, OrbitRigSettings } from "../rigs/types";

interface CenterStageProps {
  isPlaying: boolean;
  onChangeFrameRatio: (ratio: FrameRatio) => void;
  onTogglePlay: () => void;
  rig: MotionRigDefinition;
  settings: OrbitRigSettings;
  slotImages: Array<HTMLImageElement | null>;
  variant?: "editor" | "onboarding";
}

const frameRatios: FrameRatio[] = ["1:1", "16:9", "9:16"];

export function CenterStage({
  isPlaying,
  onChangeFrameRatio,
  onTogglePlay,
  rig,
  settings,
  slotImages,
  variant = "editor",
}: CenterStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const [fitVersion, setFitVersion] = useState(0);
  const frame = getFrameSize(settings.frameRatio);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    renderOrbitCarousel({
      context,
      frame,
      rig,
      progress: progressRef.current,
      renderFrameGuide: true,
      settings,
      slotImages,
    });
  }, [frame, rig, settings, slotImages]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;

    if (!canvas || !stage) {
      return;
    }

    const syncCanvasSize = () => {
      const bounds = stage.getBoundingClientRect();
      const isOnboarding = variant === "onboarding";
      const maxWidth = Math.max(280, bounds.width - (isOnboarding ? 32 : 56));
      const maxHeight = Math.max(280, bounds.height - (isOnboarding ? 32 : 116));
      const frameAspect = frame.width / frame.height;
      const stageAspect = maxWidth / maxHeight;
      const displayWidth = stageAspect > frameAspect ? maxHeight * frameAspect : maxWidth;
      const displayHeight = displayWidth / frameAspect;
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      canvas.width = Math.round(frame.width * pixelRatio);
      canvas.height = Math.round(frame.height * pixelRatio);

      const context = canvas.getContext("2d");
      if (context) {
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        draw();
      }
    };

    syncCanvasSize();

    const observer = new ResizeObserver(syncCanvasSize);
    observer.observe(stage);

    return () => observer.disconnect();
  }, [draw, fitVersion, frame.height, frame.width, variant]);

  useAnimationFrame(
    (deltaMs) => {
      const loopMs = settings.durationSeconds * 1000;
      progressRef.current = (progressRef.current + deltaMs / loopMs) % 1;
      draw();
    },
    isPlaying,
  );

  useEffect(() => {
    draw();
  }, [draw, isPlaying]);

  return (
    <section
      className={variant === "onboarding" ? "center-stage onboarding-stage" : "center-stage"}
      ref={stageRef}
      aria-label="Canvas preview"
    >
      {variant === "editor" ? (
        <div className="stage-toolbar">
          <div className="stage-title">
            <span className={isPlaying ? "live-indicator playing" : "live-indicator"} />
            <strong>{rig.name}</strong>
          </div>
          <div className="stage-actions">
            <button className="toolbar-button" type="button" onClick={onTogglePlay}>
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button className="toolbar-button" type="button" onClick={() => setFitVersion((value) => value + 1)}>
              Fit
            </button>
            <div className="stage-ratio-control" aria-label="Frame ratio">
              {frameRatios.map((ratio) => (
                <button
                  className={settings.frameRatio === ratio ? "selected" : ""}
                  key={ratio}
                  type="button"
                  onClick={() => onChangeFrameRatio(ratio)}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="canvas-wrap">
        <canvas
          aria-label="Animated Orbit Carousel placeholder preview"
          className="preview-canvas"
          ref={canvasRef}
        />
      </div>
    </section>
  );
}
