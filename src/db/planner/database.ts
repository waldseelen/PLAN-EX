/**
 * Planner Database
 *
 * Dexie.js ile IndexedDB yönetimi.
 * Tüm planner entity'leri (courses, units, tasks, events, habits) burada.
 *
 * Index Stratejisi:
 * - units: [courseId+order] - course'a göre sıralı fetch
 * - tasks: [courseId+status], [unitId+status], dueDateISO, completedAt
 * - events: dateISO, [courseId+dateISO], [type+dateISO]
 * - habits: isArchived, [isArchived+order]
 * - habitLogs: [habitId+dateISO], dateISO
 * - completionRecords: dateKey, taskId
 */

import Dexie, { type EntityTable } from 'dexie'
import type {
    DBCompletionRecord,
    DBCourse,
    DBLectureNoteMeta,
    DBPersonalTask,
    DBPlannerEvent,
    DBPlannerHabit,
    DBPlannerHabitLog,
    DBTask,
    DBUnit,
} from './types'

export class PlannerDatabase extends Dexie {
    // Tables
    courses!: EntityTable<DBCourse, 'id'>
    units!: EntityTable<DBUnit, 'id'>
    tasks!: EntityTable<DBTask, 'id'>
    events!: EntityTable<DBPlannerEvent, 'id'>
    personalTasks!: EntityTable<DBPersonalTask, 'id'>
    habits!: EntityTable<DBPlannerHabit, 'id'>
    habitLogs!: EntityTable<DBPlannerHabitLog, 'id'>
    completionRecords!: EntityTable<DBCompletionRecord, 'id'>
    lectureNotesMeta!: EntityTable<DBLectureNoteMeta, 'id'>

    constructor() {
        super('planex-planner')

        // ============================================
        // Version 1 - Initial Schema
        // ============================================
        this.version(1).stores({
            // Core entities
            courses: 'id, order, createdAt',
            units: 'id, courseId, [courseId+order], order',
            tasks: 'id, courseId, unitId, status, dueDateISO, completedAt, [courseId+status], [unitId+status], [courseId+unitId+order]',

            // Events/Exams
            events: 'id, dateISO, courseId, type, [courseId+dateISO], [type+dateISO]',

            // Personal tasks
            personalTasks: 'id, status, dueDateISO, completedAt, order',

            // Habits
            habits: 'id, isArchived, order, [isArchived+order]',
            habitLogs: 'id, habitId, dateISO, [habitId+dateISO]',

            // Completion tracking
            completionRecords: 'id, taskId, dateKey, completedAt',

            // Lecture notes
            lectureNotesMeta: 'id, courseId, uploadDateISO',
        })
    }
}

// Singleton instance
export const plannerDb = new PlannerDatabase()

// ============================================
// Helper Functions
// ============================================

/**
 * Generate unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get current ISO timestamp
 */
export function nowISO(): string {
    return new Date().toISOString()
}

/**
 * Get today's date key (YYYY-MM-DD)
 */
export function todayKey(): string {
    return new Date().toISOString().split('T')[0]
}

/**
 * Clear all planner data (for testing/reset)
 */
export async function clearPlannerData(): Promise<void> {
    // Use array notation for more than 6 tables
    await plannerDb.transaction('rw',
        [
            plannerDb.courses,
            plannerDb.units,
            plannerDb.tasks,
            plannerDb.events,
            plannerDb.personalTasks,
            plannerDb.habits,
            plannerDb.habitLogs,
            plannerDb.completionRecords,
            plannerDb.lectureNotesMeta,
        ],
        async () => {
            await Promise.all([
                plannerDb.courses.clear(),
                plannerDb.units.clear(),
                plannerDb.tasks.clear(),
                plannerDb.events.clear(),
                plannerDb.personalTasks.clear(),
                plannerDb.habits.clear(),
                plannerDb.habitLogs.clear(),
                plannerDb.completionRecords.clear(),
                plannerDb.lectureNotesMeta.clear(),
            ])
        }
    )
}
