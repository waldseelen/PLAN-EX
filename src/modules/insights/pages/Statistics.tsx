import { db } from '@/db'
import type { HabitLog, TimeSession } from '@/db/types'
import { useCategoriesStore } from '@/modules/core-time/store/categoriesStore'
import { useActivitiesStore } from '@/modules/core-time/store/timerStore'
import { useHabitsStore } from '@/modules/habits/store/habitsStore'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'
import { ProgressRing } from '@/shared/components'
import { formatTimerDisplay } from '@/shared/utils/date'
import {
    ArrowTrendingUpIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    ClockIcon,
    FireIcon,
} from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { DateTime } from 'luxon'
import { useEffect, useMemo, useState } from 'react'

type DateRange = '7d' | '30d' | '90d' | 'all'

interface DayStats {
    date: string
    totalSeconds: number
    sessionCount: number
}

interface CategoryStats {
    categoryId: string
    categoryName: string
    color: string
    icon: string
    totalSeconds: number
    percentage: number
}

export function Statistics() {
    const { activities, initialize: initActivities } = useActivitiesStore()
    const { categories, initialize: initCategories } = useCategoriesStore()
    const { habits, streaks, initialize: initHabits } = useHabitsStore()
    const { rolloverHour, initialize: initSettings } = useSettingsStore()

    const [isLoading, setIsLoading] = useState(true)
    const [dateRange, setDateRange] = useState<DateRange>('7d')
    const [sessions, setSessions] = useState<TimeSession[]>([])
    const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])

    // Load data
    useEffect(() => {
        async function init() {
            await Promise.all([
                initSettings(),
                initActivities(),
                initCategories(),
            ])
            await initHabits(rolloverHour)
            setIsLoading(false)
        }
        init()
    }, [initActivities, initCategories, initSettings, initHabits, rolloverHour])

    // Load sessions based on date range
    useEffect(() => {
        async function loadData() {
            const endDate = DateTime.now()
            let startDate: DateTime

            switch (dateRange) {
                case '7d':
                    startDate = endDate.minus({ days: 7 })
                    break
                case '30d':
                    startDate = endDate.minus({ days: 30 })
                    break
                case '90d':
                    startDate = endDate.minus({ days: 90 })
                    break
                default:
                    startDate = DateTime.fromMillis(0)
            }

            const [loadedSessions, loadedLogs] = await Promise.all([
                db.timeSessions
                    .where('dateKey')
                    .between(startDate.toFormat('yyyy-MM-dd'), endDate.toFormat('yyyy-MM-dd'), true, true)
                    .toArray(),
                db.habitLogs
                    .where('dateKey')
                    .between(startDate.toFormat('yyyy-MM-dd'), endDate.toFormat('yyyy-MM-dd'), true, true)
                    .toArray(),
            ])

            setSessions(loadedSessions)
            setHabitLogs(loadedLogs)
        }

        if (!isLoading) {
            loadData()
        }
    }, [dateRange, isLoading])

    // Calculate stats
    const stats = useMemo(() => {
        const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSec, 0)
        const totalSessions = sessions.length
        const avgSecondsPerDay = dateRange === 'all'
            ? 0
            : totalSeconds / parseInt(dateRange)

        // Daily stats
        const dailyMap = new Map<string, DayStats>()
        sessions.forEach(session => {
            const existing = dailyMap.get(session.dateKey) || {
                date: session.dateKey,
                totalSeconds: 0,
                sessionCount: 0,
            }
            existing.totalSeconds += session.durationSec
            existing.sessionCount++
            dailyMap.set(session.dateKey, existing)
        })
        const dailyStats = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))

        // Category stats
        const categoryMap = new Map<string, number>()
        sessions.forEach(session => {
            const activity = activities.find(a => a.id === session.activityId)
            if (activity) {
                const current = categoryMap.get(activity.categoryId) || 0
                categoryMap.set(activity.categoryId, current + session.durationSec)
            }
        })

        const categoryStats: CategoryStats[] = Array.from(categoryMap.entries())
            .map(([categoryId, totalSeconds]) => {
                const category = categories.find(c => c.id === categoryId)
                return {
                    categoryId,
                    categoryName: category?.name ?? 'Bilinmeyen',
                    color: category?.color ?? '#6366f1',
                    icon: category?.icon ?? '📌',
                    totalSeconds,
                    percentage: totalSeconds > 0 ? (totalSeconds / totalSeconds) * 100 : 0,
                }
            })
            .sort((a, b) => b.totalSeconds - a.totalSeconds)

        // Recalculate percentages
        const totalCategorySeconds = categoryStats.reduce((sum, c) => sum + c.totalSeconds, 0)
        categoryStats.forEach(cat => {
            cat.percentage = totalCategorySeconds > 0 ? (cat.totalSeconds / totalCategorySeconds) * 100 : 0
        })

        // Habit stats
        const completedHabits = habitLogs.filter(l => l.status === 'done').length
        const skippedHabits = habitLogs.filter(l => l.status === 'skip').length
        const habitDays = new Set(habitLogs.map(l => l.dateKey)).size

        // Longest streak
        const longestStreak = Math.max(0, ...Array.from(streaks.values()).map(s => s.longestStreak))

        return {
            totalSeconds,
            totalSessions,
            avgSecondsPerDay,
            dailyStats,
            categoryStats,
            completedHabits,
            skippedHabits,
            habitDays,
            longestStreak,
        }
    }, [sessions, activities, categories, habitLogs, streaks, dateRange])

    // Get max for bar chart scaling
    const maxDailySeconds = Math.max(...stats.dailyStats.map(d => d.totalSeconds), 1)

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="skeleton h-8 w-40 rounded-xl" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton h-32 rounded-3xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">
                        İstatistikler
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        Zaman ve alışkanlık analizlerin
                    </p>
                </div>

                {/* Date Range Selector */}
                <div className="flex gap-2 p-1 glass rounded-2xl">
                    {[
                        { value: '7d', label: '7 Gün' },
                        { value: '30d', label: '30 Gün' },
                        { value: '90d', label: '90 Gün' },
                    ].map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setDateRange(value as DateRange)}
                            className={clsx(
                                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                dateRange === value
                                    ? 'gradient-primary text-white shadow-glow'
                                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stat-card bg-gradient-to-br from-primary-50/80 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 border-primary-300/50 dark:border-primary-700/40">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                            <ClockIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="stat-value text-primary-600 dark:text-primary-400">
                                {formatTimerDisplay(stats.totalSeconds)}
                            </p>
                            <p className="stat-label">Toplam Süre</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-timer-50/80 to-timer-100/50 dark:from-timer-900/30 dark:to-timer-800/20 border-timer-300/50 dark:border-timer-700/40">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl gradient-timer flex items-center justify-center shadow-lg">
                            <CalendarDaysIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="stat-value text-timer-600 dark:text-timer-400">
                                {stats.totalSessions}
                            </p>
                            <p className="stat-label">Toplam Oturum</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-success-50/80 to-accent-50/50 dark:from-success-900/30 dark:to-accent-900/20 border-success-300/50 dark:border-success-700/40">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl gradient-success flex items-center justify-center shadow-lg">
                            <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="stat-value text-success-600 dark:text-success-400">
                                {stats.completedHabits}
                            </p>
                            <p className="stat-label">Tamamlanan Alışkanlık</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-accent-50/80 to-success-50/50 dark:from-accent-900/30 dark:to-success-900/20 border-accent-300/50 dark:border-accent-700/40">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
                            <FireIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="stat-value text-accent-600 dark:text-accent-400">
                                {stats.longestStreak} gün
                            </p>
                            <p className="stat-label">En Uzun Seri</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Daily Bar Chart */}
                <div className="card p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <ChartBarIcon className="w-5 h-5 text-primary-500" />
                        <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                            Günlük Aktivite
                        </h3>
                    </div>

                    {stats.dailyStats.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-surface-400">
                            Bu dönemde veri yok
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.dailyStats.slice(-7).map((day) => {
                                const date = DateTime.fromISO(day.date)
                                const percentage = (day.totalSeconds / maxDailySeconds) * 100

                                return (
                                    <div key={day.date} className="flex items-center gap-3">
                                        <div className="w-12 text-xs text-surface-500 text-right">
                                            {date.toFormat('dd MMM', { locale: 'tr' })}
                                        </div>
                                        <div className="flex-1 progress-bar">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-16 text-xs font-mono text-surface-600 dark:text-surface-400">
                                            {formatTimerDisplay(day.totalSeconds)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Category Distribution */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">
                        Kategori Dağılımı
                    </h3>

                    {stats.categoryStats.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-surface-400">
                            Bu dönemde veri yok
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            {/* Simple pie visualization */}
                            <div className="relative mb-6">
                                <ProgressRing
                                    progress={100}
                                    size={160}
                                    strokeWidth={24}
                                    variant="primary"
                                >
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-surface-900 dark:text-white">
                                            {stats.categoryStats.length}
                                        </p>
                                        <p className="text-xs text-surface-500">Kategori</p>
                                    </div>
                                </ProgressRing>
                            </div>

                            {/* Category list */}
                            <div className="w-full space-y-3">
                                {stats.categoryStats.slice(0, 5).map((cat) => (
                                    <div key={cat.categoryId} className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                                            style={{ backgroundColor: cat.color }}
                                        >
                                            {cat.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-surface-900 dark:text-white">
                                                    {cat.categoryName}
                                                </span>
                                                <span className="text-xs text-surface-500">
                                                    {cat.percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${cat.percentage}%`,
                                                        backgroundColor: cat.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono text-surface-500 w-16 text-right">
                                            {formatTimerDisplay(cat.totalSeconds)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Habit Stats */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">
                    Alışkanlık İstatistikleri
                </h3>

                {habits.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-surface-400">
                        Henüz alışkanlık yok
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {habits.filter(h => !h.archived).slice(0, 4).map((habit) => {
                            const streak = streaks.get(habit.id)
                            const completionRate = streak
                                ? Math.round((streak.totalDone / (streak.totalDone + streak.totalFail + streak.totalSkip || 1)) * 100)
                                : 0

                            return (
                                <div
                                    key={habit.id}
                                    className="p-4 bg-surface-50 dark:bg-surface-800 rounded-2xl"
                                >
                                    <p className="font-medium text-surface-900 dark:text-white truncate mb-2">
                                        {habit.name}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-sm">
                                            <FireIcon className="w-4 h-4 text-timer-500" />
                                            <span className="text-surface-600 dark:text-surface-400">
                                                {streak?.currentStreak ?? 0} gün
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-success-600 dark:text-success-400">
                                            {completionRate}%
                                        </span>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div className="mt-2 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-success-500 rounded-full"
                                            style={{ width: `${completionRate}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
