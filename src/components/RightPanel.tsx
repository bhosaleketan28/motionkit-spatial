import { RigControls } from "./RigControls";
import type { MotionRigDefinition, OrbitRigSettings } from "../rigs/types";

interface RightPanelProps {
  isDrawer: boolean;
  isVisible: boolean;
  onRequestClose: () => void;
  rig: MotionRigDefinition;
  settings: OrbitRigSettings;
  setSettings: (settings: OrbitRigSettings) => void;
}

export function RightPanel({
  isDrawer,
  isVisible,
  onRequestClose,
  rig,
  settings,
  setSettings,
}: RightPanelProps) {
  return (
    <aside
      aria-hidden={!isVisible}
      aria-label={isDrawer ? "Orbit Carousel inspector drawer" : "Orbit Carousel inspector"}
      className={isVisible ? "panel right-panel panel-open" : "panel right-panel"}
      data-workspace-drawer="inspector"
      id="inspector-panel"
    >
      <div className="inspector-heading">
        <div>
          <p className="eyebrow">Inspector</p>
          <h2>{rig.name}</h2>
        </div>
        <div className="inspector-heading-actions">
          <span>Canvas 2D</span>
          <button
            aria-label={isDrawer ? "Close inspector drawer" : "Collapse inspector rail"}
            data-drawer-close
            type="button"
            onClick={onRequestClose}
          >
            {isDrawer ? "Close" : "Hide"}
          </button>
        </div>
      </div>

      <RigControls defaults={rig.defaults} settings={settings} onChange={setSettings} />
    </aside>
  );
}
