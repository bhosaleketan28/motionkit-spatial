import { CenterStage } from "./components/CenterStage";
import type { CenterStageHandle } from "./components/CenterStage";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { StartScreen } from "./components/StartScreen";
import { TopBar } from "./components/TopBar";
import { exportOrbitCarouselPng } from "./export/exportPng";
import { exportOrbitCarouselWebm } from "./export/exportWebm";
import type { ExportStatus } from "./export/exportSettings";
import { useImageSlots } from "./hooks/useImageSlots";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { orbitCarouselRig } from "./rigs/orbitCarousel";
import type { OrbitRigSettings } from "./rigs/types";
import { useEffect, useRef, useState } from "react";

type WorkspacePanel = "media" | "inspector";

const NARROW_WORKSPACE_QUERY = "(max-width: 1024px)";
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

function createDefaultSettings(): OrbitRigSettings {
  return {
    ...orbitCarouselRig.defaults,
    frameRatio: orbitCarouselRig.defaultFrameRatio,
  };
}

function normalizeSettings(settings: OrbitRigSettings): OrbitRigSettings {
  const defaults = createDefaultSettings();

  return {
    ...defaults,
    ...settings,
    background: settings.background ?? defaults.background,
    cardShape: settings.cardShape ?? defaults.cardShape,
  };
}

export default function App() {
  const exportInProgressRef = useRef(false);
  const previousDrawerRef = useRef<WorkspacePanel | null>(null);
  const stageRef = useRef<CenterStageHandle | null>(null);
  const isNarrowWorkspace = useMediaQuery(NARROW_WORKSPACE_QUERY);
  const [exportStatus, setExportStatus] = useState<ExportStatus>("ready");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLeftRailCollapsed, setIsLeftRailCollapsed] = useState(false);
  const [isRightRailCollapsed, setIsRightRailCollapsed] = useState(false);
  const [isStageOnly, setIsStageOnly] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<WorkspacePanel | null>(null);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [isFitMode, setIsFitMode] = useState(true);
  const [startUploadError, setStartUploadError] = useState<string | null>(null);
  const [settings, setSettings] = useState<OrbitRigSettings>(createDefaultSettings);
  const normalizedSettings = normalizeSettings(settings);
  const { slots, slotImages, setSlotFile, clearSlot, clearAllSlots, loadDemoSlots } =
    useImageSlots(orbitCarouselRig.mediaSlotCount);
  const hasMedia = slots.some((slot) => slot.status === "loading" || slot.status === "ready");

  const handleStartUpload = (files: FileList) => {
    const selectedFiles = Array.from(files);

    if (selectedFiles.length !== orbitCarouselRig.mediaSlotCount) {
      setStartUploadError("Choose exactly 4 image files to begin.");
      return;
    }

    if (selectedFiles.some((file) => !file.type.startsWith("image/"))) {
      setStartUploadError("Choose image files only.");
      return;
    }

    setStartUploadError(null);
    selectedFiles.forEach((file, index) => setSlotFile(index, file));
  };

  const handleLoadDemo = () => {
    setStartUploadError(null);
    loadDemoSlots();
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
            'button:not(:disabled), input:not(:disabled), summary, [tabindex]:not([tabindex="-1"])',
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

  const handleExport = async () => {
    if (exportInProgressRef.current) {
      return;
    }

    exportInProgressRef.current = true;
    setExportStatus("exporting");

    try {
      await exportOrbitCarouselWebm({
        rig: orbitCarouselRig,
        settings: normalizedSettings,
        slotImages,
      });
      setExportStatus("done");
    } catch {
      try {
        await exportOrbitCarouselPng({
          rig: orbitCarouselRig,
          settings: normalizedSettings,
          slotImages,
        });
        setExportStatus("fallback");
      } catch {
        setExportStatus("error");
      }
    } finally {
      exportInProgressRef.current = false;
    }
  };

  if (!hasMedia) {
    return (
      <StartScreen
        errorMessage={startUploadError}
        onLoadDemo={handleLoadDemo}
        onUploadFiles={handleStartUpload}
        rig={orbitCarouselRig}
        settings={normalizedSettings}
      />
    );
  }

  const resetSettings = () => setSettings(createDefaultSettings());

  return (
    <main className="app-shell">
      <TopBar
        exportStatus={exportStatus}
        onExport={handleExport}
        onReset={resetSettings}
        rigName={orbitCarouselRig.name}
      />
      <div
        className={[
          "workspace-shell",
          isLeftRailCollapsed ? "left-rail-collapsed" : "",
          isRightRailCollapsed ? "right-rail-collapsed" : "",
          isStageOnly ? "stage-only" : "",
        ].filter(Boolean).join(" ")}
      >
        <LeftPanel
          activeRigId={orbitCarouselRig.id}
          clearAllSlots={clearAllSlots}
          clearSlot={clearSlot}
          isDrawer={isNarrowWorkspace}
          isVisible={
            isNarrowWorkspace
              ? activeDrawer === "media"
              : !isLeftRailCollapsed && !isStageOnly
          }
          onLoadDemo={handleLoadDemo}
          onRequestClose={() =>
            isNarrowWorkspace ? setActiveDrawer(null) : setIsLeftRailCollapsed(true)
          }
          setSlotFile={setSlotFile}
          slots={slots}
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
          rig={orbitCarouselRig}
          ref={stageRef}
          settings={normalizedSettings}
          slotImages={slotImages}
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
          rig={orbitCarouselRig}
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
    </main>
  );
}
