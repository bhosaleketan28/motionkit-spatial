import { MediaSlotControl } from "./MediaSlotControl";
import { RigControls } from "./RigControls";
import type { ExportStatus } from "../export/exportSettings";
import type { ImageSlot } from "../hooks/useImageSlots";
import type { MotionRigDefinition, OrbitRigSettings } from "../rigs/types";

interface RightPanelProps {
  clearAllSlots: () => void;
  clearSlot: (index: number) => void;
  exportStatus: ExportStatus;
  onExport: () => void;
  onLoadDemo: () => void;
  onResetSettings: () => void;
  rig: MotionRigDefinition;
  settings: OrbitRigSettings;
  setSettings: (settings: OrbitRigSettings) => void;
  setSlotFile: (index: number, file: File) => void;
  slots: ImageSlot[];
}

export function RightPanel({
  clearAllSlots,
  clearSlot,
  exportStatus,
  onExport,
  onLoadDemo,
  onResetSettings,
  rig,
  settings,
  setSettings,
  setSlotFile,
  slots,
}: RightPanelProps) {
  return (
    <aside className="panel right-panel" aria-label="Rig details">
      <div className="panel-section intro-section">
        <p className="eyebrow">Active Rig</p>
        <h2>{rig.name}</h2>
        <p className="panel-copy">{rig.description}</p>
      </div>

      <section className="panel-section alpha-guide" aria-label="Alpha workflow">
        <p className="eyebrow">Private Alpha</p>
        <p className="alpha-copy">
          MotionKit Spatial is an early private alpha. Uploaded images stay in your browser, are
          not saved or sent to a server, and exports are generated locally as WebM.
        </p>
        <ol>
          <li>Upload 4 images</li>
          <li>Adjust controls</li>
          <li>Preview motion</li>
          <li>Export WebM</li>
        </ol>
        <button className="demo-control" type="button" onClick={onLoadDemo}>
          Load demo
        </button>
      </section>

      <dl className="detail-list">
        <div>
          <dt>Media slots</dt>
          <dd>{rig.mediaSlotCount}</dd>
        </div>
        <div>
          <dt>Frame</dt>
          <dd>{settings.frameRatio}</dd>
        </div>
        <div>
          <dt>Loop</dt>
          <dd>{settings.durationSeconds}s</dd>
        </div>
        <div>
          <dt>Renderer</dt>
          <dd>Canvas 2D</dd>
        </div>
      </dl>

      <section className="panel-section media-slots-section" aria-label="Media slots">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Media</p>
            <h2>Local Images</h2>
          </div>
          <button className="text-control" type="button" onClick={clearAllSlots}>
            Clear all
          </button>
        </div>
        <p className="section-helper">Upload 4 screenshots or start with the generated demo set.</p>

        <div className="media-slot-list">
          {slots.map((slot, index) => (
            <MediaSlotControl
              index={index}
              key={slot.id}
              onClear={clearSlot}
              onUpload={setSlotFile}
              slot={slot}
            />
          ))}
        </div>
      </section>

      <RigControls settings={settings} onChange={setSettings} onReset={onResetSettings} />

      <section className="panel-section export-action" aria-label="Export">
        <div>
          <p className="eyebrow">Export</p>
          <h2>Render WebM</h2>
        </div>
        <button disabled={exportStatus === "exporting"} type="button" onClick={onExport}>
          {exportStatus === "exporting" ? "Exporting..." : "Export WebM"}
        </button>
        <small>{getExportStatusLabel(exportStatus)}</small>
        <p className="export-note">
          Exports WebM locally. MP4 not available yet. Chrome controls may appear when previewing
          the downloaded file.
        </p>
      </section>
    </aside>
  );
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
