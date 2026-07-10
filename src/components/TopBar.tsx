import type { ExportStatus } from "../export/exportSettings";

interface TopBarProps {
  exportStatus: ExportStatus;
  isPlaying: boolean;
  onExport: () => void;
  onReset: () => void;
  onTogglePlay: () => void;
  rigName: string;
}

export function TopBar({
  exportStatus,
  isPlaying,
  onExport,
  onReset,
  onTogglePlay,
  rigName,
}: TopBarProps) {
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
        <button className="toolbar-button" type="button" onClick={onTogglePlay}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button className="toolbar-button" type="button" onClick={onReset}>
          Reset
        </button>
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
