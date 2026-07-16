# Privacy-conscious analytics

Hoppy analytics measures a small creation and export funnel without identifying a person or inspecting creative work. Product code calls the provider-independent adapter in `src/analytics/analytics.ts`; the current optional provider sends a minimal JSON event to a configured HTTP endpoint.

## Runtime configuration

Analytics is off unless all required conditions are met. It is disabled by default in local Vite development.

| Environment variable | Behavior |
| --- | --- |
| `VITE_ANALYTICS_ENABLED=true` | Allows analytics in a production build when an endpoint is also configured. |
| `VITE_ANALYTICS_ENDPOINT=https://…` | Sets the optional event collector endpoint. A missing endpoint makes the adapter a no-op. |
| `VITE_ANALYTICS_DISABLED=true` | Global kill switch. This overrides runtime calls to `setAnalyticsEnabled(true)`. |

The application-facing API is:

```ts
trackEvent(eventName, properties?)
setAnalyticsEnabled(enabled)
isAnalyticsEnabled()
```

`setAnalyticsEnabled` changes only in-memory adapter state. It does not write a preference, identifier, or event queue to local storage. The adapter sends requests without cookies or credentials and suppresses provider and network errors.

## Event schema

Every event may include `device_category` and `viewport_group`, derived only from the current viewport width. No user, device, session, or project identifier is created.

| Event | Trigger | Event-specific properties |
| --- | --- | --- |
| `home_viewed` | The Start Screen becomes active. | `motion_system_id` |
| `creation_started` | A first workspace is successfully started from uploaded media or a showcase. | `motion_system_id`, `media_count` |
| `showcase_started` | A user explicitly loads a showcase or motion demo. | `motion_system_id`, `preset_id`, `media_count` |
| `media_added` | One or more validated files are accepted into available media slots. | `motion_system_id`, `media_count` |
| `motion_system_selected` | A different registered motion system is successfully selected. | `motion_system_id` |
| `preset_selected` | A valid preset is successfully applied. | `motion_system_id`, `preset_id` |
| `preview_played` | A user starts a paused stage preview or replays it. | `motion_system_id`, `preset_id`, `aspect_ratio`, `duration_bucket`, `media_count` |
| `export_sheet_opened` | The canonical Export action opens the export sheet. | `motion_system_id`, `preset_id`, `aspect_ratio`, `duration_bucket`, `media_count` |
| `export_started` | One validated PNG or WebM export attempt begins. | `motion_system_id`, `aspect_ratio`, `duration_bucket`, `media_count`, `export_format`, `export_resolution`, WebM-only `export_fps` |
| `export_completed` | Rendering succeeded and the browser download action was started. | Same as `export_started` |
| `export_failed` | A non-cancellation export failure reaches a controlled error state. | Same as `export_started`, plus `failure_reason` |

Permitted property values are bounded enums or counts:

- `device_category`: `mobile`, `tablet`, `desktop`
- `viewport_group`: `mobile`, `tablet`, `desktop`, `wide`
- `aspect_ratio`: `1:1`, `16:9`, `9:16`
- `duration_bucket`: `under_7_seconds`, `7_to_10_seconds`, `over_10_seconds`
- `export_format`: `png`, `webm`
- `export_resolution`: one of the six supported width-by-height export sizes
- `export_fps`: `30` or `60`, WebM only
- `failure_reason`: `unsupported_browser`, `recorder_startup`, `invalid_media`, `encoding`, `png_encoding`, `download`, `unknown`
- `media_count`: integer clamped to the supported zero-to-six slot range
- `motion_system_id` and `preset_id`: registered slug-like product identifiers only

The adapter performs runtime allowlisting even though TypeScript also constrains callers. Unknown property keys and invalid values are never included in a request.

## Data that is never collected

Analytics must not receive or derive:

- uploaded media bytes, image URLs, blob URLs, canvas pixels, or preview data
- filenames, project names, free-form text, or creative settings beyond the listed coarse export fields
- local filesystem information or local storage contents
- advertising identifiers, account details, session replay, or behavioral profiles

The HTTP provider body contains only:

```json
{
  "event": "export_started",
  "properties": {
    "device_category": "desktop",
    "viewport_group": "wide",
    "motion_system_id": "orbit-carousel",
    "aspect_ratio": "16:9",
    "duration_bucket": "7_to_10_seconds",
    "media_count": 4,
    "export_format": "webm",
    "export_resolution": "1920x1080",
    "export_fps": 60
  }
}
```

## Failure behavior

Tracking is fire-and-forget. A blocked provider, rejected request, offline browser, malformed endpoint response, or missing environment configuration cannot block navigation, media loading, preview playback, session restoration, or export. Events are not queued or retried locally. User-cancelled exports do not emit `export_failed`.
