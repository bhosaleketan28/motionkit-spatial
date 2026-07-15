import { AlphaGuideDialog } from "./components/AlphaGuideDialog";
import { CenterStage } from "./components/CenterStage";
import type { CenterStageHandle } from "./components/CenterStage";
import { DemoPicker } from "./components/DemoPicker";
import { ExportSheet } from "./components/ExportSheet";
import { LeftPanel } from "./components/LeftPanel";
import { NoticeCenter } from "./components/NoticeCenter";
import type { AppNotice, NoticeTone } from "./components/NoticeCenter";
import { RightPanel } from "./components/RightPanel";
import { RigGallery } from "./components/RigGallery";
import { RigSwitchDialog } from "./components/RigSwitchDialog";
import { StartScreen } from "./components/StartScreen";
import { TopBar } from "./components/TopBar";
import { demoScenarios } from "./demo/demoScenarios";
import type { DemoScenario } from "./demo/demoScenarios";
import type { ExportFormat, ExportStatus } from "./export/exportSettings";
import { useImageSlots } from "./hooks/useImageSlots";
import type { ImageSlot } from "./hooks/useImageSlots";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { getRigById, rigRegistry } from "./rigs/registry";
import { getPresetById, getPresetsForRig } from "./rigs/presetRegistry";
import { applyRigPreset, getPresetApplicationState } from "./rigs/presetSystem";
import type { AnyRigSettings, RegisteredRigDefinition } from "./rigs/types";
import { createDefaultRigState, readWorkspaceSession, writeWorkspaceSession } from "./utils/workspaceSession";
import type { PersistedRigState, WorkspaceSession } from "./utils/workspaceSession";
import { useCallback, useEffect, useRef, useState } from "react";

type WorkspacePanel = "media" | "inspector";

const NARROW_WORKSPACE_QUERY = "(max-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

function createDefaultSettings(rig: RegisteredRigDefinition): AnyRigSettings {
  return {
    ...rig.defaultSettings,
    background: { ...rig.defaultSettings.background },
  };
}

function normalizeSettings(
  rig: RegisteredRigDefinition,
  settings: AnyRigSettings,
): AnyRigSettings {
  const defaults = createDefaultSettings(rig);

  const normalized = {
    ...defaults,
    ...settings,
    background: { ...defaults.background, ...settings.background },
  };
  return rig.isSettings(normalized) ? normalized : defaults;
}

export default function App() {
  const [initialSession] = useState(readWorkspaceSession);
  const [activeRigId, setActiveRigId] = useState(
    () => initialSession.session?.activeRigId ?? getRigById(null).id,
  );
  const [rigStates, setRigStates] = useState<Record<string, PersistedRigState>>(() =>
    initialSession.session?.rigStates ?? Object.fromEntries(
      rigRegistry.map((rig) => [rig.id, createDefaultRigState(rig)]),
    ),
  );
  const activeRig = getRigById(activeRigId);
  const previousDrawerRef = useRef<WorkspacePanel | null>(null);
  const rigGalleryTriggerRef = useRef<HTMLElement | null>(null);
  const rigSwitchTriggerRef = useRef<HTMLElement | null>(null);
  const latestSessionRef = useRef<WorkspaceSession | null>(null);
  const noticeIdRef = useRef(1);
  const sessionNoticeShownRef = useRef(false);
  const storageWarningShownRef = useRef(false);
  const stageRef = useRef<CenterStageHandle | null>(null);
  const isNarrowWorkspace = useMediaQuery(NARROW_WORKSPACE_QUERY);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [exportStatus, setExportStatus] = useState<ExportStatus>("ready");
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(() => !prefersReducedMotion);
  const [isLeftRailCollapsed, setIsLeftRailCollapsed] = useState(
    () => initialSession.session?.isLeftRailCollapsed ?? false,
  );
  const [isRightRailCollapsed, setIsRightRailCollapsed] = useState(
    () => initialSession.session?.isRightRailCollapsed ?? false,
  );
  const [isStageOnly, setIsStageOnly] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<WorkspacePanel | null>(null);
  const [zoomPercent, setZoomPercent] = useState(() => initialSession.session?.zoomPercent ?? 100);
  const [isFitMode, setIsFitMode] = useState(() => initialSession.session?.isFitMode ?? true);
  const [hasEnteredEditor, setHasEnteredEditor] = useState(
    () => initialSession.session?.hasEditorSession ?? false,
  );
  const [startUploadError, setStartUploadError] = useState<string | null>(null);
  const [pendingRigId, setPendingRigId] = useState<string | null>(null);
  const [pendingDemoScenario, setPendingDemoScenario] = useState<DemoScenario | null>(null);
  const [isDemoPickerOpen, setIsDemoPickerOpen] = useState(false);
  const [isAlphaGuideOpen, setIsAlphaGuideOpen] = useState(false);
  const [isRigGalleryOpen, setIsRigGalleryOpen] = useState(false);
  const [appNotice, setAppNotice] = useState<AppNotice | null>(() =>
    initialSession.issue
      ? { id: 0, message: initialSession.issue, tone: "warning" }
      : null,
  );
  const activeRigState = rigStates[activeRig.id] ?? createDefaultRigState(activeRig);
  const normalizedSettings = normalizeSettings(activeRig, activeRigState.settings);
  const activePresetId = activeRigState.activePresetId;
  const setSettings = useCallback((nextSettings: AnyRigSettings) => {
    setRigStates((current) => ({
      ...current,
      [activeRig.id]: {
        activePresetId: current[activeRig.id]?.activePresetId ?? null,
        settings: normalizeSettings(activeRig, nextSettings),
      },
    }));
  }, [activeRig]);
  const setActivePresetId = useCallback((presetId: string | null) => {
    setRigStates((current) => ({
      ...current,
      [activeRig.id]: {
        activePresetId: presetId,
        settings: current[activeRig.id]?.settings ?? createDefaultSettings(activeRig),
      },
    }));
  }, [activeRig]);
  const availablePresets = getPresetsForRig(activeRig);
  const activePreset = getPresetById(activeRig, activePresetId);
  const activePresetState = activePreset
    ? getPresetApplicationState(activePreset, normalizedSettings)
    : null;
  const isBlockingOverlayOpen =
    isRigGalleryOpen || isExportSheetOpen || isAlphaGuideOpen || Boolean(pendingRigId);
  const {
    addFiles,
    clearAllSlots,
    dismissUndo,
    loadDemoSlots,
    mediaAnnouncement,
    mediaNotice,
    moveSlot,
    previewSlotImages,
    removeSlot,
    replaceSlot,
    selectSlot,
    selectedIndex,
    slotImages,
    slots,
    switchRigMedia,
    undo,
    undoAction,
  } = useImageSlots(activeRig);
  const isStageRenderingPaused =
    isBlockingOverlayOpen || (isNarrowWorkspace && activeDrawer !== null);
  const exportMediaIssues = {
    png: getExportMediaIssue(activeRig, slots, "png"),
    webm: getExportMediaIssue(activeRig, slots, "webm"),
  };
  const showNotice = useCallback(
    (message: string, tone: NoticeTone, action?: Pick<AppNotice, "actionLabel" | "onAction">) => {
      setAppNotice({
        id: noticeIdRef.current,
        message,
        tone,
        ...action,
      });
      noticeIdRef.current += 1;
    },
    [],
  );
  const dismissNotice = useCallback(() => setAppNotice(null), []);
  const openRigGallery = useCallback((trigger: HTMLElement) => {
    rigGalleryTriggerRef.current = trigger;
    setIsRigGalleryOpen(true);
  }, []);
  const closeRigGallery = useCallback(() => {
    setIsRigGalleryOpen(false);
    window.requestAnimationFrame(() => {
      const originalTrigger = rigGalleryTriggerRef.current;
      if (originalTrigger?.isConnected) {
        originalTrigger.focus();
        return;
      }
      const fallbackTrigger = Array.from(
        document.querySelectorAll<HTMLButtonElement>("[data-rig-gallery-trigger]"),
      ).find((button) => button.getClientRects().length > 0);
      fallbackTrigger?.focus();
    });
  }, []);

  const handleStartUpload = (files: FileList) => {
    const selectedFiles = Array.from(files);

    const { minItems, maxItems } = activeRig.mediaRequirements;
    if (selectedFiles.length < minItems || selectedFiles.length > maxItems) {
      setStartUploadError(`Choose between ${minItems} and ${maxItems} images to begin.`);
      return;
    }
    const result = addFiles(selectedFiles);
    if (result.added > 0) {
      setHasEnteredEditor(true);
    }
    setStartUploadError(result.errors.length ? result.errors.join(" ") : null);
  };

  const handleLoadDemo = () => {
    setStartUploadError(null);
    loadDemoSlots();
    setHasEnteredEditor(true);
  };

  const handleSelectDemoScenario = (scenario: DemoScenario) => {
    const nextRig = getRigById(scenario.rigId);
    const preset = getPresetById(nextRig, scenario.presetId);
    const presetResult = preset
      ? applyRigPreset(nextRig, preset, createDefaultSettings(nextRig))
      : null;
    const nextSettings = presetResult?.ok
      ? presetResult.settings
      : createDefaultSettings(nextRig);

    stageRef.current?.resetProgress();
    switchRigMedia(nextRig);
    setRigStates((current) => ({
      ...current,
      [nextRig.id]: {
        activePresetId: presetResult?.ok ? scenario.presetId : null,
        settings: nextSettings,
      },
    }));
    setActiveRigId(nextRig.id);
    setExportStatus("ready");
    setIsFitMode(true);
    setZoomPercent(100);
    setIsDemoPickerOpen(false);
    setPendingDemoScenario(scenario);
  };

  const handleResetSettings = () => {
    const previousSettings = normalizedSettings;
    const previousPresetId = activePresetId;
    setSettings(createDefaultSettings(activeRig));
    setActivePresetId(null);
    showNotice("Motion settings reset to defaults.", "undo", {
      actionLabel: "Undo",
      onAction: () => {
        setSettings(previousSettings);
        setActivePresetId(previousPresetId);
      },
    });
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = getPresetById(activeRig, presetId);
    if (!preset) {
      showNotice("That preset is unavailable for this motion system. No settings were changed.", "warning");
      return;
    }
    const result = applyRigPreset(activeRig, preset, normalizedSettings);
    if (!result.ok) {
      showNotice(`${result.error} No settings were changed.`, "warning");
      return;
    }
    setSettings(result.settings);
    setActivePresetId(preset.id);
    showNotice(`${preset.name} applied to ${activeRig.name}.`, "success");
  };

  const completeRigSwitch = (nextRigId: string) => {
    const nextRig = getRigById(nextRigId);
    stageRef.current?.resetProgress();
    const result = switchRigMedia(nextRig);
    setRigStates((current) => current[nextRig.id]
      ? current
      : { ...current, [nextRig.id]: createDefaultRigState(nextRig) });
    setActiveRigId(nextRig.id);
    setPendingRigId(null);
    setIsExportSheetOpen(false);
    setExportStatus("ready");
    setIsFitMode(true);
    setZoomPercent(100);
    const detail = result.preservedCount
      ? `${result.preservedCount} media item${result.preservedCount === 1 ? "" : "s"} preserved.`
      : "Media slots are ready.";
    showNotice(`${nextRig.name} selected. ${detail}`, "info");
    closeRigGallery();
  };

  const handleSelectRig = (nextRigId: string) => {
    if (nextRigId === activeRig.id) return;
    const nextRig = getRigById(nextRigId);
    const hasOverflow = slots.slice(nextRig.slotCount).some((slot) => slot.status !== "empty");
    if (hasOverflow) {
      rigSwitchTriggerRef.current = document.activeElement as HTMLElement | null;
      setPendingRigId(nextRig.id);
      return;
    }
    completeRigSwitch(nextRig.id);
  };

  const cancelRigSwitch = () => {
    setPendingRigId(null);
    window.requestAnimationFrame(() => {
      if (rigSwitchTriggerRef.current?.isConnected) rigSwitchTriggerRef.current.focus();
    });
  };

  const togglePlayback = () => setIsPlaying((current) => !current);

  const handleFit = () => {
    setZoomPercent(100);
    setIsFitMode(true);
  };

  const handleZoom = (direction: -1 | 1) => {
    setIsFitMode(false);
    setZoomPercent((current) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + direction * ZOOM_STEP)),
    );
  };

  const toggleStageOnly = () => {
    setActiveDrawer(null);
    setIsStageOnly((current) => !current);
  };

  const toggleWorkspacePanel = (panel: WorkspacePanel) => {
    if (isNarrowWorkspace) {
      setIsStageOnly(false);
      setActiveDrawer((current) => (current === panel ? null : panel));
      return;
    }

    setIsStageOnly(false);
    if (panel === "media") {
      setIsLeftRailCollapsed((current) => !current);
      return;
    }

    setIsRightRailCollapsed((current) => !current);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsPlaying(false);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!pendingDemoScenario || activeRig.id !== pendingDemoScenario.rigId) {
      return;
    }
    loadDemoSlots();
    setStartUploadError(null);
    setHasEnteredEditor(true);
    setIsPlaying(!prefersReducedMotion);
    showNotice(
      `${pendingDemoScenario.name} opened with ${pendingDemoScenario.rigName} and ${pendingDemoScenario.presetName}.`,
      "success",
    );
    setPendingDemoScenario(null);
  }, [activeRig.id, loadDemoSlots, pendingDemoScenario, prefersReducedMotion, showNotice]);

  useEffect(() => {
    if (!initialSession.session || sessionNoticeShownRef.current) {
      return;
    }
    sessionNoticeShownRef.current = true;
    showNotice("Workspace settings restored. Local images must be re-added after reload.", "info", {
      actionLabel: "Re-add images",
      onAction: () => {
        setIsStageOnly(false);
        if (isNarrowWorkspace) {
          setActiveDrawer("media");
        } else {
          setIsLeftRailCollapsed(false);
        }
      },
    });
  }, [initialSession.session, isNarrowWorkspace, showNotice]);

  useEffect(() => {
    if (!hasEnteredEditor) {
      return;
    }
    const session: WorkspaceSession = {
      activeRigId: activeRig.id,
      hasEditorSession: true,
      isFitMode,
      isLeftRailCollapsed,
      isRightRailCollapsed,
      rigStates,
      version: 5,
      zoomPercent,
    };
    latestSessionRef.current = session;
    const timer = window.setTimeout(() => {
      const issue = writeWorkspaceSession(session);
      if (issue && !storageWarningShownRef.current) {
        storageWarningShownRef.current = true;
        showNotice(issue, "warning");
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [
    hasEnteredEditor,
    activeRig.id,
    isFitMode,
    isLeftRailCollapsed,
    isRightRailCollapsed,
    rigStates,
    showNotice,
    zoomPercent,
  ]);

  useEffect(() => {
    const flushSession = () => {
      if (latestSessionRef.current) {
        writeWorkspaceSession(latestSessionRef.current);
      }
    };
    window.addEventListener("pagehide", flushSession);
    return () => window.removeEventListener("pagehide", flushSession);
  }, []);

  useEffect(() => {
    if (exportStatus === "done") {
      showNotice("WebM export downloaded locally.", "success");
    } else if (exportStatus === "fallback") {
      showNotice("PNG snapshot downloaded locally.", "success");
    } else if (exportStatus === "cancelled") {
      showNotice("Export cancelled. No partial file was downloaded.", "info");
    } else if (exportStatus === "error") {
      showNotice("Export failed. Review the export details and try again.", "error");
    }
  }, [exportStatus, showNotice]);

  useEffect(() => {
    const hasLocalMedia = slots.some((slot) => slot.source === "upload" && slot.status === "ready");
    if (!hasLocalMedia) {
      return;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [slots]);

  useEffect(() => {
    if (!isNarrowWorkspace) {
      setActiveDrawer(null);
    }
  }, [isNarrowWorkspace]);

  useEffect(() => {
    if (activeDrawer) {
      previousDrawerRef.current = activeDrawer;
      const focusFrame = window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLButtonElement>(`[data-workspace-drawer="${activeDrawer}"] [data-drawer-close]`)
          ?.focus();
      });

      return () => window.cancelAnimationFrame(focusFrame);
    }

    const previousDrawer = previousDrawerRef.current;
    if (!previousDrawer) {
      return;
    }

    previousDrawerRef.current = null;
    const focusFrame = window.requestAnimationFrame(() => {
      document.getElementById(`${previousDrawer}-panel-toggle`)?.focus();
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [activeDrawer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isEditableTarget =
        target?.isContentEditable ||
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT";

      if (event.key === "Escape" && activeDrawer) {
        event.preventDefault();
        setActiveDrawer(null);
        return;
      }

      if (event.key === "Tab" && activeDrawer) {
        const drawer = document.getElementById(`${activeDrawer}-panel`);
        const focusableElements = Array.from(
          drawer?.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), summary, [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => element.getClientRects().length > 0);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (firstElement && lastElement) {
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }

        return;
      }

      if (isEditableTarget) {
        return;
      }

      const normalizedKey = event.key.toLowerCase();
      const normalizedCode = event.code.toLowerCase();
      if (
        normalizedCode === "space" ||
        event.key === " " ||
        normalizedKey === "space" ||
        normalizedKey === "spacebar"
      ) {
        event.preventDefault();
        togglePlayback();
        return;
      }

      if (event.key === "0") {
        event.preventDefault();
        handleFit();
        return;
      }

      if (event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleStageOnly();
        return;
      }

      const stageHasFocus =
        target?.classList.contains("center-stage") || Boolean(target?.closest(".stage-transport"));
      if (
        stageHasFocus &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        stageRef.current?.stepBySeconds(direction * (event.shiftKey ? 0.25 : 1 / 30));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDrawer]);

  if (!hasEnteredEditor) {
    return (
      <>
        <StartScreen
          errorMessage={startUploadError}
          isInert={isRigGalleryOpen || isDemoPickerOpen}
          noticeMessage={appNotice?.message}
          onBrowseRigs={openRigGallery}
          onOpenDemo={() => setIsDemoPickerOpen(true)}
          onUploadFiles={handleStartUpload}
          prefersReducedMotion={prefersReducedMotion}
          rig={activeRig}
          rigs={rigRegistry}
          settings={normalizedSettings}
        />
        {isRigGalleryOpen ? (
          <RigGallery
            activeRig={activeRig}
            isInert={false}
            onClose={closeRigGallery}
            onSelectRig={handleSelectRig}
            prefersReducedMotion={prefersReducedMotion}
            rigs={rigRegistry}
          />
        ) : null}
        {isDemoPickerOpen ? (
          <DemoPicker
            onClose={() => setIsDemoPickerOpen(false)}
            onSelect={handleSelectDemoScenario}
            scenarios={demoScenarios}
          />
        ) : null}
      </>
    );
  }

  return (
    <main className="app-shell">
      <a className="skip-link" href="#workspace-stage">Skip to stage</a>
      <div aria-hidden={isBlockingOverlayOpen} className="top-bar-layer" inert={isBlockingOverlayOpen}>
        <TopBar
          exportStatus={exportStatus}
          onExport={() => {
            setExportStatus("ready");
            setIsExportSheetOpen(true);
          }}
          onOpenHelp={() => setIsAlphaGuideOpen(true)}
          onReset={handleResetSettings}
          rigName={activeRig.name}
        />
      </div>
      <div
        className={[
          "workspace-shell",
          isLeftRailCollapsed ? "left-rail-collapsed" : "",
          isRightRailCollapsed ? "right-rail-collapsed" : "",
          isStageOnly ? "stage-only" : "",
        ].filter(Boolean).join(" ")}
        aria-hidden={isBlockingOverlayOpen}
        inert={isBlockingOverlayOpen}
      >
        <LeftPanel
          activeRig={activeRig}
          activePresetId={activePreset?.id ?? null}
          activePresetState={activePresetState}
          addFiles={addFiles}
          clearAllSlots={clearAllSlots}
          isDrawer={isNarrowWorkspace}
          isVisible={
            isNarrowWorkspace
              ? activeDrawer === "media"
              : !isLeftRailCollapsed && !isStageOnly
          }
          mediaAnnouncement={mediaAnnouncement}
          mediaNotice={mediaNotice}
          moveSlot={moveSlot}
          onApplyPreset={handleApplyPreset}
          onBrowseRigs={openRigGallery}
          onLoadDemo={handleLoadDemo}
          onRequestClose={() =>
            isNarrowWorkspace ? setActiveDrawer(null) : setIsLeftRailCollapsed(true)
          }
          removeSlot={removeSlot}
          replaceSlot={replaceSlot}
          selectSlot={selectSlot}
          selectedIndex={selectedIndex}
          slots={slots}
          presets={availablePresets}
          onReturnToDefaults={handleResetSettings}
        />
        <CenterStage
          isFitMode={isFitMode}
          isInspectorOpen={
            isNarrowWorkspace
              ? activeDrawer === "inspector"
              : !isRightRailCollapsed && !isStageOnly
          }
          isMediaOpen={
            isNarrowWorkspace
              ? activeDrawer === "media"
              : !isLeftRailCollapsed && !isStageOnly
          }
          isPlaying={isPlaying}
          isRenderingPaused={isStageRenderingPaused}
          isStageOnly={isStageOnly}
          onChangeFrameRatio={(frameRatio) =>
            setSettings({ ...normalizedSettings, frameRatio })
          }
          onFit={handleFit}
          onPlaybackChange={setIsPlaying}
          onToggleInspector={() => toggleWorkspacePanel("inspector")}
          onToggleMedia={() => toggleWorkspacePanel("media")}
          onTogglePlay={togglePlayback}
          onToggleStageOnly={toggleStageOnly}
          onZoomIn={() => handleZoom(1)}
          onZoomOut={() => handleZoom(-1)}
          rig={activeRig}
          ref={stageRef}
          settings={normalizedSettings}
          selectedSlotIndex={selectedIndex}
          slotImages={previewSlotImages}
          zoomPercent={zoomPercent}
        />
        <RightPanel
          isDrawer={isNarrowWorkspace}
          isVisible={
            isNarrowWorkspace
              ? activeDrawer === "inspector"
              : !isRightRailCollapsed && !isStageOnly
          }
          onRequestClose={() =>
            isNarrowWorkspace ? setActiveDrawer(null) : setIsRightRailCollapsed(true)
          }
          rig={activeRig}
          settings={normalizedSettings}
          setSettings={setSettings}
        />
        {isNarrowWorkspace && activeDrawer ? (
          <button
            aria-label={`Close ${activeDrawer} drawer`}
            className="drawer-scrim"
            type="button"
            onClick={() => setActiveDrawer(null)}
          />
        ) : null}
      </div>
      {isExportSheetOpen ? (
        <ExportSheet
          mediaIssues={exportMediaIssues}
          onAddMedia={() => {
            setIsExportSheetOpen(false);
            setIsStageOnly(false);
            if (isNarrowWorkspace) {
              setActiveDrawer("media");
            } else {
              setIsLeftRailCollapsed(false);
            }
          }}
          onClose={() => setIsExportSheetOpen(false)}
          onFrameRatioChange={(frameRatio) =>
            setSettings({ ...normalizedSettings, frameRatio })
          }
          onStatusChange={setExportStatus}
          rig={activeRig}
          settings={normalizedSettings}
          slotImages={slotImages}
        />
      ) : null}
      {isRigGalleryOpen ? (
        <RigGallery
          activeRig={activeRig}
          isInert={Boolean(pendingRigId)}
          onClose={closeRigGallery}
          onSelectRig={handleSelectRig}
          prefersReducedMotion={prefersReducedMotion}
          rigs={rigRegistry}
        />
      ) : null}
      {pendingRigId ? (
        <RigSwitchDialog
          discardedCount={slots.slice(getRigById(pendingRigId).slotCount).filter((slot) => slot.status !== "empty").length}
          fromRig={activeRig}
          onCancel={cancelRigSwitch}
          onConfirm={() => completeRigSwitch(pendingRigId)}
          toRig={getRigById(pendingRigId)}
        />
      ) : null}
      {isAlphaGuideOpen ? <AlphaGuideDialog onClose={() => setIsAlphaGuideOpen(false)} /> : null}
      <NoticeCenter
        notice={
          undoAction
            ? { id: -1, message: undoAction.message, tone: "undo", actionLabel: "Undo", onAction: undo }
            : appNotice
        }
        onDismiss={undoAction ? dismissUndo : dismissNotice}
        reducedMotion={prefersReducedMotion}
      />
    </main>
  );
}

function getExportMediaIssue(rig: RegisteredRigDefinition, slots: ImageSlot[], format: ExportFormat) {
  if (slots.some((slot) => slot.status === "loading")) {
    return "Your images are still loading. Wait a moment, then try export again.";
  }

  if (slots.some((slot) => slot.status === "error")) {
    return "One image could not be opened. Replace it in Media, then try export again.";
  }

  const validItemCount = slots.filter((slot) => slot.status === "ready" && slot.image).length;
  const required = format === "png"
    ? rig.mediaRequirements.requiredForPng
    : rig.mediaRequirements.requiredForExport;
  if (validItemCount < required) {
    const formatLabel = format === "webm" ? "WebM" : "PNG";
    return `${rig.name} needs at least ${required} image${required === 1 ? "" : "s"} for ${formatLabel} export. Add images in Media, then try again.`;
  }

  return null;
}
