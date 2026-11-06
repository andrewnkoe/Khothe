
(function () {
    'use strict';

    const STORAGE_KEY = 'khothe_theme';
    const THEME_ATTR = 'data-theme';

    /**
     * Get preferred theme from localStorage or system preference.
     * @returns {'light' | 'dark'}
     */
    function getPreferredTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
            return saved;
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    /**
     * Apply theme to root <html> element with optional smooth transition.
     * @param {'light' | 'dark'} theme 
     * @param {boolean} persist - Whether to save to localStorage
     * @param {boolean} animated - Whether to enable smooth transition
     */
    function applyTheme(theme, persist = false, animated = false) {
        if (animated) {
            document.documentElement.classList.add('theme-transitioning');
        }

        document.documentElement.setAttribute(THEME_ATTR, theme);

        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEY, theme);
            } catch (e) {
                console.warn('LocalStorage unavailable for theme persistence', e);
            }
        }

        updateToggleButtonUI(theme);

        if (animated) {
            window.setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, 350);
        }

        window.dispatchEvent(new CustomEvent('khotheThemeChange', { detail: { theme } }));
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute(THEME_ATTR) || getPreferredTheme();
        const nextTheme = current === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme, true, true);
    }

    /**
     * Updates toggle button DOM elements (icons, labels, ARIA attributes).
     * @param {'light' | 'dark'} theme 
     */
    function updateToggleButtonUI(theme) {
        const isDark = theme === 'dark';
        const buttons = document.querySelectorAll('.theme-toggle');

        buttons.forEach(btn => {
            btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            btn.setAttribute(
                'aria-label',
                isDark ? 'Switch to light mode' : 'Switch to dark mode'
            );
            btn.setAttribute(
                'title',
                isDark ? 'Switch to light mode' : 'Switch to dark mode'
            );

            const label = btn.querySelector('.theme-toggle-label');
            if (label) {
                label.textContent = isDark ? 'Dark' : 'Light';
            }
        });
    }

    /**
     * Creates the theme toggle button DOM element.
     * @returns {HTMLButtonElement}
     */
    function createToggleButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'theme-toggle';
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Switch to dark mode');
        button.setAttribute('title', 'Switch to dark mode');
        button.dataset.themeBound = 'true';

        button.innerHTML = `
            <span class="theme-toggle-track" aria-hidden="true">
                <span class="theme-toggle-thumb">
                    <!-- Sun Icon -->
                    <svg class="theme-icon sun-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    <!-- Moon Icon -->
                    <svg class="theme-icon moon-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                </span>
            </span>
            <span class="theme-toggle-label">Light</span>
        `;

        button.addEventListener('click', toggleTheme);
        return button;
    }

    
    function initTheme() {
        const currentTheme = getPreferredTheme();
        applyTheme(currentTheme, false, false);


        const existingButtons = document.querySelectorAll('.theme-toggle');
        if (existingButtons.length > 0) {
            existingButtons.forEach(btn => {
                if (!btn.dataset.themeBound) {
                    btn.addEventListener('click', toggleTheme);
                    btn.dataset.themeBound = 'true';
                }
            });
        } else {
            const navContainer = document.querySelector('.nav-container');
            if (navContainer) {
                const newToggle = createToggleButton();
                navContainer.appendChild(newToggle);
            }
        }

        updateToggleButtonUI(currentTheme);

        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = e => {
                // Only follow OS if the user hasn't explicitly set a preference
                if (!localStorage.getItem(STORAGE_KEY)) {
                    applyTheme(e.matches ? 'dark' : 'light', false, true);
                }
            };
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', listener);
            } else if (mediaQuery.addListener) {
                mediaQuery.addListener(listener);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
