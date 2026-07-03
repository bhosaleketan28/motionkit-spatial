import { useEffect, useRef } from "react";

export function useAnimationFrame(
  callback: (deltaMs: number) => void,
  isRunning: boolean,
) {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  callbackRef.current = callback;

  useEffect(() => {
    if (!isRunning) {
      previousTimeRef.current = null;
      return;
    }

    const tick = (time: number) => {
      const previous = previousTimeRef.current ?? time;
      const deltaMs = time - previous;
      previousTimeRef.current = time;

      callbackRef.current(deltaMs);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
      previousTimeRef.current = null;
    };
  }, [isRunning]);
}
