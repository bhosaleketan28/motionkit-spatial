import { useEffect, useRef } from "react";

export function useAnimationFrame(
  callback: (deltaMs: number) => void,
  isRunning: boolean,
  targetFps?: number,
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

    const minimumFrameInterval = targetFps ? 1000 / targetFps : 0;

    const schedule = () => {
      if (frameRef.current === null && !document.hidden) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    const tick = (time: number) => {
      frameRef.current = null;
      const previous = previousTimeRef.current;
      if (previous === null) {
        previousTimeRef.current = time;
        schedule();
        return;
      }
      const deltaMs = time - previous;

      if (!minimumFrameInterval || deltaMs >= minimumFrameInterval - 1) {
        previousTimeRef.current = time;
        callbackRef.current(deltaMs);
      }

      schedule();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        previousTimeRef.current = null;
        return;
      }

      schedule();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    schedule();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
      previousTimeRef.current = null;
    };
  }, [isRunning, targetFps]);
}
