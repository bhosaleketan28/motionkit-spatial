import { forwardRef, useImperativeHandle, useRef } from "react";

interface StageTransportProps {
  durationSeconds: number;
  isPlaying: boolean;
  onReplay: () => void;
  onScrubEnd: () => void;
  onScrubStart: () => void;
  onSeek: (progress: number) => void;
  onStep: (seconds: number) => void;
  onTogglePlay: () => void;
  rigName: string;
}

export interface StageTransportHandle {
  updateProgress: (progress: number, durationSeconds: number) => void;
}

export const StageTransport = forwardRef<StageTransportHandle, StageTransportProps>(
  function StageTransport(
    {
      durationSeconds,
      isPlaying,
      onReplay,
      onScrubEnd,
      onScrubStart,
      onSeek,
      onStep,
      onTogglePlay,
      rigName,
    },
    ref,
  ) {
    const currentTimeRef = useRef<HTMLSpanElement | null>(null);
    const scrubberRef = useRef<HTMLInputElement | null>(null);

    const paintProgress = (progress: number, duration: number) => {
      const clampedProgress = clampProgress(progress);
      const scrubber = scrubberRef.current;

      if (scrubber) {
        scrubber.value = clampedProgress.toString();
        scrubber.style.setProperty("--transport-progress", `${clampedProgress * 100}%`);
        scrubber.setAttribute(
          "aria-valuetext",
          `${formatTransportTime(clampedProgress * duration)} of ${formatTransportTime(duration)}`,
        );
      }

      if (currentTimeRef.current) {
        currentTimeRef.current.textContent = formatTransportTime(clampedProgress * duration);
      }
    };

    useImperativeHandle(ref, () => ({ updateProgress: paintProgress }));

    const handleSeek = (value: number) => {
      const progress = clampProgress(value);
      paintProgress(progress, durationSeconds);
      onSeek(progress);
    };

    const handleStepKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      onStep(direction * (event.shiftKey ? 0.25 : 1 / 30));
    };

    return (
      <div className="stage-transport" aria-label="Motion transport" role="group">
        <div className="transport-controls">
          <button
            aria-label={isPlaying ? "Pause preview (Space)" : "Play preview (Space)"}
            className="transport-button transport-play-button"
            type="button"
            onClick={onTogglePlay}
          >
            <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
          </button>
          <button
            aria-label="Replay from start"
            className="transport-button"
            type="button"
            onClick={onReplay}
          >
            <span aria-hidden="true">↺</span>
          </button>
        </div>

        <label className="transport-scrubber">
          <span className="sr-only">{rigName} loop scrubber</span>
          <input
            aria-label={`${rigName} loop scrubber`}
            max={1}
            min={0}
            ref={scrubberRef}
            step="any"
            type="range"
            defaultValue={0}
            onChange={(event) => handleSeek(Number(event.currentTarget.value))}
            onKeyDown={handleStepKey}
            onPointerCancel={onScrubEnd}
            onPointerDown={onScrubStart}
            onPointerUp={onScrubEnd}
          />
          <span className="transport-loop-line" aria-hidden="true" />
        </label>

        <div className="transport-time" aria-label="Loop time">
          <span aria-label="Current time" ref={currentTimeRef}>00:00.0</span>
          <span aria-hidden="true">/</span>
          <span aria-label="Total duration">{formatTransportTime(durationSeconds)}</span>
        </div>

        <span
          className={isPlaying ? "transport-loop-indicator playing" : "transport-loop-indicator"}
          aria-label="Loop playback enabled"
        >
          <span aria-hidden="true" />
          Loop
        </span>

        <span className="sr-only" aria-live="polite">
          {isPlaying ? "Preview playing" : "Preview paused"}
        </span>
      </div>
    );
  },
);

function clampProgress(progress: number) {
  return Math.min(1, Math.max(0, progress));
}

function formatTransportTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds - minutes * 60;

  return `${String(minutes).padStart(2, "0")}:${remainingSeconds.toFixed(1).padStart(4, "0")}`;
}
