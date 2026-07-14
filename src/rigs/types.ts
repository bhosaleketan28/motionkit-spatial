export type FrameRatio = "1:1" | "16:9" | "9:16";

export const RIG_FAMILIES = [
  "orbit",
  "stream",
  "grid",
  "focus",
  "stack",
  "cluster",
  "path",
  "depth",
] as const;

export type RigFamily = (typeof RIG_FAMILIES)[number];
export type RigMaturity = "production";

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
  background: BackgroundSettings;
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

export type FilmStripDirection = "left" | "right";

export interface FilmStripRigSettings extends BaseRigSettings {
  cardHeight: number;
  cardWidth: number;
  centerScale: number;
  cornerRadius: number;
  direction: FilmStripDirection;
  edgeOpacity: number;
  gap: number;
  perspective: number;
  tilt: number;
}

export type LinearDirection = "forward" | "reverse";

export interface GridWallRigSettings extends BaseRigSettings {
  cornerRadius: number;
  direction: LinearDirection;
  driftAmount: number;
  edgeOpacity: number;
  focusDepth: number;
  focusScale: number;
  gridScale: number;
  horizontalGap: number;
  tileHeight: number;
  tileWidth: number;
  verticalGap: number;
}

export interface FocusDeckRigSettings extends BaseRigSettings {
  cornerRadius: number;
  deckDepth: number;
  direction: LinearDirection;
  edgeOpacity: number;
  heroEmphasis: number;
  heroHeight: number;
  heroWidth: number;
  sideRotation: number;
  supportScale: number;
  supportSpread: number;
  transitionSoftness: number;
}

export type StackAxis = "horizontal" | "vertical" | "diagonal";

export interface StackFlowRigSettings extends BaseRigSettings {
  backOpacity: number;
  backScale: number;
  cardHeight: number;
  cardWidth: number;
  cornerRadius: number;
  direction: LinearDirection;
  frontExitDistance: number;
  rotationStep: number;
  stackAxis: StackAxis;
  stackDepth: number;
  stackOffset: number;
  transitionSoftness: number;
}

export interface WavePathRigSettings extends BaseRigSettings {
  cardHeight: number;
  cardWidth: number;
  centerScale: number;
  cornerRadius: number;
  direction: FilmStripDirection;
  edgeOpacity: number;
  gap: number;
  pathTilt: number;
  perspective: number;
  tangentRotation: number;
  waveAmplitude: number;
  waveFrequency: number;
}

export type AnyRigSettings =
  | OrbitRigSettings
  | FilmStripRigSettings
  | GridWallRigSettings
  | FocusDeckRigSettings
  | StackFlowRigSettings
  | WavePathRigSettings;

export type RigInspectorSectionId =
  | "motion"
  | "layout"
  | "depth"
  | "appearance"
  | "background"
  | "export";

export interface RigInspectorSection {
  defaultOpen: boolean;
  id: RigInspectorSectionId;
  label: string;
}

export interface RigNumericInspectorControl {
  fineStep: number;
  key: string;
  kind: "number";
  label: string;
  largeStep: number;
  max: number;
  min: number;
  precision: number;
  scale?: number;
  section: RigInspectorSectionId;
  sliderStep: number;
  step: number;
  unit: string;
  unitLabel: string;
}

export interface RigChoiceInspectorOption {
  label: string;
  value: string;
}

export interface RigChoiceInspectorControl {
  key: string;
  kind: "choice";
  label: string;
  options: readonly RigChoiceInspectorOption[];
  section: RigInspectorSectionId;
}

export type RigInspectorControl = RigNumericInspectorControl | RigChoiceInspectorControl;

export interface RigMediaRequirements {
  acceptedTypes: string[];
  maxFileBytes: number;
  maxItems: number;
  minItems: number;
  preferredDimensions: string;
  requiredForExport: number;
  requiredForPng: number;
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

export interface RigGalleryMetadata {
  description: string;
  featured?: boolean;
}

export interface RigPreviewDefinition<Settings extends BaseRigSettings> {
  accent?: string;
  backgroundOverride?: Partial<BackgroundSettings>;
  durationSeconds: number;
  generateMedia: () => RigDemoMedia[];
  mediaCount: number;
  ratio: FrameRatio;
  render: RigRenderer<Settings>;
  settingsOverride: Partial<Settings>;
  staticProgress: number;
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
  accessibilityDescription: string;
  capabilities: RigCapabilities;
  category: string;
  defaultRatio: FrameRatio;
  defaultSettings: Settings;
  exportMetadata: RigExportMetadata;
  family: RigFamily;
  gallery: RigGalleryMetadata;
  generateDemoMedia: () => RigDemoMedia[];
  id: string;
  inspectorSections: RigInspectorSection[];
  inspectorControls: readonly RigInspectorControl[];
  isSettings: (value: unknown) => value is Settings;
  longDescription: string;
  mediaRequirements: RigMediaRequirements;
  maturity: RigMaturity;
  name: string;
  presetCompatibility: RigPresetCompatibility;
  presets: readonly RigPreset<Settings>[];
  preview: RigPreviewDefinition<Settings>;
  render: RigRenderer<Settings>;
  shortDescription: string;
  slotCount: number;
  slotLabels: string[];
  supportedRatios: FrameRatio[];
  tags: readonly string[];
  version: number;
}

export type OrbitCarouselRigDefinition = RigDefinition<OrbitRigSettings>;
export type FilmStripRigDefinition = RigDefinition<FilmStripRigSettings>;
export type GridWallRigDefinition = RigDefinition<GridWallRigSettings>;
export type FocusDeckRigDefinition = RigDefinition<FocusDeckRigSettings>;
export type StackFlowRigDefinition = RigDefinition<StackFlowRigSettings>;
export type WavePathRigDefinition = RigDefinition<WavePathRigSettings>;
export type RegisteredRigDefinition = RigDefinition<any>;
