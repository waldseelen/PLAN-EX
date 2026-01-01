/**
 * Planner Store - Zustand
 *
 * PlannerContext yerine Zustand store kullanılıyor.
 * Plan.Ex'in state yönetim pattern'ine uyumlu.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
    CompletionState,
    Course,
    COURSE_COLORS,
    LectureNoteMeta,
    LIMITS,
    PersonalTask,
    PlannerEvent,
    PlannerEventType,
    Task,
    TaskStatus,
    UndoSnapshot,
    Unit,
} from '../types'

// ================== HELPERS ==================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ================== TYPES ==================

interface PlannerState {
    // Data
    courses: Course[]
    events: PlannerEvent[]
    completionState: CompletionState
    undoStack: UndoSnapshot[]
    personalTasks: PersonalTask[]
    lectureNotesMeta: LectureNoteMeta[]

    // State
    isLoading: boolean
    isInitialized: boolean
    hasHydrated: boolean
}

interface PlannerActions {
    // Initialize
    initialize: () => void
    setHasHydrated: (hasHydrated: boolean) => void

    // Courses
    addCourse: (title: string, code?: string) => void
    updateCourse: (id: string, updates: Partial<Course>) => void
    deleteCourse: (id: string) => void

    // Units
    addUnit: (courseId: string, title: string) => void
    updateUnit: (courseId: string, unitId: string, updates: Partial<Unit>) => void
    deleteUnit: (courseId: string, unitId: string) => void
    reorderUnits: (courseId: string, units: Unit[]) => void

    // Tasks
    addTask: (courseId: string, unitId: string, text: string, options?: Partial<Task>) => void
    updateTask: (courseId: string, unitId: string, taskId: string, updates: Partial<Task>) => void
    deleteTask: (courseId: string, unitId: string, taskId: string) => void
    toggleTaskCompletion: (taskId: string) => void
    updateTaskStatus: (taskId: string, status: TaskStatus, courseId: string, unitId: string) => void

    // Events / Exams
    addEvent: (data: { type: PlannerEventType; title: string; dateISO: string; courseId?: string; description?: string; color?: string }) => void
    updateEvent: (id: string, updates: Partial<PlannerEvent>) => void
    deleteEvent: (id: string) => void
    getCourseEvents: (courseId: string) => PlannerEvent[]

    // Backward-compatible exam helpers
    addExam: (courseId: string, title: string, dateISO: string, description?: string) => void
    updateExam: (courseId: string, examId: string, updates: Partial<PlannerEvent>) => void
    deleteExam: (courseId: string, examId: string) => void

    // Personal Tasks
    addPersonalTask: (text: string, options?: Partial<Omit<PersonalTask, 'id' | 'text' | 'createdAt' | 'updatedAt'>>) => void
    updatePersonalTask: (id: string, updates: Partial<PersonalTask>) => void
    deletePersonalTask: (id: string) => void

    // Lecture Notes
    addLectureNoteMeta: (meta: LectureNoteMeta) => void
    deleteLectureNoteMeta: (id: string) => void

    // Undo
    undo: () => void
    pushUndoSnapshot: () => void

    // Import
    importData: (courses: Course[], completionState: CompletionState, personalTasks: PersonalTask[]) => void

    // Selectors
    getCourse: (id: string) => Course | undefined
    getTaskById: (taskId: string) => { task: Task; course: Course; unit: Unit } | undefined
}

type PlannerStore = PlannerState & PlannerActions

const initialState: PlannerState = {
    courses: [],
    events: [],
    completionState: { completedTaskIds: [], completionHistory: {} },
    undoStack: [],
    personalTasks: [],
    lectureNotesMeta: [],
    isLoading: false,
    isInitialized: false,
    hasHydrated: false,
}

export const usePlannerStore = create<PlannerStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            initialize: () => {
                set({ isInitialized: true, isLoading: false })
            },

            setHasHydrated: (hasHydrated) => {
                set({ hasHydrated })
            },

            // ================== COURSES ==================
            addCourse: (title, code) => {
                const state = get()
                if (state.courses.length >= LIMITS.MAX_COURSES) {
                    console.warn('Max courses limit reached')
                    return
                }

                const colorIndex = state.courses.length % COURSE_COLORS.length
                const newCourse: Course = {
                    id: generateId(),
                    title,
                    code,
                    color: COURSE_COLORS[colorIndex],
                    units: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }

                set({ courses: [...state.courses, newCourse] })
            },

            updateCourse: (id, updates) => {
                set(state => ({
                    courses: state.courses.map(c =>
                        c.id === id
                            ? { ...c, ...updates, updatedAt: new Date().toISOString() }
                            : c
                    ),
                }))
            },

            deleteCourse: (id) => {
                set(state => ({
                    courses: state.courses.filter(c => c.id !== id),
                }))
            },

            // ================== UNITS ==================
            addUnit: (courseId, title) => {
                set(state => ({
                    courses: state.courses.map(c => {
                        if (c.id !== courseId) return c
                        if (c.units.length >= LIMITS.MAX_UNITS_PER_COURSE) return c

                        const newUnit: Unit = {
                            id: generateId(),
                            title,
                            order: c.units.length,
                            tasks: [],
                        }

                        return {
                            ...c,
                            units: [...c.units, newUnit],
                            updatedAt: new Date().toISOString(),
                        }
                    }),
                }))
            },

            updateUnit: (courseId, unitId, updates) => {
                set(state => ({
                    courses: state.courses.map(c =>
                        c.id === courseId
                            ? {
                                ...c,
                                units: c.units.map(u =>
                                    u.id === unitId ? { ...u, ...updates } : u
                                ),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }))
            },

            deleteUnit: (courseId, unitId) => {
                set(state => ({
                    courses: state.courses.map(c =>
                        c.id === courseId
                            ? {
                                ...c,
                                units: c.units.filter(u => u.id !== unitId),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }))
            },

            reorderUnits: (courseId, units) => {
                set(state => ({
                    courses: state.courses.map(c =>
                        c.id === courseId
                            ? { ...c, units, updatedAt: new Date().toISOString() }
                            : c
                    ),
                }))
            },

            // ================== TASKS ==================
            addTask: (courseId, unitId, text, options) => {
                const now = new Date().toISOString()
                const newTask: Task = {
                    id: generateId(),
                    text,
                    status: options?.status || 'todo',
                    isPriority: options?.isPriority,
                    dueDateISO: options?.dueDateISO,
                    note: options?.note,
                    tags: options?.tags,
                    createdAt: now,
                    updatedAt: now,
                }

                set(state => ({
                    courses: state.courses.map(c =>
                        c.id === courseId
                            ? {
                                ...c,
                                units: c.units.map(u =>
                                    u.id === unitId
                                        ? { ...u, tasks: [...u.tasks, newTask] }
                                        : u
                                ),
                                updatedAt: now,
                            }
                            : c
                    ),
                }))
            },

            updateTask: (courseId, unitId, taskId, updates) => {
                set(state => ({
                    courses: state.courses.map(c =>
                        c.id === courseId
                            ? {
                                ...c,
                                units: c.units.map(u =>
                                    u.id === unitId
                                        ? {
                                            ...u,
                                            tasks: u.tasks.map(t =>
                                                t.id === taskId
                                                    ? { ...t, ...updates, updatedAt: new Date().toISOString() }
                                                    : t
                                            ),
                                        }
                                        : u
                                ),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }))
            },

            deleteTask: (courseId, unitId, taskId) => {
                set(state => ({
                    courses: state.courses.map(c =>
                        c.id === courseId
                            ? {
                                ...c,
                                units: c.units.map(u =>
                                    u.id === unitId
                                        ? { ...u, tasks: u.tasks.filter(t => t.id !== taskId) }
                                        : u
                                ),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                    // Also remove from completed
                    completionState: {
                        ...state.completionState,
                        completedTaskIds: state.completionState.completedTaskIds.filter(id => id !== taskId),
                    },
                }))
            },

            toggleTaskCompletion: (taskId) => {
                set(state => {
                    const isCompleted = state.completionState.completedTaskIds.includes(taskId)
                    const now = new Date().toISOString()

                    if (isCompleted) {
                        // Uncomplete
                        const newHistory = { ...state.completionState.completionHistory }
                        delete newHistory[taskId]
                        return {
                            completionState: {
                                completedTaskIds: state.completionState.completedTaskIds.filter(id => id !== taskId),
                                completionHistory: newHistory,
                            },
                        }
                    } else {
                        // Complete
                        return {
                            completionState: {
                                completedTaskIds: [...state.completionState.completedTaskIds, taskId],
                                completionHistory: {
                                    ...state.completionState.completionHistory,
                                    [taskId]: now,
                                },
                            },
                        }
                    }
                })
            },

            updateTaskStatus: (taskId, status, courseId, unitId) => {
                get().updateTask(courseId, unitId, taskId, { status })

                // If status is 'done', also mark as completed
                if (status === 'done') {
                    const state = get()
                    if (!state.completionState.completedTaskIds.includes(taskId)) {
                        get().toggleTaskCompletion(taskId)
                    }
                }
            },

            // ================== EVENTS / EXAMS ==================
            addEvent: (data) => {
                const state = get()
                const now = new Date().toISOString()

                const newEvent: PlannerEvent = {
                    id: generateId(),
                    type: data.type,
                    courseId: data.courseId,
                    title: data.title,
                    dateISO: data.dateISO,
                    description: data.description,
                    color: data.color,
                    createdAt: now,
                    updatedAt: now,
                }

                set({ events: [...state.events, newEvent] })
            },

            updateEvent: (id, updates) => {
                const { id: _ignoredId, createdAt: _ignoredCreatedAt, updatedAt: _ignoredUpdatedAt, ...safeUpdates } = updates
                void _ignoredId
                void _ignoredCreatedAt
                void _ignoredUpdatedAt
                set(state => ({
                    events: state.events.map(e =>
                        e.id === id
                            ? { ...e, ...safeUpdates, updatedAt: new Date().toISOString() }
                            : e
                    ),
                }))
            },

            deleteEvent: (id) => {
                set(state => ({
                    events: state.events.filter(e => e.id !== id),
                }))
            },

            getCourseEvents: (courseId) => {
                return get()
                    .events
                    .filter(e => e.courseId === courseId)
                    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
            },

            // Backward-compatible exam helpers
            addExam: (courseId, title, dateISO, description) => {
                get().addEvent({ type: 'exam', courseId, title, dateISO, description })
            },

            updateExam: (_courseId, examId, updates) => {
                get().updateEvent(examId, updates)
            },

            deleteExam: (_courseId, examId) => {
                get().deleteEvent(examId)
            },

            // ================== PERSONAL TASKS ==================
            addPersonalTask: (text, options) => {
                const state = get()
                if (state.personalTasks.length >= LIMITS.MAX_PERSONAL_TASKS) {
                    console.warn('Max personal tasks limit reached')
                    return
                }

                const now = new Date().toISOString()
                const newTask: PersonalTask = {
                    id: generateId(),
                    text,
                    status: options?.status ?? 'todo',
                    isPriority: options?.isPriority,
                    dueDateISO: options?.dueDateISO,
                    note: options?.note,
                    createdAt: now,
                    updatedAt: now,
                }

                set({ personalTasks: [...state.personalTasks, newTask] })
            },

            updatePersonalTask: (id, updates) => {
                set(state => ({
                    personalTasks: state.personalTasks.map(t =>
                        t.id === id
                            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
                            : t
                    ),
                }))
            },

            deletePersonalTask: (id) => {
                set(state => ({
                    personalTasks: state.personalTasks.filter(t => t.id !== id),
                }))
            },

            // ================== LECTURE NOTES ==================
            addLectureNoteMeta: (meta) => {
                set(state => ({
                    lectureNotesMeta: [...state.lectureNotesMeta, meta],
                }))
            },

            deleteLectureNoteMeta: (id) => {
                set(state => ({
                    lectureNotesMeta: state.lectureNotesMeta.filter(m => m.id !== id),
                }))
            },

            // ================== UNDO ==================
            pushUndoSnapshot: () => {
                const state = get()
                const snapshot: UndoSnapshot = {
                    timestamp: new Date().toISOString(),
                    completedTaskIds: [...state.completionState.completedTaskIds],
                    completionHistory: { ...state.completionState.completionHistory },
                }

                const newStack = [...state.undoStack, snapshot].slice(-LIMITS.MAX_UNDO_STACK)
                set({ undoStack: newStack })
            },

            undo: () => {
                const state = get()
                if (state.undoStack.length === 0) return

                const lastSnapshot = state.undoStack[state.undoStack.length - 1]
                set({
                    completionState: {
                        completedTaskIds: lastSnapshot.completedTaskIds,
                        completionHistory: lastSnapshot.completionHistory,
                    },
                    undoStack: state.undoStack.slice(0, -1),
                })
            },

            // ================== IMPORT ==================
            importData: (courses, completionState, personalTasks) => {
                set({
                    courses,
                    completionState,
                    personalTasks,
                })
            },

            // ================== SELECTORS ==================
            getCourse: (id) => {
                return get().courses.find(c => c.id === id)
            },

            getTaskById: (taskId) => {
                const state = get()
                for (const course of state.courses) {
                    for (const unit of course.units) {
                        const task = unit.tasks.find(t => t.id === taskId)
                        if (task) {
                            return { task, course, unit }
                        }
                    }
                }
                return undefined
            },
        }),
        {
            name: 'lifeflow-planner',
            version: 2,
            migrate: (persistedState, version) => {
                if (version >= 2) return persistedState as PlannerStore

                type LegacyExam = {
                    id?: unknown
                    title?: unknown
                    examDateISO?: unknown
                    dateISO?: unknown
                    description?: unknown
                }
                type LegacyCourse = {
                    id?: unknown
                    color?: unknown
                    exams?: unknown
                }

                const state = persistedState as unknown as { courses?: unknown; events?: unknown } & Record<string, unknown>
                const now = new Date().toISOString()

                const courses: LegacyCourse[] = Array.isArray(state?.courses) ? (state.courses as LegacyCourse[]) : []
                const existingEvents: PlannerEvent[] = Array.isArray(state?.events) ? (state.events as PlannerEvent[]) : []

                const migratedEvents: PlannerEvent[] = [...existingEvents]

                for (const course of courses) {
                    const exams: LegacyExam[] = Array.isArray(course?.exams) ? (course.exams as LegacyExam[]) : []
                    for (const exam of exams) {
                        migratedEvents.push({
                            id: exam?.id ?? `${now}-${Math.random().toString(36).slice(2, 9)}`,
                            type: 'exam',
                            courseId: course?.id,
                            title: exam?.title ?? 'Sınav',
                            dateISO: exam?.examDateISO ?? exam?.dateISO ?? now.split('T')[0],
                            description: exam?.description,
                            color: course?.color,
                            createdAt: now,
                            updatedAt: now,
                        } as PlannerEvent)
                    }
                    delete course.exams
                }

                const seen = new Set<string>()
                const dedupedEvents: PlannerEvent[] = []
                for (const e of migratedEvents) {
                    if (!e?.id || seen.has(e.id)) continue
                    seen.add(e.id)
                    dedupedEvents.push(e)
                }

                return {
                    ...state,
                    courses,
                    events: dedupedEvents,
                    hasHydrated: false,
                } as PlannerStore
            },
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error('Failed to hydrate planner store:', error)
                }

                state?.setHasHydrated(true)

                // Legacy CalendarPage localStorage key migration
                const LEGACY_CALENDAR_EVENTS_KEY = 'planex-calendar-events'
                try {
                    const raw = localStorage.getItem(LEGACY_CALENDAR_EVENTS_KEY)
                    if (!raw) return

                    const parsed = JSON.parse(raw)
                    if (!Array.isArray(parsed)) return

                    const now = new Date().toISOString()
                    const migrated: PlannerEvent[] = parsed
                        .filter((e: unknown) => {
                            if (!e || typeof e !== 'object') return false
                            const obj = e as Record<string, unknown>
                            return typeof obj['title'] === 'string' && typeof obj['dateISO'] === 'string'
                        })
                        .map((e: unknown) => {
                            const obj = e as Record<string, unknown>
                            return {
                                id: typeof obj['id'] === 'string' ? obj['id'] : `${now}-${Math.random().toString(36).slice(2, 9)}`,
                                type: 'event',
                                courseId: typeof obj['courseId'] === 'string' ? obj['courseId'] : undefined,
                                title: obj['title'] as string,
                                dateISO: obj['dateISO'] as string,
                                description: typeof obj['description'] === 'string' ? obj['description'] : undefined,
                                color: typeof obj['color'] === 'string' ? obj['color'] : undefined,
                                createdAt: now,
                                updatedAt: now,
                            } as PlannerEvent
                        })

                    if (migrated.length > 0) {
                        const existing = state?.events ?? []
                        const seen = new Set<string>(existing.map(e => e.id))
                        const merged = [...existing, ...migrated.filter(e => !seen.has(e.id))]
                        usePlannerStore.setState({ events: merged }, false)
                    }

                    localStorage.removeItem(LEGACY_CALENDAR_EVENTS_KEY)
                } catch (e) {
                    console.warn('Failed to migrate legacy calendar events:', e)
                }
            },
            partialize: (state) => ({
                courses: state.courses,
                events: state.events,
                completionState: state.completionState,
                undoStack: state.undoStack,
                personalTasks: state.personalTasks,
                lectureNotesMeta: state.lectureNotesMeta,
            }),
        }
    )
)

// ================== HOOKS ==================

export function usePlanner() {
    return usePlannerStore()
}

// Computed selectors
export function usePlannerStats() {
    const courses = usePlannerStore(state => state.courses)
    const completionState = usePlannerStore(state => state.completionState)

    let totalTasks = 0
    let completedTasks = 0

    courses.forEach(course => {
        course.units.forEach(unit => {
            totalTasks += unit.tasks.length
            completedTasks += unit.tasks.filter(t =>
                completionState.completedTaskIds.includes(t.id)
            ).length
        })
    })

    return {
        totalCourses: courses.length,
        totalTasks,
        completedTasks,
        completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    }
}
