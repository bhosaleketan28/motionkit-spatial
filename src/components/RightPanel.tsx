import { RigControls } from "./RigControls";
import type { ExportStatus } from "../export/exportSettings";
import type { MotionRigDefinition, OrbitRigSettings } from "../rigs/types";

interface RightPanelProps {
  exportStatus: ExportStatus;
  onExport: () => void;
  rig: MotionRigDefinition;
  settings: OrbitRigSettings;
  setSettings: (settings: OrbitRigSettings) => void;
}

export function RightPanel({
  exportStatus,
  onExport,
  rig,
  settings,
  setSettings,
}: RightPanelProps) {
  return (
    <aside className="panel right-panel" aria-label="Orbit Carousel inspector">
      <div className="inspector-heading">
        <div>
          <p className="eyebrow">Inspector</p>
          <h2>{rig.name}</h2>
        </div>
        <span>Canvas 2D</span>
      </div>

      <RigControls settings={settings} onChange={setSettings} />

      <details className="inspector-section export-inspector">
        <summary>Export</summary>
        <div className="inspector-content">
          <dl className="export-details">
            <div><dt>Format</dt><dd>WebM</dd></div>
            <div><dt>Ratio</dt><dd>{settings.frameRatio}</dd></div>
            <div><dt>Duration</dt><dd>{settings.durationSeconds}s</dd></div>
            <div><dt>Background</dt><dd>{formatBackgroundMode(settings.background.mode)}</dd></div>
          </dl>
          <button
            className="primary-button inspector-export-button"
            disabled={exportStatus === "exporting"}
            type="button"
            onClick={onExport}
          >
            {exportStatus === "exporting" ? "Exporting one loop..." : "Export WebM"}
          </button>
          <p className={`export-status status-${exportStatus}`} aria-live="polite">
            {getExportStatusLabel(exportStatus)}
          </p>
          <p className="control-note">
            Generated locally. MP4 is not available yet. Transparent playback can vary by browser.
          </p>
        </div>
      </details>
    </aside>
  );
}

function formatBackgroundMode(mode: OrbitRigSettings["background"]["mode"]) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

function getExportStatusLabel(status: ExportStatus) {
  if (status === "exporting") {
    return "Exporting one full loop...";
  }

  if (status === "done") {
    return "WebM downloaded.";
  }

  if (status === "fallback") {
    return "Snapshot downloaded.";
  }

  if (status === "error") {
    return "Export failed. Try again.";
  }

  return "Ready to export WebM.";
}
