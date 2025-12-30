import { useCategoriesStore } from '@/modules/core-time/store/categoriesStore'
import { useActivitiesStore, useTimerStore } from '@/modules/core-time/store/timerStore'
import { useHabitsStore } from '@/modules/habits/store/habitsStore'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'
import { EmptyState, ProgressRing, SkeletonActivityCard, SkeletonStatCard } from '@/shared/components'
import { formatTimerDisplay } from '@/shared/utils/date'
import {
    ArrowRightIcon,
    CheckIcon,
    ClockIcon,
    FireIcon,
    PauseIcon,
    PlayIcon,
    PlusIcon,
    RectangleStackIcon,
    StopIcon,
} from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function Dashboard() {
    const { runningTimers, tick, startTimer, stopTimer, getElapsedSeconds } = useTimerStore()
    const { activities, initialize: initActivities } = useActivitiesStore()
    const { categories, initialize: initCategories } = useCategoriesStore()
    const { rolloverHour, initialize: initSettings } = useSettingsStore()
    const {
        habits,
        todayLogs,
        streaks,
        initialize: initHabits,
        checkHabit,
    } = useHabitsStore()

    const [isInitializing, setIsInitializing] = useState(true)

    // Initialize stores
    useEffect(() => {
        async function init() {
            await Promise.all([
                initSettings(),
                initActivities(),
                initCategories(),
            ])
            await useTimerStore.getState().initialize()
            await initHabits(rolloverHour)
            setIsInitializing(false)
        }
        init()
    }, [initActivities, initCategories, initSettings, initHabits, rolloverHour])

    // Tick interval for timer updates
    useEffect(() => {
        const interval = setInterval(() => {
            tick()
        }, 1000)
        return () => clearInterval(interval)
    }, [tick])

    const handleStartTimer = async (activityId: string) => {
        await startTimer(activityId)
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50)
        }
    }

    const handleStopTimer = async (timerId: string) => {
        await stopTimer(timerId, rolloverHour)
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50])
        }
    }

    const handleQuickCheck = async (habitId: string) => {
        await checkHabit(habitId, undefined, undefined, rolloverHour)
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50)
        }
    }

    const activeActivities = activities.filter((a) => !a.archived)
    const activeHabits = habits.filter((h) => !h.archived)

    // Calculate stats
    const totalHabits = activeHabits.length
    const completedHabits = Array.from(todayLogs.values()).filter(l => l.status === 'done').length
    const habitProgress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

    // Get longest streak
    const longestStreak = Math.max(0, ...Array.from(streaks.values()).map(s => s.currentStreak))

    if (isInitializing) {
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Header Skeleton */}
                <div className="space-y-2">
                    <div className="skeleton h-8 w-48 rounded-xl" />
                    <div className="skeleton h-4 w-64 rounded-lg" />
                </div>

                {/* Stats Skeleton */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
                </div>

                {/* Activity Cards Skeleton */}
                <div className="space-y-3">
                    <div className="skeleton h-6 w-32 rounded-lg" />
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => <SkeletonActivityCard key={i} />)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header with Mesh Gradient */}
            <div className="relative">
                <div className="absolute inset-0 mesh-gradient rounded-3xl opacity-60" />
                <div className="relative flex items-start justify-between p-6 card-glow">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient">
                            Merhaba! 👋
                        </h1>
                        <p className="text-surface-500 dark:text-surface-400 mt-1">
                            Bugün neler başaracaksın?
                        </p>
                    </div>

                    {/* Daily Progress Ring */}
                    <ProgressRing progress={habitProgress} size={80} strokeWidth={6} variant="success">
                        <div className="text-center">
                            <span className="text-lg font-bold text-success-500 dark:text-success-400">
                                {habitProgress}%
                            </span>
                        </div>
                    </ProgressRing>
                </div>
            </div>

            {/* Running Timers - Sticky Card */}
            {runningTimers.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-timer-500 animate-pulse" />
                        <h2 className="text-lg font-semibold text-gradient-warm">
                            Aktif Zamanlayıcılar
                        </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {runningTimers.map((timer) => {
                            const activity = activities.find((a) => a.id === timer.activityId)
                            const category = activity ? categories.find((c) => c.id === activity.categoryId) : null
                            const elapsed = getElapsedSeconds(timer)

                            return (
                                <div
                                    key={timer.id}
                                    className="card-timer p-5 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                                            style={{ backgroundColor: category?.color ?? '#f59e0b' }}
                                        >
                                            {category?.icon ?? '⏱️'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-surface-900 dark:text-white">
                                                {activity?.name ?? 'Bilinmeyen Aktivite'}
                                            </p>
                                            <p className="timer-display mt-1">
                                                {formatTimerDisplay(elapsed)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="btn-icon bg-timer-100/50 dark:bg-timer-900/30 text-timer-600 dark:text-timer-400">
                                            <PauseIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleStopTimer(timer.id)}
                                            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-500 to-red-400 text-white flex items-center justify-center hover:from-red-600 hover:to-red-500 active:scale-95 transition-all shadow-lg"
                                        >
                                            <StopIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Today's Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stat-card bg-gradient-to-br from-primary-50/80 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 border-primary-300/50 dark:border-primary-700/40">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                            <ClockIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="stat-value text-primary-600 dark:text-primary-400 mt-3">0s 0dk</p>
                    <p className="stat-label">Bugün Toplam</p>
                </div>

                <div className="stat-card bg-gradient-to-br from-success-50/80 to-accent-50/50 dark:from-success-900/30 dark:to-accent-900/20 border-success-300/50 dark:border-success-700/40">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl gradient-success flex items-center justify-center shadow-lg">
                            <CheckIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="stat-value text-success-600 dark:text-success-400 mt-3">
                        {completedHabits}/{totalHabits}
                    </p>
                    <p className="stat-label">Tamamlanan Alışkanlık</p>
                </div>

                <div className="stat-card bg-gradient-to-br from-timer-50/80 to-timer-100/50 dark:from-timer-900/30 dark:to-timer-800/20 border-timer-300/50 dark:border-timer-700/40">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl gradient-timer flex items-center justify-center shadow-lg">
                            <RectangleStackIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="stat-value text-timer-600 dark:text-timer-400 mt-3">
                        {runningTimers.length}
                    </p>
                    <p className="stat-label">Aktif Oturum</p>
                </div>

                <div className="stat-card bg-gradient-to-br from-accent-50/80 to-success-50/50 dark:from-accent-900/30 dark:to-success-900/20 border-accent-300/50 dark:border-accent-700/40">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
                            <FireIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="stat-value text-accent-600 dark:text-accent-400 mt-3">{longestStreak} gün</p>
                    <p className="stat-label">En Uzun Seri</p>
                </div>
            </div>

            {/* Today's Habits - Quick Check */}
            {activeHabits.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gradient">
                            Bugünün Alışkanlıkları
                        </h2>
                        <Link
                            to="/habits"
                            className="text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 flex items-center gap-1 transition-colors"
                        >
                            Tümünü Gör
                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {activeHabits.slice(0, 6).map((habit) => {
                            const log = todayLogs.get(habit.id)
                            const streak = streaks.get(habit.id)
                            const isDone = log?.status === 'done'

                            return (
                                <button
                                    key={habit.id}
                                    onClick={() => !isDone && handleQuickCheck(habit.id)}
                                    className={clsx(
                                        'flex-shrink-0 w-28 p-4 rounded-3xl text-center transition-all duration-300',
                                        isDone
                                            ? 'card-success shadow-glow-success'
                                            : 'card-hover'
                                    )}
                                >
                                    <div className={clsx(
                                        'w-10 h-10 mx-auto rounded-full flex items-center justify-center transition-all duration-300',
                                        isDone
                                            ? 'gradient-success text-white animate-bounce-in shadow-lg'
                                            : 'border-2 border-primary-300 dark:border-primary-600'
                                    )}>
                                        {isDone && <CheckIcon className="w-5 h-5" />}
                                    </div>
                                    <p className={clsx(
                                        'mt-3 text-sm font-medium truncate',
                                        isDone
                                            ? 'text-success-700 dark:text-success-300'
                                            : 'text-surface-700 dark:text-surface-300'
                                    )}>
                                        {habit.name}
                                    </p>
                                    <p className="text-xs text-accent-600 dark:text-accent-400 mt-1 font-medium">
                                        🔥 {streak?.currentStreak ?? 0}
                                    </p>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Quick Start Activities */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gradient">
                        Hızlı Başlat
                    </h2>
                    <Link
                        to="/activities"
                        className="text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 flex items-center gap-1 transition-colors"
                    >
                        Tümünü Gör
                        <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>

                {activeActivities.length === 0 ? (
                    <EmptyState
                        icon={<RectangleStackIcon className="w-8 h-8" />}
                        title="Henüz aktivite yok"
                        description="Zaman takibi yapmak için ilk aktiviteni oluştur"
                        action={
                            <Link to="/activities" className="btn-primary">
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Aktivite Ekle
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {activeActivities.slice(0, 8).map((activity) => {
                            const category = categories.find((c) => c.id === activity.categoryId)
                            const hasRunningTimer = runningTimers.some(
                                (t) => t.activityId === activity.id
                            )

                            return (
                                <button
                                    key={activity.id}
                                    onClick={() => handleStartTimer(activity.id)}
                                    disabled={hasRunningTimer}
                                    className={clsx(
                                        'card-interactive p-4 flex items-center gap-3 text-left group',
                                        hasRunningTimer && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-md transition-transform group-hover:scale-110 group-hover:shadow-lg"
                                        style={{ backgroundColor: category?.color ?? '#06b6d4' }}
                                    >
                                        {category?.icon ?? '📌'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-surface-900 dark:text-white truncate">
                                            {activity.name}
                                        </p>
                                        <p className="text-sm text-surface-500 dark:text-surface-400 truncate">
                                            {category?.name ?? 'Kategorisiz'}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-primary-100/60 dark:bg-primary-900/40 flex items-center justify-center group-hover:bg-primary-200/80 dark:group-hover:bg-primary-800/50 transition-colors">
                                        <PlayIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
