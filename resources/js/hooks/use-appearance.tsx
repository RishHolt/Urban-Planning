import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark =
        appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'light');
};

export function initializeTheme() {
    const savedAppearance =
        (localStorage.getItem('appearance') as Appearance) || 'light';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    // Initialize from localStorage immediately
    const [appearance, setAppearance] = useState<Appearance>(() => {
        if (typeof window === 'undefined') return 'light';
        return (localStorage.getItem('appearance') as Appearance) || 'light';
    });

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
        setCookie('appearance', mode);
        applyTheme(mode);
    }, []);

    useEffect(() => {
        // Apply theme on mount
        applyTheme(appearance);
        
        // Listen for system theme changes
        const handleChange = () => {
            if (appearance === 'system') {
                applyTheme('system');
            }
        };
        
        mediaQuery()?.addEventListener('change', handleChange);
        return () => mediaQuery()?.removeEventListener('change', handleChange);
    }, [appearance]); // Only depend on appearance, not updateAppearance

    return { appearance, updateAppearance } as const;
}
