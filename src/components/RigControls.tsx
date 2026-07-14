import { useEffect, useId, useRef, useState } from "react";
import type {
  AnyRigSettings,
  BackgroundMode,
  RegisteredRigDefinition,
  RigChoiceInspectorControl,
  RigNumericInspectorControl,
} from "../rigs/types";

interface RigControlsProps {
  onChange: (settings: AnyRigSettings) => void;
  rig: RegisteredRigDefinition;
  settings: AnyRigSettings;
}

const backgroundModes: BackgroundMode[] = ["transparent", "solid", "gradient"];

export function RigControls({ rig, settings, onChange }: RigControlsProps) {
  const defaults = rig.defaultSettings as AnyRigSettings;
  const lastIncludedModeRef = useRef<Exclude<BackgroundMode, "transparent">>(
    settings.background.mode === "solid" ? "solid" : "gradient",
  );
  const updateSetting = (key: string, value: unknown) => {
    const next = { ...settings, [key]: value };
    if (rig.isSettings(next)) onChange(next);
  };
  const updateBackground = (background: AnyRigSettings["background"]) => {
    if (background.mode !== "transparent") lastIncludedModeRef.current = background.mode;
    const next = { ...settings, background };
    if (rig.isSettings(next)) onChange(next);
  };
  const includesBackground = settings.background.mode !== "transparent";

  return (
    <div className="inspector-sections" aria-label={`${rig.name} controls`}>
      {rig.inspectorSections.map((section) => {
        const controls = rig.inspectorControls.filter((control) => control.section === section.id);
        if (section.id === "background" && !rig.capabilities.supportsBackground) return null;

        return (
          <InspectorSection defaultOpen={section.defaultOpen} key={`${rig.id}-${section.id}`} label={section.label}>
            <div className="inspector-content">
              {controls.map((control) =>
                control.kind === "number" ? (
                  <RigNumberControl
                    control={control}
                    defaultSettings={defaults}
                    key={control.key}
                    settings={settings}
                    onChange={updateSetting}
                  />
                ) : (
                  <RigChoiceControl
                    control={control}
                    defaultSettings={defaults}
                    key={control.key}
                    rigId={rig.id}
                    settings={settings}
                    onChange={updateSetting}
                  />
                ),
              )}

              {section.id === "background" ? (
                <BackgroundControls
                  defaults={defaults.background}
                  includesBackground={includesBackground}
                  lastIncludedModeRef={lastIncludedModeRef}
                  settings={settings.background}
                  supportsTransparency={rig.capabilities.supportsTransparentBackground}
                  onChange={updateBackground}
                />
              ) : null}

              {section.id === "export" ? (
                <>
                  <dl className="inspector-output-summary">
                    <div><dt>Ratio</dt><dd>{settings.frameRatio}</dd></div>
                    <div><dt>Duration</dt><dd>{settings.durationSeconds.toFixed(1)} s</dd></div>
                    <div><dt>Background</dt><dd>{formatBackgroundMode(settings.background.mode)}</dd></div>
                  </dl>
                  <p className="control-note">Use Export in the top bar to review format, resolution, and FPS.</p>
                </>
              ) : null}
            </div>
          </InspectorSection>
        );
      })}
    </div>
  );
}

function InspectorSection({
  children,
  defaultOpen,
  label,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <details
      className="inspector-section"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary>{label}</summary>
      {children}
    </details>
  );
}

function RigNumberControl({
  control,
  defaultSettings,
  onChange,
  settings,
}: {
  control: RigNumericInspectorControl;
  defaultSettings: AnyRigSettings;
  onChange: (key: string, value: unknown) => void;
  settings: AnyRigSettings;
}) {
  const scale = control.scale ?? 1;
  const {
    key: _settingKey,
    kind: _kind,
    scale: _scale,
    section: _section,
    ...precisionProps
  } = control;
  const value = Number((settings as unknown as Record<string, unknown>)[control.key]) * scale;
  const defaultValue = Number((defaultSettings as unknown as Record<string, unknown>)[control.key]) * scale;
  return (
    <PrecisionControl
      {...precisionProps}
      defaultValue={defaultValue}
      value={value}
      onChange={(next) => onChange(control.key, next / scale)}
    />
  );
}

function RigChoiceControl({
  control,
  defaultSettings,
  onChange,
  rigId,
  settings,
}: {
  control: RigChoiceInspectorControl;
  defaultSettings: AnyRigSettings;
  onChange: (key: string, value: unknown) => void;
  rigId: string;
  settings: AnyRigSettings;
}) {
  const value = String((settings as unknown as Record<string, unknown>)[control.key]);
  const defaultValue = String((defaultSettings as unknown as Record<string, unknown>)[control.key]);
  const idPrefix = `${rigId}-${control.key}-option`;
  const labelId = `${rigId}-${control.key}-control-label`;
  return (
    <div className="segmented-field">
      <ControlHeading
        changed={value !== defaultValue}
        id={labelId}
        label={control.label}
        onReset={() => onChange(control.key, defaultValue)}
      />
      <div
        aria-labelledby={labelId}
        className={`segmented-control ${control.options.length > 2 ? "four-up" : "two-up"}`}
        role="radiogroup"
      >
        {control.options.map((option, index) => (
          <button
            aria-checked={value === option.value}
            className={value === option.value ? "segment-active" : ""}
            id={`${idPrefix}-${option.value}`}
            key={option.value}
            onClick={() => onChange(control.key, option.value)}
            onKeyDown={(event) =>
              handleRadioNavigation(event, control.options, index, (next) => onChange(control.key, next.value), idPrefix)
            }
            role="radio"
            tabIndex={value === option.value ? 0 : -1}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BackgroundControls({
  defaults,
  includesBackground,
  lastIncludedModeRef,
  onChange,
  settings,
  supportsTransparency,
}: {
  defaults: AnyRigSettings["background"];
  includesBackground: boolean;
  lastIncludedModeRef: React.MutableRefObject<Exclude<BackgroundMode, "transparent">>;
  onChange: (background: AnyRigSettings["background"]) => void;
  settings: AnyRigSettings["background"];
  supportsTransparency: boolean;
}) {
  return (
    <>
      {supportsTransparency ? (
        <label className="toggle-control">
          <span><strong>Include background</strong><small>Off exports transparent pixels</small></span>
          <input
            aria-label="Include background"
            name="include-background"
            checked={includesBackground}
            type="checkbox"
            onChange={(event) => onChange({ ...settings, mode: event.currentTarget.checked ? lastIncludedModeRef.current : "transparent" })}
          />
        </label>
      ) : null}
      <label className="select-control">
        <ControlHeading
          changed={settings.mode !== defaults.mode}
          label="Mode"
          onReset={() => onChange({ ...settings, mode: defaults.mode })}
        />
        <select
          aria-label="Background mode"
          autoComplete="off"
          disabled={!includesBackground}
          name="background-mode"
          value={settings.mode}
          onChange={(event) => onChange({ ...settings, mode: event.currentTarget.value as BackgroundMode })}
        >
          {backgroundModes.filter((mode) => mode !== "transparent" || supportsTransparency).map((mode) => (
            <option key={mode} value={mode}>{formatBackgroundMode(mode)}</option>
          ))}
        </select>
      </label>
      {settings.mode === "solid" ? (
        <ColorControl defaultValue={defaults.solidColor} label="Solid color" value={settings.solidColor} onChange={(solidColor) => onChange({ ...settings, solidColor })} />
      ) : null}
      {settings.mode === "gradient" ? (
        <div className="color-pair">
          <ColorControl defaultValue={defaults.gradientStart} label="Gradient start" value={settings.gradientStart} onChange={(gradientStart) => onChange({ ...settings, gradientStart })} />
          <ColorControl defaultValue={defaults.gradientEnd} label="Gradient end" value={settings.gradientEnd} onChange={(gradientEnd) => onChange({ ...settings, gradientEnd })} />
        </div>
      ) : null}
      <p className="control-note">The checkerboard is preview-only. Transparent WebM playback varies by browser.</p>
    </>
  );
}

interface ControlHeadingProps { changed: boolean; id?: string; label: string; onReset: () => void }

function ControlHeading({ changed, id, label, onReset }: ControlHeadingProps) {
  return (
    <span className="control-heading">
      <span id={id}>{label}{changed ? <i aria-hidden="true" /> : null}{changed ? <span className="sr-only">Modified from default</span> : null}</span>
      <button aria-label={`Reset ${label.toLowerCase()} to default`} className="property-reset" disabled={!changed} title={`Reset ${label.toLowerCase()} to default`} type="button" onClick={onReset}>↺</button>
    </span>
  );
}

function ColorControl({ defaultValue, label, onChange, value }: { defaultValue: string; label: string; onChange: (value: string) => void; value: string }) {
  const errorId = useId();
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const normalized = normalizeHex(draft);
  const invalid = normalized === null;
  useEffect(() => { if (!focused) setDraft(value); }, [focused, value]);
  const commitDraft = () => {
    const next = normalizeHex(draft);
    if (next) { setDraft(next); onChange(next); } else setDraft(value);
  };
  return (
    <div className={`color-control ${invalid ? "control-invalid" : ""}`}>
      <ControlHeading changed={value.toLowerCase() !== normalizeHex(defaultValue)} label={label} onReset={() => { const next = normalizeHex(defaultValue) ?? defaultValue; setDraft(next); onChange(next); }} />
      <div className="color-input-row">
        <input aria-label={`${label} color picker`} name={`${toControlName(label)}-picker`} type="color" value={normalizeHex(value) ?? "#000000"} onChange={(event) => { setDraft(event.currentTarget.value); onChange(event.currentTarget.value); }} />
        <input aria-describedby={invalid ? errorId : undefined} aria-invalid={invalid} aria-label={`${label} hex value`} autoCapitalize="off" autoComplete="off" maxLength={7} name={`${toControlName(label)}-hex`} spellCheck={false} type="text" value={draft} onBlur={() => { setFocused(false); commitDraft(); }} onChange={(event) => { const nextDraft = event.currentTarget.value; setDraft(nextDraft); const next = normalizeHex(nextDraft); if (next) onChange(next); }} onFocus={() => setFocused(true)} />
      </div>
      <span className="color-validation" id={errorId} aria-live="polite">{invalid ? "Enter a 3- or 6-digit hex value." : ""}</span>
    </div>
  );
}

interface PrecisionControlProps extends Omit<RigNumericInspectorControl, "key" | "kind" | "scale" | "section"> {
  defaultValue: number;
  onChange: (value: number) => void;
  value: number;
}

function PrecisionControl({ defaultValue, fineStep, label, largeStep, max, min, onChange, precision, sliderStep, step, unit, unitLabel, value }: PrecisionControlProps) {
  const errorId = useId();
  const [draft, setDraft] = useState(formatNumber(value, precision));
  const [focused, setFocused] = useState(false);
  const parsed = Number(draft);
  const invalid = draft.trim() === "" || !Number.isFinite(parsed);
  const changed = Math.abs(value - defaultValue) > 0.0001;
  useEffect(() => { if (!focused) setDraft(formatNumber(value, precision)); }, [focused, precision, value]);
  const commit = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) return;
    const clamped = roundTo(clamp(nextValue, min, max), precision);
    onChange(clamped);
    setDraft(formatNumber(clamped, precision));
  };
  return (
    <div className={`precision-control ${changed ? "control-changed" : ""} ${invalid ? "control-invalid" : ""}`}>
      <ControlHeading changed={changed} label={label} onReset={() => commit(defaultValue)} />
      <div className="precision-control-row">
        <input aria-label={`${label} slider`} max={max} min={min} name={`${toControlName(label)}-slider`} step={sliderStep} type="range" value={value} onChange={(event) => commit(Number(event.currentTarget.value))} />
        <label className="numeric-input"><span className="sr-only">{label}</span><input aria-describedby={invalid ? errorId : undefined} aria-invalid={invalid} aria-label={`${label} precise value in ${unitLabel}`} autoComplete="off" inputMode="decimal" max={max} min={min} name={`${toControlName(label)}-value`} step={step} type="number" value={draft} onBlur={() => { setFocused(false); if (invalid) setDraft(formatNumber(value, precision)); else commit(parsed); }} onChange={(event) => { const nextDraft = event.currentTarget.value; setDraft(nextDraft); const nextValue = Number(nextDraft); if (nextDraft.trim() !== "" && Number.isFinite(nextValue)) onChange(roundTo(clamp(nextValue, min, max), precision)); }} onFocus={() => setFocused(true)} onKeyDown={(event) => { if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return; event.preventDefault(); const increment = event.shiftKey ? largeStep : event.altKey ? fineStep : step; commit(value + increment * (event.key === "ArrowUp" ? 1 : -1)); }} /><span aria-hidden="true">{unit}</span></label>
      </div>
      <span className="sr-only" id={errorId} aria-live="polite">{invalid ? `${label} needs a valid number.` : ""}</span>
    </div>
  );
}

function normalizeHex(value: string) { const trimmed = value.trim().toLowerCase(); const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`; if (/^#[0-9a-f]{6}$/.test(withHash)) return withHash; if (/^#[0-9a-f]{3}$/.test(withHash)) return `#${withHash[1]}${withHash[1]}${withHash[2]}${withHash[2]}${withHash[3]}${withHash[3]}`; return null; }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
function roundTo(value: number, precision: number) { const factor = 10 ** precision; return Math.round(value * factor) / factor; }
function formatNumber(value: number, precision: number) { return value.toFixed(precision).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1"); }
function formatBackgroundMode(mode: BackgroundMode) { return mode === "transparent" ? "Transparent" : mode === "gradient" ? "Gradient" : "Solid"; }
function toControlName(label: string) { return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function handleRadioNavigation(
  event: React.KeyboardEvent<HTMLButtonElement>,
  options: readonly { label: string; value: string }[],
  currentIndex: number,
  onSelect: (option: { label: string; value: string }) => void,
  idPrefix: string,
) {
  let nextIndex = currentIndex;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % options.length;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + options.length) % options.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = options.length - 1;
  else return;
  event.preventDefault();
  const next = options[nextIndex];
  onSelect(next);
  window.requestAnimationFrame(() => document.getElementById(`${idPrefix}-${next.value}`)?.focus());
}
