/**
 * Focus Mode Hook
 * Increases focus by hiding distracting elements.
 *
 * @author Code Audit - Production Ready
 * @version 1.0.0
 */

import { useCallback, useEffect, useState } from 'react';

interface FocusModeState {
    isActive: boolean;
    startTime: Date | null;
    sessionMinutes: number;
}

export const useFocusMode = () => {
    const [state, setState] = useState<FocusModeState>({
        isActive: false,
        startTime: null,
        sessionMinutes: 0
    });

    // Toggle focus mode on/off
    const toggleFocusMode = useCallback(() => {
        setState(prev => {
            if (prev.isActive) {
                // Deactivate and calculate session duration
                const sessionMinutes = prev.startTime
                    ? Math.round((Date.now() - prev.startTime.getTime()) / 60000)
                    : 0;

                return {
                    isActive: false,
                    startTime: null,
                    sessionMinutes
                };
            } else {
                // Activate
                return {
                    isActive: true,
                    startTime: new Date(),
                    sessionMinutes: 0
                };
            }
        });
    }, []);

    // Add class to body when focus mode is active
    useEffect(() => {
        if (state.isActive) {
            document.body.classList.add('focus-mode');

            // Request browser notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } else {
            document.body.classList.remove('focus-mode');
        }

        return () => {
            document.body.classList.remove('focus-mode');
        };
    }, [state.isActive]);

    // Focus mode süresini hesapla
    const getElapsedMinutes = useCallback(() => {
        if (!state.startTime) return 0;
        return Math.round((Date.now() - state.startTime.getTime()) / 60000);
    }, [state.startTime]);

    return {
        isActive: state.isActive,
        startTime: state.startTime,
        lastSessionMinutes: state.sessionMinutes,
        toggleFocusMode,
        getElapsedMinutes
    };
};
