import { useRef } from "react";
import type { ImageSlot } from "../hooks/useImageSlots";

interface MediaSlotControlProps {
  acceptedTypes: string[];
  dragOver: boolean;
  index: number;
  isSelected: boolean;
  onDragEnd: () => void;
  onDragOver: (index: number) => void;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  onReplace: (index: number, file: File) => void;
  onSelect: (index: number) => void;
  slot: ImageSlot;
  slotCount: number;
  slotLabel: string;
}

export function MediaSlotControl({
  acceptedTypes,
  dragOver,
  index,
  isSelected,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onMove,
  onRemove,
  onReplace,
  onSelect,
  slot,
  slotCount,
  slotLabel,
}: MediaSlotControlProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasMedia = slot.status !== "empty" && slot.status !== "error";

  return (
    <div
      aria-label={`${slotLabel}, ${getSlotLabel(slot)}`}
      aria-current={isSelected ? "true" : undefined}
      className={[
        "media-card",
        isSelected ? "media-card-selected" : "",
        slot.errorMessage ? "media-card-error" : "",
        dragOver ? "media-card-drag-over" : "",
      ].filter(Boolean).join(" ")}
      onClick={() => onSelect(index)}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver(index);
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDrop(index);
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(index);
        }
      }}
      role="listitem"
      tabIndex={0}
    >
      <div className="media-card-main">
        <div className="media-thumbnail" aria-hidden="true">
          {slot.src ? <img alt="" src={slot.src} /> : <span>{index + 1}</span>}
          {slot.status === "loading" ? <i className="media-thumbnail-loading" /> : null}
        </div>
        <div className="media-card-copy">
          <div className="media-card-title-row">
            <strong>{slotLabel}</strong>
            {isSelected ? <span className="selected-badge">Selected</span> : null}
          </div>
          <span>{getSlotLabel(slot)}</span>
          <small>{getSourceLabel(slot)}</small>
        </div>
        <button
          aria-label={`Drag ${slotLabel} to reorder`}
          className="drag-handle"
          draggable
          onClick={(event) => event.stopPropagation()}
          onDragEnd={onDragEnd}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(index));
            onDragStart(index);
          }}
          title="Drag to reorder"
          type="button"
        >
          <span aria-hidden="true">⠿</span>
        </button>
      </div>

      {slot.errorMessage ? <p className="media-card-error-text">{slot.errorMessage}</p> : null}

      <div className="media-card-actions">
        <input
          accept={acceptedTypes.join(",")}
          className="media-slot-input"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onReplace(index, file);
            }
            event.currentTarget.value = "";
          }}
          ref={inputRef}
          type="file"
        />
        <button
          aria-label={`${hasMedia ? "Replace" : "Add image to"} ${slotLabel}`}
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
          type="button"
        >
          {hasMedia ? "Replace" : "Add image"}
        </button>
        <button
          aria-label={`Remove image from ${slotLabel}`}
          disabled={!hasMedia && slot.status !== "error"}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(index);
          }}
          type="button"
        >
          Remove
        </button>
        <div className="media-order-actions" aria-label={`Reorder ${slotLabel}`}>
          <button
            aria-label={`Move ${slotLabel} earlier`}
            disabled={index === 0}
            onClick={(event) => {
              event.stopPropagation();
              onMove(index, index - 1);
            }}
            title="Move earlier"
            type="button"
          >
            ↑
          </button>
          <button
            aria-label={`Move ${slotLabel} later`}
            disabled={index === slotCount - 1}
            onClick={(event) => {
              event.stopPropagation();
              onMove(index, index + 1);
            }}
            title="Move later"
            type="button"
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
}

function getSlotLabel(slot: ImageSlot) {
  if (slot.status === "loading") {
    return "Loading image…";
  }
  if (slot.status === "error") {
    return slot.fileName ?? "Image unavailable";
  }
  return slot.fileName ?? "Empty slot";
}

function getSourceLabel(slot: ImageSlot) {
  if (slot.source === "demo") {
    return "MotionKit showcase";
  }
  if (slot.source === "upload" && slot.fileSize) {
    return `${formatBytes(slot.fileSize)} · Local only`;
  }
  return "Placeholder shown on stage";
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
