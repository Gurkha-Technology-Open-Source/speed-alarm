// Variables and cached DOM elements
let prevCoords = null;
let speedThreshold = 50; // Default threshold in km/h
const speedDisplay = document.getElementById('speed-display');
const statusMessage = document.getElementById('status-message');
const speedThresholdInput = document.getElementById('speed-threshold');
const gaugeEl = document.getElementById('gauge');

const STORAGE_KEY = 'speedAlarmThreshold';
speedThreshold = parseInt(localStorage.getItem(STORAGE_KEY), 10) || speedThreshold;
speedThresholdInput.value = speedThreshold;

// Alarm sound (single reusable instance) and state
const alarmSound = new Audio('alarm.mp3');
alarmSound.preload = 'auto';
alarmSound.loop = true;
let isAlarmPlaying = false;

// Minimums to avoid jitter / divide-by-zero
const MIN_TIME_DELTA_S = 0.7; // seconds
const MIN_DISTANCE_M = 2; // meters

// Set up event listener for user-defined threshold
speedThresholdInput.addEventListener('change', () => {
    const v = parseInt(speedThresholdInput.value, 10);
    if (!Number.isFinite(v) || v <= 0) {
        speedThresholdInput.value = speedThreshold;
        return;
    }
    speedThreshold = v;
    localStorage.setItem(STORAGE_KEY, String(speedThreshold));
});

// Haversine distance in meters
function calculateDistance(coords1, coords2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = coords1.latitude * Math.PI / 180;
    const φ2 = coords2.latitude * Math.PI / 180;
    const Δφ = (coords2.latitude - coords1.latitude) * Math.PI / 180;
    const Δλ = (coords2.longitude - coords1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Function to calculate speed using the Haversine formula
function calculateSpeed(coords1, coords2, timeElapsed) {
    if (!timeElapsed || timeElapsed <= 0) return 0;
    const distance = calculateDistance(coords1, coords2); // meters
    const speed = (distance / timeElapsed) * 3.6; // m/s -> km/h
    return Number.isFinite(speed) ? Math.max(0, speed) : 0;
}

// Function to start geolocation tracking
function trackLocation() {
    if (!navigator.geolocation) {
        statusMessage.textContent = "Geolocation is not supported by this browser.";
        return;
    }

    // Best-effort permissions message (optional)
    try {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                if (result.state === 'denied') {
                    statusMessage.textContent = "Geolocation permission denied.";
                }
            }).catch(() => {/* ignore */});
        }
    } catch (e) { /* ignore */ }

    navigator.geolocation.watchPosition(updateSpeed, showError, {
        enableHighAccuracy: true,
        maximumAge: 500,
        timeout: 5000
    });
}

// Function to update the speed display
function updateSpeed(position) {
    if (!position || !position.coords) return;

    if (prevCoords) {
        const timeElapsed = (position.timestamp - prevCoords.timestamp) / 1000; // seconds

        // Ignore too-frequent updates or invalid time deltas
        if (timeElapsed < MIN_TIME_DELTA_S) {
            prevCoords = position;
            return;
        }

        const distance = calculateDistance(prevCoords.coords, position.coords);
        if (distance < MIN_DISTANCE_M) {
            prevCoords = position;
            return;
        }

        const speed = calculateSpeed(prevCoords.coords, position.coords, timeElapsed);
        const displaySpeed = Number.isFinite(speed) ? speed : 0;
        speedDisplay.textContent = `${displaySpeed.toFixed(1)} km/h`;
        updateGauge(displaySpeed);

        // Trigger or stop alarm depending on threshold
        if (displaySpeed > speedThreshold) {
            startAlarm();
        } else {
            stopAlarm();
        }
    } else {
        // Initial reading
        speedDisplay.textContent = "0.0 km/h";
        updateGauge(0);
    }

    prevCoords = position;
}

// Function to update speedometer gauge
function updateGauge(speed) {
    if (!gaugeEl) return;
    const pct = Math.min(Math.max(speed, 0), 100);
    gaugeEl.style.width = `${pct}%`;
}

// Start alarm (non-reentrant)
function startAlarm() {
    if (isAlarmPlaying) return;
    isAlarmPlaying = true;
    // Vibrate once at start if supported
    try { navigator.vibrate && navigator.vibrate(500); } catch (e) { /* ignore */ }
    alarmSound.play().catch(() => {
        // play may fail if not user-interacted; silently ignore
        isAlarmPlaying = false;
    });
}

// Stop alarm
function stopAlarm() {
    if (!isAlarmPlaying) return;
    alarmSound.pause();
    try { alarmSound.currentTime = 0; } catch (e) { /* ignore */ }
    isAlarmPlaying = false;
}

// Function to handle errors
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            statusMessage.textContent = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            statusMessage.textContent = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            statusMessage.textContent = "The request to get user location timed out.";
            break;
        default:
            statusMessage.textContent = "An unknown error occurred.";
            break;
    }
}

// Initialize tracking
trackLocation();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker registered:', registration))
        .catch(error => console.log('Service Worker registration failed:', error));
}
