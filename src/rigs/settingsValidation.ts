import type { FrameRatio } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isInRange(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function isBackground(value: unknown) {
  if (!isRecord(value)) return false;
  return (
    (value.mode === "transparent" || value.mode === "solid" || value.mode === "gradient") &&
    isHex(value.solidColor) &&
    isHex(value.gradientStart) &&
    isHex(value.gradientEnd)
  );
}

export function isSupportedRatio(value: unknown, supported: readonly FrameRatio[]) {
  return typeof value === "string" && supported.includes(value as FrameRatio);
}

function isHex(value: unknown) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}
