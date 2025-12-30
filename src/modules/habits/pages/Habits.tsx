import type { Habit, HabitType, ScheduleType } from '@/db/types'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'
import { ConfirmDialog, EmptyState, Modal, SkeletonHabitCard } from '@/shared/components'
import {
    CheckIcon,
    MinusIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import { FireIcon } from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { useHabitsStore } from '../store/habitsStore'

interface HabitFormData {
    name: string
    type: HabitType
    scheduleType: ScheduleType
    weeklyRequired: number
    minTarget: number | undefined
    maxTarget: number | undefined
    unit: string | undefined
    allowSkip: boolean
}

const defaultFormData: HabitFormData = {
    name: '',
    type: 'boolean',
    scheduleType: 'daily',
    weeklyRequired: 3,
    minTarget: undefined,
    maxTarget: undefined,
    unit: undefined,
    allowSkip: true,
}

export function Habits() {
    const {
        habits,
        todayLogs,
        streaks,
        initialize: initHabits,
        createHabit,
        updateHabit,
        deleteHabit,
        checkHabit,
        skipHabit,
        uncheckHabit,
    } = useHabitsStore()
    const { rolloverHour, initialize: initSettings } = useSettingsStore()

    const [isLoading, setIsLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
    const [formData, setFormData] = useState<HabitFormData>(defaultFormData)
    const [numericValue, setNumericValue] = useState<Record<string, number>>({})

    useEffect(() => {
        async function init() {
            await initSettings()
            await initHabits(rolloverHour)
            setIsLoading(false)
        }
        init()
    }, [initHabits, initSettings, rolloverHour])

    const resetForm = () => {
        setFormData(defaultFormData)
        setSelectedHabit(null)
    }

    const handleCreateHabit = async () => {
        if (!formData.name.trim()) return

        const habitData: Parameters<typeof createHabit>[0] = {
            name: formData.name.trim(),
            type: formData.type,
            scheduleSpec: {
                type: formData.scheduleType,
                ...(formData.scheduleType === 'weekly' && { required: formData.weeklyRequired }),
            },
            tagIds: [],
            allowSkip: formData.allowSkip,
            archived: false,
        }

        if (formData.type === 'numeric') {
            if (formData.minTarget !== undefined) habitData.minTarget = formData.minTarget
            if (formData.maxTarget !== undefined) habitData.maxTarget = formData.maxTarget
            if (formData.unit !== undefined) habitData.unit = formData.unit
        }

        await createHabit(habitData)

        resetForm()
        setShowCreateModal(false)

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50)
        }
    }

    const handleEditHabit = async () => {
        if (!selectedHabit || !formData.name.trim()) return

        const updateData: Parameters<typeof updateHabit>[1] = {
            name: formData.name.trim(),
            type: formData.type,
            scheduleSpec: {
                type: formData.scheduleType,
                ...(formData.scheduleType === 'weekly' && { required: formData.weeklyRequired }),
            },
            allowSkip: formData.allowSkip,
        }

        if (formData.type === 'numeric') {
            if (formData.minTarget !== undefined) updateData.minTarget = formData.minTarget
            if (formData.maxTarget !== undefined) updateData.maxTarget = formData.maxTarget
            if (formData.unit !== undefined) updateData.unit = formData.unit
        }

        await updateHabit(selectedHabit.id, updateData)

        resetForm()
        setShowEditModal(false)
    }

    const handleDeleteHabit = async () => {
        if (!selectedHabit) return

        await deleteHabit(selectedHabit.id)
        setSelectedHabit(null)
        setShowDeleteConfirm(false)

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 50])
        }
    }

    const openEditModal = (habit: Habit) => {
        setSelectedHabit(habit)
        setFormData({
            name: habit.name,
            type: habit.type,
            scheduleType: habit.scheduleSpec.type,
            weeklyRequired: habit.scheduleSpec.required ?? 3,
            minTarget: habit.minTarget ?? undefined,
            maxTarget: habit.maxTarget ?? undefined,
            unit: habit.unit ?? undefined,
            allowSkip: habit.allowSkip,
        })
        setShowEditModal(true)
    }

    const openDeleteConfirm = (habit: Habit) => {
        setSelectedHabit(habit)
        setShowDeleteConfirm(true)
    }

    const handleToggleHabit = async (habit: Habit) => {
        const log = todayLogs.get(habit.id)

        if (log?.status === 'done') {
            await uncheckHabit(habit.id, rolloverHour)
        } else if (habit.type === 'boolean') {
            await checkHabit(habit.id, undefined, undefined, rolloverHour)
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(50)
            }
        }
    }

    const handleNumericCheck = async (habitId: string) => {
        const value = numericValue[habitId] ?? 0
        if (value > 0) {
            await checkHabit(habitId, value, undefined, rolloverHour)
            setNumericValue(prev => ({ ...prev, [habitId]: 0 }))
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(50)
            }
        }
    }

    const handleSkipHabit = async (habitId: string) => {
        await skipHabit(habitId, undefined, rolloverHour)
    }

    const activeHabits = habits.filter(h => !h.archived)

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="skeleton h-8 w-40 rounded-xl" />
                        <div className="skeleton h-4 w-56 rounded-lg" />
                    </div>
                    <div className="skeleton h-10 w-36 rounded-2xl" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <SkeletonHabitCard key={i} />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">
                        Alışkanlıklar
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        Günlük alışkanlıklarını takip et ve güçlendir
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Yeni Alışkanlık
                </button>
            </div>

            {/* Stats Summary */}
            {activeHabits.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="stat-card bg-gradient-to-br from-success-50/80 to-accent-50/50 dark:from-success-900/30 dark:to-accent-900/20 border-success-300/50 dark:border-success-700/40">
                        <p className="stat-value text-success-600 dark:text-success-400">
                            {Array.from(todayLogs.values()).filter(l => l.status === 'done').length}
                        </p>
                        <p className="stat-label">Tamamlanan</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-value text-surface-600 dark:text-surface-400">
                            {Array.from(todayLogs.values()).filter(l => l.status === 'skip').length}
                        </p>
                        <p className="stat-label">Atlanan</p>
                    </div>
                    <div className="stat-card bg-gradient-to-br from-primary-50/80 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 border-primary-300/50 dark:border-primary-700/40">
                        <p className="stat-value text-primary-600 dark:text-primary-400">
                            {activeHabits.length - todayLogs.size}
                        </p>
                        <p className="stat-label">Bekleyen</p>
                    </div>
                </div>
            )}

            {/* Habits List */}
            {activeHabits.length === 0 ? (
                <EmptyState
                    icon={<CheckIcon className="w-8 h-8" />}
                    title="Henüz alışkanlık yok"
                    description="Günlük rutinlerini takip etmek için ilk alışkanlığını oluştur"
                    action={
                        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            İlk Alışkanlığı Ekle
                        </button>
                    }
                />
            ) : (
                <div className="space-y-3">
                    {activeHabits.map((habit) => {
                        const log = todayLogs.get(habit.id)
                        const streak = streaks.get(habit.id)
                        const isDone = log?.status === 'done'
                        const isSkipped = log?.status === 'skip'

                        return (
                            <div
                                key={habit.id}
                                className={clsx(
                                    'card p-5 flex items-center gap-4 transition-all duration-300',
                                    isDone && 'card-success',
                                    isSkipped && 'bg-surface-50 dark:bg-surface-800/50 border-surface-300 dark:border-surface-600'
                                )}
                            >
                                {/* Checkbox / Input */}
                                {habit.type === 'boolean' ? (
                                    <button
                                        onClick={() => handleToggleHabit(habit)}
                                        className={clsx(
                                            'habit-checkbox flex-shrink-0',
                                            isDone && 'habit-checkbox-checked',
                                            isSkipped && 'habit-checkbox-skipped'
                                        )}
                                    >
                                        {isDone && <CheckIcon className="w-5 h-5 animate-check" />}
                                        {isSkipped && <MinusIcon className="w-4 h-4 text-surface-500" />}
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <input
                                            type="number"
                                            value={numericValue[habit.id] ?? log?.value ?? ''}
                                            onChange={(e) => setNumericValue(prev => ({
                                                ...prev,
                                                [habit.id]: parseInt(e.target.value) || 0
                                            }))}
                                            placeholder="0"
                                            className="input-sm w-20 text-center font-mono"
                                            disabled={isDone}
                                        />
                                        {!isDone && (
                                            <button
                                                onClick={() => handleNumericCheck(habit.id)}
                                                className="btn-success p-2"
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Habit Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={clsx(
                                            'font-semibold truncate',
                                            isDone
                                                ? 'text-success-700 dark:text-success-300 line-through'
                                                : 'text-surface-900 dark:text-white'
                                        )}>
                                            {habit.name}
                                        </p>
                                        {habit.type === 'numeric' && habit.unit && (
                                            <span className="badge-primary">{habit.unit}</span>
                                        )}
                                        {habit.scheduleSpec.type === 'weekly' && (
                                            <span className="badge-timer">
                                                {habit.scheduleSpec.required}x/hafta
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400">
                                            <FireIcon className="w-4 h-4 text-timer-500" />
                                            {streak?.currentStreak ?? 0} gün seri
                                        </span>
                                        {habit.type === 'numeric' && habit.minTarget && (
                                            <span className="text-sm text-surface-500">
                                                Hedef: {habit.minTarget}{habit.unit ? ` ${habit.unit}` : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {!isDone && habit.allowSkip && !isSkipped && (
                                        <button
                                            onClick={() => handleSkipHabit(habit.id)}
                                            className="btn-icon text-surface-400 hover:text-surface-600"
                                            title="Bugünü atla"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openEditModal(habit)}
                                        className="btn-icon text-surface-400 hover:text-primary-600"
                                        title="Düzenle"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => openDeleteConfirm(habit)}
                                        className="btn-icon text-surface-400 hover:text-red-600"
                                        title="Sil"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => { resetForm(); setShowCreateModal(false) }}
                title="Yeni Alışkanlık"
            >
                <HabitForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleCreateHabit}
                    onCancel={() => { resetForm(); setShowCreateModal(false) }}
                    submitText="Oluştur"
                />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => { resetForm(); setShowEditModal(false) }}
                title="Alışkanlığı Düzenle"
            >
                <HabitForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleEditHabit}
                    onCancel={() => { resetForm(); setShowEditModal(false) }}
                    submitText="Kaydet"
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteHabit}
                title="Alışkanlığı Sil"
                message={`"${selectedHabit?.name}" alışkanlığını ve tüm geçmişini silmek istediğine emin misin? Bu işlem geri alınamaz.`}
                confirmText="Sil"
                variant="danger"
            />
        </div>
    )
}

// Habit Form Component
interface HabitFormProps {
    formData: HabitFormData
    setFormData: (data: HabitFormData | ((prev: HabitFormData) => HabitFormData)) => void
    onSubmit: () => void
    onCancel: () => void
    submitText: string
}

function HabitForm({ formData, setFormData, onSubmit, onCancel, submitText }: HabitFormProps) {
    return (
        <div className="space-y-5">
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Alışkanlık Adı
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="örn. Günde 8 bardak su iç"
                    className="input"
                    autoFocus
                />
            </div>

            {/* Type Selection */}
            <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Takip Türü
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: 'boolean' }))}
                        className={clsx(
                            'p-4 rounded-2xl border-2 text-left transition-all',
                            formData.type === 'boolean'
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                                formData.type === 'boolean' ? 'border-primary-500 bg-primary-500' : 'border-surface-300'
                            )}>
                                {formData.type === 'boolean' && <CheckIcon className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                                <p className="font-medium text-surface-900 dark:text-white">Evet/Hayır</p>
                                <p className="text-xs text-surface-500">Basit tamamlama</p>
                            </div>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: 'numeric' }))}
                        className={clsx(
                            'p-4 rounded-2xl border-2 text-left transition-all',
                            formData.type === 'numeric'
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                'w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-bold',
                                formData.type === 'numeric' ? 'border-primary-500 bg-primary-500 text-white' : 'border-surface-300 text-surface-400'
                            )}>
                                #
                            </div>
                            <div>
                                <p className="font-medium text-surface-900 dark:text-white">Sayaç</p>
                                <p className="text-xs text-surface-500">Miktar takibi</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Numeric specific fields */}
            {formData.type === 'numeric' && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Hedef Değer
                        </label>
                        <input
                            type="number"
                            value={formData.minTarget ?? ''}
                            onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value) : undefined
                                setFormData(prev => ({ ...prev, minTarget: val }))
                            }}
                            placeholder="örn. 8"
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Birim
                        </label>
                        <input
                            type="text"
                            value={formData.unit ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                            placeholder="örn. bardak"
                            className="input"
                        />
                    </div>
                </div>
            )}

            {/* Schedule Type */}
            <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Tekrar Sıklığı
                </label>
                <select
                    value={formData.scheduleType}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduleType: e.target.value as ScheduleType }))}
                    className="input"
                >
                    <option value="daily">Her gün</option>
                    <option value="weekly">Haftada X kez</option>
                </select>
            </div>

            {/* Weekly specific */}
            {formData.scheduleType === 'weekly' && (
                <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Haftada kaç kez?
                    </label>
                    <div className="flex items-center gap-3">
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, weeklyRequired: num }))}
                                className={clsx(
                                    'w-10 h-10 rounded-xl font-medium transition-all',
                                    formData.weeklyRequired === num
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200'
                                )}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Allow Skip */}
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={formData.allowSkip}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowSkip: e.target.checked }))}
                    className="w-5 h-5 rounded-lg border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                    <p className="font-medium text-surface-900 dark:text-white">Atlama izni ver</p>
                    <p className="text-sm text-surface-500">Atlanan günler seriyi bozmaz</p>
                </div>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <button onClick={onCancel} className="btn-secondary flex-1">
                    İptal
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!formData.name.trim()}
                    className="btn-primary flex-1"
                >
                    {submitText}
                </button>
            </div>
        </div>
    )
}
