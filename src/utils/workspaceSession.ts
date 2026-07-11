import type { OrbitRigSettings } from "../rigs/types";

export const WORKSPACE_SESSION_KEY = "motionkit-spatial.workspace.v1";

export interface WorkspaceSession {
  hasEditorSession: true;
  isFitMode: boolean;
  isLeftRailCollapsed: boolean;
  isRightRailCollapsed: boolean;
  settings: OrbitRigSettings;
  version: 1;
  zoomPercent: number;
}

export interface WorkspaceSessionReadResult {
  issue: string | null;
  session: WorkspaceSession | null;
}

export function readWorkspaceSession(): WorkspaceSessionReadResult {
  try {
    const raw = window.localStorage.getItem(WORKSPACE_SESSION_KEY);
    if (!raw) {
      return { issue: null, session: null };
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isWorkspaceSession(parsed)) {
      window.localStorage.removeItem(WORKSPACE_SESSION_KEY);
      return {
        issue: "Saved workspace settings were invalid and have been reset safely.",
        session: null,
      };
    }

    return { issue: null, session: parsed };
  } catch {
    try {
      window.localStorage.removeItem(WORKSPACE_SESSION_KEY);
    } catch {
      // Storage may be blocked entirely; defaults remain safe in memory.
    }
    return {
      issue: "Workspace settings could not be read. MotionKit is using safe defaults.",
      session: null,
    };
  }
}

export function writeWorkspaceSession(session: WorkspaceSession) {
  try {
    window.localStorage.setItem(WORKSPACE_SESSION_KEY, JSON.stringify(session));
    return null;
  } catch {
    return "Workspace settings could not be saved in this browser.";
  }
}

function isWorkspaceSession(value: unknown): value is WorkspaceSession {
  if (!isRecord(value) || value.version !== 1 || value.hasEditorSession !== true) {
    return false;
  }

  return (
    typeof value.isFitMode === "boolean" &&
    typeof value.isLeftRailCollapsed === "boolean" &&
    typeof value.isRightRailCollapsed === "boolean" &&
    isFiniteNumberInRange(value.zoomPercent, 50, 200) &&
    isRigSettings(value.settings)
  );
}

function isRigSettings(value: unknown): value is OrbitRigSettings {
  if (!isRecord(value) || !isRecord(value.background)) {
    return false;
  }

  const background = value.background;
  return (
    isFiniteNumberInRange(value.durationSeconds, 4, 20) &&
    isFiniteNumberInRange(value.spread, 0.38, 1) &&
    isFiniteNumberInRange(value.depthFade, 0.05, 0.85) &&
    isFiniteNumberInRange(value.cardSize, 0.22, 0.44) &&
    isFiniteNumberInRange(value.cornerRadius, 0, 32) &&
    (value.direction === "clockwise" || value.direction === "counter-clockwise") &&
    (["rectangle", "square", "circle", "star"] as unknown[]).includes(value.cardShape) &&
    (["1:1", "16:9", "9:16"] as unknown[]).includes(value.frameRatio) &&
    (["transparent", "solid", "gradient"] as unknown[]).includes(background.mode) &&
    isHex(background.solidColor) &&
    isHex(background.gradientStart) &&
    isHex(background.gradientEnd)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumberInRange(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isHex(value: unknown) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}
