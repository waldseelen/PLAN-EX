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
    Exam,
    LectureNoteMeta,
    LIMITS,
    PersonalTask,
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
    completionState: CompletionState
    undoStack: UndoSnapshot[]
    personalTasks: PersonalTask[]
    lectureNotesMeta: LectureNoteMeta[]

    // State
    isLoading: boolean
    isInitialized: boolean
}

interface PlannerActions {
    // Initialize
    initialize: () => void

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

    // Exams
    addExam: (courseId: string, title: string, examDateISO: string, description?: string) => void
    updateExam: (courseId: string, examId: string, updates: Partial<Exam>) => void
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
    completionState: { completedTaskIds: [], completionHistory: {} },
    undoStack: [],
    personalTasks: [],
    lectureNotesMeta: [],
    isLoading: false,
    isInitialized: false,
}

export const usePlannerStore = create<PlannerStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            initialize: () => {
                set({ isInitialized: true, isLoading: false })
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
                    exams: [],
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

            // ================== EXAMS ==================
            addExam: (courseId, title, examDateISO, description) => {
                const newExam: Exam = {
                    id: generateId(),
                    title,
                    examDateISO,
                    description,
                }

                set(state => ({
                    courses: state.courses.map(c =>
                        c.id === courseId
                            ? {
                                ...c,
                                exams: [...c.exams, newExam],
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }))
            },

            updateExam: (courseId, examId, updates) => {
                set(state => ({
                    courses: state.courses.map(c =>
                        c.id === courseId
                            ? {
                                ...c,
                                exams: c.exams.map(e =>
                                    e.id === examId ? { ...e, ...updates } : e
                                ),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }))
            },

            deleteExam: (courseId, examId) => {
                set(state => ({
                    courses: state.courses.map(c =>
                        c.id === courseId
                            ? {
                                ...c,
                                exams: c.exams.filter(e => e.id !== examId),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }))
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
            version: 1,
            partialize: (state) => ({
                courses: state.courses,
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
