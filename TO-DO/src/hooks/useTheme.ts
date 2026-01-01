/**
 * Theme Management Hook
 * Kullanıcının tema tercihini localStorage'da saklar ve sistem tercihini takip eder.
 *
 * @author Code Audit - Production Ready
 * @version 1.0.0
 */

import { useCallback, useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@/constants';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    mode: ThemeMode;
    isDark: boolean;
}

const getSystemPreference = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getStoredTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'system';

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            return stored;
        }
    } catch (error) {
        console.warn('useTheme: Failed to read theme from localStorage', error);
    }

    return 'system';
};

const calculateIsDark = (mode: ThemeMode): boolean => {
    if (mode === 'system') {
        return getSystemPreference();
    }
    return mode === 'dark';
};

export const useTheme = () => {
    const [state, setState] = useState<ThemeState>(() => {
        const mode = getStoredTheme();
        return {
            mode,
            isDark: calculateIsDark(mode)
        };
    });

    // Tema değişikliğini DOM'a uygula
    useEffect(() => {
        const root = document.documentElement;

        if (state.isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Update meta theme-color (for mobile browsers)
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', state.isDark ? '#1e1e2e' : '#f8fafc');
        }
    }, [state.isDark]);

    // Sistem tercih değişikliğini dinle
    useEffect(() => {
        if (state.mode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            setState(prev => ({
                ...prev,
                isDark: e.matches
            }));
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [state.mode]);

    // Tema modunu değiştir
    const setThemeMode = useCallback((newMode: ThemeMode) => {
        try {
            localStorage.setItem(STORAGE_KEYS.DARK_MODE, newMode);
        } catch (error) {
            console.warn('useTheme: Failed to save theme to localStorage', error);
        }

        setState({
            mode: newMode,
            isDark: calculateIsDark(newMode)
        });
    }, []);

    // Karanlık modu direkt toggle et
    const toggleDarkMode = useCallback(() => {
        const newMode: ThemeMode = state.isDark ? 'light' : 'dark';
        setThemeMode(newMode);
    }, [state.isDark, setThemeMode]);

    // Döngüsel tema değişimi: light -> dark -> system -> light
    const cycleTheme = useCallback(() => {
        const modes: ThemeMode[] = ['light', 'dark', 'system'];
        const currentIndex = modes.indexOf(state.mode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setThemeMode(modes[nextIndex]);
    }, [state.mode, setThemeMode]);

    return {
        mode: state.mode,
        isDark: state.isDark,
        setThemeMode,
        toggleDarkMode,
        cycleTheme
    };
};
