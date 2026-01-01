import { useCallback, useRef } from 'react';

import { useLocalStorage } from './useLocalStorage';

export const useCompletionSound = () => {
    const [soundEnabled, setSoundEnabled] = useLocalStorage('planner_sound_enabled', true);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playCompletionSound = useCallback(() => {
        if (!soundEnabled) return;

        try {
            // Create a simple "ding" sound with Web Audio API
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }

            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }, [soundEnabled]);

    const playSuccessSound = useCallback(() => {
        if (!soundEnabled) return;

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }

            const ctx = audioContextRef.current;

            // Play two notes - more celebratory feel
            [0, 0.15].forEach((delay, i) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.frequency.setValueAtTime(i === 0 ? 523 : 784, ctx.currentTime + delay); // C5 ve G5

                gainNode.gain.setValueAtTime(0.3, ctx.currentTime + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.4);

                oscillator.start(ctx.currentTime + delay);
                oscillator.stop(ctx.currentTime + delay + 0.4);
            });
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }, [soundEnabled]);

    return { soundEnabled, setSoundEnabled, playCompletionSound, playSuccessSound };
};
