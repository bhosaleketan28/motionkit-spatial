import { useEffect, useMemo, useRef, useState } from "react";
import { exportOrbitCarouselPng } from "../export/exportPng";
import { exportOrbitCarouselWebm } from "../export/exportWebm";
import {
  createDefaultExportFileName,
  detectExportCapability,
  downloadBlob,
  ExportProcessError,
  formatCodecName,
  formatFileSize,
  getExportFrameSize,
  normalizeExportFileName,
  throwIfExportCancelled,
} from "../export/exportSettings";
import type {
  ExportArtifact,
  ExportFormat,
  ExportFps,
  ExportPhase,
  ExportProgress,
  ExportQuality,
  ExportRenderInput,
  ExportStatus,
} from "../export/exportSettings";
import type { MotionRigDefinition, OrbitRigSettings } from "../rigs/types";

interface ExportSheetProps {
  mediaIssue: string | null;
  onClose: () => void;
  onStatusChange: (status: ExportStatus) => void;
  rig: MotionRigDefinition;
  settings: OrbitRigSettings;
  slotImages: Array<HTMLImageElement | null>;
}

type ExportView = "review" | "running" | "complete" | "cancelled" | "error";

const EXPORT_PHASES: ExportPhase[] = [
  "preparing",
  "rendering",
  "encoding",
  "finalizing",
  "downloading",
  "complete",
];

const INITIAL_PROGRESS: ExportProgress = {
  elapsedMs: 0,
  phase: "preparing",
  progress: 0,
  remainingMs: null,
};

export function ExportSheet({
  mediaIssue,
  onClose,
  onStatusChange,
  rig,
  settings,
  slotImages,
}: ExportSheetProps) {
  const capability = useMemo(detectExportCapability, []);
  const initialFormat: ExportFormat = capability.webmSupported ? "webm" : "png";
  const dialogRef = useRef<HTMLElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement | null);
  const lastProgressPaintRef = useRef(0);
  const lastProgressPhaseRef = useRef<ExportPhase>("preparing");
  const latestProgressRef = useRef<ExportProgress>(INITIAL_PROGRESS);
  const [view, setView] = useState<ExportView>("review");
  const [format, setFormat] = useState<ExportFormat>(initialFormat);
  const [fps, setFps] = useState<ExportFps>(60);
  const [quality, setQuality] = useState<ExportQuality>("standard");
  const [fileName, setFileName] = useState(() =>
    createDefaultExportFileName({ rig, settings }, initialFormat),
  );
  const [pngConsent, setPngConsent] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>(INITIAL_PROGRESS);
  const [artifact, setArtifact] = useState<ExportArtifact | null>(null);
  const [error, setError] = useState<ExportProcessError | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const frame = getExportFrameSize(settings.frameRatio, quality);
  const isRunning = view === "running";

  useEffect(() => {
    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>("[data-export-view-focus]")
        ?.focus();
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [view]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!isRunning) {
          onClose();
        }
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, onClose]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      previousFocusRef.current?.focus();
    };
  }, []);

  const closeSheet = () => {
    if (!isRunning) {
      onClose();
    }
  };

  const updateProgress = (nextProgress: ExportProgress) => {
    latestProgressRef.current = nextProgress;
    const now = performance.now();
    const phaseChanged = nextProgress.phase !== lastProgressPhaseRef.current;
    if (phaseChanged || now - lastProgressPaintRef.current >= 80 || nextProgress.progress >= 0.94) {
      lastProgressPaintRef.current = now;
      lastProgressPhaseRef.current = nextProgress.phase;
      setProgress(nextProgress);
    }
  };

  const startExport = async () => {
    if (mediaIssue || (format === "png" && !pngConsent)) {
      return;
    }

    const controller = new AbortController();
    const input: ExportRenderInput = { rig, settings, slotImages };
    const normalizedFileName = normalizeExportFileName(fileName, format);
    abortControllerRef.current = controller;
    setFileName(normalizedFileName);
    setArtifact(null);
    setError(null);
    setIsCancelling(false);
    setProgress(INITIAL_PROGRESS);
    setView("running");
    onStatusChange("exporting");

    try {
      const options = {
        fileName: normalizedFileName,
        fps,
        quality,
        signal: controller.signal,
        onProgress: updateProgress,
      };
      const result =
        format === "webm"
          ? await exportOrbitCarouselWebm(input, options)
          : await exportOrbitCarouselPng(input, options);

      throwIfExportCancelled(controller.signal);
      const downloadingProgress: ExportProgress = {
        elapsedMs: latestProgressRef.current.elapsedMs,
        phase: "downloading",
        progress: 0.98,
        remainingMs: null,
      };
      setProgress(downloadingProgress);
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      throwIfExportCancelled(controller.signal);
      downloadBlob(result.blob, result.fileName);
      setProgress({
        elapsedMs: downloadingProgress.elapsedMs,
        phase: "complete",
        progress: 1,
        remainingMs: 0,
      });
      setArtifact(result);
      setView("complete");
      onStatusChange(result.format === "webm" ? "done" : "fallback");
    } catch (caughtError) {
      const processError =
        caughtError instanceof ExportProcessError
          ? caughtError
          : new ExportProcessError(
              "encoding",
              "The export ended unexpectedly before a file could be created.",
            );

      if (processError.code === "cancelled") {
        setView("cancelled");
        onStatusChange("cancelled");
      } else {
        setError(processError);
        setView("error");
        onStatusChange("error");
      }
    } finally {
      abortControllerRef.current = null;
      setIsCancelling(false);
    }
  };

  const cancelExport = () => {
    if (!abortControllerRef.current || isCancelling) {
      return;
    }
    setIsCancelling(true);
    abortControllerRef.current.abort();
  };

  const selectFormat = (nextFormat: ExportFormat) => {
    setFormat(nextFormat);
    setFileName((current) => normalizeExportFileName(current, nextFormat));
    setPngConsent(false);
    setError(null);
    setView("review");
    onStatusChange("ready");
  };

  const returnToReview = () => {
    setArtifact(null);
    setError(null);
    setProgress(INITIAL_PROGRESS);
    setView("review");
    onStatusChange("ready");
  };

  return (
    <div className="export-modal-layer">
      <button
        aria-label="Close export"
        className="export-modal-scrim"
        disabled={isRunning}
        type="button"
        onClick={closeSheet}
      />
      <section
        aria-labelledby="export-dialog-title"
        aria-modal="true"
        className={`export-sheet export-view-${view}`}
        ref={dialogRef}
        role="dialog"
      >
        <header className="export-sheet-header">
          <div>
            <p className="eyebrow">Local export</p>
            <h2 id="export-dialog-title">Export {rig.name}</h2>
          </div>
          <div className="export-header-actions">
            <span className={`export-phase-badge phase-${view}`}>{formatViewLabel(view)}</span>
            <button
              aria-label="Close export"
              className="export-close-button"
              disabled={isRunning}
              type="button"
              onClick={closeSheet}
            >
              ×
            </button>
          </div>
        </header>

        <div className="export-sheet-body">
          {view === "review" ? (
            <ExportReview
              capability={capability}
              fileName={fileName}
              format={format}
              fps={fps}
              frame={frame}
              mediaIssue={mediaIssue}
              pngConsent={pngConsent}
              quality={quality}
              settings={settings}
              onFileNameChange={setFileName}
              onFpsChange={setFps}
              onPngConsentChange={setPngConsent}
              onQualityChange={setQuality}
              onSelectFormat={selectFormat}
            />
          ) : null}

          {view === "running" ? (
            <ExportRunning
              isCancelling={isCancelling}
              progress={progress}
              onCancel={cancelExport}
            />
          ) : null}

          {view === "complete" && artifact ? (
            <ExportComplete artifact={artifact} onClose={closeSheet} onExportAgain={returnToReview} />
          ) : null}

          {view === "cancelled" ? (
            <ExportMessage
              eyebrow="Cancelled"
              message="The render stopped safely. No partial file was downloaded."
              title="Export cancelled"
            />
          ) : null}

          {view === "error" && error ? (
            <ExportMessage
              eyebrow={formatErrorCode(error.code)}
              message={error.message}
              title="Export could not complete"
            />
          ) : null}
        </div>

        {view === "review" ? (
          <footer className="export-sheet-footer">
            <button className="secondary-button" type="button" onClick={closeSheet}>Cancel</button>
            <button
              className="primary-button export-primary-action"
              data-export-view-focus
              disabled={Boolean(mediaIssue) || (format === "png" && !pngConsent)}
              type="button"
              onClick={startExport}
            >
              {format === "webm" ? "Export WebM" : "Export PNG snapshot"}
            </button>
          </footer>
        ) : null}

        {view === "cancelled" ? (
          <footer className="export-sheet-footer">
            <button className="secondary-button" type="button" onClick={closeSheet}>Close</button>
            <button className="primary-button" data-export-view-focus type="button" onClick={returnToReview}>
              Return to export
            </button>
          </footer>
        ) : null}

        {view === "error" && error ? (
          <footer className="export-sheet-footer export-error-actions">
            <button className="secondary-button" type="button" onClick={closeSheet}>Close</button>
            {format === "webm" ? (
              <button className="secondary-button" type="button" onClick={() => selectFormat("png")}>
                Use PNG snapshot instead
              </button>
            ) : null}
            <button className="primary-button" data-export-view-focus type="button" onClick={returnToReview}>
              Review and retry
            </button>
          </footer>
        ) : null}
      </section>
    </div>
  );
}

interface ExportReviewProps {
  capability: ReturnType<typeof detectExportCapability>;
  fileName: string;
  format: ExportFormat;
  fps: ExportFps;
  frame: { width: number; height: number };
  mediaIssue: string | null;
  onFileNameChange: (fileName: string) => void;
  onFpsChange: (fps: ExportFps) => void;
  onPngConsentChange: (consent: boolean) => void;
  onQualityChange: (quality: ExportQuality) => void;
  onSelectFormat: (format: ExportFormat) => void;
  pngConsent: boolean;
  quality: ExportQuality;
  settings: OrbitRigSettings;
}

function ExportReview({
  capability,
  fileName,
  format,
  fps,
  frame,
  mediaIssue,
  onFileNameChange,
  onFpsChange,
  onPngConsentChange,
  onQualityChange,
  onSelectFormat,
  pngConsent,
  quality,
  settings,
}: ExportReviewProps) {
  const estimatedSeconds =
    format === "png" ? null : settings.durationSeconds + (quality === "high" ? 2.5 : 1.5);

  return (
    <div className="export-review">
      <div className={`export-capability capability-${capability.status}`}>
        <span className="export-capability-dot" aria-hidden="true" />
        <div>
          <strong>{capability.label}</strong>
          <p>{capability.message}</p>
        </div>
        <small>{formatCodecName(capability.mimeType)}</small>
      </div>

      {mediaIssue ? <p className="export-callout error" role="alert">{mediaIssue}</p> : null}

      <label className="export-filename-field">
        <span>Filename</span>
        <input
          aria-label="Export filename"
          data-export-view-focus
          maxLength={140}
          type="text"
          value={fileName}
          onBlur={() => onFileNameChange(normalizeExportFileName(fileName, format))}
          onChange={(event) => onFileNameChange(event.currentTarget.value)}
        />
        <small>Final file: {normalizeExportFileName(fileName, format)}</small>
      </label>

      <div className="export-setting-grid">
        <fieldset className="export-choice-field">
          <legend>Frames per second</legend>
          <div className="export-segmented-control">
            {([30, 60] as ExportFps[]).map((option) => (
              <button
                aria-pressed={fps === option}
                className={fps === option ? "selected" : ""}
                disabled={format === "png"}
                key={option}
                type="button"
                onClick={() => onFpsChange(option)}
              >
                {option} FPS
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="export-choice-field">
          <legend>Quality</legend>
          <div className="export-segmented-control">
            {(["standard", "high"] as ExportQuality[]).map((option) => (
              <button
                aria-pressed={quality === option}
                className={quality === option ? "selected" : ""}
                key={option}
                type="button"
                onClick={() => onQualityChange(option)}
              >
                {option === "standard" ? "Standard" : "High"}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <dl className="export-review-details">
        <div><dt>Format</dt><dd>{format === "webm" ? "WebM video" : "PNG snapshot"}</dd></div>
        <div><dt>Dimensions</dt><dd>{frame.width} × {frame.height}</dd></div>
        <div><dt>Frame ratio</dt><dd>{settings.frameRatio}</dd></div>
        <div><dt>Duration</dt><dd>{settings.durationSeconds.toFixed(1)} seconds</dd></div>
        <div><dt>FPS</dt><dd>{format === "webm" ? `${fps} FPS` : "Not applicable"}</dd></div>
        <div><dt>Background</dt><dd>{formatBackgroundMode(settings.background.mode)}</dd></div>
        <div><dt>Estimated time</dt><dd>{estimatedSeconds ? `About ${estimatedSeconds.toFixed(1)} seconds` : "Usually under 1 second"}</dd></div>
      </dl>

      {format === "webm" ? (
        <div className="export-alternative">
          <span>Need one still frame instead of a looping video?</span>
          <button className="quiet-button" type="button" onClick={() => onSelectFormat("png")}>
            Review PNG snapshot
          </button>
        </div>
      ) : null}

      {format === "png" ? (
        <div className="export-png-consent">
          <p>
            PNG creates one still frame at the start of the loop. It is not a video replacement.
          </p>
          <label>
            <input
              checked={pngConsent}
              type="checkbox"
              onChange={(event) => onPngConsentChange(event.currentTarget.checked)}
            />
            <span>I understand this will export a single PNG snapshot.</span>
          </label>
          {capability.webmSupported ? (
            <button className="quiet-button" type="button" onClick={() => onSelectFormat("webm")}>
              Return to WebM
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ExportRunning({
  isCancelling,
  onCancel,
  progress,
}: {
  isCancelling: boolean;
  onCancel: () => void;
  progress: ExportProgress;
}) {
  const currentPhaseIndex = EXPORT_PHASES.indexOf(progress.phase);
  const percentage = Math.round(progress.progress * 100);

  return (
    <div className="export-running">
      <div className="export-progress-heading">
        <div aria-live="polite">
          <p className="eyebrow">{formatPhase(progress.phase)}</p>
          <h3>{formatRunningTitle(progress.phase)}</h3>
        </div>
        <strong>{percentage}%</strong>
      </div>
      <div
        aria-label={`Export progress ${percentage} percent`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percentage}
        className="export-progress-track"
        role="progressbar"
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
      <div className="export-progress-times">
        <span>Elapsed {formatElapsed(progress.elapsedMs)}</span>
        <span>{progress.remainingMs === null ? "Estimating remaining time" : `About ${formatElapsed(progress.remainingMs)} left`}</span>
      </div>
      <ol className="export-phase-list" aria-label="Export phases">
        {EXPORT_PHASES.map((phase, index) => (
          <li
            className={index < currentPhaseIndex ? "complete" : index === currentPhaseIndex ? "current" : ""}
            key={phase}
          >
            <span aria-hidden="true" />
            {formatPhase(phase)}
          </li>
        ))}
      </ol>
      <div className="export-running-footer">
        <p>The preview and scrubber remain independent while this loop renders from frame zero.</p>
        <button
          className="secondary-button export-cancel-button"
          data-export-view-focus
          disabled={isCancelling}
          type="button"
          onClick={onCancel}
        >
          {isCancelling ? "Cancelling…" : "Cancel export"}
        </button>
      </div>
    </div>
  );
}

function ExportComplete({
  artifact,
  onClose,
  onExportAgain,
}: {
  artifact: ExportArtifact;
  onClose: () => void;
  onExportAgain: () => void;
}) {
  return (
    <div className="export-complete">
      <span className="export-success-mark" aria-hidden="true">✓</span>
      <p className="eyebrow">Downloaded locally</p>
      <h3 data-export-view-focus tabIndex={-1}>
        {artifact.format === "webm" ? "WebM export complete" : "PNG snapshot complete"}
      </h3>
      <dl className="export-result-details">
        <div><dt>Filename</dt><dd>{artifact.fileName}</dd></div>
        <div><dt>Format</dt><dd>{artifact.format.toUpperCase()}</dd></div>
        <div><dt>Dimensions</dt><dd>{artifact.frame.width} × {artifact.frame.height}</dd></div>
        <div><dt>Duration</dt><dd>{artifact.durationSeconds.toFixed(1)} seconds</dd></div>
        <div><dt>FPS</dt><dd>{artifact.fps ? `${artifact.fps} FPS` : "Not applicable"}</dd></div>
        <div><dt>File size</dt><dd>{formatFileSize(artifact.blob.size)}</dd></div>
      </dl>
      <div className="export-complete-actions">
        <button className="secondary-button" type="button" onClick={onExportAgain}>Export again</button>
        <button className="primary-button" type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function ExportMessage({ eyebrow, message, title }: { eyebrow: string; message: string; title: string }) {
  return (
    <div className="export-message">
      <p className="eyebrow">{eyebrow}</p>
      <h3 data-export-view-focus tabIndex={-1}>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

function formatViewLabel(view: ExportView) {
  if (view === "review") return "Review";
  if (view === "running") return "Exporting";
  if (view === "complete") return "Complete";
  if (view === "cancelled") return "Cancelled";
  return "Needs attention";
}

function formatPhase(phase: ExportPhase) {
  return phase.charAt(0).toUpperCase() + phase.slice(1);
}

function formatRunningTitle(phase: ExportPhase) {
  if (phase === "preparing") return "Preparing the export canvas";
  if (phase === "rendering") return "Rendering one complete loop";
  if (phase === "encoding") return "Encoding the media file";
  if (phase === "finalizing") return "Finalizing file details";
  if (phase === "downloading") return "Starting the local download";
  return "Export complete";
}

function formatElapsed(milliseconds: number) {
  return `${Math.max(0, milliseconds / 1000).toFixed(1)}s`;
}

function formatBackgroundMode(mode: OrbitRigSettings["background"]["mode"]) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

function formatErrorCode(code: ExportProcessError["code"]) {
  const labels: Record<ExportProcessError["code"], string> = {
    cancelled: "Cancelled",
    "unsupported-browser": "Unsupported browser",
    "recorder-startup": "Recorder startup failure",
    "invalid-media": "Invalid media",
    encoding: "Encoding failure",
    "png-encoding": "PNG encoding failure",
    download: "Download failure",
  };
  return labels[code];
}
