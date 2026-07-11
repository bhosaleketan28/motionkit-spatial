import { DEFAULT_RIG_ID, getRigById, hasRig } from "../rigs/registry";
import type { OrbitRigSettings } from "../rigs/types";

export const WORKSPACE_SESSION_KEY = "motionkit-spatial.workspace.v1";

export interface WorkspaceSession {
  activeRigId: string;
  hasEditorSession: true;
  isFitMode: boolean;
  isLeftRailCollapsed: boolean;
  isRightRailCollapsed: boolean;
  settings: OrbitRigSettings;
  version: 2;
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

    const result = parseWorkspaceSession(JSON.parse(raw));
    if (!result.session) {
      window.localStorage.removeItem(WORKSPACE_SESSION_KEY);
    }
    return result;
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

export function parseWorkspaceSession(value: unknown): WorkspaceSessionReadResult {
  if (!isSessionShell(value)) {
    return {
      issue: "Saved workspace settings were invalid and have been reset safely.",
      session: null,
    };
  }

  const requestedRigId = value.version === 2 && typeof value.activeRigId === "string"
    ? value.activeRigId
    : DEFAULT_RIG_ID;
  const rigWasFound = hasRig(requestedRigId);
  const rig = getRigById(requestedRigId);
  const settingsAreValid = rigWasFound && rig.isSettings(value.settings);
  const settings = rigWasFound && rig.isSettings(value.settings)
    ? value.settings
    : cloneSettings(rig.defaultSettings);
  const issue = !rigWasFound
    ? "The saved motion rig is unavailable. Orbit Carousel was restored safely."
    : !settingsAreValid
      ? "Some saved rig settings were invalid and have been reset safely."
      : null;

  return {
    issue,
    session: {
      activeRigId: rig.id,
      hasEditorSession: true,
      isFitMode: value.isFitMode,
      isLeftRailCollapsed: value.isLeftRailCollapsed,
      isRightRailCollapsed: value.isRightRailCollapsed,
      settings,
      version: 2,
      zoomPercent: value.zoomPercent,
    },
  };
}

export function writeWorkspaceSession(session: WorkspaceSession) {
  try {
    window.localStorage.setItem(WORKSPACE_SESSION_KEY, JSON.stringify(session));
    return null;
  } catch {
    return "Workspace settings could not be saved in this browser.";
  }
}

function isSessionShell(value: unknown): value is Record<string, unknown> & {
  hasEditorSession: true;
  isFitMode: boolean;
  isLeftRailCollapsed: boolean;
  isRightRailCollapsed: boolean;
  settings: unknown;
  version: 1 | 2;
  zoomPercent: number;
} {
  if (
    !isRecord(value) ||
    (value.version !== 1 && value.version !== 2) ||
    value.hasEditorSession !== true
  ) {
    return false;
  }

  return (
    typeof value.isFitMode === "boolean" &&
    typeof value.isLeftRailCollapsed === "boolean" &&
    typeof value.isRightRailCollapsed === "boolean" &&
    isFiniteNumberInRange(value.zoomPercent, 50, 200) &&
    "settings" in value
  );
}

function cloneSettings(settings: OrbitRigSettings): OrbitRigSettings {
  return {
    ...settings,
    background: { ...settings.background },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumberInRange(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}
