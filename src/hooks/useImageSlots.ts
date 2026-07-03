import { useCallback, useEffect, useRef, useState } from "react";

export interface ImageSlot {
  errorMessage: string | null;
  id: number;
  fileName: string | null;
  image: HTMLImageElement | null;
  objectUrl: string | null;
  status: "empty" | "loading" | "ready" | "error";
}

function createEmptySlots(count: number): ImageSlot[] {
  return Array.from({ length: count }, (_, index) => ({
    errorMessage: null,
    id: index,
    fileName: null,
    image: null,
    objectUrl: null,
    status: "empty",
  }));
}

export function useImageSlots(slotCount: number) {
  const [slots, setSlots] = useState<ImageSlot[]>(() => createEmptySlots(slotCount));
  const objectUrlsRef = useRef<(string | null)[]>(createEmptySlots(slotCount).map(() => null));

  const revokeSlotUrl = useCallback((index: number) => {
    const existingUrl = objectUrlsRef.current[index];

    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
      objectUrlsRef.current[index] = null;
    }
  }, []);

  const setSlotFile = useCallback(
    (index: number, file: File) => {
      if (!file.type.startsWith("image/")) {
        setSlots((current) =>
          current.map((slot, slotIndex) =>
            slotIndex === index
              ? {
                  ...slot,
                  errorMessage: "Choose an image file.",
                  status: slot.image ? "ready" : "error",
                }
              : slot,
          ),
        );
        return;
      }

      revokeSlotUrl(index);

      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.decoding = "async";
      objectUrlsRef.current[index] = objectUrl;

      setSlots((current) =>
        current.map((slot, slotIndex) =>
          slotIndex === index
            ? {
                ...slot,
                errorMessage: null,
                fileName: file.name,
                image: null,
                objectUrl,
                status: "loading",
              }
            : slot,
        ),
      );

      image.onload = () => {
        if (objectUrlsRef.current[index] !== objectUrl) {
          return;
        }

        setSlots((current) =>
          current.map((slot, slotIndex) =>
            slotIndex === index
              ? {
                  ...slot,
                  errorMessage: null,
                  image,
                  status: "ready",
                }
              : slot,
          ),
        );
      };

      image.onerror = () => {
        if (objectUrlsRef.current[index] !== objectUrl) {
          return;
        }

        revokeSlotUrl(index);
        setSlots((current) =>
          current.map((slot, slotIndex) =>
            slotIndex === index
              ? {
                  ...slot,
                  errorMessage: "This image could not be loaded.",
                  image: null,
                  objectUrl: null,
                  status: "error",
                }
              : slot,
          ),
        );
      };

      image.src = objectUrl;
    },
    [revokeSlotUrl],
  );

  const clearSlot = useCallback(
    (index: number) => {
      revokeSlotUrl(index);
      setSlots((current) =>
        current.map((slot, slotIndex) =>
          slotIndex === index
            ? {
              ...slot,
                errorMessage: null,
                fileName: null,
                image: null,
                objectUrl: null,
                status: "empty",
              }
            : slot,
        ),
      );
    },
    [revokeSlotUrl],
  );

  const clearAllSlots = useCallback(() => {
    objectUrlsRef.current.forEach((objectUrl) => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    });
    objectUrlsRef.current = createEmptySlots(slotCount).map(() => null);
    setSlots(createEmptySlots(slotCount));
  }, [slotCount]);

  useEffect(() => {
    setSlots((current) => {
      if (current.length === slotCount) {
        return current;
      }

      objectUrlsRef.current.forEach((objectUrl) => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      });

      objectUrlsRef.current = createEmptySlots(slotCount).map(() => null);
      return createEmptySlots(slotCount);
    });
  }, [slotCount]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((objectUrl) => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      });
    };
  }, []);

  return {
    slots,
    slotImages: slots.map((slot) => slot.image),
    setSlotFile,
    clearSlot,
    clearAllSlots,
  };
}
