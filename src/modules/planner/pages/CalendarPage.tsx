import { useToast } from '@/shared/components'
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, IconButton } from '../components/ui/Button'
import { Badge, Card, EmptyState } from '../components/ui/Card'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { cn, formatDateDisplay, getDaysUntil } from '../lib/utils'
import { usePlannerStore } from '../store'
import { COURSE_COLORS, type PlannerEvent, type PlannerEventType } from '../types'

function toDateISO(date: Date): string {
    return date.toISOString().split('T')[0]
}

function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addDays(date: Date, days: number): Date {
    const copy = new Date(date)
    copy.setDate(copy.getDate() + days)
    return copy
}

type CalendarDay = {
    date: Date
    dateISO: string
    isCurrentMonth: boolean
    isToday: boolean
    items: PlannerEvent[]
}

export function CalendarPage() {
    const { showToast } = useToast()
    const location = useLocation()
    const navigate = useNavigate()

    const courses = usePlannerStore(state => state.courses)
    const events = usePlannerStore(state => state.events)
    const addEvent = usePlannerStore(state => state.addEvent)
    const updateEvent = usePlannerStore(state => state.updateEvent)
    const deleteEvent = usePlannerStore(state => state.deleteEvent)

    const [currentDate, setCurrentDate] = useState(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    })

    const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null)
    const [eventModalOpen, setEventModalOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null)
    const [formData, setFormData] = useState<{
        type: PlannerEventType
        title: string
        dateISO: string
        courseId: string
        description: string
        color: string
    }>({
        type: 'event',
        title: '',
        dateISO: '',
        courseId: '',
        description: '',
        color: '#6366f1',
    })

    const todayISO = useMemo(() => toDateISO(new Date()), [])

    const courseOptions = useMemo(
        () => [
            { value: '', label: 'Ders seç (opsiyonel)' },
            ...courses.map(c => ({ value: c.id, label: c.code ? `${c.code} • ${c.title}` : c.title })),
        ],
        [courses]
    )

    const days = useMemo<CalendarDay[]>(() => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)

        const firstGridDay = addDays(monthStart, -monthStart.getDay())
        const lastGridDay = addDays(monthEnd, 6 - monthEnd.getDay())

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const itemsByDate = new Map<string, PlannerEvent[]>()
        events.forEach(e => {
            if (!itemsByDate.has(e.dateISO)) itemsByDate.set(e.dateISO, [])
            itemsByDate.get(e.dateISO)!.push(e)
        })

        const out: CalendarDay[] = []
        for (let d = new Date(firstGridDay); d <= lastGridDay; d = addDays(d, 1)) {
            const dateISO = toDateISO(d)
            out.push({
                date: new Date(d),
                dateISO,
                isCurrentMonth: d.getMonth() === monthStart.getMonth(),
                isToday: d.getTime() === today.getTime(),
                items: (itemsByDate.get(dateISO) ?? []).slice().sort((a, b) => a.type.localeCompare(b.type)),
            })
        }

        return out
    }, [currentDate, events])

    const upcomingExams = useMemo(() => {
        const items = events
            .filter(e => e.type === 'exam' && e.courseId)
            .map(e => ({ event: e, daysLeft: getDaysUntil(e.dateISO) }))
            .filter(x => x.daysLeft >= 0)
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .slice(0, 10)

        return items.map(x => ({
            ...x,
            course: courses.find(c => c.id === x.event.courseId) ?? null,
        }))
    }, [events, courses])

    const todayItems = useMemo(() => {
        return events
            .filter(e => e.dateISO === todayISO)
            .slice()
            .sort((a, b) => a.type.localeCompare(b.type))
    }, [events, todayISO])

    const monthLabel = useMemo(() => {
        return currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    }, [currentDate])

    const openCreateModal = useCallback((dateISO: string, type: PlannerEventType = 'event') => {
        setSelectedDateISO(dateISO)
        setEditingEvent(null)
        setFormData({
            type,
            title: '',
            dateISO,
            courseId: '',
            description: '',
            color: type === 'exam' ? '#f97316' : '#6366f1',
        })
        setEventModalOpen(true)
    }, [])

    useEffect(() => {
        const state = location.state as undefined | { openCreate?: boolean }
        if (state?.openCreate) {
            openCreateModal(toDateISO(new Date()), 'event')
            navigate(location.pathname, { replace: true, state: {} })
        }
    }, [location.state, location.pathname, navigate, openCreateModal])

    const openEditModal = (event: PlannerEvent) => {
        setSelectedDateISO(event.dateISO)
        setEditingEvent(event)
        setFormData({
            type: event.type,
            title: event.title,
            dateISO: event.dateISO,
            courseId: event.courseId ?? '',
            description: event.description ?? '',
            color: event.color ?? (event.type === 'exam' ? '#f97316' : '#6366f1'),
        })
        setEventModalOpen(true)
    }

    const save = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            showToast('Başlık gerekli', { variant: 'error' })
            return
        }
        if (!formData.dateISO) {
            showToast('Tarih gerekli', { variant: 'error' })
            return
        }
        if (formData.type === 'exam' && !formData.courseId) {
            showToast('Sinav için ders seçmelisiniz', { variant: 'error' })
            return
        }

        if (editingEvent) {
            updateEvent(editingEvent.id, {
                type: formData.type,
                title: formData.title,
                dateISO: formData.dateISO,
                courseId: formData.courseId || undefined,
                description: formData.description || undefined,
                color: formData.color || undefined,
            })
            showToast('Güncellendi', { variant: 'success' })
        } else {
            addEvent({
                type: formData.type,
                title: formData.title,
                dateISO: formData.dateISO,
                courseId: formData.courseId || undefined,
                description: formData.description || undefined,
                color: formData.color || undefined,
            })
            showToast('Eklendi', { variant: 'success' })
        }

        setEventModalOpen(false)
        setEditingEvent(null)
    }

    const deleteSelected = () => {
        if (!editingEvent) return
        deleteEvent(editingEvent.id)
        showToast('Silindi', { variant: 'success' })
        setEventModalOpen(false)
        setEditingEvent(null)
    }

    const selectedDayItems = useMemo(() => {
        if (!selectedDateISO) return []
        return events
            .filter(e => e.dateISO === selectedDateISO)
            .slice()
            .sort((a, b) => a.type.localeCompare(b.type))
    }, [events, selectedDateISO])

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <CalendarDays className="w-6 h-6" />
                        Takvim
                    </h1>
                    <p className="text-secondary mt-1">Sinavlar ve etkinlikler</p>
                </div>
                <Button onClick={() => openCreateModal(toDateISO(new Date()), 'event')} leftIcon={<Plus className="w-4 h-4" />}>
                    Yeni
                </Button>
            </div>
            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
                <div className="w-full">
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <IconButton variant="secondary" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} title="Onceki ay">
                                    <ChevronLeft className="w-4 h-4" />
                                </IconButton>
                                <IconButton variant="secondary" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} title="Sonraki ay">
                                    <ChevronRight className="w-4 h-4" />
                                </IconButton>
                                <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>
                                    Bugün
                                </Button>
                            </div>
                            <div className="text-primary font-semibold capitalize">{monthLabel}</div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-xs text-secondary mb-2">
                            {['Paz', 'Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt'].map(d => (
                                <div key={d} className="text-center py-1">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {days.map(day => {
                                const examCount = day.items.filter(i => i.type === 'exam').length
                                const eventCount = day.items.filter(i => i.type === 'event').length

                                return (
                                    <button
                                        key={day.dateISO}
                                        onClick={() => openCreateModal(day.dateISO, 'event')}
                                        className={cn(
                                            'p-2 rounded-xl border text-left min-h-[72px] transition-colors',
                                            'border-default hover:bg-secondary/30',
                                            !day.isCurrentMonth && 'opacity-40',
                                            day.isToday && 'ring-2 ring-[var(--color-accent)]/40'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-primary">{day.date.getDate()}</span>
                                            {(examCount + eventCount) > 0 && (
                                                <span className="text-[10px] text-tertiary">{examCount + eventCount}</span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex flex-col gap-1">
                                            {examCount > 0 && (
                                                <span className="text-[10px] text-orange-300">Sinav: {examCount}</span>
                                            )}
                                            {eventCount > 0 && (
                                                <span className="text-[10px] text-blue-300">Etkinlik: {eventCount}</span>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-primary">Bugünün Etkinlikleri</h2>
                            <Button variant="ghost" size="sm" onClick={() => openCreateModal(todayISO, 'event')}>
                                Yeni
                            </Button>
                        </div>

                        {todayItems.length === 0 ? (
                            <EmptyState
                                icon={<CalendarDays className="w-8 h-8 text-tertiary" />}
                                title="Bugün için kayıt yok"
                                description="Bugün bir etkinlik ekleyebilirsiniz."
                            />
                        ) : (
                            <div className="space-y-2">
                                {todayItems.map(item => (
                                    <div
                                        key={item.id}
                                        className={cn('p-3 rounded-xl border flex items-start gap-3', 'border-default bg-secondary/20')}
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: item.color ?? '#6366f1' }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-primary truncate">{item.title}</p>
                                            <p className="text-sm text-secondary">{item.type === 'exam' ? 'Sinav' : 'Etkinlik'}</p>
                                        </div>
                                        <IconButton size="sm" onClick={() => openEditModal(item)} title="Duzenle">
                                            <Pencil className="w-4 h-4" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-primary">Yaklasan sinavlar</h2>
                        </div>

                        {upcomingExams.length === 0 ? (
                            <EmptyState
                                icon={<CalendarDays className="w-8 h-8 text-tertiary" />}
                                title="Yaklasan sinav yok"
                                description="Sinav eklediginizde burada gorunur."
                            />
                        ) : (
                            <div className="space-y-2">
                                {upcomingExams.map(({ event, course, daysLeft }) => (
                                    <div
                                        key={event.id}
                                        className={cn('p-3 rounded-xl border flex items-start gap-3', 'border-default bg-secondary/20')}
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: course?.color ?? '#f97316' }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-primary truncate">{event.title}</p>
                                            <p className="text-sm text-secondary truncate">{course?.title ?? 'Ders'}</p>
                                            <p className="text-xs text-tertiary mt-1">{formatDateDisplay(event.dateISO)}</p>
                                        </div>
                                        <Badge color={daysLeft <= 3 ? '#ef4444' : daysLeft <= 7 ? '#f97316' : '#6366f1'}>
                                            {daysLeft} gun
                                        </Badge>
                                        <IconButton size="sm" onClick={() => openEditModal(event)} title="Duzenle">
                                            <Pencil className="w-4 h-4" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={eventModalOpen}
                onClose={() => {
                    setEventModalOpen(false)
                    setEditingEvent(null)
                }}
                title={editingEvent ? 'Düzenle' : 'Yeni'}
                subtitle={selectedDateISO ? formatDateDisplay(selectedDateISO) : undefined}
                footer={
                    <div className="flex justify-between gap-2">
                        <div>
                            {editingEvent && (
                                <Button variant="danger" onClick={deleteSelected} leftIcon={<Trash2 className="w-4 h-4" />}>
                                    Sil
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setEventModalOpen(false)}>İptal</Button>
                            <Button form="calendar-event-form" type="submit">
                                {editingEvent ? 'Güncelle' : 'Ekle'}
                            </Button>
                        </div>
                    </div>
                }
            >
                <form id="calendar-event-form" onSubmit={save} className="space-y-4">
                    <Select
                        label="Tip"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PlannerEventType }))}
                        options={[
                            { value: 'event', label: 'Etkinlik' },
                            { value: 'exam', label: 'Sinav' },
                        ]}
                    />
                    <Input
                        label="Başlık"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        autoFocus
                    />
                    <Input
                        label="Tarih"
                        type="date"
                        value={formData.dateISO}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateISO: e.target.value }))}
                    />
                    <Select
                        label="Ders"
                        value={formData.courseId}
                        onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                        options={courseOptions}
                    />
                    <div>
                        <label className="block text-sm font-medium text-primary mb-2">Renk</label>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                            {COURSE_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                                    className={cn(
                                        'w-9 h-9 rounded-full border border-white/10 transition-transform duration-150 shadow-sm',
                                        formData.color === color
                                            ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-[#0f1117] scale-110'
                                            : 'hover:scale-105'
                                    )}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Renk ${color}`}
                                />
                            ))}
                        </div>
                    </div>
                    <Textarea
                        label="Açıklama (opsiyonel)"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                    />

                    {selectedDayItems.length > 0 && (
                        <div className="pt-4 border-t border-default">
                            <p className="text-sm font-semibold text-primary mb-2">Bu günün kayıtları</p>
                            <div className="space-y-2">
                                {selectedDayItems.map(item => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => openEditModal(item)}
                                        className="w-full p-3 rounded-xl border border-default bg-secondary/20 hover:bg-secondary/30 text-left flex items-start gap-3"
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: item.color ?? (item.type === 'exam' ? '#f97316' : '#6366f1') }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-primary truncate">{item.title}</p>
                                            <p className="text-xs text-secondary">{item.type === 'exam' ? 'Sinav' : 'Etkinlik'}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    )
}











