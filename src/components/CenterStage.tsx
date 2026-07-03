import { useCallback, useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "../hooks/useAnimationFrame";
import { getFrameSize } from "../renderer/geometry";
import { renderOrbitCarousel } from "../renderer/canvasRenderer";
import type { MotionRigDefinition, OrbitRigSettings } from "../rigs/types";

interface CenterStageProps {
  rig: MotionRigDefinition;
  settings: OrbitRigSettings;
  slotImages: Array<HTMLImageElement | null>;
}

export function CenterStage({ rig, settings, slotImages }: CenterStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(true);
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
      const maxWidth = Math.max(280, bounds.width - 48);
      const maxHeight = Math.max(280, bounds.height - 148);
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
  }, [draw, frame.height, frame.width]);

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
    <section className="center-stage" ref={stageRef} aria-label="Canvas preview">
      <div className="stage-header">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>{rig.name}</h2>
        </div>
        <button
          className="primary-control"
          type="button"
          onClick={() => setIsPlaying((current) => !current)}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

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
