import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useAnimationFrame } from "../hooks/useAnimationFrame";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { getPreviewQuality } from "../preview/previewQuality";
import { getFrameSize } from "../renderer/geometry";
import type { AnyRigSettings, FrameRatio, RegisteredRigDefinition } from "../rigs/types";
import { StageTransport } from "./StageTransport";
import type { StageTransportHandle } from "./StageTransport";

interface CenterStageProps {
  isFitMode?: boolean;
  initialProgress?: number;
  isInspectorOpen?: boolean;
  isMediaOpen?: boolean;
  isPlaying: boolean;
  isRenderingPaused?: boolean;
  isStageOnly?: boolean;
  onChangeFrameRatio: (ratio: FrameRatio) => void;
  onFit?: () => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
  onPlaybackStarted?: () => void;
  onToggleInspector?: () => void;
  onToggleMedia?: () => void;
  onTogglePlay: () => void;
  onToggleStageOnly?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  rig: RegisteredRigDefinition;
  selectedSlotIndex?: number;
  settings: AnyRigSettings;
  slotImages: Array<HTMLImageElement | null>;
  variant?: "editor" | "onboarding";
  zoomPercent?: number;
}

export interface CenterStageHandle {
  getProgress: () => number;
  resetProgress: () => void;
  stepBySeconds: (seconds: number) => void;
}

export const CenterStage = forwardRef<CenterStageHandle, CenterStageProps>(function CenterStage({
  isFitMode = true,
  initialProgress = 0,
  isInspectorOpen = false,
  isMediaOpen = false,
  isPlaying,
  isRenderingPaused = false,
  isStageOnly = false,
  onChangeFrameRatio,
  onFit = () => undefined,
  onPlaybackChange = () => undefined,
  onPlaybackStarted = () => undefined,
  onToggleInspector = () => undefined,
  onToggleMedia = () => undefined,
  onTogglePlay,
  onToggleStageOnly = () => undefined,
  onZoomIn = () => undefined,
  onZoomOut = () => undefined,
  rig,
  selectedSlotIndex,
  settings,
  slotImages,
  variant = "editor",
  zoomPercent = 100,
}: CenterStageProps, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasSurfaceRef = useRef<HTMLDivElement | null>(null);
  const drawRef = useRef<() => void>(() => undefined);
  const stageDescriptionRef = useRef<HTMLParagraphElement | null>(null);
  const lastDescriptionSecondRef = useRef(-1);
  const lastMeasurementRef = useRef({
    containerHeight: 0,
    containerWidth: 0,
    displayHeight: 0,
    displayWidth: 0,
    pixelRatio: 0,
  });
  const progressRef = useRef(Math.min(1, Math.max(0, initialProgress)));
  const resizeFrameRef = useRef<number | null>(null);
  const resumeAfterScrubRef = useRef(false);
  const isScrubbingRef = useRef(false);
  const transportRef = useRef<StageTransportHandle | null>(null);
  const [fitFeedback, setFitFeedback] = useState(false);
  const isMobilePreview = useMediaQuery("(max-width: 680px)");
  const previewFrameRate = getPreviewQuality(
    isMobilePreview ? 680 : 1440,
    1,
  ).stageFps;
  const frame = getFrameSize(settings.frameRatio);
  const loadedMediaCount = slotImages.filter(Boolean).length;

  const updateStageDescription = useCallback(
    (progress: number, force = false) => {
      if (variant !== "editor" || !stageDescriptionRef.current) {
        return;
      }
      const currentSeconds = progress * settings.durationSeconds;
      const wholeSecond = Math.floor(currentSeconds);
      if (!force && lastDescriptionSecondRef.current === wholeSecond) {
        return;
      }
      lastDescriptionSecondRef.current = wholeSecond;
      stageDescriptionRef.current.textContent = [
        `${rig.name} motion system.`,
        rig.accessibilityDescription,
        `${loadedMediaCount} of ${rig.slotCount} media items loaded.`,
        `${settings.frameRatio} frame ratio.`,
        isPlaying ? "Playback is running." : "Playback is paused.",
        `Current time ${formatAccessibleTime(currentSeconds)} of ${formatAccessibleTime(settings.durationSeconds)}.`,
      ].join(" ");
    },
    [isPlaying, loadedMediaCount, rig.accessibilityDescription, rig.name, rig.slotCount, settings.durationSeconds, settings.frameRatio, variant],
  );

  const draw = useCallback(() => {
    if (isRenderingPaused) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    rig.render({
      context,
      frame,
      progress: progressRef.current,
      renderFrameGuide: true,
      selectedSlotIndex,
      settings,
      slotCount: rig.slotCount,
      slotImages,
    });
    updateStageDescription(progressRef.current);
  }, [frame, isRenderingPaused, rig, selectedSlotIndex, settings, slotImages, updateStageDescription]);

  drawRef.current = draw;

  const updateProgress = useCallback((progress: number) => {
    const clampedProgress = Math.min(1, Math.max(0, progress));
    progressRef.current = clampedProgress;
    transportRef.current?.updateProgress(clampedProgress, settings.durationSeconds);
    draw();
  }, [draw, settings.durationSeconds]);

  const stepBySeconds = useCallback((seconds: number) => {
    onPlaybackChange(false);
    updateProgress(progressRef.current + seconds / settings.durationSeconds);
  }, [onPlaybackChange, settings.durationSeconds, updateProgress]);

  useImperativeHandle(ref, () => ({
    getProgress: () => progressRef.current,
    resetProgress: () => updateProgress(0),
    stepBySeconds,
  }), [stepBySeconds, updateProgress]);

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
      const pixelRatio = getPreviewQuality(
        window.innerWidth,
        window.devicePixelRatio || 1,
      ).stagePixelRatio;
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

      if (bounds.width < 1 || bounds.height < 1) {
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
        drawRef.current();
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
  }, [frame.height, frame.width, isFitMode, variant, zoomPercent]);

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
      if (isScrubbingRef.current) {
        return;
      }

      const loopMs = settings.durationSeconds * 1000;
      progressRef.current = (progressRef.current + deltaMs / loopMs) % 1;
      transportRef.current?.updateProgress(progressRef.current, settings.durationSeconds);
      draw();
    },
    isPlaying && !isRenderingPaused,
    previewFrameRate,
  );

  useEffect(() => {
    transportRef.current?.updateProgress(progressRef.current, settings.durationSeconds);
    updateStageDescription(progressRef.current, true);
    draw();
  }, [draw, isPlaying, settings.durationSeconds, updateStageDescription]);

  const handleReplay = () => {
    updateProgress(0);
    onPlaybackStarted();
    onPlaybackChange(true);
  };

  const handleScrubStart = () => {
    isScrubbingRef.current = true;
    resumeAfterScrubRef.current = isPlaying;
    if (isPlaying) {
      onPlaybackChange(false);
    }
  };

  const handleScrubEnd = () => {
    isScrubbingRef.current = false;
    if (resumeAfterScrubRef.current) {
      onPlaybackChange(true);
    }
    resumeAfterScrubRef.current = false;
  };

  return (
    <section
      aria-describedby={variant === "editor" ? "stage-accessible-description" : undefined}
      className={variant === "onboarding" ? "center-stage onboarding-stage" : "center-stage"}
      aria-label="Canvas preview"
      id={variant === "editor" ? "workspace-stage" : undefined}
      tabIndex={variant === "editor" ? 0 : undefined}
    >
      {variant === "editor" ? (
        <p className="sr-only" id="stage-accessible-description" ref={stageDescriptionRef} />
      ) : null}
      {variant === "editor" ? (
        <div className="stage-toolbar">
          <div className="stage-leading-actions">
            <div className="stage-title">
              <span className={isPlaying ? "live-indicator playing" : "live-indicator"} />
              <strong>{rig.name}</strong>
            </div>
            <div className="stage-panel-controls" aria-label="Workspace panels" role="group">
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
            <div className="zoom-control" aria-label="Stage zoom" role="group">
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
            <label className="stage-ratio-control">
              <span>Ratio</span>
              <select
                aria-label="Frame ratio"
                value={settings.frameRatio}
                onChange={(event) => onChangeFrameRatio(event.currentTarget.value as FrameRatio)}
              >
                {rig.supportedRatios.map((ratio) => (
                  <option key={ratio} value={ratio}>{ratio}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      <div className="canvas-wrap" ref={canvasWrapRef}>
        <div className="canvas-scroll-surface" ref={canvasSurfaceRef}>
          <canvas
            aria-label={`${rig.name} visual preview`}
            className="preview-canvas"
            ref={canvasRef}
          />
        </div>
      </div>

      {variant === "editor" ? (
        <StageTransport
          durationSeconds={settings.durationSeconds}
          isPlaying={isPlaying}
          onReplay={handleReplay}
          onScrubEnd={handleScrubEnd}
          onScrubStart={handleScrubStart}
          onSeek={updateProgress}
          onStep={stepBySeconds}
          onTogglePlay={onTogglePlay}
          rigName={rig.name}
          ref={transportRef}
        />
      ) : null}
    </section>
  );
});

function formatAccessibleTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds - minutes * 60);
  return minutes > 0
    ? `${minutes} minute${minutes === 1 ? "" : "s"} ${remainingSeconds} seconds`
    : `${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"}`;
}
