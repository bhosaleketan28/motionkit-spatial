import { useEffect, useId, useRef, useState } from "react";
import type {
  BackgroundMode,
  CardShape,
  MotionRigControlDefaults,
  OrbitDirection,
  OrbitRigSettings,
} from "../rigs/types";

interface RigControlsProps {
  defaults: MotionRigControlDefaults;
  onChange: (settings: OrbitRigSettings) => void;
  settings: OrbitRigSettings;
}

const directions: OrbitDirection[] = ["clockwise", "counter-clockwise"];
const backgroundModes: BackgroundMode[] = ["transparent", "solid", "gradient"];
const cardShapes: CardShape[] = ["rectangle", "square", "circle", "star"];

export function RigControls({ defaults, settings, onChange }: RigControlsProps) {
  const lastIncludedModeRef = useRef<Exclude<BackgroundMode, "transparent">>(
    settings.background.mode === "solid" ? "solid" : "gradient",
  );
  const updateSetting = <Key extends keyof OrbitRigSettings>(
    key: Key,
    value: OrbitRigSettings[Key],
  ) => onChange({ ...settings, [key]: value });
  const updateBackground = (background: OrbitRigSettings["background"]) => {
    if (background.mode !== "transparent") {
      lastIncludedModeRef.current = background.mode;
    }
    updateSetting("background", background);
  };
  const includesBackground = settings.background.mode !== "transparent";

  return (
    <div className="inspector-sections" aria-label="Orbit Carousel controls">
      <details className="inspector-section" open>
        <summary>Motion</summary>
        <div className="inspector-content">
          <PrecisionControl
            defaultValue={defaults.durationSeconds}
            fineStep={0.05}
            label="Loop duration"
            largeStep={1}
            max={20}
            min={4}
            precision={1}
            sliderStep={0.1}
            step={0.1}
            unit="s"
            unitLabel="seconds"
            value={settings.durationSeconds}
            onChange={(value) => updateSetting("durationSeconds", value)}
          />
          <PrecisionControl
            defaultValue={defaults.spread * 100}
            fineStep={0.1}
            label="Spread"
            largeStep={10}
            max={100}
            min={38}
            precision={1}
            sliderStep={1}
            step={1}
            unit="%"
            unitLabel="percent"
            value={settings.spread * 100}
            onChange={(value) => updateSetting("spread", value / 100)}
          />
          <PrecisionControl
            defaultValue={defaults.depthFade * 100}
            fineStep={0.1}
            label="Depth fade"
            largeStep={10}
            max={85}
            min={5}
            precision={1}
            sliderStep={1}
            step={1}
            unit="%"
            unitLabel="percent"
            value={settings.depthFade * 100}
            onChange={(value) => updateSetting("depthFade", value / 100)}
          />

          <fieldset className="segmented-field">
            <legend className="sr-only">Direction</legend>
            <ControlHeading
              changed={settings.direction !== defaults.direction}
              label="Direction"
              onReset={() => updateSetting("direction", defaults.direction)}
            />
            <div className="segmented-control two-up">
              {directions.map((direction) => (
                <button
                  aria-pressed={settings.direction === direction}
                  className={settings.direction === direction ? "segment-active" : ""}
                  key={direction}
                  type="button"
                  onClick={() => updateSetting("direction", direction)}
                >
                  {direction === "clockwise" ? "Clockwise" : "Counter"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </details>

      <details className="inspector-section" open>
        <summary>Appearance</summary>
        <div className="inspector-content">
          <PrecisionControl
            defaultValue={defaults.cardSize * 100}
            fineStep={0.1}
            label="Card size"
            largeStep={5}
            max={44}
            min={22}
            precision={1}
            sliderStep={1}
            step={1}
            unit="%"
            unitLabel="percent"
            value={settings.cardSize * 100}
            onChange={(value) => updateSetting("cardSize", value / 100)}
          />
          <PrecisionControl
            defaultValue={defaults.cornerRadius}
            fineStep={0.5}
            label="Corner radius"
            largeStep={5}
            max={32}
            min={0}
            precision={1}
            sliderStep={1}
            step={1}
            unit="px"
            unitLabel="pixels"
            value={settings.cornerRadius}
            onChange={(value) => updateSetting("cornerRadius", value)}
          />

          <fieldset className="segmented-field">
            <legend className="sr-only">Card shape</legend>
            <ControlHeading
              changed={settings.cardShape !== defaults.cardShape}
              label="Card shape"
              onReset={() => updateSetting("cardShape", defaults.cardShape)}
            />
            <div className="segmented-control four-up">
              {cardShapes.map((shape) => (
                <button
                  aria-pressed={settings.cardShape === shape}
                  className={settings.cardShape === shape ? "segment-active" : ""}
                  key={shape}
                  type="button"
                  onClick={() => updateSetting("cardShape", shape)}
                >
                  {formatCardShape(shape)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </details>

      <details className="inspector-section" open>
        <summary>Background</summary>
        <div className="inspector-content">
          <label className="toggle-control">
            <span>
              <strong>Include background</strong>
              <small>Off exports transparent pixels</small>
            </span>
            <input
              aria-label="Include background"
              checked={includesBackground}
              type="checkbox"
              onChange={(event) =>
                updateBackground({
                  ...settings.background,
                  mode: event.currentTarget.checked ? lastIncludedModeRef.current : "transparent",
                })
              }
            />
          </label>

          <label className="select-control">
            <ControlHeading
              changed={settings.background.mode !== defaults.background.mode}
              label="Mode"
              onReset={() => updateBackground({ ...settings.background, mode: defaults.background.mode })}
            />
            <select
              aria-label="Background mode"
              disabled={!includesBackground}
              value={settings.background.mode}
              onChange={(event) =>
                updateBackground({
                  ...settings.background,
                  mode: event.currentTarget.value as BackgroundMode,
                })
              }
            >
              {backgroundModes.map((mode) => (
                <option key={mode} value={mode}>{formatBackgroundMode(mode)}</option>
              ))}
            </select>
          </label>

          {settings.background.mode === "solid" ? (
            <ColorControl
              defaultValue={defaults.background.solidColor}
              label="Solid color"
              value={settings.background.solidColor}
              onChange={(solidColor) =>
                updateBackground({ ...settings.background, solidColor })
              }
            />
          ) : null}

          {settings.background.mode === "gradient" ? (
            <div className="color-pair">
              <ColorControl
                defaultValue={defaults.background.gradientStart}
                label="Gradient start"
                value={settings.background.gradientStart}
                onChange={(gradientStart) =>
                  updateBackground({ ...settings.background, gradientStart })
                }
              />
              <ColorControl
                defaultValue={defaults.background.gradientEnd}
                label="Gradient end"
                value={settings.background.gradientEnd}
                onChange={(gradientEnd) =>
                  updateBackground({ ...settings.background, gradientEnd })
                }
              />
            </div>
          ) : null}

          <p className="control-note">
            The checkerboard is preview-only. Transparent WebM playback varies by browser.
          </p>
        </div>
      </details>

      <details className="inspector-section">
        <summary>Export summary</summary>
        <div className="inspector-content">
          <dl className="inspector-output-summary">
            <div><dt>Ratio</dt><dd>{settings.frameRatio}</dd></div>
            <div><dt>Duration</dt><dd>{settings.durationSeconds.toFixed(1)} s</dd></div>
            <div><dt>Background</dt><dd>{formatBackgroundMode(settings.background.mode)}</dd></div>
          </dl>
          <p className="control-note">Use Export in the top bar to review format, resolution, and FPS.</p>
        </div>
      </details>
    </div>
  );
}

interface ControlHeadingProps {
  changed: boolean;
  label: string;
  onReset: () => void;
}

function ControlHeading({ changed, label, onReset }: ControlHeadingProps) {
  return (
    <span className="control-heading">
      <span>
        {label}
        {changed ? <i aria-hidden="true" /> : null}
        {changed ? <span className="sr-only">Modified from default</span> : null}
      </span>
      <button
        aria-label={`Reset ${label.toLowerCase()} to default`}
        className="property-reset"
        disabled={!changed}
        title={`Reset ${label.toLowerCase()} to default`}
        type="button"
        onClick={onReset}
      >
        ↺
      </button>
    </span>
  );
}

interface ColorControlProps {
  defaultValue: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

function ColorControl({ defaultValue, label, onChange, value }: ColorControlProps) {
  const errorId = useId();
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const normalized = normalizeHex(draft);
  const invalid = normalized === null;

  useEffect(() => {
    if (!focused) {
      setDraft(value);
    }
  }, [focused, value]);

  const commitDraft = () => {
    const next = normalizeHex(draft);
    if (next) {
      setDraft(next);
      onChange(next);
    } else {
      setDraft(value);
    }
  };

  return (
    <div className={`color-control ${invalid ? "control-invalid" : ""}`}>
      <ControlHeading
        changed={value.toLowerCase() !== normalizeHex(defaultValue)}
        label={label}
        onReset={() => {
          const next = normalizeHex(defaultValue) ?? defaultValue;
          setDraft(next);
          onChange(next);
        }}
      />
      <div className="color-input-row">
        <input
          aria-label={`${label} color picker`}
          type="color"
          value={normalizeHex(value) ?? "#000000"}
          onChange={(event) => {
            setDraft(event.currentTarget.value);
            onChange(event.currentTarget.value);
          }}
        />
        <input
          aria-describedby={invalid ? errorId : undefined}
          aria-invalid={invalid}
          aria-label={`${label} hex value`}
          autoCapitalize="off"
          maxLength={7}
          spellCheck={false}
          type="text"
          value={draft}
          onBlur={() => {
            setFocused(false);
            commitDraft();
          }}
          onChange={(event) => {
            const nextDraft = event.currentTarget.value;
            setDraft(nextDraft);
            const next = normalizeHex(nextDraft);
            if (next) {
              onChange(next);
            }
          }}
          onFocus={() => setFocused(true)}
        />
      </div>
      <span className="color-validation" id={errorId} aria-live="polite">
        {invalid ? "Enter a 3- or 6-digit hex value." : ""}
      </span>
    </div>
  );
}

interface PrecisionControlProps {
  defaultValue: number;
  fineStep: number;
  label: string;
  largeStep: number;
  max: number;
  min: number;
  onChange: (value: number) => void;
  precision: number;
  sliderStep: number;
  step: number;
  unit: string;
  unitLabel: string;
  value: number;
}

function PrecisionControl({
  defaultValue,
  fineStep,
  label,
  largeStep,
  max,
  min,
  onChange,
  precision,
  sliderStep,
  step,
  unit,
  unitLabel,
  value,
}: PrecisionControlProps) {
  const [draft, setDraft] = useState(formatNumber(value, precision));
  const [focused, setFocused] = useState(false);
  const parsed = Number(draft);
  const invalid = draft.trim() === "" || !Number.isFinite(parsed);
  const changed = Math.abs(value - defaultValue) > 0.0001;

  useEffect(() => {
    if (!focused) {
      setDraft(formatNumber(value, precision));
    }
  }, [focused, precision, value]);

  const commit = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) {
      return;
    }
    const clamped = roundTo(clamp(nextValue, min, max), precision);
    onChange(clamped);
    setDraft(formatNumber(clamped, precision));
  };

  return (
    <div className={`precision-control ${changed ? "control-changed" : ""} ${invalid ? "control-invalid" : ""}`}>
      <ControlHeading
        changed={changed}
        label={label}
        onReset={() => commit(defaultValue)}
      />
      <div className="precision-control-row">
        <input
          aria-label={`${label} slider`}
          max={max}
          min={min}
          step={sliderStep}
          type="range"
          value={value}
          onChange={(event) => commit(Number(event.currentTarget.value))}
        />
        <label className="numeric-input">
          <span className="sr-only">{label}</span>
          <input
            aria-invalid={invalid}
            aria-label={`${label} in ${unitLabel}`}
            inputMode="decimal"
            max={max}
            min={min}
            step={step}
            type="number"
            value={draft}
            onBlur={() => {
              setFocused(false);
              if (invalid) {
                setDraft(formatNumber(value, precision));
              } else {
                commit(parsed);
              }
            }}
            onChange={(event) => {
              const nextDraft = event.currentTarget.value;
              setDraft(nextDraft);
              const nextValue = Number(nextDraft);
              if (nextDraft.trim() !== "" && Number.isFinite(nextValue)) {
                onChange(roundTo(clamp(nextValue, min, max), precision));
              }
            }}
            onFocus={() => setFocused(true)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                return;
              }
              event.preventDefault();
              const increment = event.shiftKey ? largeStep : event.altKey ? fineStep : step;
              const direction = event.key === "ArrowUp" ? 1 : -1;
              commit(value + increment * direction);
            }}
          />
          <span aria-hidden="true">{unit}</span>
        </label>
      </div>
      <span className="sr-only" aria-live="polite">
        {invalid ? `${label} needs a valid number.` : ""}
      </span>
    </div>
  );
}

function normalizeHex(value: string) {
  const trimmed = value.trim().toLowerCase();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (/^#[0-9a-f]{6}$/.test(withHash)) {
    return withHash;
  }
  if (/^#[0-9a-f]{3}$/.test(withHash)) {
    return `#${withHash[1]}${withHash[1]}${withHash[2]}${withHash[2]}${withHash[3]}${withHash[3]}`;
  }
  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function formatNumber(value: number, precision: number) {
  return value.toFixed(precision).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function formatBackgroundMode(mode: BackgroundMode) {
  return mode === "transparent" ? "Transparent" : mode === "gradient" ? "Gradient" : "Solid";
}

function formatCardShape(shape: CardShape) {
  return shape.charAt(0).toUpperCase() + shape.slice(1);
}
