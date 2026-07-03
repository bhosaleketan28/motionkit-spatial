import { CenterStage } from "./components/CenterStage";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
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
  const [settings, setSettings] = useState<OrbitRigSettings>(createDefaultSettings);
  const normalizedSettings = normalizeSettings(settings);
  const { slots, slotImages, setSlotFile, clearSlot, clearAllSlots } = useImageSlots(
    orbitCarouselRig.mediaSlotCount,
  );

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

  return (
    <main className="app-shell">
      <LeftPanel activeRigId={orbitCarouselRig.id} />
      <CenterStage rig={orbitCarouselRig} settings={normalizedSettings} slotImages={slotImages} />
      <RightPanel
        clearAllSlots={clearAllSlots}
        clearSlot={clearSlot}
        exportStatus={exportStatus}
        onExport={handleExport}
        onResetSettings={() => setSettings(createDefaultSettings())}
        rig={orbitCarouselRig}
        settings={normalizedSettings}
        setSettings={setSettings}
        setSlotFile={setSlotFile}
        slots={slots}
      />
    </main>
  );
}
