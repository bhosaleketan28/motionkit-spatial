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
        fileName: `Demo image ${index + 1}`,
        source: "demo" as const,
        src,
        status: "loading" as const,
      };
    });
    applySlots(nextSlots);
    nextSlots.forEach((slot) => {
      if (slot.src) {
        decodeSlotSource(slot.id, slot.src, "Demo image could not be decoded.");
      }
    });
    updateSelectedId(nextSlots[0].id);
    setMediaNotice("Demo images loaded. Replace any slot with your own media.");
    setMediaAnnouncement("Four demo images loaded.");
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
  const palettes = [
    ["#e95f55", "#ffe1bc", "#351915"],
    ["#2e776d", "#d7f0e7", "#092a26"],
    ["#4d65b4", "#dce5ff", "#111f55"],
    ["#d7a73f", "#fff3c5", "#3b2a05"],
  ];
  const [accent, soft, ink] = palettes[index % palettes.length];

  canvas.width = 900;
  canvas.height = 1160;

  if (!context) {
    return "";
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, soft);
  gradient.addColorStop(0.58, accent);
  gradient.addColorStop(1, ink);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255, 255, 255, 0.88)";
  roundRect(context, 74, 82, 752, 92, 28);
  context.fill();

  context.fillStyle = ink;
  context.font = "700 42px Inter, system-ui, sans-serif";
  context.fillText(["Launch", "Feature", "Dashboard", "Update"][index % 4], 112, 142);

  context.fillStyle = "rgba(255, 255, 255, 0.28)";
  roundRect(context, 92, 248, 716, 420, 46);
  context.fill();

  context.fillStyle = "rgba(255, 255, 255, 0.72)";
  roundRect(context, 136, 310, 396, 42, 20);
  context.fill();
  roundRect(context, 136, 384, 560, 28, 14);
  context.fill();
  roundRect(context, 136, 440, 462, 28, 14);
  context.fill();

  context.fillStyle = "rgba(255, 255, 255, 0.3)";
  context.beginPath();
  context.arc(636, 500, 128, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(255, 255, 255, 0.86)";
  roundRect(context, 92, 744, 716, 238, 38);
  context.fill();

  context.fillStyle = accent;
  roundRect(context, 136, 804, 168, 46, 23);
  context.fill();

  context.fillStyle = "rgba(31, 37, 41, 0.22)";
  roundRect(context, 344, 816, 330, 22, 11);
  context.fill();
  roundRect(context, 136, 900, 534, 26, 13);
  context.fill();

  context.fillStyle = "rgba(255, 255, 255, 0.5)";
  context.font = "600 30px Inter, system-ui, sans-serif";
  context.fillText(`Demo ${index + 1}`, 112, 1060);

  return canvas.toDataURL("image/png");
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
