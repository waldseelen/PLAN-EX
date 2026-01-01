/**
 * Enhanced Keyboard Shortcuts Hook
 * Global keyboard shortcuts management
 *
 * @author Code Audit - Production Ready
 * @version 2.0.0
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';

export interface ShortcutConfig {
    /** Key (lowercase) */
    key: string;
    /** Is Ctrl/Cmd key required */
    ctrl?: boolean;
    /** Is Shift key required */
    shift?: boolean;
    /** Is Alt key required */
    alt?: boolean;
    /** Shortcut description (for UI display) */
    description?: string;
    /** Function to execute */
    callback: () => void;
    /** Should work inside Input/textarea too */
    allowInInput?: boolean;
}

// Default global shortcuts
export const DEFAULT_SHORTCUTS = {
    SAVE: { key: 's', ctrl: true, description: 'Save' },
    UNDO: { key: 'z', ctrl: true, description: 'Undo' },
    SEARCH: { key: 'k', ctrl: true, description: 'Search' },
    SETTINGS: { key: ',', ctrl: true, description: 'Settings' },
    TOGGLE_THEME: { key: 'd', ctrl: true, shift: true, description: 'Toggle Theme' },
    NEW_TASK: { key: 'n', ctrl: true, description: 'New Task' },
    ESCAPE: { key: 'Escape', description: 'Close/Cancel' },
} as const;

/**
 * Converts shortcut key combination to string
 * Example: { ctrl: true, key: 's' } -> "Ctrl+S"
 */
export const formatShortcut = (shortcut: Omit<ShortcutConfig, 'callback'>): string => {
    const parts: string[] = [];

    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');

    // Special key names
    const keyName = shortcut.key === ' ' ? 'Space' :
        shortcut.key === 'Escape' ? 'Esc' :
            shortcut.key.length === 1 ? shortcut.key.toUpperCase() :
                shortcut.key;

    parts.push(keyName);

    return parts.join('+');
};

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[], enabled = true) => {
    // Use ref to prevent adding new listener on every render
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Disabled by default when inside Input/textarea
        const target = event.target as HTMLElement;
        const isInInput = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        for (const shortcut of shortcutsRef.current) {
            // Input check
            if (isInInput && !shortcut.allowInInput) {
                // Only allow special keys like Escape
                if (shortcut.key !== 'Escape') continue;
            }

            const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
            const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
            const altMatch = shortcut.alt ? event.altKey : !event.altKey;
            const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

            // If modifier is not specified, work in any state
            const finalCtrlMatch = shortcut.ctrl === undefined ? true : ctrlMatch;
            const finalShiftMatch = shortcut.shift === undefined ? true : shiftMatch;
            const finalAltMatch = shortcut.alt === undefined ? true : altMatch;

            if (finalCtrlMatch && finalShiftMatch && finalAltMatch && keyMatch) {
                event.preventDefault();
                event.stopPropagation();
                shortcut.callback();
                break; // Run first matching shortcut and stop
            }
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [enabled, handleKeyDown]);

    // Kısayolları formatlı olarak döndür (UI'da göstermek için)
    const formattedShortcuts = useMemo(() =>
        shortcuts.map(s => ({
            ...s,
            formatted: formatShortcut(s)
        })),
        [shortcuts]
    );

    return { formattedShortcuts };
};

/**
 * Tek bir kısayol için basitleştirilmiş hook
 */
export const useKeyboardShortcut = (
    config: Omit<ShortcutConfig, 'callback'>,
    callback: () => void,
    enabled = true
) => {
    useKeyboardShortcuts(
        [{ ...config, callback }],
        enabled
    );
};
