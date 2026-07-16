import { useEffect, useMemo, useRef, useState } from "react";
import { getDurationBucket, trackEvent } from "../analytics/analytics";
import type { AnalyticsFailureReason, AnalyticsProperties } from "../analytics/analytics";
import { exportRigPng } from "../export/exportPng";
import { exportRigWebm } from "../export/exportWebm";
import {
  detectExportCapability,
  getExportErrorPresentation,
  normalizeExportError,
  runExportPreflight,
} from "../export/exportCapability";
import type {
  ExportErrorPresentation,
  ExportPreflightResult,
  ExportRecoveryAction,
} from "../export/exportCapability";
import {
  createDefaultExportFileName,
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
  onAddMedia: () => void;
  onClose: () => void;
  onFrameRatioChange: (ratio: FrameRatio) => void;
  onStatusChange: (status: ExportStatus) => void;
  rig: RegisteredRigDefinition;
  settings: AnyRigSettings;
  slotImages: Array<HTMLImageElement | null>;
}

type ExportState = "idle" | "validating" | "exporting" | "completed" | "failed" | "cancelled";

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
  const downloadCleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);
  const attemptInProgressRef = useRef(false);
  const previousFocusRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement | null);
  const lastProgressPaintRef = useRef(0);
  const lastProgressPhaseRef = useRef<ExportPhase>("preparing");
  const latestProgressRef = useRef<ExportProgress>(INITIAL_PROGRESS);
  const [exportState, setExportState] = useState<ExportState>("idle");
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
  const isBusy = exportState === "validating" || exportState === "exporting";
  const reviewPreflight = useMemo(
    () =>
      runExportPreflight({
        capability,
        exportInProgress: false,
        format,
        fps,
        input: { rig, settings, slotImages },
        quality,
        requestedMimeType: capability.mimeType,
      }),
    [capability, format, fps, quality, rig, settings, slotImages],
  );

  useEffect(() => {
    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>("[data-export-view-focus]")
        ?.focus();
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [exportState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!isBusy) {
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
  }, [isBusy, onClose]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      downloadCleanupRef.current?.();
      previousFocusRef.current?.focus();
    };
  }, []);

  const closeSheet = () => {
    if (!isBusy) {
      onClose();
    }
  };

  const updateProgress = (nextProgress: ExportProgress) => {
    if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) {
      return;
    }
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
    if (
      attemptInProgressRef.current ||
      reviewPreflight.blockingError ||
      (format === "png" && !pngConsent)
    ) {
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
    setExportState("validating");
    onStatusChange("exporting");

    try {
      await waitForAnimationFrame(controller.signal);
      throwIfExportCancelled(controller.signal);
      const preflight = runExportPreflight({
        capability,
        exportInProgress: false,
        format,
        fps,
        input,
        quality,
        requestedMimeType: capability.mimeType,
      });
      if (preflight.blockingError) {
        throw preflight.blockingError;
      }
      if (isMountedRef.current) {
        setExportState("exporting");
      }
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
      updateProgress(downloadingProgress);
      await waitForAnimationFrame(controller.signal);
      throwIfExportCancelled(controller.signal);
      downloadCleanupRef.current?.();
      downloadCleanupRef.current = downloadBlob(result.blob, result.fileName);
      trackEvent("export_completed", analyticsProperties);
      updateProgress({
        elapsedMs: downloadingProgress.elapsedMs,
        phase: "complete",
        progress: 1,
        remainingMs: 0,
      });
      setArtifact(result);
      setExportState("completed");
      onStatusChange(result.format === "webm" ? "done" : "fallback");
    } catch (caughtError) {
      const processError = normalizeExportError(caughtError);

      if (!isMountedRef.current) {
        return;
      }
      if (processError.code === "EXPORT_CANCELLED") {
        setExportState("cancelled");
        onStatusChange("cancelled");
      } else {
        trackEvent("export_failed", {
          ...analyticsProperties,
          failure_reason: getAnalyticsFailureReason(processError.code, format),
        });
        setError(processError);
        setExportState("failed");
        onStatusChange("error");
      }
    } finally {
      attemptInProgressRef.current = false;
      abortControllerRef.current = null;
      if (isMountedRef.current) {
        setIsCancelling(false);
      }
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
    setExportState("idle");
    onStatusChange("ready");
  };

  const returnToReview = () => {
    setArtifact(null);
    setError(null);
    setProgress(INITIAL_PROGRESS);
    setExportState("idle");
    onStatusChange("ready");
  };

  const handleRecoveryAction = (action: ExportRecoveryAction) => {
    if (action === "RETRY") {
      void startExport();
      return;
    }
    if (action === "LOWER_RESOLUTION") {
      setQuality("standard");
      returnToReview();
      return;
    }
    if (action === "USE_30_FPS") {
      setFps(30);
      returnToReview();
      return;
    }
    if (action === "SWITCH_TO_PNG") {
      selectFormat("png");
      return;
    }
    if (action === "REVIEW_MEDIA") {
      onAddMedia();
      return;
    }
    if (action === "RETURN_TO_SETTINGS") {
      returnToReview();
      return;
    }
    closeSheet();
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
  const failurePresentation = error ? getExportErrorPresentation(error.code) : null;
  const mediaNeedsAttention = reviewPreflight.blockingError?.code === "MEDIA_NOT_READY";

  return (
    <div className="export-modal-layer">
      <button
        aria-label="Close export"
        className="export-modal-scrim"
        disabled={isBusy}
        type="button"
        onClick={closeSheet}
      />
      <section
        aria-labelledby="export-dialog-title"
        aria-busy={isBusy}
        aria-modal="true"
        className={`export-sheet export-state-${exportState}`}
        ref={dialogRef}
        role="dialog"
      >
        <header className="export-sheet-header">
          <div>
            <p className="eyebrow">Final output</p>
            <h2 id="export-dialog-title">Create {rig.name} output</h2>
          </div>
          <div className="export-header-actions">
            <span className={`export-phase-badge phase-${exportState}`}>
              {formatViewLabel(exportState)}
            </span>
            <button
              aria-label="Close export"
              className="export-close-button"
              disabled={isBusy}
              type="button"
              onClick={closeSheet}
            >
              ×
            </button>
          </div>
        </header>

        <div className="export-sheet-body">
          {exportState === "idle" ? (
            <ExportReview
              capability={capability}
              fileName={fileName}
              format={format}
              fps={fps}
              frame={frame}
              mediaCount={mediaCount}
              onFrameRatioChange={changeFrameRatio}
              preflight={reviewPreflight}
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

          {isBusy ? (
            <ExportRunning
              exportState={exportState}
              format={format}
              isCancelling={isCancelling}
              progress={progress}
              onCancel={cancelExport}
            />
          ) : null}

          {exportState === "completed" && artifact ? (
            <ExportComplete
              artifact={artifact}
              backgroundMode={settings.background.mode}
              mediaCount={mediaCount}
              onClose={closeSheet}
              onExportAgain={returnToReview}
              rigName={rig.name}
            />
          ) : null}

          {exportState === "cancelled" ? (
            <ExportMessage
              announcement="polite"
              eyebrow="Cancelled"
              message="The render stopped safely. No partial file was downloaded."
              title="Export cancelled"
            />
          ) : null}

          {exportState === "failed" && failurePresentation ? (
            <ExportFailure presentation={failurePresentation} />
          ) : null}
        </div>

        {exportState === "idle" ? (
          <footer className="export-sheet-footer">
            <button className="secondary-button" type="button" onClick={closeSheet}>Cancel</button>
            {mediaNeedsAttention ? (
              <button className="primary-button export-primary-action" data-export-view-focus type="button" onClick={onAddMedia}>
                Add images
              </button>
            ) : (
              <button
                className="primary-button export-primary-action"
                data-export-view-focus
                aria-describedby={reviewPreflight.blockingError ? "export-blocking-message" : undefined}
                disabled={Boolean(reviewPreflight.blockingError) || (format === "png" && !pngConsent)}
                type="button"
                onClick={startExport}
              >
                {format === "webm" ? "Create WebM" : "Create PNG"}
              </button>
            )}
          </footer>
        ) : null}

        {exportState === "cancelled" ? (
          <footer className="export-sheet-footer">
            <button className="secondary-button" type="button" onClick={closeSheet}>Close</button>
            <button className="primary-button" data-export-view-focus type="button" onClick={returnToReview}>
              Return to export
            </button>
          </footer>
        ) : null}

        {exportState === "failed" && failurePresentation ? (
          <footer className="export-sheet-footer export-error-actions">
            {getAvailableRecoveryActions(failurePresentation.actions, format, quality).map(
              (action) => (
                <button
                  className={
                    action === "RETRY" || action === "RETURN_TO_SETTINGS"
                      ? "primary-button"
                      : "secondary-button"
                  }
                  key={action}
                  type="button"
                  onClick={() => handleRecoveryAction(action)}
                >
                  {formatRecoveryAction(action)}
                </button>
              ),
            )}
          </footer>
        ) : null}
      </section>
    </div>
  );
}

function getAnalyticsFailureReason(
  code: ExportProcessError["code"],
  format: ExportFormat,
): AnalyticsFailureReason {
  if (code === "UNSUPPORTED_BROWSER" || code === "UNSUPPORTED_FORMAT") {
    return "unsupported_browser";
  }
  if (code === "MEDIA_NOT_READY" || code === "INVALID_EXPORT_SETTINGS") {
    return "invalid_media";
  }
  if (code === "RECORDER_START_FAILED") {
    return "recorder_startup";
  }
  if (code === "RECORDING_INTERRUPTED" || code === "EMPTY_OUTPUT") {
    return format === "png" ? "png_encoding" : "encoding";
  }
  if (code === "CANVAS_TOO_LARGE" || code === "MEMORY_PRESSURE") {
    return "encoding";
  }
  return "unknown";
}

interface ExportReviewProps {
  capability: ReturnType<typeof detectExportCapability>;
  fileName: string;
  format: ExportFormat;
  fps: ExportFps;
  frame: { width: number; height: number };
  mediaCount: number;
  onFileNameChange: (fileName: string) => void;
  onFrameRatioChange: (ratio: FrameRatio) => void;
  onFpsChange: (fps: ExportFps) => void;
  onPngConsentChange: (consent: boolean) => void;
  onQualityChange: (quality: ExportQuality) => void;
  onSelectFormat: (format: ExportFormat) => void;
  preflight: ExportPreflightResult;
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
  onFileNameChange,
  onFrameRatioChange,
  onFpsChange,
  onPngConsentChange,
  onQualityChange,
  onSelectFormat,
  preflight,
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
  const blockingPresentation = preflight.blockingError
    ? getExportErrorPresentation(preflight.blockingError.code)
    : null;

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

      {blockingPresentation ? (
        <p className="export-callout error" id="export-blocking-message" role="alert">
          <strong>{blockingPresentation.title}.</strong> {blockingPresentation.explanation}
        </p>
      ) : null}

      {preflight.warnings.length ? (
        <ul aria-label="Export warnings" className="export-warning-list">
          {preflight.warnings.map((warning) => (
            <li key={warning.code}>
              <span aria-hidden="true">!</span>
              <div>
                <strong>{warning.title}</strong>
                <p>{warning.message}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

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
  exportState,
  format,
  isCancelling,
  onCancel,
  progress,
}: {
  exportState: "validating" | "exporting";
  format: ExportFormat;
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
          <p className="eyebrow">
            {exportState === "validating" ? "Validating" : formatPhase(progress.phase)}
          </p>
          <h3>{formatRunningTitle(progress.phase, exportState, format)}</h3>
        </div>
        <strong>{percentage}%</strong>
      </div>
      <div
        aria-label={
          exportState === "validating"
            ? "Export preflight validation in progress"
            : `Export progress ${percentage} percent`
        }
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
        <p>
          {exportState === "validating"
            ? "Checking media, output settings, and browser recording support before export begins."
            : "The preview and scrubber remain independent while this loop renders from frame zero."}
        </p>
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

function ExportMessage({
  announcement,
  eyebrow,
  message,
  title,
}: {
  announcement: "polite" | "assertive";
  eyebrow: string;
  message: string;
  title: string;
}) {
  return (
    <div aria-atomic="true" aria-live={announcement} className="export-message" role="status">
      <p className="eyebrow">{eyebrow}</p>
      <h3 data-export-view-focus tabIndex={-1}>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

function ExportFailure({ presentation }: { presentation: ExportErrorPresentation }) {
  return (
    <div
      aria-atomic="true"
      aria-live="assertive"
      className="export-message export-failure-summary"
      role="alert"
    >
      <span aria-hidden="true" className="export-failure-mark">!</span>
      <p className="eyebrow">{presentation.label}</p>
      <h3 data-export-view-focus tabIndex={-1}>{presentation.title}</h3>
      <p>{presentation.explanation}</p>
    </div>
  );
}

function formatViewLabel(exportState: ExportState) {
  if (exportState === "idle") return "Review";
  if (exportState === "validating") return "Validating";
  if (exportState === "exporting") return "Exporting";
  if (exportState === "completed") return "Complete";
  if (exportState === "cancelled") return "Cancelled";
  return "Needs attention";
}

function formatPhase(phase: ExportPhase) {
  return phase.charAt(0).toUpperCase() + phase.slice(1);
}

function formatRunningTitle(
  phase: ExportPhase,
  exportState: "validating" | "exporting",
  format: ExportFormat,
) {
  if (exportState === "validating") return "Checking export readiness";
  if (phase === "preparing") return "Preparing your output";
  if (phase === "rendering") {
    return format === "webm" ? "Creating one complete loop" : "Drawing the still frame";
  }
  if (phase === "encoding") return format === "webm" ? "Building the WebM file" : "Encoding the PNG image";
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

function getAvailableRecoveryActions(
  actions: ExportRecoveryAction[],
  format: ExportFormat,
  quality: ExportQuality,
) {
  return actions.filter(
    (action) =>
      !(action === "SWITCH_TO_PNG" && format === "png") &&
      !(action === "USE_30_FPS" && format === "png") &&
      !(action === "LOWER_RESOLUTION" && quality === "standard"),
  );
}

function formatRecoveryAction(action: ExportRecoveryAction) {
  const labels: Record<ExportRecoveryAction, string> = {
    RETRY: "Retry export",
    LOWER_RESOLUTION: "Lower resolution",
    USE_30_FPS: "Use 30 FPS",
    SWITCH_TO_PNG: "Switch to PNG",
    REVIEW_MEDIA: "Review media",
    RETURN_TO_SETTINGS: "Return to export settings",
    DISMISS: "Dismiss",
  };
  return labels[action];
}

function waitForAnimationFrame(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    let frame = 0;
    const cleanup = () => {
      window.cancelAnimationFrame(frame);
      signal.removeEventListener("abort", handleAbort);
    };
    const handleAbort = () => {
      cleanup();
      reject(new ExportProcessError("EXPORT_CANCELLED"));
    };

    signal.addEventListener("abort", handleAbort, { once: true });
    if (signal.aborted) {
      handleAbort();
      return;
    }
    frame = window.requestAnimationFrame(() => {
      cleanup();
      resolve();
    });
  });
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
