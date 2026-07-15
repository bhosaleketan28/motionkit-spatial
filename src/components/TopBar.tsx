import { useEffect, useRef, useState } from "react";
import type { ExportStatus } from "../export/exportSettings";

interface TopBarProps {
  exportStatus: ExportStatus;
  onExport: () => void;
  onOpenHelp: () => void;
  onReset: () => void;
  rigName: string;
}

export function TopBar({
  exportStatus,
  onExport,
  onOpenHelp,
  onReset,
  rigName,
}: TopBarProps) {
  const utilitiesRef = useRef<HTMLDetailsElement | null>(null);
  const utilitiesSummaryRef = useRef<HTMLElement | null>(null);
  const resetCancelRef = useRef<HTMLButtonElement | null>(null);
  const resetTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
  const isExporting = exportStatus === "exporting";

  useEffect(() => {
    if (!isResetConfirmationOpen) {
      return;
    }
    const frame = window.requestAnimationFrame(() => resetCancelRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isResetConfirmationOpen]);

  return (
    <header className="top-bar">
      <div className="top-bar-brand">
        <strong>Hoppy</strong>
        <span aria-hidden="true" />
        <small>{rigName}</small>
      </div>
      <div className="top-bar-actions">
        <span className={`top-status status-${exportStatus}`}>
          {getCompactStatus(exportStatus)}
        </span>
        <details
          className="utility-menu"
          ref={utilitiesRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              if (utilitiesRef.current) utilitiesRef.current.open = false;
              setIsResetConfirmationOpen(false);
              utilitiesSummaryRef.current?.focus();
            }
          }}
        >
          <summary aria-label="Open workspace utilities" ref={utilitiesSummaryRef}>•••</summary>
          <div className="utility-menu-popover">
            <span>Workspace</span>
            {isResetConfirmationOpen ? (
              <div className="reset-confirmation" role="group" aria-label="Confirm reset motion settings">
                <p>Reset every motion setting to its default?</p>
                <div>
                  <button
                    ref={resetCancelRef}
                    type="button"
                    onClick={() => {
                      setIsResetConfirmationOpen(false);
                      window.requestAnimationFrame(() => resetTriggerRef.current?.focus());
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onReset();
                      setIsResetConfirmationOpen(false);
                      if (utilitiesRef.current) utilitiesRef.current.open = false;
                      window.requestAnimationFrame(() => utilitiesSummaryRef.current?.focus());
                    }}
                  >
                    Reset settings
                  </button>
                </div>
              </div>
            ) : (
              <button ref={resetTriggerRef} type="button" onClick={() => setIsResetConfirmationOpen(true)}>
                Reset motion settings…
              </button>
            )}
            <details className="shortcut-help">
              <summary>Keyboard shortcuts</summary>
              <dl>
                <div><dt>Play / Pause</dt><dd>Space</dd></div>
                <div><dt>Step</dt><dd>← / →</dd></div>
                <div><dt>Larger step</dt><dd>Shift + ← / →</dd></div>
                <div><dt>Fit</dt><dd>0</dd></div>
                <div><dt>Focus mode</dt><dd>Shift + F</dd></div>
                <div><dt>Close</dt><dd>Escape</dd></div>
              </dl>
            </details>
            <button
              aria-label="Open Hoppy Alpha guide and feedback"
              className="utility-help-action"
              type="button"
              onClick={() => {
                if (utilitiesRef.current) utilitiesRef.current.open = false;
                utilitiesSummaryRef.current?.focus();
                onOpenHelp();
              }}
            >
              Hoppy Alpha guide & feedback
            </button>
          </div>
        </details>
        <button
          className="primary-button top-export-button"
          disabled={isExporting}
          type="button"
          onClick={onExport}
        >
          {isExporting ? "Creating…" : "Export"}
        </button>
      </div>
    </header>
  );
}

function getCompactStatus(status: ExportStatus) {
  if (status === "exporting") return "Creating output";
  if (status === "done") return "WebM downloaded";
  if (status === "fallback") return "Snapshot downloaded";
  if (status === "cancelled") return "Export cancelled";
  if (status === "error") return "Export failed";
  return "Ready";
}
