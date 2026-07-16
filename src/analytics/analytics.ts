export const analyticsEventNames = [
  "home_viewed",
  "creation_started",
  "showcase_started",
  "media_added",
  "motion_system_selected",
  "preset_selected",
  "preview_played",
  "export_sheet_opened",
  "export_started",
  "export_completed",
  "export_failed",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type AnalyticsFailureReason =
  | "unsupported_browser"
  | "recorder_startup"
  | "invalid_media"
  | "encoding"
  | "png_encoding"
  | "download"
  | "unknown";

export interface AnalyticsProperties {
  aspect_ratio?: "1:1" | "16:9" | "9:16";
  device_category?: "desktop" | "tablet" | "mobile";
  duration_bucket?: "under_7_seconds" | "7_to_10_seconds" | "over_10_seconds";
  export_format?: "webm" | "png";
  export_fps?: 30 | 60;
  export_resolution?:
    | "1080x1080"
    | "1920x1080"
    | "1080x1920"
    | "1440x1440"
    | "2560x1440"
    | "1440x2560";
  failure_reason?: AnalyticsFailureReason;
  media_count?: number;
  motion_system_id?: string;
  preset_id?: string;
  viewport_group?: "mobile" | "tablet" | "desktop" | "wide";
}

interface AnalyticsPayload {
  event: AnalyticsEventName;
  properties: AnalyticsProperties;
}

interface AnalyticsProvider {
  track(payload: AnalyticsPayload): Promise<void> | void;
}

const ANALYTICS_GLOBALLY_DISABLED = import.meta.env.VITE_ANALYTICS_DISABLED === "true";
const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim() ?? "";
let analyticsEnabled =
  import.meta.env.PROD &&
  import.meta.env.VITE_ANALYTICS_ENABLED === "true" &&
  !ANALYTICS_GLOBALLY_DISABLED;

const provider = ANALYTICS_ENDPOINT ? createHttpProvider(ANALYTICS_ENDPOINT) : null;

export function trackEvent(
  eventName: AnalyticsEventName,
  properties: AnalyticsProperties = {},
) {
  if (!isAnalyticsEnabled() || !analyticsEventNames.includes(eventName)) {
    return;
  }

  const payload: AnalyticsPayload = {
    event: eventName,
    properties: sanitizeProperties({ ...getViewportProperties(), ...properties }),
  };

  try {
    void Promise.resolve(provider?.track(payload)).catch(() => undefined);
  } catch {
    // Analytics must never interrupt the product flow.
  }
}

export function setAnalyticsEnabled(enabled: boolean) {
  analyticsEnabled = Boolean(enabled) && !ANALYTICS_GLOBALLY_DISABLED;
}

export function isAnalyticsEnabled() {
  return analyticsEnabled && provider !== null;
}

export function getDurationBucket(durationSeconds: number): AnalyticsProperties["duration_bucket"] {
  if (durationSeconds < 7) return "under_7_seconds";
  if (durationSeconds <= 10) return "7_to_10_seconds";
  return "over_10_seconds";
}

function createHttpProvider(endpoint: string): AnalyticsProvider {
  return {
    async track(payload) {
      await fetch(endpoint, {
        body: JSON.stringify(payload),
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        method: "POST",
        referrerPolicy: "no-referrer",
      });
    },
  };
}

function getViewportProperties(): Pick<AnalyticsProperties, "device_category" | "viewport_group"> {
  const width = typeof window === "undefined" ? 1280 : window.innerWidth;
  return {
    device_category: width <= 680 ? "mobile" : width <= 1024 ? "tablet" : "desktop",
    viewport_group:
      width <= 680 ? "mobile" : width <= 1024 ? "tablet" : width <= 1280 ? "desktop" : "wide",
  };
}

function sanitizeProperties(properties: AnalyticsProperties): AnalyticsProperties {
  const sanitized: AnalyticsProperties = {};
  const safeId = /^[a-z0-9][a-z0-9-]{0,63}$/;
  const allowedValues = {
    aspect_ratio: ["1:1", "16:9", "9:16"],
    device_category: ["desktop", "tablet", "mobile"],
    duration_bucket: ["under_7_seconds", "7_to_10_seconds", "over_10_seconds"],
    export_format: ["webm", "png"],
    export_fps: [30, 60],
    export_resolution: [
      "1080x1080",
      "1920x1080",
      "1080x1920",
      "1440x1440",
      "2560x1440",
      "1440x2560",
    ],
    failure_reason: [
      "unsupported_browser",
      "recorder_startup",
      "invalid_media",
      "encoding",
      "png_encoding",
      "download",
      "unknown",
    ],
    viewport_group: ["mobile", "tablet", "desktop", "wide"],
  } as const;

  (Object.keys(allowedValues) as Array<keyof typeof allowedValues>).forEach((key) => {
    const value = properties[key];
    if ((allowedValues[key] as readonly unknown[]).includes(value)) {
      Object.assign(sanitized, { [key]: value });
    }
  });

  if (typeof properties.media_count === "number" && Number.isInteger(properties.media_count)) {
    sanitized.media_count = Math.min(6, Math.max(0, properties.media_count));
  }
  if (typeof properties.motion_system_id === "string" && safeId.test(properties.motion_system_id)) {
    sanitized.motion_system_id = properties.motion_system_id;
  }
  if (typeof properties.preset_id === "string" && safeId.test(properties.preset_id)) {
    sanitized.preset_id = properties.preset_id;
  }

  return sanitized;
}
