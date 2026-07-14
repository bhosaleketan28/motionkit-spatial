import { DEFAULT_RIG_ID, getRigById, hasRig, rigRegistry } from "../rigs/registry";
import { getPresetById } from "../rigs/presetRegistry";
import type { AnyRigSettings, RegisteredRigDefinition } from "../rigs/types";

export const WORKSPACE_SESSION_KEY = "motionkit-spatial.workspace.v1";

export interface PersistedRigState {
  activePresetId: string | null;
  settings: AnyRigSettings;
}

export interface WorkspaceSession {
  activeRigId: string;
  hasEditorSession: true;
  isFitMode: boolean;
  isLeftRailCollapsed: boolean;
  isRightRailCollapsed: boolean;
  rigStates: Record<string, PersistedRigState>;
  version: 5;
  zoomPercent: number;
}

export interface WorkspaceSessionReadResult {
  issue: string | null;
  session: WorkspaceSession | null;
}

export function readWorkspaceSession(): WorkspaceSessionReadResult {
  try {
    const raw = window.localStorage.getItem(WORKSPACE_SESSION_KEY);
    if (!raw) return { issue: null, session: null };
    const result = parseWorkspaceSession(JSON.parse(raw));
    if (!result.session) window.localStorage.removeItem(WORKSPACE_SESSION_KEY);
    return result;
  } catch {
    try { window.localStorage.removeItem(WORKSPACE_SESSION_KEY); } catch { /* Storage may be blocked. */ }
    return { issue: "Workspace settings could not be read. MotionKit is using safe defaults.", session: null };
  }
}

export function parseWorkspaceSession(value: unknown): WorkspaceSessionReadResult {
  if (!isSessionShell(value)) {
    return { issue: "Saved workspace settings were invalid and have been reset safely.", session: null };
  }

  const requestedRigId = value.version >= 2 && typeof value.activeRigId === "string" ? value.activeRigId : DEFAULT_RIG_ID;
  const rigWasFound = hasRig(requestedRigId);
  const activeRig = getRigById(requestedRigId);
  let issue: string | null = rigWasFound ? null : "The saved motion system is unavailable. Orbit Carousel was restored safely.";
  const rigStates: Record<string, PersistedRigState> = {};

  rigRegistry.forEach((rig) => {
    const rawState = value.version >= 4 && isRecord(value.rigStates)
      ? value.rigStates[rig.id]
      : rig.id === activeRig.id
        ? { activePresetId: value.version === 3 ? value.activePresetId : null, settings: value.settings }
        : null;
    const parsed = parseRigState(rig, rawState);
    rigStates[rig.id] = parsed.state;
    if (!issue && parsed.issue) issue = parsed.issue;
  });

  return {
    issue,
    session: {
      activeRigId: activeRig.id,
      hasEditorSession: true,
      isFitMode: value.isFitMode,
      isLeftRailCollapsed: value.isLeftRailCollapsed,
      isRightRailCollapsed: value.isRightRailCollapsed,
      rigStates,
      version: 5,
      zoomPercent: value.zoomPercent,
    },
  };
}

export function createDefaultRigState(rig: RegisteredRigDefinition): PersistedRigState {
  return { activePresetId: null, settings: cloneSettings(rig.defaultSettings) };
}

export function writeWorkspaceSession(session: WorkspaceSession) {
  try {
    window.localStorage.setItem(WORKSPACE_SESSION_KEY, JSON.stringify(session));
    return null;
  } catch {
    return "Workspace settings could not be saved in this browser.";
  }
}

function parseRigState(rig: RegisteredRigDefinition, value: unknown) {
  if (!isRecord(value) || !rig.isSettings(value.settings)) {
    return {
      issue: value ? `Some saved ${rig.name} settings were invalid and have been reset safely.` : null,
      state: createDefaultRigState(rig),
    };
  }
  const requestedPresetId = typeof value.activePresetId === "string" ? value.activePresetId : null;
  const preset = getPresetById(rig, requestedPresetId);
  return {
    issue: requestedPresetId && !preset ? `The saved ${rig.name} preset is unavailable. Compatible settings were preserved.` : null,
    state: {
      activePresetId: preset?.id ?? null,
      settings: cloneSettings(value.settings),
    },
  };
}

function isSessionShell(value: unknown): value is Record<string, unknown> & {
  activePresetId?: unknown;
  hasEditorSession: true;
  isFitMode: boolean;
  isLeftRailCollapsed: boolean;
  isRightRailCollapsed: boolean;
  rigStates?: unknown;
  settings?: unknown;
  version: 1 | 2 | 3 | 4 | 5;
  zoomPercent: number;
} {
  if (!isRecord(value) || ![1, 2, 3, 4, 5].includes(value.version as number) || value.hasEditorSession !== true) return false;
  return (
    typeof value.isFitMode === "boolean" &&
    typeof value.isLeftRailCollapsed === "boolean" &&
    typeof value.isRightRailCollapsed === "boolean" &&
    isFiniteNumberInRange(value.zoomPercent, 50, 200) &&
    (Number(value.version) >= 4 ? "rigStates" in value : "settings" in value)
  );
}

function cloneSettings(settings: AnyRigSettings): AnyRigSettings {
  return { ...settings, background: { ...settings.background } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumberInRange(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}
