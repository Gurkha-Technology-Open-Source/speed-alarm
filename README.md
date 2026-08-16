# Speed Alarm

A traffic awareness app that tracks your speed in real time and alarms the moment you exceed your speed limit. Built as a web app and wrapped with [Capacitor](https://capacitorjs.com/) for a native Android experience (iOS-ready for later), with the goal of reducing speeding-related accidents.

## Features

- **Real-time speedometer** — adaptive SVG gauge with a limit marker; prefers the GPS chip's doppler speed and falls back to position-derived speed, with accuracy filtering and smoothing to suppress jitter.
- **Overspeed alarm** — looping alarm sound, repeating vibration, full-screen visual flash, and a high-priority notification. Hysteresis prevents chattering right at the limit; a mute button silences the current episode only.
- **Background tracking** — on Android, tracking runs in a foreground service with a persistent notification, so the alarm keeps working with the screen off or the app in the background.
- **Trip logging** — every trip records distance, duration, moving average, max speed, overspeed episodes, and time spent over the limit. Trips are snapshotted while recording, so a killed app doesn't lose data.
- **Safety score** — each trip gets a 0–100 score based on how much of it was spent over the limit. Trip history shows per-trip scores plus lifetime totals.
- **Home-screen widget** (Android) — shows your speed limit and last trip summary at a glance.
- **Configurable** — speed limit with quick presets, km/h or mph, and independent toggles for sound, vibration, notifications, and keep-screen-awake.
- **Still a PWA** — the same `www/` folder works in any modern browser with a service worker for offline use and a web manifest for install.

## Project structure

```
www/                  Web app (plain HTML/CSS/JS modules, no build step)
  js/speed-engine.js  GPS → stable speed readings (filtering, smoothing)
  js/alarm.js         Overspeed alarm with hysteresis
  js/trips.js         Trip recording, scoring, and history persistence
  js/native.js        Capacitor plugin bridge with web fallbacks
  js/gauge.js         SVG speedometer gauge
  js/app.js           UI orchestration
android/              Native Android project (Capacitor)
  .../WidgetBridgePlugin.java        JS → widget data bridge
  .../SpeedAlarmWidgetProvider.java  Home-screen widget
capacitor.config.json
```

## Development

Requirements: Node 20+, JDK 21, Android SDK (for the Android build).

```bash
npm install

# Run in a browser (uses browser geolocation, no background mode)
npx http-server www   # or: python3 -m http.server -d www

# Sync web assets + plugins into the Android project
npx cap sync android

# Build a debug APK
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk

# Or open in Android Studio
npx cap open android
```

There is no bundler: the web app is plain ES modules, and Capacitor plugins are accessed through `window.Capacitor.registerPlugin` at runtime (see `www/js/native.js`), falling back to standard web APIs in the browser.

## Permissions (Android)

- **Location (fine)** — to measure speed. Requested on first "Start trip".
- **Notifications** — the foreground-service notification while tracking and overspeed alerts.
- Vibration and wake lock for the alarm and keep-awake option.

## License

MIT — see [LICENSE](LICENSE).
