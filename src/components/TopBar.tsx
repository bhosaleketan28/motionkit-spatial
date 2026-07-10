import { useRef } from "react";
import type { ExportStatus } from "../export/exportSettings";

interface TopBarProps {
  exportStatus: ExportStatus;
  onExport: () => void;
  onReset: () => void;
  rigName: string;
}

export function TopBar({
  exportStatus,
  onExport,
  onReset,
  rigName,
}: TopBarProps) {
  const utilitiesRef = useRef<HTMLDetailsElement | null>(null);
  const isExporting = exportStatus === "exporting";

  return (
    <header className="top-bar">
      <div className="top-bar-brand">
        <strong>MotionKit Spatial</strong>
        <span aria-hidden="true" />
        <small>{rigName}</small>
      </div>
      <div className="top-bar-actions">
        <span className={`top-status status-${exportStatus}`} aria-live="polite">
          {getCompactStatus(exportStatus)}
        </span>
        <details className="utility-menu" ref={utilitiesRef}>
          <summary aria-label="Open workspace utilities">•••</summary>
          <div className="utility-menu-popover">
            <span>Workspace</span>
            <button
              type="button"
              onClick={() => {
                onReset();
                if (utilitiesRef.current) utilitiesRef.current.open = false;
              }}
            >
              Reset rig settings
            </button>
          </div>
        </details>
        <button
          className="primary-button top-export-button"
          disabled={isExporting}
          type="button"
          onClick={onExport}
        >
          {isExporting ? "Exporting..." : "Export"}
        </button>
      </div>
    </header>
  );
}

function getCompactStatus(status: ExportStatus) {
  if (status === "exporting") return "Rendering loop";
  if (status === "done") return "WebM downloaded";
  if (status === "fallback") return "Snapshot downloaded";
  if (status === "error") return "Export failed";
  return "Ready";
}
