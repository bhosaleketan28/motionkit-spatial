import { useEffect, useMemo, useRef, useState } from "react";
import { getDurationBucket, trackEvent } from "../analytics/analytics";
import type { AnalyticsFailureReason, AnalyticsProperties } from "../analytics/analytics";
import { exportRigPng } from "../export/exportPng";
import { exportRigWebm } from "../export/exportWebm";
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
import type { AnyRigSettings, BackgroundMode, FrameRatio, RegisteredRigDefinition } from "../rigs/types";

interface ExportSheetProps {
  mediaIssues: Record<ExportFormat, string | null>;
  onAddMedia: () => void;
  onClose: () => void;
  onFrameRatioChange: (ratio: FrameRatio) => void;
  onStatusChange: (status: ExportStatus) => void;
  rig: RegisteredRigDefinition;
  settings: AnyRigSettings;
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
  mediaIssues,
  onAddMedia,
  onClose,
  onFrameRatioChange,
  onStatusChange,
  rig,
  settings,
  slotImages,
}: ExportSheetProps) {
  const capability = useMemo(detectExportCapability, []);
  const initialFormat: ExportFormat = capability.webmSupported ? "webm" : "png";
  const dialogRef = useRef<HTMLElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const attemptInProgressRef = useRef(false);
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
  const mediaCount = slotImages.filter(Boolean).length;
  const isRunning = view === "running";
  const mediaIssue = mediaIssues[format];

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
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
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
    if (attemptInProgressRef.current || mediaIssue || (format === "png" && !pngConsent)) {
      return;
    }

    attemptInProgressRef.current = true;
    const controller = new AbortController();
    const input: ExportRenderInput = { rig, settings, slotImages };
    const normalizedFileName = normalizeExportFileName(fileName, format);
    const analyticsProperties: AnalyticsProperties = {
      aspect_ratio: settings.frameRatio,
      duration_bucket: getDurationBucket(settings.durationSeconds),
      export_format: format,
      export_resolution: `${frame.width}x${frame.height}` as AnalyticsProperties["export_resolution"],
      media_count: mediaCount,
      motion_system_id: rig.id,
      ...(format === "webm" ? { export_fps: fps } : {}),
    };
    trackEvent("export_started", analyticsProperties);
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
          ? await exportRigWebm(input, options)
          : await exportRigPng(input, options);

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
      trackEvent("export_completed", analyticsProperties);
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
        trackEvent("export_failed", {
          ...analyticsProperties,
          failure_reason:
            caughtError instanceof ExportProcessError
              ? getAnalyticsFailureReason(processError.code)
              : "unknown",
        });
        setError(processError);
        setView("error");
        onStatusChange("error");
      }
    } finally {
      attemptInProgressRef.current = false;
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

  const changeFrameRatio = (frameRatio: FrameRatio) => {
    setFileName((current) => {
      const normalized = normalizeExportFileName(current, format);
      const isGeneratedName =
        normalized.startsWith("hoppy-") &&
        /-(1x1|16x9|9x16)-\d{8}-\d{6}\.(webm|png)$/.test(normalized);
      return isGeneratedName
        ? createDefaultExportFileName(
            { rig, settings: { ...settings, frameRatio } },
            format,
          )
        : current;
    });
    onFrameRatioChange(frameRatio);
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
        aria-busy={isRunning}
        aria-modal="true"
        className={`export-sheet export-view-${view}`}
        ref={dialogRef}
        role="dialog"
      >
        <header className="export-sheet-header">
          <div>
            <p className="eyebrow">Final output</p>
            <h2 id="export-dialog-title">Create {rig.name} output</h2>
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
              mediaCount={mediaCount}
              mediaIssue={mediaIssue}
              onFrameRatioChange={changeFrameRatio}
              pngConsent={pngConsent}
              quality={quality}
              rig={rig}
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
            <ExportComplete
              artifact={artifact}
              backgroundMode={settings.background.mode}
              mediaCount={mediaCount}
              onClose={closeSheet}
              onExportAgain={returnToReview}
              rigName={rig.name}
            />
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
            {mediaIssue ? (
              <button className="primary-button export-primary-action" data-export-view-focus type="button" onClick={onAddMedia}>
                Add images
              </button>
            ) : (
              <button
                className="primary-button export-primary-action"
                data-export-view-focus
                disabled={format === "png" && !pngConsent}
                type="button"
                onClick={startExport}
              >
                {format === "webm" ? "Create WebM" : "Create PNG"}
              </button>
            )}
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

function getAnalyticsFailureReason(
  code: ExportProcessError["code"],
): AnalyticsFailureReason {
  const reasons: Record<ExportProcessError["code"], AnalyticsFailureReason | null> = {
    cancelled: null,
    "unsupported-browser": "unsupported_browser",
    "recorder-startup": "recorder_startup",
    "invalid-media": "invalid_media",
    encoding: "encoding",
    "png-encoding": "png_encoding",
    download: "download",
  };
  return reasons[code] ?? "unknown";
}

interface ExportReviewProps {
  capability: ReturnType<typeof detectExportCapability>;
  fileName: string;
  format: ExportFormat;
  fps: ExportFps;
  frame: { width: number; height: number };
  mediaCount: number;
  mediaIssue: string | null;
  onFileNameChange: (fileName: string) => void;
  onFrameRatioChange: (ratio: FrameRatio) => void;
  onFpsChange: (fps: ExportFps) => void;
  onPngConsentChange: (consent: boolean) => void;
  onQualityChange: (quality: ExportQuality) => void;
  onSelectFormat: (format: ExportFormat) => void;
  pngConsent: boolean;
  quality: ExportQuality;
  rig: RegisteredRigDefinition;
  settings: AnyRigSettings;
}

function ExportReview({
  capability,
  fileName,
  format,
  fps,
  frame,
  mediaCount,
  mediaIssue,
  onFileNameChange,
  onFrameRatioChange,
  onFpsChange,
  onPngConsentChange,
  onQualityChange,
  onSelectFormat,
  pngConsent,
  quality,
  rig,
  settings,
}: ExportReviewProps) {
  const estimatedSeconds =
    format === "png" ? null : settings.durationSeconds + (quality === "high" ? 2.5 : 1.5);
  const capabilityLabel = format === "png" ? "PNG still-frame export" : capability.label;
  const capabilityMessage =
    format === "png"
      ? capability.webmSupported
        ? "Creates one image from the opening frame. Switch to WebM for a looping video."
        : "Creates one image from the opening frame. WebM recording is unavailable in this browser."
      : capability.message;

  return (
    <div className="export-review">
      <div
        className={`export-capability ${
          format === "png" ? "capability-png-snapshot" : `capability-${capability.status}`
        }`}
      >
        <span className="export-capability-dot" aria-hidden="true" />
        <div>
          <strong>{capabilityLabel}</strong>
          <p>{capabilityMessage}</p>
        </div>
        <small>{format === "png" ? "STILL" : formatCodecName(capability.mimeType)}</small>
      </div>

      {mediaIssue ? <p className="export-callout error" role="alert">{mediaIssue}</p> : null}

      <div className="export-control-list">
        <div aria-labelledby="export-format-label" className="export-output-row" role="radiogroup">
          <span className="export-output-label" id="export-format-label">Format</span>
          <div className="export-segmented-control">
            <button
              aria-checked={format === "webm"}
              className={format === "webm" ? "selected" : ""}
              disabled={!capability.webmSupported}
              id="export-format-option-webm"
              role="radio"
              tabIndex={format === "webm" ? 0 : -1}
              type="button"
              onClick={() => onSelectFormat("webm")}
              onKeyDown={(event) =>
                handleOutputRadioNavigation(
                  event,
                  ["webm", "png"] as ExportFormat[],
                  0,
                  onSelectFormat,
                  "export-format-option",
                  (value) => value === "webm" && !capability.webmSupported,
                )
              }
            >
              WebM
            </button>
            <button
              aria-checked={format === "png"}
              className={format === "png" ? "selected" : ""}
              id="export-format-option-png"
              role="radio"
              tabIndex={format === "png" ? 0 : -1}
              type="button"
              onClick={() => onSelectFormat("png")}
              onKeyDown={(event) =>
                handleOutputRadioNavigation(
                  event,
                  ["webm", "png"] as ExportFormat[],
                  1,
                  onSelectFormat,
                  "export-format-option",
                  (value) => value === "webm" && !capability.webmSupported,
                )
              }
            >
              PNG
            </button>
          </div>
        </div>

        <div aria-labelledby="export-resolution-label" className="export-output-row" role="radiogroup">
          <span className="export-output-label" id="export-resolution-label">Resolution</span>
          <div className="export-resolution-control">
            <div className="export-segmented-control">
              {(["standard", "high"] as ExportQuality[]).map((option, index, options) => (
                <button
                  aria-checked={quality === option}
                  className={quality === option ? "selected" : ""}
                  id={`export-quality-option-${option}`}
                  key={option}
                  onKeyDown={(event) =>
                    handleOutputRadioNavigation(
                      event,
                      options,
                      index,
                      onQualityChange,
                      "export-quality-option",
                    )
                  }
                  role="radio"
                  tabIndex={quality === option ? 0 : -1}
                  type="button"
                  onClick={() => onQualityChange(option)}
                >
                  {option === "standard" ? "Standard" : "High"}
                </button>
              ))}
            </div>
            <output aria-label={`Output dimensions ${frame.width} by ${frame.height}`}>
              {frame.width} × {frame.height}
            </output>
          </div>
        </div>

        {format === "webm" ? (
          <div aria-labelledby="export-fps-label" className="export-output-row" role="radiogroup">
            <span className="export-output-label" id="export-fps-label">FPS</span>
            <div className="export-segmented-control">
              {([30, 60] as ExportFps[]).map((option, index, options) => (
                <button
                  aria-checked={fps === option}
                  className={fps === option ? "selected" : ""}
                  id={`export-fps-option-${option}`}
                  key={option}
                  onKeyDown={(event) =>
                    handleOutputRadioNavigation(
                      event,
                      options,
                      index,
                      onFpsChange,
                      "export-fps-option",
                    )
                  }
                  role="radio"
                  tabIndex={fps === option ? 0 : -1}
                  type="button"
                  onClick={() => onFpsChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <label className="export-output-row export-select-row">
          <span>Ratio</span>
          <select
            aria-label="Export frame ratio"
            value={settings.frameRatio}
            onChange={(event) => onFrameRatioChange(event.currentTarget.value as FrameRatio)}
          >
            {rig.supportedRatios.map((ratio) => (
              <option key={ratio} value={ratio}>{ratio}</option>
            ))}
          </select>
        </label>

        {format === "webm" ? (
          <div className="export-output-row export-readonly-row">
            <span>Duration</span>
            <output>{settings.durationSeconds.toFixed(1)} s</output>
          </div>
        ) : null}
        {rig.capabilities.supportsBackground ? (
        <div className="export-output-row export-readonly-row">
          <span>Background</span>
          <output>{formatBackgroundMode(settings.background.mode)}</output>
        </div>
        ) : null}

        <div className="export-output-row export-readonly-row">
          <span>Media</span>
          <output>{mediaCount}/{rig.slotCount} loaded</output>
        </div>

        <label className="export-filename-field export-output-row">
          <span>Filename</span>
          <span className="export-filename-input-wrap">
            <input
              aria-label="Export filename"
              autoComplete="off"
              data-export-view-focus
              maxLength={140}
              name="export-filename"
              spellCheck={false}
              type="text"
              value={fileName}
              onBlur={() => onFileNameChange(normalizeExportFileName(fileName, format))}
              onChange={(event) => onFileNameChange(event.currentTarget.value)}
            />
          </span>
        </label>
      </div>

      <p className="export-estimate">
        Estimated export time: {estimatedSeconds ? `about ${estimatedSeconds.toFixed(1)} seconds` : "usually under 1 second"}.
      </p>

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
  backgroundMode,
  mediaCount,
  onClose,
  onExportAgain,
  rigName,
}: {
  artifact: ExportArtifact;
  backgroundMode: BackgroundMode;
  mediaCount: number;
  onClose: () => void;
  onExportAgain: () => void;
  rigName: string;
}) {
  return (
    <div className="export-complete">
      <span className="export-success-mark" aria-hidden="true">✓</span>
      <p className="eyebrow">Saved locally</p>
      <h3
        aria-label={`Hoppy export complete. ${artifact.format === "webm" ? "Your WebM is ready" : "Your PNG still is ready"}`}
        data-export-view-focus
        tabIndex={-1}
      >
        {artifact.format === "webm" ? "Your WebM is ready" : "Your PNG still is ready"}
      </h3>
      <dl className="export-result-details">
        <div><dt>Filename</dt><dd>{artifact.fileName}</dd></div>
        <div><dt>Motion system</dt><dd>{rigName}</dd></div>
        <div><dt>Format</dt><dd>{artifact.format.toUpperCase()}</dd></div>
        <div><dt>Dimensions</dt><dd>{artifact.frame.width} × {artifact.frame.height}</dd></div>
        <div><dt>Duration</dt><dd>{artifact.format === "png" ? "Still frame" : `${artifact.durationSeconds.toFixed(1)} seconds`}</dd></div>
        <div><dt>FPS</dt><dd>{artifact.fps ? `${artifact.fps} FPS` : "Not applicable"}</dd></div>
        <div><dt>Background</dt><dd>{formatBackgroundMode(backgroundMode)}</dd></div>
        <div><dt>Media</dt><dd>{mediaCount} loaded</dd></div>
        <div><dt>File size</dt><dd>{formatFileSize(artifact.blob.size)}</dd></div>
      </dl>
      <div className="export-complete-actions">
        <button className="primary-button" type="button" onClick={onExportAgain}>Export again</button>
        <button className="secondary-button" type="button" onClick={onClose}>Close</button>
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
  if (phase === "preparing") return "Preparing your output";
  if (phase === "rendering") return "Creating one complete loop";
  if (phase === "encoding") return "Building the WebM file";
  if (phase === "finalizing") return "Finishing output details";
  if (phase === "downloading") return "Saving to your device";
  return "Output ready";
}

function formatElapsed(milliseconds: number) {
  return `${Math.max(0, milliseconds / 1000).toFixed(1)}s`;
}

function formatBackgroundMode(mode: BackgroundMode) {
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

function handleOutputRadioNavigation<Value extends string | number>(
  event: React.KeyboardEvent<HTMLButtonElement>,
  values: Value[],
  currentIndex: number,
  onSelect: (value: Value) => void,
  idPrefix: string,
  isDisabled: (value: Value) => boolean = () => false,
) {
  const direction =
    event.key === "ArrowRight" || event.key === "ArrowDown"
      ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? -1
        : 0;
  let nextIndex = currentIndex;
  if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = values.length - 1;
  else if (direction !== 0) nextIndex = (currentIndex + direction + values.length) % values.length;
  else return;

  for (let attempts = 0; attempts < values.length && isDisabled(values[nextIndex]); attempts += 1) {
    nextIndex = (nextIndex + (direction || 1) + values.length) % values.length;
  }
  if (isDisabled(values[nextIndex])) return;
  event.preventDefault();
  const nextValue = values[nextIndex];
  onSelect(nextValue);
  window.requestAnimationFrame(() => document.getElementById(`${idPrefix}-${nextValue}`)?.focus());
}
