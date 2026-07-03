import { useRef } from "react";
import type { ImageSlot } from "../hooks/useImageSlots";

interface MediaSlotControlProps {
  slot: ImageSlot;
  index: number;
  onClear: (index: number) => void;
  onUpload: (index: number, file: File) => void;
}

export function MediaSlotControl({ slot, index, onClear, onUpload }: MediaSlotControlProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasImage = slot.status === "ready" && Boolean(slot.image);

  return (
    <div className={slot.errorMessage ? "media-slot media-slot-error" : "media-slot"}>
      <div className="media-slot-info">
        <span className={getStatusClassName(slot, hasImage)} />
        <div>
          <p>Slot {index + 1}</p>
          <small aria-live="polite">{getSlotLabel(slot)}</small>
        </div>
      </div>

      <div className="media-slot-actions">
        <input
          accept="image/*"
          className="media-slot-input"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onUpload(index, file);
            }

            event.currentTarget.value = "";
          }}
          ref={inputRef}
          type="file"
        />
        <button type="button" onClick={() => inputRef.current?.click()}>
          {hasImage ? "Replace" : "Upload"}
        </button>
        <button
          className="ghost-control"
          disabled={!slot.image && slot.status !== "loading" && slot.status !== "error"}
          type="button"
          onClick={() => onClear(index)}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function getStatusClassName(slot: ImageSlot, hasImage: boolean) {
  if (slot.errorMessage) {
    return "slot-status slot-status-error";
  }

  return hasImage ? "slot-status slot-status-ready" : "slot-status";
}

function getSlotLabel(slot: ImageSlot) {
  if (slot.status === "loading") {
    return "Loading image";
  }

  if (slot.errorMessage) {
    return slot.errorMessage;
  }

  return slot.fileName ?? "Using placeholder";
}
