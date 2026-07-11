import { useCallback, useEffect, useRef, useState } from "react";

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export interface ImageSlot {
  errorMessage: string | null;
  fileName: string | null;
  fileSize: number | null;
  fingerprint: string | null;
  id: number;
  image: HTMLImageElement | null;
  objectUrl: string | null;
  source: "demo" | "upload" | null;
  src: string | null;
  status: "empty" | "loading" | "ready" | "error";
}

export interface AddFilesResult {
  added: number;
  errors: string[];
}

export interface MediaUndoAction {
  message: string;
}

interface UndoSnapshot {
  message: string;
  selectedId: number;
  slots: ImageSlot[];
}

const SUPPORTED_TYPES = new Set(ACCEPTED_IMAGE_TYPES.split(","));
const UNDO_DURATION = 8000;

function createEmptySlot(id: number): ImageSlot {
  return {
    errorMessage: null,
    fileName: null,
    fileSize: null,
    fingerprint: null,
    id,
    image: null,
    objectUrl: null,
    source: null,
    src: null,
    status: "empty",
  };
}

function createEmptySlots(count: number): ImageSlot[] {
  return Array.from({ length: count }, (_, index) => createEmptySlot(index));
}

function getFileFingerprint(file: File) {
  return `${file.name.toLowerCase()}:${file.size}:${file.lastModified}`;
}

function validateFile(file: File) {
  if (!SUPPORTED_TYPES.has(file.type)) {
    return `${file.name}: use a JPEG, PNG, WebP, or GIF image.`;
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: image is larger than the 25 MB limit.`;
  }

  return null;
}

function getUrlSet(slots: ImageSlot[]) {
  return new Set(slots.flatMap((slot) => (slot.objectUrl ? [slot.objectUrl] : [])));
}

function revokeDiscardedUrls(discarded: ImageSlot[], retained: ImageSlot[]) {
  const retainedUrls = getUrlSet(retained);
  getUrlSet(discarded).forEach((url) => {
    if (!retainedUrls.has(url)) {
      URL.revokeObjectURL(url);
    }
  });
}

export function useImageSlots(slotCount: number) {
  const [slots, setSlots] = useState<ImageSlot[]>(() => createEmptySlots(slotCount));
  const slotsRef = useRef(slots);
  const loadIdsRef = useRef(new Map<number, number>());
  const [selectedSlotId, setSelectedSlotId] = useState(0);
  const selectedSlotIdRef = useRef(selectedSlotId);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);
  const [mediaAnnouncement, setMediaAnnouncement] = useState("");
  const [undoAction, setUndoAction] = useState<MediaUndoAction | null>(null);
  const undoRef = useRef<UndoSnapshot | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const applySlots = useCallback((nextSlots: ImageSlot[]) => {
    slotsRef.current = nextSlots;
    setSlots(nextSlots);
  }, []);

  const updateSelectedId = useCallback((id: number) => {
    selectedSlotIdRef.current = id;
    setSelectedSlotId(id);
  }, []);

  const invalidateSlotLoad = useCallback((id: number) => {
    loadIdsRef.current.set(id, (loadIdsRef.current.get(id) ?? 0) + 1);
  }, []);

  const finishUndo = useCallback(() => {
    const snapshot = undoRef.current;
    if (!snapshot) {
      return;
    }

    revokeDiscardedUrls(snapshot.slots, slotsRef.current);
    undoRef.current = null;
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoAction(null);
  }, []);

  const beginUndo = useCallback(
    (snapshot: ImageSlot[], message: string) => {
      finishUndo();
      undoRef.current = {
        message,
        selectedId: selectedSlotIdRef.current,
        slots: snapshot,
      };
      setUndoAction({ message });
      undoTimerRef.current = window.setTimeout(finishUndo, UNDO_DURATION);
    },
    [finishUndo],
  );

  const decodeSlotSource = useCallback(
    (slotId: number, src: string, errorMessage: string) => {
      const image = new Image();
      const loadId = (loadIdsRef.current.get(slotId) ?? 0) + 1;
      loadIdsRef.current.set(slotId, loadId);
      image.decoding = "async";

      image.onload = () => {
        const currentSlot = slotsRef.current.find((slot) => slot.id === slotId);
        if (
          loadIdsRef.current.get(slotId) !== loadId ||
          currentSlot?.src !== src ||
          image.naturalWidth < 1 ||
          image.naturalHeight < 1
        ) {
          return;
        }

        const nextSlots = slotsRef.current.map((slot) =>
          slot.id === slotId
            ? { ...slot, errorMessage: null, image, status: "ready" as const }
            : slot,
        );
        applySlots(nextSlots);
      };

      image.onerror = () => {
        const currentSlot = slotsRef.current.find((slot) => slot.id === slotId);
        if (loadIdsRef.current.get(slotId) !== loadId || currentSlot?.src !== src) {
          return;
        }

        if (currentSlot.objectUrl) {
          URL.revokeObjectURL(currentSlot.objectUrl);
        }
        const nextSlots = slotsRef.current.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                errorMessage,
                image: null,
                objectUrl: null,
                source: null,
                src: null,
                status: "error" as const,
              }
            : slot,
        );
        applySlots(nextSlots);
        setMediaNotice(errorMessage);
      };

      image.src = src;
    },
    [applySlots],
  );

  const loadFileIntoSlot = useCallback(
    (index: number, file: File) => {
      const currentSlot = slotsRef.current[index];
      if (!currentSlot) {
        return;
      }

      invalidateSlotLoad(currentSlot.id);
      if (currentSlot.objectUrl) {
        URL.revokeObjectURL(currentSlot.objectUrl);
      }

      const objectUrl = URL.createObjectURL(file);
      const nextSlot: ImageSlot = {
        ...currentSlot,
        errorMessage: null,
        fileName: file.name,
        fileSize: file.size,
        fingerprint: getFileFingerprint(file),
        image: null,
        objectUrl,
        source: "upload",
        src: objectUrl,
        status: "loading",
      };
      const nextSlots = slotsRef.current.map((slot, slotIndex) =>
        slotIndex === index ? nextSlot : slot,
      );
      applySlots(nextSlots);
      decodeSlotSource(currentSlot.id, objectUrl, `${file.name}: the image could not be decoded.`);
    },
    [applySlots, decodeSlotSource, invalidateSlotLoad],
  );

  const addFiles = useCallback(
    (files: File[]): AddFilesResult => {
      finishUndo();
      const errors: string[] = [];
      let added = 0;
      const fingerprints = new Set(
        slotsRef.current.flatMap((slot) => (slot.fingerprint ? [slot.fingerprint] : [])),
      );

      files.forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
          return;
        }

        const fingerprint = getFileFingerprint(file);
        if (fingerprints.has(fingerprint)) {
          errors.push(`${file.name}: this image is already in the media set.`);
          return;
        }

        const emptyIndex = slotsRef.current.findIndex(
          (slot) => slot.status === "empty" || slot.status === "error",
        );
        if (emptyIndex < 0) {
          errors.push(`${file.name}: all four slots are full.`);
          return;
        }

        loadFileIntoSlot(emptyIndex, file);
        fingerprints.add(fingerprint);
        added += 1;
        if (added === 1) {
          updateSelectedId(slotsRef.current[emptyIndex].id);
        }
      });

      const parts = [
        added ? `${added} image${added === 1 ? "" : "s"} added.` : "",
        ...errors,
      ].filter(Boolean);
      setMediaNotice(parts.join(" ") || null);
      if (added) {
        setMediaAnnouncement(`${added} image${added === 1 ? "" : "s"} added to the carousel.`);
      }
      return { added, errors };
    },
    [finishUndo, loadFileIntoSlot, updateSelectedId],
  );

  const replaceSlot = useCallback(
    (index: number, file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setMediaNotice(validationError);
        return false;
      }

      const fingerprint = getFileFingerprint(file);
      const isDuplicate = slotsRef.current.some(
        (slot, slotIndex) => slotIndex !== index && slot.fingerprint === fingerprint,
      );
      if (isDuplicate) {
        setMediaNotice(`${file.name}: this image is already in another slot.`);
        return false;
      }

      finishUndo();
      loadFileIntoSlot(index, file);
      updateSelectedId(slotsRef.current[index].id);
      setMediaNotice(`${file.name} added to Slot ${index + 1}.`);
      setMediaAnnouncement(`Slot ${index + 1} replaced with ${file.name}.`);
      return true;
    },
    [finishUndo, loadFileIntoSlot, updateSelectedId],
  );

  const removeSlot = useCallback(
    (index: number) => {
      const current = slotsRef.current;
      const slot = current[index];
      if (!slot || slot.status === "empty") {
        return;
      }

      beginUndo(current.slice(), `${slot.fileName ?? `Slot ${index + 1}`} removed.`);
      invalidateSlotLoad(slot.id);
      const nextSlots = current.map((item, slotIndex) =>
        slotIndex === index ? createEmptySlot(item.id) : item,
      );
      applySlots(nextSlots);

      if (selectedSlotIdRef.current === slot.id) {
        const nextIndex = index < nextSlots.length - 1 ? index + 1 : Math.max(0, index - 1);
        updateSelectedId(nextSlots[nextIndex].id);
      }
      setMediaNotice(null);
      setMediaAnnouncement(`Slot ${index + 1} removed. Undo is available.`);
    },
    [applySlots, beginUndo, invalidateSlotLoad, updateSelectedId],
  );

  const clearAllSlots = useCallback(() => {
    const current = slotsRef.current;
    if (current.every((slot) => slot.status === "empty")) {
      return;
    }

    beginUndo(current.slice(), "All media cleared.");
    current.forEach((slot) => invalidateSlotLoad(slot.id));
    const nextSlots = current.map((slot) => createEmptySlot(slot.id));
    applySlots(nextSlots);
    updateSelectedId(nextSlots[0].id);
    setMediaNotice(null);
    setMediaAnnouncement("All media cleared. Undo is available.");
  }, [applySlots, beginUndo, invalidateSlotLoad, updateSelectedId]);

  const undo = useCallback(() => {
    const snapshot = undoRef.current;
    if (!snapshot) {
      return;
    }

    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    revokeDiscardedUrls(slotsRef.current, snapshot.slots);
    undoRef.current = null;
    setUndoAction(null);
    applySlots(snapshot.slots);
    updateSelectedId(snapshot.selectedId);
    snapshot.slots.forEach((slot) => {
      if (slot.status === "loading" && slot.src) {
        decodeSlotSource(
          slot.id,
          slot.src,
          `${slot.fileName ?? "Image"}: the image could not be decoded.`,
        );
      }
    });
    setMediaAnnouncement("Media restored.");
  }, [applySlots, decodeSlotSource, updateSelectedId]);

  const loadDemoSlots = useCallback(() => {
    finishUndo();
    const current = slotsRef.current;
    revokeDiscardedUrls(current, []);
    const nextSlots = current.map((slot, index) => {
      invalidateSlotLoad(slot.id);
      const src = createDemoImageDataUrl(index);
      return {
        ...createEmptySlot(slot.id),
        fileName: ["Luma overview", "Luma library", "Luma insights", "Luma launch plan"][index],
        source: "demo" as const,
        src,
        status: "loading" as const,
      };
    });
    applySlots(nextSlots);
    nextSlots.forEach((slot) => {
      if (slot.src) {
        decodeSlotSource(slot.id, slot.src, "Showcase image could not be decoded.");
      }
    });
    updateSelectedId(nextSlots[0].id);
    setMediaNotice("MotionKit showcase loaded. Replace any slot with your own media.");
    setMediaAnnouncement("Four showcase images loaded.");
  }, [applySlots, decodeSlotSource, finishUndo, invalidateSlotLoad, updateSelectedId]);

  const selectSlot = useCallback(
    (index: number) => {
      const slot = slotsRef.current[index];
      if (!slot) {
        return;
      }
      updateSelectedId(slot.id);
      setMediaAnnouncement(`Slot ${index + 1} selected.`);
    },
    [updateSelectedId],
  );

  const moveSlot = useCallback(
    (fromIndex: number, toIndex: number) => {
      const current = slotsRef.current;
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= current.length ||
        toIndex >= current.length
      ) {
        return;
      }

      const nextSlots = current.slice();
      const [moved] = nextSlots.splice(fromIndex, 1);
      nextSlots.splice(toIndex, 0, moved);
      applySlots(nextSlots);
      updateSelectedId(moved.id);
      setMediaAnnouncement(
        `${moved.fileName ?? "Empty media slot"} moved to Slot ${toIndex + 1}.`,
      );
    },
    [applySlots, updateSelectedId],
  );

  useEffect(() => {
    if (slotsRef.current.length === slotCount) {
      return;
    }
    finishUndo();
    revokeDiscardedUrls(slotsRef.current, []);
    const nextSlots = createEmptySlots(slotCount);
    applySlots(nextSlots);
    updateSelectedId(nextSlots[0]?.id ?? 0);
  }, [applySlots, finishUndo, slotCount, updateSelectedId]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
      }
      const pendingSlots = undoRef.current?.slots ?? [];
      revokeDiscardedUrls([...slotsRef.current, ...pendingSlots], []);
    };
  }, []);

  const selectedIndex = Math.max(
    0,
    slots.findIndex((slot) => slot.id === selectedSlotId),
  );

  return {
    addFiles,
    clearAllSlots,
    dismissUndo: finishUndo,
    dismissNotice: () => setMediaNotice(null),
    loadDemoSlots,
    mediaAnnouncement,
    mediaNotice,
    moveSlot,
    removeSlot,
    replaceSlot,
    selectSlot,
    selectedIndex,
    slotImages: slots.map((slot) => (slot.status === "ready" ? slot.image : null)),
    slots,
    undo,
    undoAction,
  };
}

function createDemoImageDataUrl(index: number) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const accent = ["#64d6b5", "#ef8b72", "#8ca9f5", "#e5bd67"][index % 4];
  const pale = ["#dff8ef", "#fbe4dc", "#e5ebff", "#f8edcf"][index % 4];
  const ink = "#111719";
  const muted = "#6f7775";
  const line = "#d8ddd8";

  canvas.width = 900;
  canvas.height = 1160;

  if (!context) {
    return "";
  }

  context.fillStyle = "#f1f0ea";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = ink;
  roundRect(context, 54, 48, 792, 92, 28);
  context.fill();
  context.fillStyle = accent;
  context.beginPath();
  context.arc(100, 94, 18, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#f9faf7";
  context.font = "700 28px Inter, system-ui, sans-serif";
  context.fillText("LUMA FIELD", 134, 104);
  context.fillStyle = "#9ca4a1";
  context.font = "600 20px Inter, system-ui, sans-serif";
  context.fillText("CAMPAIGN OS", 660, 104);

  context.fillStyle = "#fffefa";
  roundRect(context, 54, 164, 792, 938, 34);
  context.fill();

  drawDemoScreen(context, index % 4, { accent, ink, line, muted, pale });

  return canvas.toDataURL("image/png");
}

function drawDemoScreen(
  context: CanvasRenderingContext2D,
  index: number,
  colors: { accent: string; ink: string; line: string; muted: string; pale: string },
) {
  const { accent, ink, line, muted, pale } = colors;
  const title = ["Summer release", "Asset library", "Campaign pulse", "Launch plan"][index];
  const kicker = ["OVERVIEW", "CONTENT", "INSIGHTS", "SCHEDULE"][index];

  context.fillStyle = muted;
  context.font = "700 20px Inter, system-ui, sans-serif";
  context.fillText(kicker, 96, 228);
  context.fillStyle = ink;
  context.font = "760 54px Inter, system-ui, sans-serif";
  context.fillText(title, 96, 292);
  context.fillStyle = muted;
  context.font = "500 23px Inter, system-ui, sans-serif";
  context.fillText("A focused workspace for the next product story.", 96, 336);

  if (index === 0) {
    drawMetricCard(context, 96, 390, 216, 166, "72%", "Ready", accent, pale, ink, muted);
    drawMetricCard(context, 332, 390, 216, 166, "18", "Assets", "#8ca9f5", "#e5ebff", ink, muted);
    drawMetricCard(context, 568, 390, 236, 166, "4", "Markets", "#ef8b72", "#fbe4dc", ink, muted);
    drawDemoPanel(context, 96, 594, 708, 402, line);
    drawPanelLabel(context, "Release readiness", "Updated just now", 132, 650, ink, muted);
    [0.82, 0.68, 0.54].forEach((value, row) => {
      const y = 724 + row * 82;
      context.fillStyle = [accent, "#8ca9f5", "#ef8b72"][row];
      roundRect(context, 132, y, 28, 28, 8);
      context.fill();
      context.fillStyle = ink;
      context.font = "650 22px Inter, system-ui, sans-serif";
      context.fillText(["Product story", "Launch assets", "Regional review"][row], 180, y + 23);
      context.fillStyle = "#e6e9e4";
      roundRect(context, 180, y + 40, 520, 12, 6);
      context.fill();
      context.fillStyle = [accent, "#8ca9f5", "#ef8b72"][row];
      roundRect(context, 180, y + 40, 520 * value, 12, 6);
      context.fill();
    });
  } else if (index === 1) {
    const tiles = [
      [96, 390, 442, 304, accent],
      [558, 390, 246, 304, "#151c20"],
      [96, 714, 246, 282, "#8ca9f5"],
      [362, 714, 442, 282, "#e5bd67"],
    ] as const;
    tiles.forEach(([x, y, width, height, fill], tileIndex) => {
      context.fillStyle = fill;
      roundRect(context, x, y, width, height, 26);
      context.fill();
      context.fillStyle = tileIndex === 1 ? "#edf2ef" : "rgba(17, 23, 25, 0.78)";
      context.font = "700 22px Inter, system-ui, sans-serif";
      context.fillText(["Hero system", "Motion study", "Social cut", "Retail story"][tileIndex], x + 28, y + height - 36);
      context.fillStyle = tileIndex === 1 ? accent : "rgba(255,255,255,0.58)";
      context.beginPath();
      context.arc(x + width * 0.66, y + height * 0.43, Math.min(width, height) * 0.18, 0, Math.PI * 2);
      context.fill();
    });
  } else if (index === 2) {
    drawMetricCard(context, 96, 390, 216, 166, "+24%", "Reach", accent, pale, ink, muted);
    drawMetricCard(context, 332, 390, 216, 166, "3.8×", "Return", "#8ca9f5", "#e5ebff", ink, muted);
    drawMetricCard(context, 568, 390, 236, 166, "91", "Quality", "#e5bd67", "#f8edcf", ink, muted);
    drawDemoPanel(context, 96, 594, 708, 402, line);
    drawPanelLabel(context, "Weekly momentum", "Last 8 weeks", 132, 650, ink, muted);
    const bars = [0.35, 0.48, 0.42, 0.62, 0.58, 0.74, 0.68, 0.9];
    bars.forEach((value, barIndex) => {
      const height = 230 * value;
      context.fillStyle = barIndex === bars.length - 1 ? accent : pale;
      roundRect(context, 140 + barIndex * 76, 930 - height, 42, height, 14);
      context.fill();
    });
  } else {
    drawDemoPanel(context, 96, 390, 708, 606, line);
    drawPanelLabel(context, "Release sequence", "June 17–28", 132, 450, ink, muted);
    const rows = [
      ["Narrative lock", "JUN 17", "Done", accent],
      ["Asset production", "JUN 20", "Active", "#8ca9f5"],
      ["Regional handoff", "JUN 24", "Review", "#e5bd67"],
      ["Public release", "JUN 28", "Next", "#ef8b72"],
    ] as const;
    rows.forEach(([label, date, status, color], rowIndex) => {
      const y = 520 + rowIndex * 108;
      context.fillStyle = color;
      context.beginPath();
      context.arc(146, y + 20, 13, 0, Math.PI * 2);
      context.fill();
      if (rowIndex < rows.length - 1) {
        context.fillStyle = line;
        context.fillRect(143, y + 38, 6, 72);
      }
      context.fillStyle = ink;
      context.font = "680 25px Inter, system-ui, sans-serif";
      context.fillText(label, 184, y + 29);
      context.fillStyle = muted;
      context.font = "600 18px Inter, system-ui, sans-serif";
      context.fillText(date, 184, y + 62);
      context.fillStyle = pale;
      roundRect(context, 638, y, 126, 42, 21);
      context.fill();
      context.fillStyle = ink;
      context.font = "700 18px Inter, system-ui, sans-serif";
      context.fillText(status, 668, y + 28);
    });
  }
}

function drawMetricCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  value: string,
  label: string,
  accent: string,
  pale: string,
  ink: string,
  muted: string,
) {
  context.fillStyle = pale;
  roundRect(context, x, y, width, height, 24);
  context.fill();
  context.fillStyle = accent;
  roundRect(context, x + 22, y + 22, 44, 9, 5);
  context.fill();
  context.fillStyle = ink;
  context.font = "760 42px Inter, system-ui, sans-serif";
  context.fillText(value, x + 22, y + 92);
  context.fillStyle = muted;
  context.font = "620 20px Inter, system-ui, sans-serif";
  context.fillText(label, x + 22, y + 130);
}

function drawDemoPanel(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  line: string,
) {
  context.fillStyle = "#f8f8f4";
  context.strokeStyle = line;
  context.lineWidth = 2;
  roundRect(context, x, y, width, height, 26);
  context.fill();
  context.stroke();
}

function drawPanelLabel(
  context: CanvasRenderingContext2D,
  title: string,
  detail: string,
  x: number,
  y: number,
  ink: string,
  muted: string,
) {
  context.fillStyle = ink;
  context.font = "700 27px Inter, system-ui, sans-serif";
  context.fillText(title, x, y);
  context.fillStyle = muted;
  context.font = "560 19px Inter, system-ui, sans-serif";
  context.fillText(detail, x + 460, y);
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}
