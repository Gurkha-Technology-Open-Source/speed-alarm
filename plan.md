# Project Plan

## Done

- Capacitor Android app with background GPS (foreground service), overspeed alarm, trip logging, widget, always-on monitoring
- Nepal speed presets: 20 / 40 / 50 / 60 / 80 km/h
- Reliability fixes: `useLegacyBridge`, alarm reset on GPS lost, tracking permissions (notifications + FGS location), battery settings button, in-app dialogs, privacy policy
- PWA fallback with service worker

## Next up

- **Per-road speed limits** — bundled GeoJSON/OSM maxspeed lookup for Nepal roads (auto-switch 20/40/50/60/80 by lat/lng)
- **Boot receiver** — restart always-on monitoring after phone reboot without opening the app
- **Signed release build** — keystore, Play Store listing, FGS declaration
- **Nepali localization**
- **Trip detail view** — map, speed chart, export CSV/GPX
- **Unit tests** — Vitest for speed engine, alarm hysteresis, trip scoring
- **iOS platform**
