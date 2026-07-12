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

export interface BaseRigSettings {
  durationSeconds: number;
  frameRatio: FrameRatio;
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

export type RigInspectorSectionId = "motion" | "appearance" | "background" | "export";

export interface RigInspectorSection {
  defaultOpen: boolean;
  id: RigInspectorSectionId;
  label: string;
}

export interface RigMediaRequirements {
  acceptedTypes: string[];
  maxFileBytes: number;
  maxItems: number;
  minItems: number;
  preferredDimensions: string;
  requiredForExport: number;
}

export interface RigCapabilities {
  looping: boolean;
  supportsBackground: boolean;
  supportsDirection: boolean;
  supportsShapes: boolean;
  supportsTransparentBackground: boolean;
}

export interface RigExportMetadata {
  defaultDuration: number;
  fileNamePrefix: string;
  supportsTransparentBackground: boolean;
}

export interface RigPresetCompatibility {
  schemaId: string;
  version: number;
}

export interface RigPresetPreviewStyle {
  accent: string;
  colors: readonly [string, string];
}

export interface RigPreset<Settings extends BaseRigSettings> {
  description: string;
  id: string;
  name: string;
  ownedProperties: readonly (keyof Settings)[];
  previewStyle: RigPresetPreviewStyle;
  rigId: string;
  schemaId: string;
  settingsPatch: Partial<Settings>;
  version: number;
}

export interface RigDemoMedia {
  label: string;
  src: string;
}

export interface RigRenderInput<Settings extends BaseRigSettings> {
  context: CanvasRenderingContext2D;
  frame: FrameSize;
  progress: number;
  renderFrameGuide?: boolean;
  selectedSlotIndex?: number;
  settings: Settings;
  slotCount: number;
  slotImages?: Array<HTMLImageElement | null>;
}

export type RigRenderer<Settings extends BaseRigSettings> = (
  input: RigRenderInput<Settings>,
) => void;

export interface RigDefinition<Settings extends BaseRigSettings> {
  capabilities: RigCapabilities;
  category: string;
  defaultRatio: FrameRatio;
  defaultSettings: Settings;
  exportMetadata: RigExportMetadata;
  generateDemoMedia: () => RigDemoMedia[];
  id: string;
  inspectorSections: RigInspectorSection[];
  isSettings: (value: unknown) => value is Settings;
  longDescription: string;
  mediaRequirements: RigMediaRequirements;
  name: string;
  presetCompatibility: RigPresetCompatibility;
  presets: readonly RigPreset<Settings>[];
  render: RigRenderer<Settings>;
  shortDescription: string;
  slotCount: number;
  slotLabels: string[];
  supportedRatios: FrameRatio[];
  version: number;
}

export type OrbitCarouselRigDefinition = RigDefinition<OrbitRigSettings>;
