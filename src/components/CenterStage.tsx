import { useCallback, useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "../hooks/useAnimationFrame";
import { getFrameSize } from "../renderer/geometry";
import { renderOrbitCarousel } from "../renderer/canvasRenderer";
import type { FrameRatio, MotionRigDefinition, OrbitRigSettings } from "../rigs/types";

interface CenterStageProps {
  isFitMode?: boolean;
  isInspectorOpen?: boolean;
  isMediaOpen?: boolean;
  isPlaying: boolean;
  isStageOnly?: boolean;
  onChangeFrameRatio: (ratio: FrameRatio) => void;
  onFit?: () => void;
  onToggleInspector?: () => void;
  onToggleMedia?: () => void;
  onTogglePlay: () => void;
  onToggleStageOnly?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  rig: MotionRigDefinition;
  settings: OrbitRigSettings;
  slotImages: Array<HTMLImageElement | null>;
  variant?: "editor" | "onboarding";
  zoomPercent?: number;
}

const frameRatios: FrameRatio[] = ["1:1", "16:9", "9:16"];

export function CenterStage({
  isFitMode = true,
  isInspectorOpen = false,
  isMediaOpen = false,
  isPlaying,
  isStageOnly = false,
  onChangeFrameRatio,
  onFit = () => undefined,
  onToggleInspector = () => undefined,
  onToggleMedia = () => undefined,
  onTogglePlay,
  onToggleStageOnly = () => undefined,
  onZoomIn = () => undefined,
  onZoomOut = () => undefined,
  rig,
  settings,
  slotImages,
  variant = "editor",
  zoomPercent = 100,
}: CenterStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasSurfaceRef = useRef<HTMLDivElement | null>(null);
  const lastMeasurementRef = useRef({
    containerHeight: 0,
    containerWidth: 0,
    displayHeight: 0,
    displayWidth: 0,
    pixelRatio: 0,
  });
  const progressRef = useRef(0);
  const resizeFrameRef = useRef<number | null>(null);
  const [fitFeedback, setFitFeedback] = useState(false);
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
    const canvasWrap = canvasWrapRef.current;
    const canvasSurface = canvasSurfaceRef.current;

    if (!canvas || !canvasWrap || !canvasSurface) {
      return;
    }

    const syncCanvasSize = () => {
      resizeFrameRef.current = null;
      const bounds = canvasWrap.getBoundingClientRect();
      const isOnboarding = variant === "onboarding";
      const inset = isOnboarding ? 0 : 32;
      const maxWidth = Math.max(1, bounds.width - inset);
      const maxHeight = Math.max(1, bounds.height - inset);
      const frameAspect = frame.width / frame.height;
      const stageAspect = maxWidth / maxHeight;
      const fitWidth = stageAspect > frameAspect ? maxHeight * frameAspect : maxWidth;
      const scale = variant === "onboarding" || isFitMode ? 1 : zoomPercent / 100;
      const displayWidth = Math.max(1, fitWidth * scale);
      const displayHeight = Math.max(1, displayWidth / frameAspect);
      const pixelRatio = window.devicePixelRatio || 1;
      const previous = lastMeasurementRef.current;
      const measurementIsStable =
        Math.abs(previous.containerWidth - bounds.width) < 0.5 &&
        Math.abs(previous.containerHeight - bounds.height) < 0.5 &&
        Math.abs(previous.displayWidth - displayWidth) < 0.5 &&
        Math.abs(previous.displayHeight - displayHeight) < 0.5 &&
        previous.pixelRatio === pixelRatio;

      if (measurementIsStable) {
        return;
      }

      lastMeasurementRef.current = {
        containerHeight: bounds.height,
        containerWidth: bounds.width,
        displayHeight,
        displayWidth,
        pixelRatio,
      };

      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      canvasSurface.style.width = `${Math.max(bounds.width, displayWidth + inset)}px`;
      canvasSurface.style.height = `${Math.max(bounds.height, displayHeight + inset)}px`;

      const pixelWidth = Math.round(frame.width * pixelRatio);
      const pixelHeight = Math.round(frame.height * pixelRatio);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      const context = canvas.getContext("2d");
      if (context) {
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        draw();
      }
    };

    const scheduleCanvasSync = () => {
      if (resizeFrameRef.current !== null) {
        return;
      }

      resizeFrameRef.current = window.requestAnimationFrame(syncCanvasSize);
    };

    scheduleCanvasSync();

    const observer = new ResizeObserver(scheduleCanvasSync);
    observer.observe(canvasWrap);

    return () => {
      observer.disconnect();
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
    };
  }, [draw, frame.height, frame.width, isFitMode, variant, zoomPercent]);

  useEffect(() => {
    if (!isFitMode || variant !== "editor") {
      setFitFeedback(false);
      return;
    }

    setFitFeedback(true);
    const timeout = window.setTimeout(() => setFitFeedback(false), 900);
    return () => window.clearTimeout(timeout);
  }, [isFitMode, settings.frameRatio, variant]);

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
      aria-label="Canvas preview"
      tabIndex={variant === "editor" ? 0 : undefined}
    >
      {variant === "editor" ? (
        <div className="stage-toolbar">
          <div className="stage-leading-actions">
            <div className="stage-title">
              <span className={isPlaying ? "live-indicator playing" : "live-indicator"} />
              <strong>{rig.name}</strong>
            </div>
            <div className="stage-panel-controls" aria-label="Workspace panels">
              <button
                aria-controls="media-panel"
                aria-expanded={isMediaOpen}
                aria-label={isMediaOpen ? "Hide media panel" : "Show media panel"}
                className={isMediaOpen ? "toolbar-button selected" : "toolbar-button"}
                id="media-panel-toggle"
                type="button"
                onClick={onToggleMedia}
              >
                Media
              </button>
              <button
                aria-controls="inspector-panel"
                aria-expanded={isInspectorOpen}
                aria-label={isInspectorOpen ? "Hide inspector panel" : "Show inspector panel"}
                className={isInspectorOpen ? "toolbar-button selected" : "toolbar-button"}
                id="inspector-panel-toggle"
                type="button"
                onClick={onToggleInspector}
              >
                Inspector
              </button>
            </div>
          </div>
          <div className="stage-actions">
            <button
              aria-label={isPlaying ? "Pause preview (Space)" : "Play preview (Space)"}
              className="toolbar-button playback-button"
              type="button"
              onClick={onTogglePlay}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <div className="zoom-control" aria-label="Stage zoom">
              <button
                aria-label="Zoom out"
                disabled={zoomPercent <= 50}
                type="button"
                onClick={onZoomOut}
              >
                −
              </button>
              <output aria-live="polite" aria-label={`Zoom ${zoomPercent} percent`}>
                {zoomPercent}%
              </output>
              <button
                aria-label="Zoom in"
                disabled={zoomPercent >= 200}
                type="button"
                onClick={onZoomIn}
              >
                +
              </button>
            </div>
            <button
              aria-label="Fit canvas to window (0)"
              aria-pressed={isFitMode}
              className={isFitMode ? "toolbar-button fit-button selected" : "toolbar-button fit-button"}
              type="button"
              onClick={onFit}
            >
              {fitFeedback ? "Fitted" : "Fit"}
            </button>
            <button
              aria-label={isStageOnly ? "Exit stage-only mode (Shift+F)" : "Enter stage-only mode (Shift+F)"}
              aria-pressed={isStageOnly}
              className={isStageOnly ? "toolbar-button stage-only-button selected" : "toolbar-button stage-only-button"}
              type="button"
              onClick={onToggleStageOnly}
            >
              Focus
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

      <div className="canvas-wrap" ref={canvasWrapRef}>
        <div className="canvas-scroll-surface" ref={canvasSurfaceRef}>
          <canvas
            aria-label="Animated Orbit Carousel preview"
            className="preview-canvas"
            ref={canvasRef}
          />
        </div>
      </div>
    </section>
  );
}
