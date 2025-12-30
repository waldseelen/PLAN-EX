import type { Activity, Category } from '@/db/types'
import { ConfirmDialog, EmptyState, Modal, SkeletonActivityCard } from '@/shared/components'
import { PencilIcon, PlusIcon, TagIcon, TrashIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { useCategoriesStore } from '../store/categoriesStore'
import { useActivitiesStore } from '../store/timerStore'

interface ActivityFormData {
    name: string
    categoryId: string
}

interface CategoryFormData {
    name: string
    color: string
    icon: string
}

const defaultActivityForm: ActivityFormData = {
    name: '',
    categoryId: '',
}

const defaultCategoryForm: CategoryFormData = {
    name: '',
    color: '#6366f1',
    icon: '📌',
}

const colorOptions = [
    '#ef4444', '#f97316', '#f59e0b', '#fbbf24',
    '#a3e635', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
]

const iconOptions = [
    '💼', '📚', '💻', '🎮', '🏃', '🎵', '🎨', '📝',
    '🎯', '💪', '🧘', '🍳', '🚗', '✈️', '📱', '🎬',
    '📷', '🎸', '🏠', '🛒', '💰', '📊', '🔧', '🌱',
]

export function Activities() {
    const {
        activities,
        initialize: initActivities,
        createActivity,
        updateActivity,
        deleteActivity,
    } = useActivitiesStore()
    const {
        categories,
        initialize: initCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    } = useCategoriesStore()

    const [isLoading, setIsLoading] = useState(true)

    // Activity modals
    const [showActivityModal, setShowActivityModal] = useState(false)
    const [showDeleteActivityConfirm, setShowDeleteActivityConfirm] = useState(false)
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
    const [activityForm, setActivityForm] = useState<ActivityFormData>(defaultActivityForm)

    // Category modals
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [categoryForm, setCategoryForm] = useState<CategoryFormData>(defaultCategoryForm)

    useEffect(() => {
        async function init() {
            await Promise.all([initActivities(), initCategories()])
            setIsLoading(false)
        }
        init()
    }, [initActivities, initCategories])

    // Activity handlers
    const resetActivityForm = () => {
        setActivityForm(defaultActivityForm)
        setSelectedActivity(null)
    }

    const handleCreateActivity = async () => {
        if (!activityForm.name.trim() || !activityForm.categoryId) return

        await createActivity({
            name: activityForm.name.trim(),
            categoryId: activityForm.categoryId,
            tagIds: [],
            archived: false,
            defaultGoalIds: [],
        })

        resetActivityForm()
        setShowActivityModal(false)
    }

    const handleEditActivity = async () => {
        if (!selectedActivity || !activityForm.name.trim() || !activityForm.categoryId) return

        await updateActivity(selectedActivity.id, {
            name: activityForm.name.trim(),
            categoryId: activityForm.categoryId,
        })

        resetActivityForm()
        setShowActivityModal(false)
    }

    const handleDeleteActivity = async () => {
        if (!selectedActivity) return

        await deleteActivity(selectedActivity.id)
        setSelectedActivity(null)
        setShowDeleteActivityConfirm(false)
    }

    const openEditActivityModal = (activity: Activity) => {
        setSelectedActivity(activity)
        setActivityForm({
            name: activity.name,
            categoryId: activity.categoryId,
        })
        setShowActivityModal(true)
    }

    const openDeleteActivityConfirm = (activity: Activity) => {
        setSelectedActivity(activity)
        setShowDeleteActivityConfirm(true)
    }

    // Category handlers
    const resetCategoryForm = () => {
        setCategoryForm(defaultCategoryForm)
        setSelectedCategory(null)
    }

    const handleCreateCategory = async () => {
        if (!categoryForm.name.trim()) return

        await createCategory({
            name: categoryForm.name.trim(),
            color: categoryForm.color,
            icon: categoryForm.icon,
            archived: false,
        })

        resetCategoryForm()
        setShowCategoryModal(false)
    }

    const handleEditCategory = async () => {
        if (!selectedCategory || !categoryForm.name.trim()) return

        await updateCategory(selectedCategory.id, {
            name: categoryForm.name.trim(),
            color: categoryForm.color,
            icon: categoryForm.icon,
        })

        resetCategoryForm()
        setShowCategoryModal(false)
    }

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return

        await deleteCategory(selectedCategory.id)
        setSelectedCategory(null)
        setShowDeleteCategoryConfirm(false)
    }

    const openEditCategoryModal = (category: Category) => {
        setSelectedCategory(category)
        setCategoryForm({
            name: category.name,
            color: category.color,
            icon: category.icon,
        })
        setShowCategoryModal(true)
    }

    const openDeleteCategoryConfirm = (category: Category) => {
        setSelectedCategory(category)
        setShowDeleteCategoryConfirm(true)
    }

    const activeActivities = activities.filter((a) => !a.archived)
    const activeCategories = categories.filter((c) => !c.archived)

    // Group by category
    const activitiesByCategory = activeActivities.reduce((acc, activity) => {
        const categoryId = activity.categoryId
        if (!acc[categoryId]) {
            acc[categoryId] = []
        }
        acc[categoryId]!.push(activity)
        return acc
    }, {} as Record<string, Activity[]>)

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="skeleton h-8 w-40 rounded-xl" />
                        <div className="skeleton h-4 w-64 rounded-lg" />
                    </div>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <SkeletonActivityCard key={i} />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">
                        Aktiviteler
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        Zaman takibi yapacağın aktiviteleri yönet
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            resetCategoryForm()
                            setShowCategoryModal(true)
                        }}
                        className="btn-secondary"
                    >
                        <TagIcon className="w-5 h-5 mr-2" />
                        Yeni Kategori
                    </button>
                    <button
                        onClick={() => {
                            resetActivityForm()
                            setShowActivityModal(true)
                        }}
                        className="btn-primary"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Yeni Aktivite
                    </button>
                </div>
            </div>

            {/* Categories & Activities */}
            {activeCategories.length === 0 ? (
                <EmptyState
                    icon={<TagIcon className="w-8 h-8" />}
                    title="Henüz kategori yok"
                    description="Aktiviteler için önce bir kategori oluştur"
                    action={
                        <button
                            onClick={() => {
                                resetCategoryForm()
                                setShowCategoryModal(true)
                            }}
                            className="btn-primary"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            İlk Kategoriyi Ekle
                        </button>
                    }
                />
            ) : (
                <div className="space-y-6">
                    {activeCategories.map((category) => {
                        const categoryActivities = activitiesByCategory[category.id] ?? []

                        return (
                            <div key={category.id} className="space-y-3">
                                {/* Category Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm"
                                            style={{ backgroundColor: category.color }}
                                        >
                                            {category.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                                                {category.name}
                                            </h2>
                                            <p className="text-sm text-surface-500">
                                                {categoryActivities.length} aktivite
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditCategoryModal(category)}
                                            className="btn-icon text-surface-400 hover:text-primary-600"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteCategoryConfirm(category)}
                                            className="btn-icon text-surface-400 hover:text-red-600"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Activities Grid */}
                                {categoryActivities.length === 0 ? (
                                    <div className="card p-6 text-center">
                                        <p className="text-surface-500 text-sm">
                                            Bu kategoride henüz aktivite yok
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {categoryActivities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="card p-4 flex items-center justify-between group hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className="w-2 h-8 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span className="font-medium text-surface-900 dark:text-white truncate">
                                                        {activity.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditActivityModal(activity)}
                                                        className="btn-icon text-surface-400 hover:text-primary-600"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteActivityConfirm(activity)}
                                                        className="btn-icon text-surface-400 hover:text-red-600"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Activity Modal */}
            <Modal
                isOpen={showActivityModal}
                onClose={() => { resetActivityForm(); setShowActivityModal(false) }}
                title={selectedActivity ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite'}
            >
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Aktivite Adı
                        </label>
                        <input
                            type="text"
                            value={activityForm.name}
                            onChange={(e) => setActivityForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="örn. Proje geliştirme"
                            className="input"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Kategori
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {activeCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setActivityForm(prev => ({ ...prev, categoryId: cat.id }))}
                                    className={clsx(
                                        'p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3',
                                        activityForm.categoryId === cat.id
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                                    )}
                                >
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                                        style={{ backgroundColor: cat.color }}
                                    >
                                        {cat.icon}
                                    </div>
                                    <span className="font-medium text-surface-900 dark:text-white text-sm truncate">
                                        {cat.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => { resetActivityForm(); setShowActivityModal(false) }}
                            className="btn-secondary flex-1"
                        >
                            İptal
                        </button>
                        <button
                            onClick={selectedActivity ? handleEditActivity : handleCreateActivity}
                            disabled={!activityForm.name.trim() || !activityForm.categoryId}
                            className="btn-primary flex-1"
                        >
                            {selectedActivity ? 'Kaydet' : 'Oluştur'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Category Modal */}
            <Modal
                isOpen={showCategoryModal}
                onClose={() => { resetCategoryForm(); setShowCategoryModal(false) }}
                title={selectedCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
            >
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Kategori Adı
                        </label>
                        <input
                            type="text"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="örn. İş"
                            className="input"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Renk
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                                    className={clsx(
                                        'w-8 h-8 rounded-xl transition-all',
                                        categoryForm.color === color
                                            ? 'ring-2 ring-offset-2 ring-primary-500 scale-110'
                                            : 'hover:scale-105'
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            İkon
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {iconOptions.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setCategoryForm(prev => ({ ...prev, icon }))}
                                    className={clsx(
                                        'w-10 h-10 rounded-xl text-lg transition-all flex items-center justify-center',
                                        categoryForm.icon === icon
                                            ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
                                            : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200'
                                    )}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-2xl">
                        <p className="text-xs text-surface-500 mb-2">Önizleme</p>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                                style={{ backgroundColor: categoryForm.color }}
                            >
                                {categoryForm.icon}
                            </div>
                            <span className="font-medium text-surface-900 dark:text-white">
                                {categoryForm.name || 'Kategori Adı'}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => { resetCategoryForm(); setShowCategoryModal(false) }}
                            className="btn-secondary flex-1"
                        >
                            İptal
                        </button>
                        <button
                            onClick={selectedCategory ? handleEditCategory : handleCreateCategory}
                            disabled={!categoryForm.name.trim()}
                            className="btn-primary flex-1"
                        >
                            {selectedCategory ? 'Kaydet' : 'Oluştur'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Activity Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteActivityConfirm}
                onClose={() => setShowDeleteActivityConfirm(false)}
                onConfirm={handleDeleteActivity}
                title="Aktiviteyi Sil"
                message={`"${selectedActivity?.name}" aktivitesini silmek istediğine emin misin? Bu aktiviteye ait zaman kayıtları silinmeyecek.`}
                confirmText="Sil"
                variant="danger"
            />

            {/* Delete Category Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteCategoryConfirm}
                onClose={() => setShowDeleteCategoryConfirm(false)}
                onConfirm={handleDeleteCategory}
                title="Kategoriyi Sil"
                message={`"${selectedCategory?.name}" kategorisini ve tüm aktivitelerini silmek istediğine emin misin?`}
                confirmText="Sil"
                variant="danger"
            />
        </div>
    )
}
