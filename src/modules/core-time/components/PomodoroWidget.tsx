import { useCategoriesStore } from '@/modules/core-time/store/categoriesStore'
import { useActivitiesStore } from '@/modules/core-time/store/timerStore'
import { ProgressRing } from '@/shared/components'
import { formatTimerDisplay } from '@/shared/utils/date'
import {
    Cog6ToothIcon,
    ForwardIcon,
    PauseIcon,
    PlayIcon,
    StopIcon,
} from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { usePomodoroStore, type PomodoroPhase } from '../store/pomodoroStore'

interface PomodoroWidgetProps {
    compact?: boolean
}

const phaseLabels: Record<PomodoroPhase, string> = {
    idle: 'Hazır',
    work: 'Çalışma',
    shortBreak: 'Kısa Mola',
    longBreak: 'Uzun Mola',
}

const phaseColors: Record<PomodoroPhase, string> = {
    idle: 'primary',
    work: 'timer',
    shortBreak: 'success',
    longBreak: 'accent',
}

export function PomodoroWidget({ compact = false }: PomodoroWidgetProps) {
    const {
        isActive,
        phase,
        currentActivityId,
        timeRemaining,
        sessionsCompleted,
        config,
        initialize,
        startPomodoro,
        pausePomodoro,
        resumePomodoro,
        skipPhase,
        stopPomodoro,
        tick,
    } = usePomodoroStore()

    const { activities, initialize: initActivities } = useActivitiesStore()
    const { categories, initialize: initCategories } = useCategoriesStore()

    const [selectedActivityId, setSelectedActivityId] = useState<string>('')
    const [showActivityPicker, setShowActivityPicker] = useState(false)

    useEffect(() => {
        initialize()
        initActivities()
        initCategories()
    }, [initialize, initActivities, initCategories])

    // Tick interval
    useEffect(() => {
        if (!isActive) return

        const interval = setInterval(() => {
            tick()
        }, 1000)

        return () => clearInterval(interval)
    }, [isActive, tick])

    // Update document title with timer
    useEffect(() => {
        if (phase !== 'idle' && timeRemaining > 0) {
            document.title = `${formatTimerDisplay(timeRemaining)} - ${phaseLabels[phase]} | LifeFlow`
        } else {
            document.title = 'LifeFlow'
        }

        return () => {
            document.title = 'LifeFlow'
        }
    }, [phase, timeRemaining])

    const handleStart = async () => {
        if (!selectedActivityId) {
            setShowActivityPicker(true)
            return
        }
        await startPomodoro(selectedActivityId)
    }

    const handleSelectActivity = async (activityId: string) => {
        setSelectedActivityId(activityId)
        setShowActivityPicker(false)
        await startPomodoro(activityId)
    }

    const activeActivities = activities.filter(a => !a.archived)
    const currentActivity = activities.find(a => a.id === currentActivityId)
    const currentCategory = currentActivity
        ? categories.find(c => c.id === currentActivity.categoryId)
        : null

    // Calculate progress
    const totalDuration = config
        ? (phase === 'work' ? config.workDuration
            : phase === 'shortBreak' ? config.shortBreakDuration
                : phase === 'longBreak' ? config.longBreakDuration
                    : 0)
        : 0
    const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0

    if (compact) {
        return (
            <div className="card p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            'w-10 h-10 rounded-2xl flex items-center justify-center',
                            phase === 'idle' && 'bg-surface-100 dark:bg-surface-700',
                            phase === 'work' && 'gradient-timer',
                            phase === 'shortBreak' && 'gradient-success',
                            phase === 'longBreak' && 'gradient-accent',
                        )}>
                            🍅
                        </div>
                        <div>
                            <p className="font-semibold text-surface-900 dark:text-white">
                                {phaseLabels[phase]}
                            </p>
                            <p className="text-sm text-surface-500">
                                {phase !== 'idle' ? formatTimerDisplay(timeRemaining) : 'Pomodoro Zamanlayıcı'}
                            </p>
                        </div>
                    </div>

                    {phase === 'idle' ? (
                        <button onClick={handleStart} className="btn-timer">
                            <PlayIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={isActive ? pausePomodoro : resumePomodoro}
                                className="btn-icon bg-surface-100 dark:bg-surface-700"
                            >
                                {isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={stopPomodoro}
                                className="btn-icon bg-red-100 dark:bg-red-900/30 text-red-600"
                            >
                                <StopIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="card p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">🍅</div>
                    <div>
                        <h2 className="text-lg font-bold text-gradient">Pomodoro</h2>
                        <p className="text-sm text-surface-500">
                            {sessionsCompleted} oturum tamamlandı
                        </p>
                    </div>
                </div>
                <button className="btn-icon">
                    <Cog6ToothIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center py-4">
                <ProgressRing
                    progress={progress}
                    size={200}
                    strokeWidth={12}
                    variant={phaseColors[phase] as 'primary' | 'success' | 'timer' | 'accent'}
                >
                    <div className="text-center">
                        <p className={clsx(
                            'text-4xl font-mono font-bold',
                            phase === 'work' && 'text-timer-500',
                            phase === 'shortBreak' && 'text-success-500',
                            phase === 'longBreak' && 'text-accent-500',
                            phase === 'idle' && 'text-surface-400',
                        )}>
                            {formatTimerDisplay(timeRemaining || config?.workDuration || 1500)}
                        </p>
                        <p className={clsx(
                            'text-sm font-medium mt-1',
                            phase === 'work' && 'text-timer-400',
                            phase === 'shortBreak' && 'text-success-400',
                            phase === 'longBreak' && 'text-accent-400',
                            phase === 'idle' && 'text-surface-400',
                        )}>
                            {phaseLabels[phase]}
                        </p>
                    </div>
                </ProgressRing>
            </div>

            {/* Current Activity */}
            {currentActivity && (
                <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/50">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                            style={{ backgroundColor: currentCategory?.color ?? '#06b6d4' }}
                        >
                            {currentCategory?.icon ?? '📌'}
                        </div>
                        <div>
                            <p className="font-medium text-surface-900 dark:text-white">
                                {currentActivity.name}
                            </p>
                            <p className="text-sm text-surface-500">
                                {currentCategory?.name ?? 'Kategorisiz'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
                {phase === 'idle' ? (
                    <>
                        {showActivityPicker ? (
                            <div className="w-full space-y-3">
                                <p className="text-sm text-center text-surface-500">Aktivite seç:</p>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                                    {activeActivities.map(activity => {
                                        const category = categories.find(c => c.id === activity.categoryId)
                                        return (
                                            <button
                                                key={activity.id}
                                                onClick={() => handleSelectActivity(activity.id)}
                                                className="p-3 rounded-xl text-left card-hover flex items-center gap-2"
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                                                    style={{ backgroundColor: category?.color ?? '#06b6d4' }}
                                                >
                                                    {category?.icon ?? '📌'}
                                                </div>
                                                <span className="text-sm font-medium truncate">
                                                    {activity.name}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                                <button
                                    onClick={() => setShowActivityPicker(false)}
                                    className="btn-secondary w-full"
                                >
                                    İptal
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleStart} className="btn-timer px-8 py-3">
                                <PlayIcon className="w-5 h-5 mr-2" />
                                Başlat
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            onClick={stopPomodoro}
                            className="btn-danger"
                        >
                            <StopIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={isActive ? pausePomodoro : resumePomodoro}
                            className={clsx(
                                'btn px-8 py-3',
                                phase === 'work' && 'btn-timer',
                                phase === 'shortBreak' && 'btn-success',
                                phase === 'longBreak' && 'btn-accent',
                            )}
                        >
                            {isActive ? (
                                <>
                                    <PauseIcon className="w-5 h-5 mr-2" />
                                    Duraklat
                                </>
                            ) : (
                                <>
                                    <PlayIcon className="w-5 h-5 mr-2" />
                                    Devam Et
                                </>
                            )}
                        </button>

                        <button
                            onClick={skipPhase}
                            className="btn-secondary"
                        >
                            <ForwardIcon className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Session Indicators */}
            {config && (
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: config.sessionsBeforeLongBreak }).map((_, i) => (
                        <div
                            key={i}
                            className={clsx(
                                'w-3 h-3 rounded-full transition-all',
                                i < sessionsCompleted
                                    ? 'gradient-timer shadow-glow-timer'
                                    : 'bg-surface-200 dark:bg-surface-700'
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
