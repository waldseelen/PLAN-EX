import { PomodoroSettings } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SETTINGS: PomodoroSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
};

export const usePomodoroSettings = () => {
    const [settings, setSettings] = useLocalStorage<PomodoroSettings>(
        'pomodoro-settings',
        DEFAULT_SETTINGS
    );

    const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    return {
        settings,
        updateSettings,
        resetSettings,
        DEFAULT_SETTINGS,
    };
};
