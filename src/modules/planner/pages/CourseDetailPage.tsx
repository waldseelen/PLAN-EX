import { useCompletionFeedback } from '@/shared/hooks'
import { ArrowLeft, CalendarDays, CheckCircle2, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ExternalSearchButtons } from '../components/features/ExternalSearchButtons'
import { LectureNotes } from '../components/features/LectureNotes'
import { Button, IconButton } from '../components/ui/Button'
import { Badge, Card, EmptyState } from '../components/ui/Card'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { cn, formatDateDisplay, getDaysUntil } from '../lib/utils'
import { usePlannerStore } from '../store'
import { usePlannerAppStore } from '../store/plannerAppStore'
import type { PlannerEvent, PlannerEventType, Task, TaskStatus, Unit } from '../types'

type TaskWithUnit = { task: Task; unit: Unit }

function sortTasksForList(tasks: TaskWithUnit[]): TaskWithUnit[] {
    return [...tasks].sort((a, b) => {
        const aDue = a.task.dueDateISO ? new Date(a.task.dueDateISO).getTime() : Infinity
        const bDue = b.task.dueDateISO ? new Date(b.task.dueDateISO).getTime() : Infinity
        if (aDue !== bDue) return aDue - bDue
        return a.task.createdAt.localeCompare(b.task.createdAt)
    })
}

export function CourseDetailPage() {
    const { courseId } = useParams<{ courseId: string }>()
    const navigate = useNavigate()

    const hasHydrated = usePlannerStore(state => state.hasHydrated)
    const courses = usePlannerStore(state => state.courses)
    const events = usePlannerStore(state => state.events)
    const completedTaskIds = usePlannerStore(state => state.completionState.completedTaskIds)

    const updateCourse = usePlannerStore(state => state.updateCourse)
    const addUnit = usePlannerStore(state => state.addUnit)
    const addTask = usePlannerStore(state => state.addTask)
    const updateTask = usePlannerStore(state => state.updateTask)
    const deleteTask = usePlannerStore(state => state.deleteTask)
    const toggleTaskCompletionBase = usePlannerStore(state => state.toggleTaskCompletion)

    const addEvent = usePlannerStore(state => state.addEvent)
    const updateEvent = usePlannerStore(state => state.updateEvent)
    const deleteEvent = usePlannerStore(state => state.deleteEvent)

    // Completion feedback (ses + haptic)
    const settings = usePlannerAppStore(state => state.settings)
    const { triggerCompletionFeedback } = useCompletionFeedback({
        soundEnabled: settings.soundEnabled,
    })

    // Confetti state
    const [showConfetti, setShowConfetti] = useState(false)

    // Wrap toggle with completion feedback
    const toggleTaskCompletion = useCallback((taskId: string) => {
        const isCurrentlyCompleted = completedTaskIds.includes(taskId)

        if (!isCurrentlyCompleted) {
            // Görev tamamlanıyor
            triggerCompletionFeedback()
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 1000)
        }

        toggleTaskCompletionBase(taskId)
    }, [completedTaskIds, toggleTaskCompletionBase, triggerCompletionFeedback])

    const course = useMemo(() => courses.find(c => c.id === courseId), [courses, courseId])

    const courseEvents = useMemo(() => {
        if (!course) return []
        return events
            .filter(e => e.courseId === course.id)
            .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    }, [events, course])

    const tasks = useMemo(() => {
        if (!course) return []
        const flattened: TaskWithUnit[] = []
        for (const unit of course.units) {
            for (const task of unit.tasks) {
                flattened.push({ task, unit })
            }
        }
        return sortTasksForList(flattened)
    }, [course])

    const nextEvent = useMemo(() => {
        const upcoming = courseEvents
            .map(e => ({ event: e, daysLeft: getDaysUntil(e.dateISO) }))
            .filter(x => x.daysLeft >= 0)
            .sort((a, b) => a.daysLeft - b.daysLeft)
        return upcoming[0] || null
    }, [courseEvents])

    const [isEditCourseOpen, setIsEditCourseOpen] = useState(false)
    const [courseForm, setCourseForm] = useState<{ title: string; code: string; color: string }>({
        title: course?.title ?? '',
        code: course?.code ?? '',
        color: course?.color ?? '#6366f1',
    })

    const [taskModalOpen, setTaskModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<{ task: Task; unitId: string } | null>(null)
    const [taskForm, setTaskForm] = useState<{
        text: string
        status: TaskStatus
        dueDateISO: string
        note: string
        unitId: string
    }>({
        text: '',
        status: 'todo',
        dueDateISO: '',
        note: '',
        unitId: '',
    })

    const [eventModalOpen, setEventModalOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null)
    const [eventForm, setEventForm] = useState<{
        type: PlannerEventType
        title: string
        dateISO: string
        description: string
        color: string
    }>({
        type: 'exam',
        title: '',
        dateISO: '',
        description: '',
        color: '#f97316',
    })

    // Drag & Drop state
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
    const dragOverTaskId = useRef<string | null>(null)

    const reorderUnits = usePlannerStore(state => state.reorderUnits)

    // Drag handlers for tasks within same unit
    const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', taskId)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent, taskId: string) => {
        e.preventDefault()
        dragOverTaskId.current = taskId
    }, [])

    const handleDragEnd = useCallback(() => {
        if (!draggedTaskId || !dragOverTaskId.current || !course) {
            setDraggedTaskId(null)
            return
        }

        // Find source and target task positions
        const sourceTask = tasks.find(t => t.task.id === draggedTaskId)
        const targetTask = tasks.find(t => t.task.id === dragOverTaskId.current)

        if (sourceTask && targetTask && sourceTask.unit.id === targetTask.unit.id) {
            // Same unit - reorder tasks within unit
            const unit = course.units.find(u => u.id === sourceTask.unit.id)
            if (unit) {
                const tasksCopy = [...unit.tasks]
                const sourceIndex = tasksCopy.findIndex(t => t.id === draggedTaskId)
                const targetIndex = tasksCopy.findIndex(t => t.id === dragOverTaskId.current)

                if (sourceIndex !== -1 && targetIndex !== -1) {
                    const [removed] = tasksCopy.splice(sourceIndex, 1)
                    tasksCopy.splice(targetIndex, 0, removed)

                    // Update unit with reordered tasks
                    const updatedUnits = course.units.map(u =>
                        u.id === unit.id ? { ...u, tasks: tasksCopy } : u
                    )
                    reorderUnits(course.id, updatedUnits)
                }
            }
        }

        setDraggedTaskId(null)
        dragOverTaskId.current = null
    }, [draggedTaskId, tasks, course, reorderUnits])

    if (!hasHydrated) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <p className="text-secondary">Yükleniyor...</p>
                </div>
            </div>
        )
    }

    if (!courseId || !course) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-4">
                    <p className="text-secondary">Ders bulunamadı</p>
                    <Link to="/planner/courses">
                        <Button>Derslere Dön</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const unitOptions = course.units.map(u => ({ value: u.id, label: u.title }))

    const openNewTask = () => {
        let unitId: string | undefined = course.units.at(0)?.id
        if (!unitId) {
            addUnit(course.id, 'Genel')
            unitId = usePlannerStore.getState().courses.find(c => c.id === course.id)?.units.at(0)?.id
        }

        setEditingTask(null)
        setTaskForm({
            text: '',
            status: 'todo',
            dueDateISO: '',
            note: '',
            unitId: unitId || '',
        })
        setTaskModalOpen(true)
    }

    const openEditTask = (task: Task, unitId: string) => {
        setEditingTask({ task, unitId })
        setTaskForm({
            text: task.text,
            status: task.status,
            dueDateISO: task.dueDateISO ?? '',
            note: task.note ?? '',
            unitId,
        })
        setTaskModalOpen(true)
    }

    const saveTask = (e: React.FormEvent) => {
        e.preventDefault()
        if (!taskForm.text.trim()) return

        const unitId = taskForm.unitId || course.units[0]?.id
        if (!unitId) return

        if (editingTask) {
            updateTask(course.id, unitId, editingTask.task.id, {
                text: taskForm.text,
                status: taskForm.status,
                dueDateISO: taskForm.dueDateISO || undefined,
                note: taskForm.note || undefined,
            })
        } else {
            addTask(course.id, unitId, taskForm.text, {
                status: taskForm.status,
                dueDateISO: taskForm.dueDateISO || undefined,
                note: taskForm.note || undefined,
            })
        }

        setTaskModalOpen(false)
        setEditingTask(null)
    }

    const openNewEvent = (type: PlannerEventType = 'event') => {
        setEditingEvent(null)
        setEventForm({
            type,
            title: '',
            dateISO: '',
            description: '',
            color: type === 'exam' ? '#f97316' : '#6366f1',
        })
        setEventModalOpen(true)
    }

    const openEditEvent = (event: PlannerEvent) => {
        setEditingEvent(event)
        setEventForm({
            type: event.type,
            title: event.title,
            dateISO: event.dateISO,
            description: event.description ?? '',
            color: event.color ?? (event.type === 'exam' ? '#f97316' : '#6366f1'),
        })
        setEventModalOpen(true)
    }

    const saveEvent = (e: React.FormEvent) => {
        e.preventDefault()
        if (!eventForm.title.trim() || !eventForm.dateISO) return

        if (editingEvent) {
            updateEvent(editingEvent.id, {
                type: eventForm.type,
                title: eventForm.title,
                dateISO: eventForm.dateISO,
                description: eventForm.description || undefined,
                color: eventForm.color || undefined,
                courseId: course.id,
            })
        } else {
            addEvent({
                type: eventForm.type,
                courseId: course.id,
                title: eventForm.title,
                dateISO: eventForm.dateISO,
                description: eventForm.description || undefined,
                color: eventForm.color || undefined,
            })
        }

        setEventModalOpen(false)
        setEditingEvent(null)
    }

    const openEditCourse = () => {
        setCourseForm({
            title: course.title,
            code: course.code ?? '',
            color: course.color ?? '#6366f1',
        })
        setIsEditCourseOpen(true)
    }

    const saveCourse = (e: React.FormEvent) => {
        e.preventDefault()
        if (!courseForm.title.trim()) return
        updateCourse(course.id, {
            title: courseForm.title,
            code: courseForm.code || undefined,
            color: courseForm.color,
        })
        setIsEditCourseOpen(false)
    }

    return (
        <div className="space-y-6 animate-fade-in relative">
            {/* Confetti Overlay */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => {
                        const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899']
                        return (
                            <div
                                key={i}
                                className="absolute w-2 h-2 rounded-full animate-confetti"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    backgroundColor: colors[i % 5],
                                    animationDelay: `${Math.random() * 0.3}s`,
                                    animationDuration: `${0.6 + Math.random() * 0.4}s`,
                                }}
                            />
                        )
                    })}
                </div>
            )}

            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <IconButton variant="ghost" onClick={() => navigate('/planner/courses')} title="Geri">
                        <ArrowLeft className="w-5 h-5" />
                    </IconButton>
                    <div>
                        <div className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: course.color ?? '#6366f1' }}
                            />
                            <h1 className="text-2xl font-bold text-primary">{course.title}</h1>
                        </div>
                        {course.code && <p className="text-secondary mt-1">{course.code}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => openNewEvent('exam')} leftIcon={<Plus className="w-4 h-4" />}>
                        Sınav / Etkinlik
                    </Button>
                    <IconButton variant="secondary" onClick={openEditCourse} title="Dersi düzenle">
                        <Pencil className="w-4 h-4" />
                    </IconButton>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-secondary">Bir sonraki sınav/etkinliğe</p>
                            <p className="text-2xl font-bold text-primary">
                                {nextEvent ? `${nextEvent.daysLeft} gün` : '—'}
                            </p>
                            {nextEvent && (
                                <p className="text-sm text-secondary mt-1">
                                    {nextEvent.event.type === 'exam' ? 'Sınav' : 'Etkinlik'} • {nextEvent.event.title} • {formatDateDisplay(nextEvent.event.dateISO)}
                                </p>
                            )}
                        </div>
                        <CalendarDays className="w-10 h-10 text-tertiary" />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-secondary">Toplam görev</p>
                            <p className="text-2xl font-bold text-primary">{tasks.length}</p>
                        </div>
                        <CheckCircle2 className="w-10 h-10 text-tertiary" />
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-primary">Görevler</h2>
                        <Button size="sm" onClick={openNewTask} leftIcon={<Plus className="w-4 h-4" />}>
                            Görev Ekle
                        </Button>
                    </div>

                    {tasks.length === 0 ? (
                        <EmptyState
                            icon={<CheckCircle2 className="w-8 h-8 text-tertiary" />}
                            title="Henüz görev yok"
                            description="Bu derse görev ekleyerek başlayın."
                            action={<Button onClick={openNewTask} leftIcon={<Plus className="w-4 h-4" />}>İlk Görevi Ekle</Button>}
                        />
                    ) : (
                        <div className="space-y-2">
                            {tasks.map(({ task, unit }) => {
                                const isCompleted = completedTaskIds.includes(task.id)
                                const isDragging = draggedTaskId === task.id
                                return (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onDragOver={(e) => handleDragOver(e, task.id)}
                                        onDragEnd={handleDragEnd}
                                        className={cn(
                                            'p-3 rounded-xl border flex items-start gap-3 cursor-grab active:cursor-grabbing',
                                            'border-default bg-secondary/20 hover:bg-secondary/30 transition-all',
                                            isDragging && 'opacity-50 scale-[0.98] ring-2 ring-cyan-400/50'
                                        )}
                                    >
                                        {/* Drag Handle */}
                                        <div className="mt-0.5 text-tertiary hover:text-secondary cursor-grab">
                                            <GripVertical className="w-4 h-4" />
                                        </div>

                                        <button
                                            onClick={() => toggleTaskCompletion(task.id)}
                                            className={cn(
                                                'mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0',
                                                isCompleted ? 'bg-green-500 border-green-500' : 'border-default'
                                            )}
                                            aria-label={isCompleted ? 'Tamamlandı' : 'Tamamla'}
                                        >
                                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <p className={cn('font-medium text-primary', isCompleted && 'line-through opacity-60')}>
                                                {task.text}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-secondary">
                                                <span>{unit.title}</span>
                                                {task.dueDateISO && <span>• {formatDateDisplay(task.dueDateISO)}</span>}
                                                <span className="capitalize">• {task.status}</span>
                                            </div>
                                        </div>

                                        {/* External Search Buttons */}
                                        <ExternalSearchButtons title={task.text} description={task.note} />

                                        <div className="flex items-center gap-1">
                                            <IconButton size="sm" onClick={() => openEditTask(task, unit.id)} title="Düzenle">
                                                <Pencil className="w-4 h-4" />
                                            </IconButton>
                                            <IconButton
                                                size="sm"
                                                variant="danger"
                                                onClick={() => deleteTask(course.id, unit.id, task.id)}
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </IconButton>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>

                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-primary">Takvim</h2>
                        <Button size="sm" onClick={() => openNewEvent('event')} leftIcon={<Plus className="w-4 h-4" />}>
                            Etkinlik Ekle
                        </Button>
                    </div>

                    {courseEvents.length === 0 ? (
                        <EmptyState
                            icon={<CalendarDays className="w-8 h-8 text-tertiary" />}
                            title="Henüz etkinlik/sınav yok"
                            description="Bu ders için sınav veya etkinlik ekleyin."
                            action={<Button onClick={() => openNewEvent('exam')} leftIcon={<Plus className="w-4 h-4" />}>İlk Sınavı Ekle</Button>}
                        />
                    ) : (
                        <div className="space-y-2">
                            {courseEvents.map(event => {
                                const daysLeft = getDaysUntil(event.dateISO)
                                const isPast = daysLeft < 0
                                const badgeColor = event.type === 'exam' ? '#f97316' : '#6366f1'
                                return (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            'p-3 rounded-xl border flex items-start gap-3',
                                            'border-default bg-secondary/20 hover:bg-secondary/30 transition-colors'
                                        )}
                                    >
                                        <div
                                            className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0"
                                            style={{ backgroundColor: event.color ?? badgeColor }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-primary truncate">{event.title}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-secondary">
                                                <span>{event.type === 'exam' ? 'Sınav' : 'Etkinlik'}</span>
                                                <span>• {formatDateDisplay(event.dateISO)}</span>
                                                {!isPast && (
                                                    <Badge color={badgeColor}>
                                                        {daysLeft} gün
                                                    </Badge>
                                                )}
                                                {isPast && <span className="text-tertiary">Geçti</span>}
                                            </div>
                                            {event.description && (
                                                <p className="text-sm text-secondary mt-2 line-clamp-2">{event.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <IconButton size="sm" onClick={() => openEditEvent(event)} title="Düzenle">
                                                <Pencil className="w-4 h-4" />
                                            </IconButton>
                                            <IconButton size="sm" variant="danger" onClick={() => deleteEvent(event.id)} title="Sil">
                                                <Trash2 className="w-4 h-4" />
                                            </IconButton>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>

                {/* Ders Notları (PDF) */}
                <LectureNotes courseId={course.id} courseName={course.title} />
            </div>

            {/* Edit Course Modal */}
            <Modal
                isOpen={isEditCourseOpen}
                onClose={() => setIsEditCourseOpen(false)}
                title="Dersi Düzenle"
            >
                <form onSubmit={saveCourse} className="space-y-4">
                    <Input
                        label="Ders Adı"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                        autoFocus
                    />
                    <Input
                        label="Ders Kodu (opsiyonel)"
                        value={courseForm.code}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, code: e.target.value }))}
                    />
                    <Input
                        label="Renk"
                        type="color"
                        value={courseForm.color}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, color: e.target.value }))}
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setIsEditCourseOpen(false)}>
                            İptal
                        </Button>
                        <Button type="submit">Kaydet</Button>
                    </div>
                </form>
            </Modal>

            {/* Add/Edit Task Modal */}
            <Modal
                isOpen={taskModalOpen}
                onClose={() => {
                    setTaskModalOpen(false)
                    setEditingTask(null)
                }}
                title={editingTask ? 'Görev Düzenle' : 'Yeni Görev'}
            >
                <form onSubmit={saveTask} className="space-y-4">
                    <Input
                        label="Görev"
                        value={taskForm.text}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, text: e.target.value }))}
                        autoFocus
                    />
                    <Select
                        label="Durum"
                        value={taskForm.status}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                        options={[
                            { value: 'todo', label: 'Yapılacak' },
                            { value: 'in-progress', label: 'Devam Ediyor' },
                            { value: 'review', label: 'İnceleme' },
                            { value: 'done', label: 'Tamamlandı' },
                        ]}
                    />
                    <Select
                        label="Ünite"
                        value={taskForm.unitId}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, unitId: e.target.value }))}
                        options={unitOptions.length > 0 ? unitOptions : [{ value: '', label: 'Genel' }]}
                    />
                    <Input
                        label="Bitiş Tarihi (opsiyonel)"
                        type="date"
                        value={taskForm.dueDateISO}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, dueDateISO: e.target.value }))}
                    />
                    <Textarea
                        label="Not (opsiyonel)"
                        value={taskForm.note}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, note: e.target.value }))}
                        rows={3}
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setTaskModalOpen(false)}>
                            İptal
                        </Button>
                        <Button type="submit">{editingTask ? 'Güncelle' : 'Ekle'}</Button>
                    </div>
                </form>
            </Modal>

            {/* Add/Edit Event Modal */}
            <Modal
                isOpen={eventModalOpen}
                onClose={() => {
                    setEventModalOpen(false)
                    setEditingEvent(null)
                }}
                title={editingEvent ? 'Etkinlik / Sınav Düzenle' : 'Etkinlik / Sınav Ekle'}
            >
                <form onSubmit={saveEvent} className="space-y-4">
                    <Select
                        label="Tip"
                        value={eventForm.type}
                        onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as PlannerEventType }))}
                        options={[
                            { value: 'event', label: 'Etkinlik' },
                            { value: 'exam', label: 'Sınav' },
                        ]}
                    />
                    <Input
                        label="Başlık"
                        value={eventForm.title}
                        onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                        autoFocus={!editingEvent}
                    />
                    <Input
                        label="Tarih"
                        type="date"
                        value={eventForm.dateISO}
                        onChange={(e) => setEventForm(prev => ({ ...prev, dateISO: e.target.value }))}
                    />
                    <Input
                        label="Renk"
                        type="color"
                        value={eventForm.color}
                        onChange={(e) => setEventForm(prev => ({ ...prev, color: e.target.value }))}
                    />
                    <Textarea
                        label="Açıklama (opsiyonel)"
                        value={eventForm.description}
                        onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setEventModalOpen(false)}>
                            İptal
                        </Button>
                        <Button type="submit">{editingEvent ? 'Güncelle' : 'Ekle'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
