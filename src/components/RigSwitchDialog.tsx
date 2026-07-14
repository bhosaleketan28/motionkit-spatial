import { useEffect, useRef } from "react";
import type { RegisteredRigDefinition } from "../rigs/types";

interface RigSwitchDialogProps {
  discardedCount: number;
  fromRig: RegisteredRigDefinition;
  onCancel: () => void;
  onConfirm: () => void;
  toRig: RegisteredRigDefinition;
}

export function RigSwitchDialog({
  discardedCount,
  fromRig,
  onCancel,
  onConfirm,
  toRig,
}: RigSwitchDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => cancelRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      } else if (event.key === "Tab") {
        const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      window.requestAnimationFrame(() => previousFocus?.focus());
    };
  }, [onCancel]);

  return (
    <div className="rig-switch-layer">
      <button aria-label="Cancel motion system switch" className="rig-switch-scrim" type="button" onClick={onCancel} />
      <section
        aria-labelledby="rig-switch-title"
        aria-modal="true"
        className="rig-switch-dialog"
        ref={dialogRef}
        role="dialog"
      >
        <p className="eyebrow">Switch motion system</p>
        <h2 id="rig-switch-title">Move from {fromRig.name} to {toRig.name}?</h2>
        <p>
          {discardedCount} media item{discardedCount === 1 ? " is" : "s are"} outside {toRig.name}’s {toRig.slotCount}-slot limit.
          Continuing removes only that overflow; the first {toRig.slotCount} items remain in order.
        </p>
        <div>
          <button className="secondary-button" ref={cancelRef} type="button" onClick={onCancel}>Keep current motion</button>
          <button className="primary-button" type="button" onClick={onConfirm}>Remove overflow and switch</button>
        </div>
      </section>
    </div>
  );
}
