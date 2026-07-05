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
  const loadIdsRef = useRef<number[]>(createEmptySlots(slotCount).map(() => 0));
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
      const loadId = loadIdsRef.current[index] + 1;
      image.decoding = "async";
      loadIdsRef.current[index] = loadId;
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
        if (objectUrlsRef.current[index] !== objectUrl || loadIdsRef.current[index] !== loadId) {
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
        if (objectUrlsRef.current[index] !== objectUrl || loadIdsRef.current[index] !== loadId) {
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
      loadIdsRef.current[index] += 1;
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
    loadIdsRef.current = createEmptySlots(slotCount).map(() => 0);
    setSlots(createEmptySlots(slotCount));
  }, [slotCount]);

  const loadDemoSlots = useCallback(() => {
    objectUrlsRef.current.forEach((objectUrl) => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    });
    objectUrlsRef.current = createEmptySlots(slotCount).map(() => null);
    loadIdsRef.current = loadIdsRef.current.map((loadId) => loadId + 1);

    setSlots((current) =>
      current.map((slot, index) => ({
        ...slot,
        errorMessage: null,
        fileName: `Demo card ${index + 1}`,
        image: null,
        objectUrl: null,
        status: "loading",
      })),
    );

    Array.from({ length: slotCount }, (_, index) => {
      const loadId = loadIdsRef.current[index];
      const image = new Image();

      image.decoding = "async";
      image.onload = () => {
        if (loadIdsRef.current[index] !== loadId) {
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
        if (loadIdsRef.current[index] !== loadId) {
          return;
        }

        setSlots((current) =>
          current.map((slot, slotIndex) =>
            slotIndex === index
              ? {
                  ...slot,
                  errorMessage: "Demo image could not be loaded.",
                  image: null,
                  status: "error",
                }
              : slot,
          ),
        );
      };
      image.src = createDemoImageDataUrl(index);
    });
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
      loadIdsRef.current = createEmptySlots(slotCount).map(() => 0);
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
    loadDemoSlots,
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
