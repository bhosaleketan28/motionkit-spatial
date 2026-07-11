import { useRef, useState } from "react";
import { ACCEPTED_IMAGE_TYPES } from "../hooks/useImageSlots";
import type { AddFilesResult, ImageSlot } from "../hooks/useImageSlots";
import { MediaSlotControl } from "./MediaSlotControl";

const rigs = [{ id: "orbit-carousel", name: "Orbit Carousel", status: "Active" }];

interface LeftPanelProps {
  activeRigId: string;
  addFiles: (files: File[]) => AddFilesResult;
  clearAllSlots: () => void;
  isDrawer: boolean;
  isVisible: boolean;
  mediaAnnouncement: string;
  mediaNotice: string | null;
  moveSlot: (fromIndex: number, toIndex: number) => void;
  onLoadDemo: () => void;
  onRequestClose: () => void;
  removeSlot: (index: number) => void;
  replaceSlot: (index: number, file: File) => boolean;
  selectSlot: (index: number) => void;
  selectedIndex: number;
  slots: ImageSlot[];
}

type WorkspaceSection = "create" | "media" | "presets";

export function LeftPanel({
  activeRigId,
  addFiles,
  clearAllSlots,
  isDrawer,
  isVisible,
  mediaAnnouncement,
  mediaNotice,
  moveSlot,
  onLoadDemo,
  onRequestClose,
  removeSlot,
  replaceSlot,
  selectSlot,
  selectedIndex,
  slots,
}: LeftPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("media");
  const [dropState, setDropState] = useState<"idle" | "valid" | "invalid">("idle");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [pendingReplacement, setPendingReplacement] = useState<File | null>(null);

  const receiveFiles = (files: File[]) => {
    if (!files.length) {
      return;
    }
    const hasEmptySlot = slots.some((slot) => slot.status === "empty" || slot.status === "error");
    if (!hasEmptySlot) {
      setPendingReplacement(files[0]);
      return;
    }
    addFiles(files);
  };

  const isValidDrag = (types: string[]) =>
    types.length > 0 && types.every((type) => ACCEPTED_IMAGE_TYPES.split(",").includes(type));

  return (
    <aside
      aria-hidden={!isVisible}
      aria-label={isDrawer ? "Media drawer" : "Media rail"}
      className={isVisible ? "panel left-panel panel-open" : "panel left-panel"}
      data-workspace-drawer="media"
      id="media-panel"
    >
      <div className="panel-chrome">
        <span>{isDrawer ? "Media drawer" : "Media rail"}</span>
        <button
          aria-label={isDrawer ? "Close media drawer" : "Collapse media rail"}
          data-drawer-close
          type="button"
          onClick={onRequestClose}
        >
          {isDrawer ? "Close" : "Hide"}
        </button>
      </div>
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
                  <span><strong>{rig.name}</strong><small>4 image spatial loop</small></span>
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
                <h2 id="media-heading">Carousel sequence</h2>
              </div>
              <span className="media-count">
                {slots.filter((slot) => slot.status === "ready" || slot.status === "loading").length}/4
              </span>
            </div>

            <div
              className={`media-dropzone media-dropzone-${dropState}`}
              onDragEnter={(event) => {
                event.preventDefault();
                dragDepthRef.current += 1;
                const types = Array.from(event.dataTransfer.items)
                  .filter((item) => item.kind === "file")
                  .map((item) => item.type);
                setDropState(isValidDrag(types) ? "valid" : "invalid");
              }}
              onDragLeave={() => {
                dragDepthRef.current -= 1;
                if (dragDepthRef.current <= 0) {
                  dragDepthRef.current = 0;
                  setDropState("idle");
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(event) => {
                event.preventDefault();
                dragDepthRef.current = 0;
                setDropState("idle");
                receiveFiles(Array.from(event.dataTransfer.files));
              }}
            >
              <input
                accept={ACCEPTED_IMAGE_TYPES}
                className="media-slot-input"
                multiple
                onChange={(event) => {
                  receiveFiles(Array.from(event.target.files ?? []));
                  event.currentTarget.value = "";
                }}
                ref={inputRef}
                type="file"
              />
              <strong>{dropState === "invalid" ? "That file type isn’t supported" : "Drop images here"}</strong>
              <span>JPEG, PNG, WebP, or GIF · up to 25 MB each</span>
              <button type="button" onClick={() => inputRef.current?.click()}>Add images</button>
            </div>

            <p className="media-guidance">
              Portrait images around 900 × 1160 work best. Files stay in this browser session and are not uploaded.
            </p>

            {pendingReplacement ? (
              <div className="replacement-prompt" role="status" aria-live="polite">
                <strong>All slots are full</strong>
                <p>Replace selected Slot {selectedIndex + 1} with {pendingReplacement.name}?</p>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      replaceSlot(selectedIndex, pendingReplacement);
                      setPendingReplacement(null);
                    }}
                  >
                    Replace selected
                  </button>
                  <button type="button" onClick={() => setPendingReplacement(null)}>Cancel</button>
                </div>
              </div>
            ) : null}

            {mediaNotice ? <p className="media-notice" role="status">{mediaNotice}</p> : null}

            <div className="media-slot-list" role="list" aria-label="Orbit Carousel media order">
              {slots.map((slot, index) => (
                <MediaSlotControl
                  dragOver={dragOverIndex === index}
                  index={index}
                  isSelected={selectedIndex === index}
                  key={slot.id}
                  onDragEnd={() => {
                    setDraggingIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragOver={setDragOverIndex}
                  onDragStart={setDraggingIndex}
                  onDrop={(toIndex) => {
                    if (draggingIndex !== null) {
                      moveSlot(draggingIndex, toIndex);
                    }
                    setDraggingIndex(null);
                    setDragOverIndex(null);
                  }}
                  onMove={moveSlot}
                  onRemove={removeSlot}
                  onReplace={replaceSlot}
                  onSelect={selectSlot}
                  slot={slot}
                  slotCount={slots.length}
                />
              ))}
            </div>

            <div className="media-utility-row">
              <button type="button" onClick={onLoadDemo}>Load demo</button>
              <button
                disabled={slots.every((slot) => slot.status === "empty")}
                type="button"
                onClick={clearAllSlots}
              >
                Clear all
              </button>
            </div>
            <p className="sr-only" aria-live="polite">{mediaAnnouncement}</p>
          </section>
        ) : null}

        {activeSection === "presets" ? (
          <section aria-labelledby="presets-heading">
            <p className="eyebrow">Presets</p>
            <h2 id="presets-heading">Starting looks</h2>
            <div className="preset-list" aria-label="Preset previews">
              {[["Studio", "Balanced depth"], ["Editorial", "Tighter composition"], ["Launch", "Wide spatial spread"]].map(([name, description]) => (
                <button disabled key={name} type="button"><span>{name}</span><small>{description} · Soon</small></button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
