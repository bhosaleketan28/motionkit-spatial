export type FrameRatio = "1:1" | "16:9" | "9:16";

export type OrbitDirection = "clockwise" | "counter-clockwise";

export type BackgroundMode = "transparent" | "solid" | "gradient";

export type CardShape = "rectangle" | "square" | "circle" | "star";

export interface FrameSize {
  width: number;
  height: number;
}

export interface BackgroundSettings {
  gradientEnd: string;
  gradientStart: string;
  mode: BackgroundMode;
  solidColor: string;
}

export interface MotionRigControlDefaults {
  background: BackgroundSettings;
  cardShape: CardShape;
  durationSeconds: number;
  spread: number;
  depthFade: number;
  cardSize: number;
  cornerRadius: number;
  direction: OrbitDirection;
}

export interface OrbitRigSettings extends MotionRigControlDefaults {
  frameRatio: FrameRatio;
}

export interface MotionRigDefinition {
  id: string;
  name: string;
  description: string;
  mediaSlotCount: number;
  defaultFrameRatio: FrameRatio;
  defaults: MotionRigControlDefaults;
}
