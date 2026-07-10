import { CenterStage } from "./components/CenterStage";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { StartScreen } from "./components/StartScreen";
import { TopBar } from "./components/TopBar";
import { exportOrbitCarouselPng } from "./export/exportPng";
import { exportOrbitCarouselWebm } from "./export/exportWebm";
import type { ExportStatus } from "./export/exportSettings";
import { useImageSlots } from "./hooks/useImageSlots";
import { orbitCarouselRig } from "./rigs/orbitCarousel";
import type { OrbitRigSettings } from "./rigs/types";
import { useRef, useState } from "react";

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
  const [exportStatus, setExportStatus] = useState<ExportStatus>("ready");
  const [isPlaying, setIsPlaying] = useState(true);
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
        isPlaying={isPlaying}
        onExport={handleExport}
        onReset={resetSettings}
        onTogglePlay={() => setIsPlaying((current) => !current)}
        rigName={orbitCarouselRig.name}
      />
      <div className="workspace-shell">
        <LeftPanel
          activeRigId={orbitCarouselRig.id}
          clearAllSlots={clearAllSlots}
          clearSlot={clearSlot}
          onLoadDemo={handleLoadDemo}
          setSlotFile={setSlotFile}
          slots={slots}
        />
        <CenterStage
          isPlaying={isPlaying}
          onChangeFrameRatio={(frameRatio) =>
            setSettings({ ...normalizedSettings, frameRatio })
          }
          onTogglePlay={() => setIsPlaying((current) => !current)}
          rig={orbitCarouselRig}
          settings={normalizedSettings}
          slotImages={slotImages}
        />
        <RightPanel
          exportStatus={exportStatus}
          onExport={handleExport}
          rig={orbitCarouselRig}
          settings={normalizedSettings}
          setSettings={setSettings}
        />
      </div>
    </main>
  );
}
