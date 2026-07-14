import { useEffect, useMemo, useRef, useState } from "react";

const FEEDBACK_TEMPLATE = `What were you trying to create?

Which motion system did you choose?

What felt confusing?

Would you use MotionKit Spatial for real work?

What output did you create?`;

interface AlphaGuideDialogProps {
  onClose: () => void;
}

export function AlphaGuideDialog({ onClose }: AlphaGuideDialogProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const mailtoHref = useMemo(
    () => `mailto:?subject=${encodeURIComponent("MotionKit Spatial alpha feedback")}&body=${encodeURIComponent(FEEDBACK_TEMPLATE)}`,
    [],
  );

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

  const copyFeedbackTemplate = async () => {
    let timeoutId: number | undefined;
    try {
      await Promise.race([
        navigator.clipboard.writeText(FEEDBACK_TEMPLATE),
        new Promise<never>((_, reject) => {
          timeoutId = window.setTimeout(() => reject(new Error("Clipboard request timed out.")), 800);
        }),
      ]);
      setCopyStatus("Feedback questions copied.");
    } catch {
      setCopyStatus("Copy is unavailable in this browser. Use Draft email instead.");
    } finally {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    }
  };

  return (
    <div className="alpha-modal-layer">
      <button aria-label="Close alpha guide" className="alpha-modal-scrim" type="button" onClick={onClose} />
      <section
        aria-labelledby="alpha-guide-title"
        aria-modal="true"
        className="alpha-dialog alpha-guide-dialog"
        ref={dialogRef}
        role="dialog"
      >
        <header className="alpha-dialog-header">
          <div>
            <p className="eyebrow">Alpha guide</p>
            <h2 id="alpha-guide-title">What is MotionKit Spatial?</h2>
            <p>MotionKit Spatial turns your visuals into editable, looping Canvas motion that exports locally.</p>
          </div>
          <button aria-label="Close alpha guide" className="alpha-dialog-close" ref={closeRef} type="button" onClick={onClose}>×</button>
        </header>

        <div className="alpha-guide-grid">
          <section aria-labelledby="alpha-how-title">
            <h3 id="alpha-how-title">How it works</h3>
            <ol>
              <li><span>1</span>Add visuals</li>
              <li><span>2</span>Choose a motion system</li>
              <li><span>3</span>Customize & preview</li>
              <li><span>4</span>Export locally</li>
            </ol>
          </section>
          <section aria-labelledby="alpha-results-title">
            <h3 id="alpha-results-title">Best results</h3>
            <ul>
              <li>Use high-resolution images.</li>
              <li>Use 4–6 visuals when the motion system allows it.</li>
              <li>Keep important content near the center.</li>
            </ul>
          </section>
          <section aria-labelledby="alpha-limits-title">
            <h3 id="alpha-limits-title">Current limitations</h3>
            <ul>
              <li>WebM works best in current Chromium browsers.</li>
              <li>Local images are not saved after reload.</li>
              <li>Safari and Firefox export support may vary.</li>
            </ul>
          </section>
          <section className="alpha-feedback" aria-labelledby="alpha-feedback-title">
            <h3 id="alpha-feedback-title">Share alpha feedback</h3>
            <p>No personal data is collected. Use the template in your preferred channel.</p>
            <div>
              <button className="secondary-button" type="button" onClick={copyFeedbackTemplate}>Copy questions</button>
              <a className="secondary-button alpha-mail-link" href={mailtoHref}>Draft email</a>
            </div>
            <p aria-live="polite" className="alpha-copy-status" role="status">{copyStatus}</p>
          </section>
        </div>
      </section>
    </div>
  );
}
