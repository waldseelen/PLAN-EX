import { RotateCcw, Settings, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

import { usePomodoroSettings } from '@/hooks/usePomodoroSettings';
import { formatTime } from '@/utils/time';

interface PomodoroTimerProps {
    onOpenSettings?: () => void;
}

export const PomodoroTimer = ({ onOpenSettings }: PomodoroTimerProps) => {
    const { settings } = usePomodoroSettings();
    const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [sessionCount, setSessionCount] = useState(0);

    // Update timer when settings change (only if not running)
    useEffect(() => {
        if (!isActive) {
            switch (mode) {
                case 'work':
                    setTimeLeft(settings.workDuration * 60);
                    break;
                case 'shortBreak':
                    setTimeLeft(settings.shortBreakDuration * 60);
                    break;
                case 'longBreak':
                    setTimeLeft(settings.longBreakDuration * 60);
                    break;
            }
        }
    }, [settings, mode, isActive]);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);

            // Mode transition
            if (mode === 'work') {
                const newSessionCount = sessionCount + 1;
                setSessionCount(newSessionCount);

                // Long break or short break?
                if (newSessionCount >= settings.sessionsBeforeLongBreak) {
                    setMode('longBreak');
                    setTimeLeft(settings.longBreakDuration * 60);
                    setSessionCount(0);

                    // Notification
                    const event = new CustomEvent('toast', {
                        detail: { message: `🎉 ${settings.sessionsBeforeLongBreak} pomodoros completed! Time for a long break.`, type: 'success' }
                    });
                    window.dispatchEvent(event);
                } else {
                    setMode('shortBreak');
                    setTimeLeft(settings.shortBreakDuration * 60);

                    const event = new CustomEvent('toast', {
                        detail: { message: '✨ Pomodoro completed! Time for a short break.', type: 'success' }
                    });
                    window.dispatchEvent(event);
                }
            } else {
                setMode('work');
                setTimeLeft(settings.workDuration * 60);

                const event = new CustomEvent('toast', {
                    detail: { message: '💪 Break is over! Back to work.', type: 'info' }
                });
                window.dispatchEvent(event);
            }
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isActive, timeLeft, mode, sessionCount, settings]);

    const toggleTimer = () => setIsActive(prev => !prev);

    const resetTimer = () => {
        setIsActive(false);
        setMode('work');
        setTimeLeft(settings.workDuration * 60);
        setSessionCount(0);
    };

    const getModeLabel = () => {
        switch (mode) {
            case 'work': return 'Focus';
            case 'shortBreak': return 'Short Break';
            case 'longBreak': return 'Long Break';
        }
    };

    const getModeColor = () => {
        switch (mode) {
            case 'work': return 'text-indigo-600 dark:text-indigo-400';
            case 'shortBreak': return 'text-green-600 dark:text-green-400';
            case 'longBreak': return 'text-blue-600 dark:text-blue-400';
        }
    };

    return (
        <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-2 w-full">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Timer size={14} />
                    {getModeLabel()}
                </div>
                {onOpenSettings && (
                    <button
                        onClick={onOpenSettings}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Pomodoro Settings"
                    >
                        <Settings size={14} />
                    </button>
                )}
            </div>

            <div className={`text-4xl font-mono font-bold ${isActive ? getModeColor() : 'text-slate-700 dark:text-slate-300'}`}>
                {formatTime(timeLeft)}
            </div>

            {/* Session counter */}
            <div className="flex gap-1">
                {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${i < sessionCount
                            ? 'bg-indigo-500'
                            : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                    />
                ))}
            </div>

            <div className="flex gap-2 w-full">
                <button
                    onClick={toggleTimer}
                    className={`flex-1 py-1 rounded text-sm font-medium transition-colors ${isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                >
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={resetTimer}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    );
};
