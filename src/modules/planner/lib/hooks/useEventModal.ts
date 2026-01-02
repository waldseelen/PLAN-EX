/**
 * useEventModal Hook
 *
 * Calendar event modal state yönetimi.
 * Form state, validation, create/edit/delete işlemleri.
 */

import {
    addEvent,
    deleteEvent,
    getEventById,
    updateEvent,
} from '@/db/planner'
import type { PlannerEventType } from '@/db/planner/types'
import { useCallback, useEffect, useState } from 'react'

// ============================================
// Types
// ============================================

export interface EventFormData {
    type: PlannerEventType
    title: string
    dateISO: string
    courseId: string
    description: string
    color: string
}

export interface EventModalState {
    isOpen: boolean
    isEditing: boolean
    editingEventId: string | null
    selectedDateISO: string | null
    formData: EventFormData
    isSubmitting: boolean
    error: string | null
}

export interface EventModalActions {
    /** Open modal for creating new event */
    openCreate: (dateISO: string, type?: PlannerEventType) => void
    /** Open modal for editing existing event */
    openEdit: (eventId: string) => Promise<void>
    /** Close modal */
    close: () => void
    /** Update form field */
    setField: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void
    /** Reset form to defaults */
    resetForm: () => void
    /** Submit form (create or update) */
    submit: () => Promise<boolean>
    /** Delete current event */
    remove: () => Promise<boolean>
}

export type UseEventModalReturn = EventModalState & EventModalActions

// ============================================
// Default Values
// ============================================

const DEFAULT_EVENT_COLOR = '#6366f1'
const DEFAULT_EXAM_COLOR = '#f97316'

const createDefaultFormData = (
    dateISO: string = '',
    type: PlannerEventType = 'event'
): EventFormData => ({
    type,
    title: '',
    dateISO,
    courseId: '',
    description: '',
    color: type === 'exam' ? DEFAULT_EXAM_COLOR : DEFAULT_EVENT_COLOR,
})

// ============================================
// Hook
// ============================================

export function useEventModal(): UseEventModalReturn {
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingEventId, setEditingEventId] = useState<string | null>(null)
    const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null)
    const [formData, setFormData] = useState<EventFormData>(createDefaultFormData())
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Reset error when modal closes
    useEffect(() => {
        if (!isOpen) {
            setError(null)
        }
    }, [isOpen])

    const openCreate = useCallback((dateISO: string, type: PlannerEventType = 'event') => {
        setIsEditing(false)
        setEditingEventId(null)
        setSelectedDateISO(dateISO)
        setFormData(createDefaultFormData(dateISO, type))
        setError(null)
        setIsOpen(true)
    }, [])

    const openEdit = useCallback(async (eventId: string) => {
        setIsSubmitting(true)
        setError(null)

        try {
            const event = await getEventById(eventId)
            if (!event) {
                setError('Etkinlik bulunamadı')
                return
            }

            setIsEditing(true)
            setEditingEventId(eventId)
            setSelectedDateISO(event.dateISO)
            setFormData({
                type: event.type,
                title: event.title,
                dateISO: event.dateISO,
                courseId: event.courseId ?? '',
                description: event.description ?? '',
                color: event.color ?? (event.type === 'exam' ? DEFAULT_EXAM_COLOR : DEFAULT_EVENT_COLOR),
            })
            setIsOpen(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Etkinlik yüklenemedi')
        } finally {
            setIsSubmitting(false)
        }
    }, [])

    const close = useCallback(() => {
        setIsOpen(false)
        setIsEditing(false)
        setEditingEventId(null)
        setSelectedDateISO(null)
        setFormData(createDefaultFormData())
    }, [])

    const setField = useCallback(<K extends keyof EventFormData>(
        key: K,
        value: EventFormData[K]
    ) => {
        setFormData(prev => {
            const updated = { ...prev, [key]: value }

            // Auto-update color when type changes
            if (key === 'type') {
                const type = value as PlannerEventType
                if (!prev.color || prev.color === DEFAULT_EVENT_COLOR || prev.color === DEFAULT_EXAM_COLOR) {
                    updated.color = type === 'exam' ? DEFAULT_EXAM_COLOR : DEFAULT_EVENT_COLOR
                }
            }

            return updated
        })
        setError(null)
    }, [])

    const resetForm = useCallback(() => {
        setFormData(createDefaultFormData(selectedDateISO ?? ''))
        setError(null)
    }, [selectedDateISO])

    const validate = useCallback((): string | null => {
        if (!formData.title.trim()) {
            return 'Başlık gerekli'
        }
        if (!formData.dateISO) {
            return 'Tarih gerekli'
        }
        if (formData.type === 'exam' && !formData.courseId) {
            return 'Sınav için ders seçmelisiniz'
        }
        return null
    }, [formData])

    const submit = useCallback(async (): Promise<boolean> => {
        const validationError = validate()
        if (validationError) {
            setError(validationError)
            return false
        }

        setIsSubmitting(true)
        setError(null)

        try {
            if (isEditing && editingEventId) {
                await updateEvent(editingEventId, {
                    type: formData.type,
                    title: formData.title.trim(),
                    dateISO: formData.dateISO,
                    courseId: formData.courseId || undefined,
                    description: formData.description.trim() || undefined,
                    color: formData.color || undefined,
                })
            } else {
                await addEvent({
                    type: formData.type,
                    title: formData.title.trim(),
                    dateISO: formData.dateISO,
                    courseId: formData.courseId || undefined,
                    description: formData.description.trim() || undefined,
                    color: formData.color || undefined,
                })
            }

            close()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'İşlem başarısız')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }, [formData, isEditing, editingEventId, validate, close])

    const remove = useCallback(async (): Promise<boolean> => {
        if (!editingEventId) return false

        setIsSubmitting(true)
        setError(null)

        try {
            await deleteEvent(editingEventId)
            close()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Silme başarısız')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }, [editingEventId, close])

    return {
        // State
        isOpen,
        isEditing,
        editingEventId,
        selectedDateISO,
        formData,
        isSubmitting,
        error,
        // Actions
        openCreate,
        openEdit,
        close,
        setField,
        resetForm,
        submit,
        remove,
    }
}
