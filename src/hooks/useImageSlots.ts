import { useCallback, useEffect, useRef, useState } from "react";
import type { OrbitCarouselRigDefinition, RigMediaRequirements } from "../rigs/types";

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

export function createEmptyMediaSlots(count: number): ImageSlot[] {
  return Array.from({ length: count }, (_, index) => createEmptySlot(index));
}

function getFileFingerprint(file: File) {
  return `${file.name.toLowerCase()}:${file.size}:${file.lastModified}`;
}

function validateFile(file: File, requirements: RigMediaRequirements) {
  if (!requirements.acceptedTypes.includes(file.type)) {
    const accepted = requirements.acceptedTypes
      .map((type) => type.split("/").pop()?.replace("jpeg", "JPEG").toUpperCase())
      .join(", ");
    return `${file.name}: use one of these image types: ${accepted}.`;
  }

  if (file.size > requirements.maxFileBytes) {
    const maxMegabytes = Math.round(requirements.maxFileBytes / (1024 * 1024));
    return `${file.name}: image is larger than the ${maxMegabytes} MB limit.`;
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

export function useImageSlots(rig: OrbitCarouselRigDefinition) {
  const [slots, setSlots] = useState<ImageSlot[]>(() => createEmptyMediaSlots(rig.slotCount));
  const slotsRef = useRef(slots);
  const activeRigIdRef = useRef(rig.id);
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
        const validationError = validateFile(file, rig.mediaRequirements);
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
          errors.push(`${file.name}: all ${rig.slotCount} slots are full.`);
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
        setMediaAnnouncement(`${added} image${added === 1 ? "" : "s"} added to ${rig.name}.`);
      }
      return { added, errors };
    },
    [finishUndo, loadFileIntoSlot, rig.mediaRequirements, rig.name, rig.slotCount, updateSelectedId],
  );

  const replaceSlot = useCallback(
    (index: number, file: File) => {
      const validationError = validateFile(file, rig.mediaRequirements);
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
      const slotLabel = rig.slotLabels[index] ?? `Slot ${index + 1}`;
      setMediaNotice(`${file.name} added to ${slotLabel}.`);
      setMediaAnnouncement(`${slotLabel} replaced with ${file.name}.`);
      return true;
    },
    [finishUndo, loadFileIntoSlot, rig.mediaRequirements, rig.slotLabels, updateSelectedId],
  );

  const removeSlot = useCallback(
    (index: number) => {
      const current = slotsRef.current;
      const slot = current[index];
      if (!slot || slot.status === "empty") {
        return;
      }

      const slotLabel = rig.slotLabels[index] ?? `Slot ${index + 1}`;
      beginUndo(current.slice(), `${slot.fileName ?? slotLabel} removed.`);
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
      setMediaAnnouncement(`${slotLabel} removed. Undo is available.`);
    },
    [applySlots, beginUndo, invalidateSlotLoad, rig.slotLabels, updateSelectedId],
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
    const demoMedia = rig.generateDemoMedia();
    revokeDiscardedUrls(current, []);
    const nextSlots = current.map((slot, index) => {
      invalidateSlotLoad(slot.id);
      const demo = demoMedia[index];
      if (!demo) {
        return createEmptySlot(slot.id);
      }
      return {
        ...createEmptySlot(slot.id),
        fileName: demo.label,
        source: "demo" as const,
        src: demo.src,
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
    setMediaAnnouncement(`${demoMedia.length} showcase images loaded for ${rig.name}.`);
  }, [applySlots, decodeSlotSource, finishUndo, invalidateSlotLoad, rig, updateSelectedId]);

  const selectSlot = useCallback(
    (index: number) => {
      const slot = slotsRef.current[index];
      if (!slot) {
        return;
      }
      updateSelectedId(slot.id);
      setMediaAnnouncement(`${rig.slotLabels[index] ?? `Slot ${index + 1}`} selected.`);
    },
    [rig.slotLabels, updateSelectedId],
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
        `${moved.fileName ?? "Empty media slot"} moved to ${rig.slotLabels[toIndex] ?? `Slot ${toIndex + 1}`}.`,
      );
    },
    [applySlots, rig.slotLabels, updateSelectedId],
  );

  useEffect(() => {
    if (activeRigIdRef.current === rig.id && slotsRef.current.length === rig.slotCount) {
      return;
    }
    finishUndo();
    revokeDiscardedUrls(slotsRef.current, []);
    const nextSlots = createEmptyMediaSlots(rig.slotCount);
    activeRigIdRef.current = rig.id;
    applySlots(nextSlots);
    updateSelectedId(nextSlots[0]?.id ?? 0);
    setMediaNotice(`${rig.name} media slots are ready.`);
    setMediaAnnouncement(`${rig.name} media slots initialized.`);
  }, [applySlots, finishUndo, rig.id, rig.name, rig.slotCount, updateSelectedId]);

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
