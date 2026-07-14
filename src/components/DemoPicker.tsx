import { useEffect, useRef } from "react";
import type { DemoScenario } from "../demo/demoScenarios";

interface DemoPickerProps {
  onClose: () => void;
  onSelect: (scenario: DemoScenario) => void;
  scenarios: readonly DemoScenario[];
}

export function DemoPicker({ onClose, onSelect, scenarios }: DemoPickerProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      window.requestAnimationFrame(() => previousFocus?.focus());
    };
  }, [onClose]);

  return (
    <div className="alpha-modal-layer">
      <button aria-label="Close showcase demos" className="alpha-modal-scrim" type="button" onClick={onClose} />
      <section
        aria-labelledby="demo-picker-title"
        aria-modal="true"
        className="alpha-dialog demo-picker"
        ref={dialogRef}
        role="dialog"
      >
        <header className="alpha-dialog-header">
          <div>
            <p className="eyebrow">Showcase demos</p>
            <h2 id="demo-picker-title">Start with a complete example</h2>
            <p>Choose a creative goal. MotionKit loads the visuals, motion system, and a suitable preset.</p>
          </div>
          <button aria-label="Close showcase demos" className="alpha-dialog-close" ref={closeRef} type="button" onClick={onClose}>×</button>
        </header>

        <div className="demo-scenario-grid">
          {scenarios.map((scenario, index) => (
            <button className={`demo-scenario demo-scenario-${index + 1}`} key={scenario.id} type="button" onClick={() => onSelect(scenario)}>
              <span className="demo-scenario-index" aria-hidden="true">0{index + 1}</span>
              <span className="demo-scenario-copy">
                <strong>{scenario.name}</strong>
                <small>{scenario.description}</small>
              </span>
              <span className="demo-scenario-meta">
                <span>{scenario.rigName}</span>
                <span>{scenario.presetName}</span>
                <span>{scenario.mediaSet}</span>
              </span>
              <span className="demo-scenario-action">Open showcase <span aria-hidden="true">→</span></span>
            </button>
          ))}
        </div>

        <p className="alpha-dialog-note">Every visual, preset, and control remains editable after the showcase opens.</p>
      </section>
    </div>
  );
}
