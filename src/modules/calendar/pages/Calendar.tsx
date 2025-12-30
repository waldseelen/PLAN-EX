import { db } from '@/db'
import type { Activity, Category, TimeSession } from '@/db/types'
import { useCategoriesStore } from '@/modules/core-time/store/categoriesStore'
import { useActivitiesStore } from '@/modules/core-time/store/timerStore'
import { useHabitsStore } from '@/modules/habits/store/habitsStore'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'
import { ConfirmDialog, EmptyState, Modal } from '@/shared/components'
import { formatTimerDisplay } from '@/shared/utils/date'
import {
    CalendarDaysIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { DateTime } from 'luxon'
import { useEffect, useMemo, useState } from 'react'

type ViewMode = 'timeline' | 'heatmap'

export function Calendar() {
    const { activities, initialize: initActivities } = useActivitiesStore()
    const { categories, initialize: initCategories } = useCategoriesStore()
    const { initialize: initHabits } = useHabitsStore()
    const { rolloverHour, initialize: initSettings } = useSettingsStore()

    const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now())
    const [sessions, setSessions] = useState<TimeSession[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>('timeline')
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selectedSession, setSelectedSession] = useState<TimeSession | null>(null)
    const [editNote, setEditNote] = useState('')

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

    // Load sessions for selected date
    useEffect(() => {
        async function loadSessions() {
            const dateKey = selectedDate.toFormat('yyyy-MM-dd')
            const daySessions = await db.timeSessions
                .where('dateKey')
                .equals(dateKey)
                .toArray()
            setSessions(daySessions.sort((a, b) => a.startAt - b.startAt))
        }
        if (!isLoading) {
            loadSessions()
        }
    }, [selectedDate, isLoading])

    const goToToday = () => setSelectedDate(DateTime.now())
    const goToPreviousDay = () => setSelectedDate(prev => prev.minus({ days: 1 }))
    const goToNextDay = () => setSelectedDate(prev => prev.plus({ days: 1 }))

    const isToday = selectedDate.hasSame(DateTime.now(), 'day')

    // Calculate total time for the day
    const totalDaySeconds = useMemo(() => {
        return sessions.reduce((sum, s) => sum + s.durationSec, 0)
    }, [sessions])

    // Edit session
    const handleEditSession = async () => {
        if (!selectedSession) return

        await db.timeSessions.update(selectedSession.id, {
            note: editNote,
            updatedAt: Date.now(),
        })

        setSessions(prev =>
            prev.map(s => s.id === selectedSession.id ? { ...s, note: editNote } : s)
        )
        setShowEditModal(false)
        setSelectedSession(null)
    }

    // Delete session
    const handleDeleteSession = async () => {
        if (!selectedSession) return

        await db.timeSessions.delete(selectedSession.id)
        setSessions(prev => prev.filter(s => s.id !== selectedSession.id))
        setShowDeleteConfirm(false)
        setSelectedSession(null)
    }

    const openEditModal = (session: TimeSession) => {
        setSelectedSession(session)
        setEditNote(session.note || '')
        setShowEditModal(true)
    }

    const openDeleteConfirm = (session: TimeSession) => {
        setSelectedSession(session)
        setShowDeleteConfirm(true)
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="skeleton h-8 w-32 rounded-xl" />
                <div className="skeleton h-96 rounded-3xl" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">
                        Takvim
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        Geçmiş aktivitelerini ve alışkanlıklarını görüntüle
                    </p>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2 p-1 glass rounded-2xl">
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={clsx(
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                            viewMode === 'timeline'
                                ? 'gradient-primary text-white shadow-glow'
                                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                        )}
                    >
                        Timeline
                    </button>
                    <button
                        onClick={() => setViewMode('heatmap')}
                        className={clsx(
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                            viewMode === 'heatmap'
                                ? 'gradient-primary text-white shadow-glow'
                                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                        )}
                    >
                        Heatmap
                    </button>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="card p-4 flex items-center justify-between">
                <button
                    onClick={goToPreviousDay}
                    className="btn-icon"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={goToToday}
                        className={clsx(
                            'btn text-sm',
                            isToday ? 'btn-primary' : 'btn-secondary'
                        )}
                    >
                        Bugün
                    </button>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-surface-900 dark:text-white">
                            {selectedDate.toFormat('dd MMMM yyyy', { locale: 'tr' })}
                        </p>
                        <p className="text-sm text-surface-500">
                            {selectedDate.toFormat('EEEE', { locale: 'tr' })}
                        </p>
                    </div>
                </div>

                <button
                    onClick={goToNextDay}
                    className="btn-icon"
                    disabled={isToday}
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Day Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="stat-card bg-gradient-to-br from-primary-50/80 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 border-primary-300/50 dark:border-primary-700/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
                            <ClockIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-mono text-primary-600 dark:text-primary-400">
                                {formatTimerDisplay(totalDaySeconds)}
                            </p>
                            <p className="text-sm text-surface-500">Toplam Süre</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card bg-gradient-to-br from-timer-50/80 to-timer-100/50 dark:from-timer-900/30 dark:to-timer-800/20 border-timer-300/50 dark:border-timer-700/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl gradient-timer flex items-center justify-center shadow-md">
                            <CalendarDaysIcon className="w-5 h-5 text-timer-600 dark:text-timer-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-timer-600 dark:text-timer-400">
                                {sessions.length}
                            </p>
                            <p className="text-sm text-surface-500">Oturum</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                            <CheckCircleIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                                {new Set(sessions.map(s => s.activityId)).size}
                            </p>
                            <p className="text-sm text-surface-500">Aktivite</p>
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === 'timeline' ? (
                /* Timeline View */
                <div className="card p-0 overflow-hidden">
                    {sessions.length === 0 ? (
                        <div className="p-8">
                            <EmptyState
                                icon={<ClockIcon className="w-8 h-8" />}
                                title="Bu gün için kayıt yok"
                                description="Bu tarihte henüz zaman kaydı yapılmamış"
                            />
                        </div>
                    ) : (
                        <div className="divide-y divide-surface-200 dark:divide-surface-700">
                            {/* Hour slots */}
                            <div className="relative">
                                {/* Sessions */}
                                <div className="divide-y divide-surface-100 dark:divide-surface-800">
                                    {sessions.map((session) => {
                                        const activity = activities.find(a => a.id === session.activityId)
                                        const category = activity
                                            ? categories.find(c => c.id === activity.categoryId)
                                            : null
                                        const startTime = DateTime.fromMillis(session.startAt)
                                        const endTime = DateTime.fromMillis(session.endAt)

                                        return (
                                            <div
                                                key={session.id}
                                                className="p-4 flex items-center gap-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group"
                                            >
                                                {/* Time */}
                                                <div className="w-24 flex-shrink-0 text-right">
                                                    <p className="font-mono text-sm font-medium text-surface-900 dark:text-white">
                                                        {startTime.toFormat('HH:mm')}
                                                    </p>
                                                    <p className="font-mono text-xs text-surface-500">
                                                        {endTime.toFormat('HH:mm')}
                                                    </p>
                                                </div>

                                                {/* Color bar */}
                                                <div
                                                    className="w-1 h-12 rounded-full"
                                                    style={{ backgroundColor: category?.color ?? '#6366f1' }}
                                                />

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{category?.icon ?? '📌'}</span>
                                                        <p className="font-semibold text-surface-900 dark:text-white truncate">
                                                            {activity?.name ?? 'Bilinmeyen Aktivite'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-sm text-surface-500">
                                                            {formatTimerDisplay(session.durationSec)}
                                                        </span>
                                                        {session.note && (
                                                            <span className="text-sm text-surface-400 truncate">
                                                                {session.note}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(session)}
                                                        className="btn-icon text-surface-400 hover:text-primary-600"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteConfirm(session)}
                                                        className="btn-icon text-surface-400 hover:text-red-600"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Heatmap View - GitHub style */
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                        Aktivite Yoğunluğu
                    </h3>
                    <HeatmapGrid />
                </div>
            )}

            {/* Edit Session Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Oturumu Düzenle"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Not
                        </label>
                        <textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Bu oturum hakkında not ekle..."
                            className="input min-h-[100px] resize-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">
                            İptal
                        </button>
                        <button onClick={handleEditSession} className="btn-primary flex-1">
                            Kaydet
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteSession}
                title="Oturumu Sil"
                message="Bu zaman kaydını silmek istediğine emin misin? Bu işlem geri alınamaz."
                confirmText="Sil"
                variant="danger"
            />
        </div>
    )
}

// Heatmap Grid Component
interface HeatmapGridProps {
    _activities?: Activity[]
    _categories?: Category[]
    _rolloverHour?: number
}

function HeatmapGrid(_props: HeatmapGridProps) {
    const [heatmapData, setHeatmapData] = useState<Map<string, number>>(new Map())

    useEffect(() => {
        async function loadHeatmapData() {
            const endDate = DateTime.now()
            const startDate = endDate.minus({ days: 90 })

            const sessions = await db.timeSessions
                .where('dateKey')
                .between(startDate.toFormat('yyyy-MM-dd'), endDate.toFormat('yyyy-MM-dd'), true, true)
                .toArray()

            const dataMap = new Map<string, number>()
            sessions.forEach(session => {
                const current = dataMap.get(session.dateKey) || 0
                dataMap.set(session.dateKey, current + session.durationSec)
            })

            setHeatmapData(dataMap)
        }
        loadHeatmapData()
    }, [])

    // Generate last 90 days
    const days = useMemo(() => {
        const result = []
        const today = DateTime.now()
        for (let i = 89; i >= 0; i--) {
            result.push(today.minus({ days: i }))
        }
        return result
    }, [])

    // Get intensity level (0-4)
    const getIntensity = (seconds: number): number => {
        if (seconds === 0) return 0
        if (seconds < 1800) return 1 // < 30 min
        if (seconds < 3600) return 2 // < 1 hour
        if (seconds < 7200) return 3 // < 2 hours
        return 4 // 2+ hours
    }

    const intensityColors = [
        'bg-surface-100 dark:bg-surface-800',
        'bg-success-100 dark:bg-success-900/30',
        'bg-success-300 dark:bg-success-700/50',
        'bg-success-500 dark:bg-success-600',
        'bg-success-700 dark:bg-success-500',
    ]

    return (
        <div className="space-y-4">
            {/* Grid */}
            <div className="flex flex-wrap gap-1">
                {days.map((day) => {
                    const dateKey = day.toFormat('yyyy-MM-dd')
                    const seconds = heatmapData.get(dateKey) || 0
                    const intensity = getIntensity(seconds)

                    return (
                        <div
                            key={dateKey}
                            className={clsx(
                                'w-3 h-3 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-primary-500',
                                intensityColors[intensity]
                            )}
                            title={`${day.toFormat('dd MMM yyyy', { locale: 'tr' })}: ${formatTimerDisplay(seconds)}`}
                        />
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-surface-500">
                <span>Az</span>
                {intensityColors.map((color, i) => (
                    <div key={i} className={clsx('w-3 h-3 rounded-sm', color)} />
                ))}
                <span>Çok</span>
            </div>
        </div>
    )
}
