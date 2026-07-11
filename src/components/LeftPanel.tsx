import { useRef, useState } from "react";
import type { AddFilesResult, ImageSlot } from "../hooks/useImageSlots";
import type { OrbitCarouselRigDefinition } from "../rigs/types";
import { MediaSlotControl } from "./MediaSlotControl";

interface LeftPanelProps {
  activeRig: OrbitCarouselRigDefinition;
  addFiles: (files: File[]) => AddFilesResult;
  availableRigs: readonly OrbitCarouselRigDefinition[];
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

type WorkspaceSection = "create" | "media";
// Presets can be added here once the destination has a complete workflow.
const workspaceSections: WorkspaceSection[] = ["create", "media"];

export function LeftPanel({
  activeRig,
  addFiles,
  availableRigs,
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
  const isMediaFull = slots.every(
    (slot) => slot.status === "ready" || slot.status === "loading",
  );

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
    types.length > 0 && types.every((type) => activeRig.mediaRequirements.acceptedTypes.includes(type));

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
      <nav className="workspace-nav" aria-label="Workspace sections" role="tablist">
        {workspaceSections.map((section, sectionIndex) => (
          <button
            aria-controls={`${section}-workspace-panel`}
            aria-selected={activeSection === section}
            className={activeSection === section ? "workspace-nav-item selected" : "workspace-nav-item"}
            id={`${section}-workspace-tab`}
            key={section}
            onClick={() => setActiveSection(section)}
            onKeyDown={(event) => {
              let nextIndex = sectionIndex;
              if (event.key === "ArrowRight") nextIndex = (sectionIndex + 1) % workspaceSections.length;
              else if (event.key === "ArrowLeft") nextIndex = (sectionIndex - 1 + workspaceSections.length) % workspaceSections.length;
              else if (event.key === "Home") nextIndex = 0;
              else if (event.key === "End") nextIndex = workspaceSections.length - 1;
              else return;
              event.preventDefault();
              const nextSection = workspaceSections[nextIndex];
              setActiveSection(nextSection);
              document.getElementById(`${nextSection}-workspace-tab`)?.focus();
            }}
            role="tab"
            tabIndex={activeSection === section ? 0 : -1}
            type="button"
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </nav>

      <div className="left-panel-content">
        {activeSection === "create" ? (
          <section
            aria-labelledby="create-workspace-tab"
            id="create-workspace-panel"
            role="tabpanel"
          >
            <p className="eyebrow">Create</p>
            <h2 id="create-heading">Motion rig</h2>
            <div className="rig-list">
              {availableRigs.map((rig) => (
                <button
                  className={rig.id === activeRig.id ? "rig-item rig-item-active" : "rig-item"}
                  key={rig.id}
                  type="button"
                >
                  <span><strong>{rig.name}</strong><small>{rig.shortDescription}</small></span>
                  <small>{rig.id === activeRig.id ? "Active" : "Available"}</small>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === "media" ? (
          <section
            aria-labelledby="media-workspace-tab"
            id="media-workspace-panel"
            role="tabpanel"
          >
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Media</p>
                <h2 id="media-heading">Carousel sequence</h2>
              </div>
              <span className="media-count">
                {slots.filter((slot) => slot.status === "ready" || slot.status === "loading").length}/{activeRig.slotCount}
              </span>
            </div>

            <div
              className={`media-dropzone media-dropzone-${dropState}${isMediaFull ? " media-dropzone-compact" : ""}`}
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
                accept={activeRig.mediaRequirements.acceptedTypes.join(",")}
                className="media-slot-input"
                multiple
                onChange={(event) => {
                  receiveFiles(Array.from(event.target.files ?? []));
                  event.currentTarget.value = "";
                }}
                ref={inputRef}
                type="file"
              />
              <strong>
                {dropState === "invalid"
                  ? "That file type isn’t supported"
                  : isMediaFull
                    ? "Add or replace media"
                    : "Drop images here"}
              </strong>
              <span>
                {isMediaFull
                  ? `Drop or choose an image for selected ${activeRig.slotLabels[selectedIndex]}`
                  : `${formatAcceptedTypes(activeRig.mediaRequirements.acceptedTypes)} · up to ${formatMegabytes(activeRig.mediaRequirements.maxFileBytes)} MB each`}
              </span>
              <button type="button" onClick={() => inputRef.current?.click()}>
                {isMediaFull ? "Choose image" : "Add images"}
              </button>
            </div>

            <p className="media-guidance">
              {isMediaFull
                ? "Files stay local to this browser session and are not uploaded."
                : `${activeRig.mediaRequirements.preferredDimensions} Files stay in this browser session and are not uploaded.`}
            </p>

            {pendingReplacement ? (
              <div className="replacement-prompt" role="status" aria-live="polite">
                <strong>All slots are full</strong>
                <p>Replace selected {activeRig.slotLabels[selectedIndex]} with {pendingReplacement.name}?</p>
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

            <div className="media-slot-list" role="list" aria-label={`${activeRig.name} media order`}>
              {slots.map((slot, index) => (
                <MediaSlotControl
                  acceptedTypes={activeRig.mediaRequirements.acceptedTypes}
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
                  slotLabel={activeRig.slotLabels[index] ?? `Slot ${index + 1}`}
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
      </div>
    </aside>
  );
}

function formatAcceptedTypes(types: string[]) {
  const labels = types.map((type) => {
    if (type === "image/jpeg") return "JPEG";
    if (type === "image/png") return "PNG";
    if (type === "image/webp") return "WebP";
    if (type === "image/gif") return "GIF";
    return type.split("/").pop()?.toUpperCase() ?? type;
  });
  return labels.length > 1
    ? `${labels.slice(0, -1).join(", ")}, or ${labels.at(-1)}`
    : labels[0] ?? "Image";
}

function formatMegabytes(bytes: number) {
  return Math.max(1, Math.round(bytes / (1024 * 1024)));
}
