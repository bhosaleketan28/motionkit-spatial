import { useState } from "react";
import type { ImageSlot } from "../hooks/useImageSlots";
import { MediaSlotControl } from "./MediaSlotControl";

const rigs = [
  { id: "orbit-carousel", name: "Orbit Carousel", status: "Active" },
];

interface LeftPanelProps {
  activeRigId: string;
  clearAllSlots: () => void;
  clearSlot: (index: number) => void;
  onLoadDemo: () => void;
  setSlotFile: (index: number, file: File) => void;
  slots: ImageSlot[];
}

type WorkspaceSection = "create" | "media" | "presets";

export function LeftPanel({
  activeRigId,
  clearAllSlots,
  clearSlot,
  onLoadDemo,
  setSlotFile,
  slots,
}: LeftPanelProps) {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("media");

  return (
    <aside className="panel left-panel" aria-label="Workspace navigation">
      <nav className="workspace-nav" aria-label="Workspace sections">
        {(["create", "media", "presets"] as WorkspaceSection[]).map((section) => (
          <button
            className={activeSection === section ? "workspace-nav-item selected" : "workspace-nav-item"}
            key={section}
            onClick={() => setActiveSection(section)}
            type="button"
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </nav>

      <div className="left-panel-content">
        {activeSection === "create" ? (
          <section aria-labelledby="create-heading">
            <p className="eyebrow">Create</p>
            <h2 id="create-heading">Motion rig</h2>
            <div className="rig-list">
              {rigs.map((rig) => (
                <button
                  className={rig.id === activeRigId ? "rig-item rig-item-active" : "rig-item"}
                  key={rig.id}
                  type="button"
                >
                  <span>
                    <strong>{rig.name}</strong>
                    <small>4 image spatial loop</small>
                  </span>
                  <small>{rig.status}</small>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === "media" ? (
          <section aria-labelledby="media-heading">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Media</p>
                <h2 id="media-heading">4 image slots</h2>
              </div>
              <button className="quiet-button" type="button" onClick={clearAllSlots}>
                Clear all
              </button>
            </div>
            <div className="media-quick-action">
              <span>Need a fresh set?</span>
              <button type="button" onClick={onLoadDemo}>Load demo</button>
            </div>
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
        ) : null}

        {activeSection === "presets" ? (
          <section aria-labelledby="presets-heading">
            <p className="eyebrow">Presets</p>
            <h2 id="presets-heading">Starting looks</h2>
            <div className="preset-list" aria-label="Preset previews">
              {[
                ["Studio", "Balanced depth"],
                ["Editorial", "Tighter composition"],
                ["Launch", "Wide spatial spread"],
              ].map(([name, description]) => (
                <button disabled key={name} type="button">
                  <span>{name}</span>
                  <small>{description} · Soon</small>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
