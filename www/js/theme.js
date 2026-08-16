/** Theme: 'system' | 'light' | 'dark' */

const THEME_COLORS = {
    dark: '#0f1420',
    light: '#eef2f7',
};

let mode = 'system';
let mediaQuery = null;

function resolvedTheme() {
    if (mode === 'light') return 'light';
    if (mode === 'dark') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateMetaThemeColor(resolved) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLORS[resolved];
}

export function applyTheme(themeMode) {
    mode = themeMode;
    const resolved = resolvedTheme();
    document.documentElement.dataset.theme = resolved;
    updateMetaThemeColor(resolved);
}

export function initTheme(themeMode) {
    mode = themeMode;
    if (!mediaQuery) {
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (mode === 'system') applyTheme('system');
        });
    }
    applyTheme(mode);
}

export function getResolvedTheme() {
    return resolvedTheme();
}
