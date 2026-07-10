import type {
  BackgroundMode,
  CardShape,
  OrbitDirection,
  OrbitRigSettings,
} from "../rigs/types";

interface RigControlsProps {
  settings: OrbitRigSettings;
  onChange: (settings: OrbitRigSettings) => void;
}

const directions: OrbitDirection[] = ["clockwise", "counter-clockwise"];
const backgroundModes: BackgroundMode[] = ["transparent", "solid", "gradient"];
const cardShapes: CardShape[] = ["rectangle", "square", "circle", "star"];

export function RigControls({ settings, onChange }: RigControlsProps) {
  const updateSetting = <Key extends keyof OrbitRigSettings>(
    key: Key,
    value: OrbitRigSettings[Key],
  ) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="inspector-sections" aria-label="Orbit Carousel controls">
      <details className="inspector-section" open>
        <summary>Motion</summary>
        <div className="inspector-content">
          <RangeControl
            label="Loop duration"
            max={20}
            min={4}
            step={0.5}
            suffix="s"
            value={settings.durationSeconds}
            onChange={(value) => updateSetting("durationSeconds", value)}
          />
          <RangeControl
            label="Spread"
            max={1}
            min={0.38}
            step={0.01}
            value={settings.spread}
            onChange={(value) => updateSetting("spread", value)}
          />
          <RangeControl
            label="Depth fade"
            max={0.85}
            min={0.05}
            step={0.01}
            value={settings.depthFade}
            onChange={(value) => updateSetting("depthFade", value)}
          />

          <fieldset className="segmented-field">
            <legend>Direction</legend>
            <div className="segmented-control two-up">
              {directions.map((direction) => (
                <button
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
          <RangeControl
            label="Card size"
            max={0.44}
            min={0.22}
            step={0.01}
            value={settings.cardSize}
            onChange={(value) => updateSetting("cardSize", value)}
          />
          <RangeControl
            label="Corner radius"
            max={32}
            min={0}
            step={1}
            suffix="px"
            value={settings.cornerRadius}
            onChange={(value) => updateSetting("cornerRadius", value)}
          />

          <fieldset className="segmented-field">
            <legend>Card Shape</legend>
            <div className="segmented-control four-up">
              {cardShapes.map((shape) => (
                <button
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

      <details className="inspector-section">
        <summary>Background</summary>
        <div className="inspector-content">
          <fieldset className="segmented-field">
            <legend>Mode</legend>
            <div className="segmented-control">
              {backgroundModes.map((mode) => (
                <button
                  className={settings.background.mode === mode ? "segment-active" : ""}
                  key={mode}
                  type="button"
                  onClick={() =>
                    updateSetting("background", {
                      ...settings.background,
                      mode,
                    })
                  }
                >
                  {formatBackgroundMode(mode)}
                </button>
              ))}
            </div>
          </fieldset>

          {settings.background.mode === "solid" ? (
            <ColorControl
              label="Solid color"
              value={settings.background.solidColor}
              onChange={(solidColor) =>
                updateSetting("background", {
                  ...settings.background,
                  solidColor,
                })
              }
            />
          ) : null}

          {settings.background.mode === "gradient" ? (
            <div className="color-pair">
              <ColorControl
                label="Gradient start"
                value={settings.background.gradientStart}
                onChange={(gradientStart) =>
                  updateSetting("background", {
                    ...settings.background,
                    gradientStart,
                  })
                }
              />
              <ColorControl
                label="Gradient end"
                value={settings.background.gradientEnd}
                onChange={(gradientEnd) =>
                  updateSetting("background", {
                    ...settings.background,
                    gradientEnd,
                  })
                }
              />
            </div>
          ) : null}

          <p className="control-note">
            Transparent WebM support can vary by browser; use solid or gradient for the most
            reliable playback.
          </p>
        </div>
      </details>
    </div>
  );
}

interface ColorControlProps {
  label: string;
  onChange: (value: string) => void;
  value: string;
}

function ColorControl({ label, onChange, value }: ColorControlProps) {
  return (
    <label className="color-control">
      <span>{label}</span>
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function formatBackgroundMode(mode: BackgroundMode) {
  if (mode === "transparent") {
    return "Transparent";
  }

  if (mode === "gradient") {
    return "Gradient";
  }

  return "Solid";
}

function formatCardShape(shape: CardShape) {
  if (shape === "rectangle") {
    return "Rectangle";
  }

  if (shape === "square") {
    return "Square";
  }

  if (shape === "circle") {
    return "Circle";
  }

  return "Star";
}

interface RangeControlProps {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  suffix?: string;
  value: number;
}

function RangeControl({ label, max, min, onChange, step, suffix = "", value }: RangeControlProps) {
  return (
    <label className="range-control">
      <span>
        {label}
        <strong>
          {formatValue(value)}
          {suffix}
        </strong>
      </span>
      <input
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function formatValue(value: number) {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(2).replace(/0$/, "");
}
