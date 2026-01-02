/**
 * Migration Service
 *
 * localStorage (Zustand persist) -> Dexie (IndexedDB) migration.
 *
 * Strateji:
 * 1. localStorage'dan legacy state'i oku ve validate et
 * 2. Dexie'ye atomic transaction ile yaz
 * 3. Migration flag'i kaydet
 * 4. Legacy data'yı hemen silme (rollback penceresi için 7 gün bekle)
 */

import { generateId, nowISO, plannerDb, todayKey } from '../database'
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
} from '../types'
import {
    LegacyHabitsStateSchema,
    LegacyPlannerStateSchema,
    type LegacyCourse,
    type LegacyEvent,
    type LegacyHabit,
    type LegacyHabitLog,
    type LegacyHabitsState,
    type LegacyPersonalTask,
    type LegacyPlannerState,
    type LegacyTask,
    type LegacyUnit,
    type MigrationFlags,
    type MigrationResult,
} from './types'

// ============================================
// Constants
// ============================================

const PLANNER_STORAGE_KEY = 'lifeflow-planner'
const HABITS_STORAGE_KEY = 'lifeflow-planner-habits'
const MIGRATION_FLAGS_KEY = 'planex-migration-flags'
const LEGACY_DATA_BACKUP_KEY = 'planex-legacy-backup'
const ROLLBACK_WINDOW_DAYS = 7

// ============================================
// Flag Management
// ============================================

/**
 * Get migration flags from localStorage
 */
export function getMigrationFlags(): MigrationFlags {
    try {
        const stored = localStorage.getItem(MIGRATION_FLAGS_KEY)
        if (stored) {
            return JSON.parse(stored)
        }
    } catch {
        // Ignore parse errors
    }

    return {
        plannerMigrated: false,
        habitsMigrated: false,
        migrationDate: '',
        rollbackAvailable: false,
        legacyDataPurged: false,
    }
}

/**
 * Save migration flags
 */
function saveMigrationFlags(flags: MigrationFlags): void {
    localStorage.setItem(MIGRATION_FLAGS_KEY, JSON.stringify(flags))
}

/**
 * Check if migration is needed
 */
export function isMigrationNeeded(): boolean {
    const flags = getMigrationFlags()

    // If already migrated, no need
    if (flags.plannerMigrated && flags.habitsMigrated) {
        return false
    }

    // Check if there's legacy data to migrate
    const hasPlannerData = !!localStorage.getItem(PLANNER_STORAGE_KEY)
    const hasHabitsData = !!localStorage.getItem(HABITS_STORAGE_KEY)

    return (hasPlannerData && !flags.plannerMigrated) ||
        (hasHabitsData && !flags.habitsMigrated)
}

// ============================================
// Data Extraction
// ============================================

/**
 * Extract legacy planner state from localStorage
 */
function extractLegacyPlannerState(): LegacyPlannerState | null {
    try {
        const raw = localStorage.getItem(PLANNER_STORAGE_KEY)
        if (!raw) return null

        const parsed = JSON.parse(raw)

        // Zustand persist wraps state in { state: ..., version: ... }
        const stateData = parsed.state || parsed

        // Validate with Zod
        const result = LegacyPlannerStateSchema.safeParse(stateData)
        if (!result.success) {
            console.warn('[Migration] Planner state validation failed:', result.error)
            // Try to salvage what we can
            return {
                courses: Array.isArray(stateData?.courses) ? stateData.courses : [],
                events: Array.isArray(stateData?.events) ? stateData.events : [],
                completionState: stateData?.completionState || { completedTaskIds: [], completionHistory: {} },
                personalTasks: Array.isArray(stateData?.personalTasks) ? stateData.personalTasks : [],
                lectureNotesMeta: Array.isArray(stateData?.lectureNotesMeta) ? stateData.lectureNotesMeta : [],
            }
        }

        return result.data
    } catch (error) {
        console.error('[Migration] Failed to extract planner state:', error)
        return null
    }
}

/**
 * Extract legacy habits state from localStorage
 */
function extractLegacyHabitsState(): LegacyHabitsState | null {
    try {
        const raw = localStorage.getItem(HABITS_STORAGE_KEY)
        if (!raw) return null

        const parsed = JSON.parse(raw)
        const stateData = parsed.state || parsed

        const result = LegacyHabitsStateSchema.safeParse(stateData)
        if (!result.success) {
            console.warn('[Migration] Habits state validation failed:', result.error)
            return {
                habits: Array.isArray(stateData?.habits) ? stateData.habits : [],
                habitLogs: stateData?.habitLogs || {},
            }
        }

        return result.data
    } catch (error) {
        console.error('[Migration] Failed to extract habits state:', error)
        return null
    }
}

// ============================================
// Data Transformation
// ============================================

/**
 * Transform legacy course to DB format
 */
function transformCourse(course: LegacyCourse, order: number): DBCourse {
    const now = nowISO()
    return {
        id: course.id,
        code: course.code,
        title: course.title,
        color: course.color,
        bgGradient: course.bgGradient,
        order,
        createdAt: course.createdAt || now,
        updatedAt: course.updatedAt || now,
    }
}

/**
 * Transform legacy unit to DB format
 */
function transformUnit(unit: LegacyUnit, courseId: string, order: number): DBUnit {
    const now = nowISO()
    return {
        id: unit.id,
        courseId,
        title: unit.title,
        order: unit.order ?? order,
        createdAt: now,
        updatedAt: now,
    }
}

/**
 * Transform legacy task to DB format
 */
function transformTask(
    task: LegacyTask,
    courseId: string,
    unitId: string,
    order: number,
    isCompleted: boolean,
    completedAt?: string
): DBTask {
    const now = nowISO()
    return {
        id: task.id,
        courseId,
        unitId,
        text: task.text,
        status: isCompleted ? 'done' : (task.status || 'todo'),
        isPriority: task.isPriority,
        dueDateISO: task.dueDateISO,
        completedAt: isCompleted ? (completedAt || now) : undefined,
        tags: task.tags,
        note: task.note,
        order,
        createdAt: task.createdAt || now,
        updatedAt: task.updatedAt || now,
    }
}

/**
 * Transform legacy event to DB format
 */
function transformEvent(event: LegacyEvent): DBPlannerEvent {
    const now = nowISO()
    return {
        id: event.id,
        type: event.type || 'event',
        courseId: event.courseId,
        title: event.title,
        dateISO: event.dateISO,
        description: event.description,
        color: event.color,
        createdAt: event.createdAt || now,
        updatedAt: event.updatedAt || now,
    }
}

/**
 * Transform legacy personal task to DB format
 */
function transformPersonalTask(task: LegacyPersonalTask, order: number): DBPersonalTask {
    const now = nowISO()
    return {
        id: task.id,
        text: task.text,
        status: task.status || 'todo',
        isPriority: task.isPriority,
        dueDateISO: task.dueDateISO,
        completedAt: task.status === 'done' ? now : undefined,
        note: task.note,
        order,
        createdAt: task.createdAt || now,
        updatedAt: task.updatedAt || now,
    }
}

/**
 * Transform legacy habit to DB format
 */
function transformHabit(habit: LegacyHabit, order: number): DBPlannerHabit {
    const now = nowISO()
    return {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        emoji: habit.emoji || '✨',
        type: habit.type || 'boolean',
        target: habit.target,
        unit: habit.unit,
        color: habit.color,
        frequency: {
            type: habit.frequency.type,
            timesPerWeek: habit.frequency.type === 'weeklyTarget'
                ? (habit.frequency as { timesPerWeek: number }).timesPerWeek
                : undefined,
            days: habit.frequency.type === 'specificDays'
                ? (habit.frequency as { days: number[] }).days
                : undefined,
            interval: habit.frequency.type === 'everyXDays'
                ? (habit.frequency as { interval: number }).interval
                : undefined,
        },
        isArchived: habit.isArchived || false,
        order: habit.manualOrder ?? order,
        createdAt: habit.createdAt || now,
        updatedAt: habit.updatedAt || now,
    }
}

/**
 * Transform legacy habit log to DB format
 */
function transformHabitLog(log: LegacyHabitLog): DBPlannerHabitLog {
    const now = nowISO()
    return {
        id: generateId(),
        habitId: log.habitId,
        dateISO: log.dateISO,
        done: log.done ?? false,
        value: log.value,
        createdAt: log.timestamp || now,
    }
}

// ============================================
// Migration Execution
// ============================================

/**
 * Migrate planner data from localStorage to Dexie
 */
export async function migratePlannerData(): Promise<MigrationResult> {
    const result: MigrationResult = {
        success: false,
        coursesCount: 0,
        unitsCount: 0,
        tasksCount: 0,
        eventsCount: 0,
        personalTasksCount: 0,
        habitsCount: 0,
        habitLogsCount: 0,
        errors: [],
        warnings: [],
    }

    const flags = getMigrationFlags()

    if (flags.plannerMigrated) {
        result.success = true
        result.warnings.push('Planner data already migrated')
        return result
    }

    const legacyState = extractLegacyPlannerState()
    if (!legacyState) {
        result.success = true
        result.warnings.push('No legacy planner data found')
        saveMigrationFlags({ ...flags, plannerMigrated: true, migrationDate: nowISO() })
        return result
    }

    try {
        // Backup legacy data before migration
        backupLegacyData('planner', legacyState)

        // Prepare all data
        const courses: DBCourse[] = []
        const units: DBUnit[] = []
        const tasks: DBTask[] = []
        const completionRecords: DBCompletionRecord[] = []
        const events: DBPlannerEvent[] = []
        const personalTasks: DBPersonalTask[] = []
        const lectureNotes: DBLectureNoteMeta[] = []

        const completedTaskIds = new Set(legacyState.completionState.completedTaskIds)
        const completionHistory = legacyState.completionState.completionHistory

        // Transform courses, units, tasks
        for (let courseIndex = 0; courseIndex < legacyState.courses.length; courseIndex++) {
            const course = legacyState.courses[courseIndex]
            courses.push(transformCourse(course, courseIndex))

            const courseUnits = course.units || []
            for (let unitIndex = 0; unitIndex < courseUnits.length; unitIndex++) {
                const unit = courseUnits[unitIndex]
                units.push(transformUnit(unit, course.id, unitIndex))

                const unitTasks = unit.tasks || []
                for (let taskIndex = 0; taskIndex < unitTasks.length; taskIndex++) {
                    const task = unitTasks[taskIndex]
                    const isCompleted = completedTaskIds.has(task.id)
                    const completedAt = completionHistory[task.id]

                    tasks.push(transformTask(
                        task,
                        course.id,
                        unit.id,
                        taskIndex,
                        isCompleted,
                        completedAt
                    ))

                    // Create completion record if completed
                    if (isCompleted) {
                        completionRecords.push({
                            id: generateId(),
                            taskId: task.id,
                            completedAt: completedAt || nowISO(),
                            dateKey: completedAt
                                ? completedAt.split('T')[0]
                                : todayKey(),
                        })
                    }
                }
            }
        }

        // Transform events
        legacyState.events.forEach(event => {
            events.push(transformEvent(event))
        })

        // Transform personal tasks
        legacyState.personalTasks.forEach((task, index) => {
            personalTasks.push(transformPersonalTask(task, index))
        })

        // Transform lecture notes
        legacyState.lectureNotesMeta.forEach(meta => {
            lectureNotes.push({
                id: meta.id,
                courseId: meta.courseId,
                name: meta.name,
                fileName: meta.fileName,
                uploadDateISO: meta.uploadDateISO,
                unitTitle: meta.unitTitle,
                fileSize: meta.fileSize,
            })
        })

        // Write to Dexie in a transaction
        await plannerDb.transaction('rw',
            [
                plannerDb.courses,
                plannerDb.units,
                plannerDb.tasks,
                plannerDb.completionRecords,
                plannerDb.events,
                plannerDb.personalTasks,
                plannerDb.lectureNotesMeta,
            ],
            async () => {
                // Clear existing data (in case of retry)
                await Promise.all([
                    plannerDb.courses.clear(),
                    plannerDb.units.clear(),
                    plannerDb.tasks.clear(),
                    plannerDb.completionRecords.clear(),
                    plannerDb.events.clear(),
                    plannerDb.personalTasks.clear(),
                    plannerDb.lectureNotesMeta.clear(),
                ])

                // Bulk add
                if (courses.length) await plannerDb.courses.bulkAdd(courses)
                if (units.length) await plannerDb.units.bulkAdd(units)
                if (tasks.length) await plannerDb.tasks.bulkAdd(tasks)
                if (completionRecords.length) await plannerDb.completionRecords.bulkAdd(completionRecords)
                if (events.length) await plannerDb.events.bulkAdd(events)
                if (personalTasks.length) await plannerDb.personalTasks.bulkAdd(personalTasks)
                if (lectureNotes.length) await plannerDb.lectureNotesMeta.bulkAdd(lectureNotes)
            }
        )

        // Update counts
        result.coursesCount = courses.length
        result.unitsCount = units.length
        result.tasksCount = tasks.length
        result.eventsCount = events.length
        result.personalTasksCount = personalTasks.length
        result.success = true

        // Update flags
        saveMigrationFlags({
            ...flags,
            plannerMigrated: true,
            migrationDate: nowISO(),
            rollbackAvailable: true,
        })

        console.log('[Migration] Planner data migrated successfully:', result)

    } catch (error) {
        result.errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`)
        console.error('[Migration] Failed:', error)
    }

    return result
}

/**
 * Migrate habits data from localStorage to Dexie
 */
export async function migrateHabitsData(): Promise<MigrationResult> {
    const result: MigrationResult = {
        success: false,
        coursesCount: 0,
        unitsCount: 0,
        tasksCount: 0,
        eventsCount: 0,
        personalTasksCount: 0,
        habitsCount: 0,
        habitLogsCount: 0,
        errors: [],
        warnings: [],
    }

    const flags = getMigrationFlags()

    if (flags.habitsMigrated) {
        result.success = true
        result.warnings.push('Habits data already migrated')
        return result
    }

    const legacyState = extractLegacyHabitsState()
    if (!legacyState) {
        result.success = true
        result.warnings.push('No legacy habits data found')
        saveMigrationFlags({ ...flags, habitsMigrated: true })
        return result
    }

    try {
        // Backup legacy data
        backupLegacyData('habits', legacyState)

        // Prepare data
        const habits: DBPlannerHabit[] = []
        const habitLogs: DBPlannerHabitLog[] = []

        // Transform habits
        legacyState.habits.forEach((habit, index) => {
            habits.push(transformHabit(habit, index))
        })

        // Transform habit logs
        Object.entries(legacyState.habitLogs).forEach(([habitId, logs]) => {
            logs.forEach(log => {
                habitLogs.push(transformHabitLog({ ...log, habitId }))
            })
        })

        // Write to Dexie
        await plannerDb.transaction('rw',
            plannerDb.habits,
            plannerDb.habitLogs,
            async () => {
                await plannerDb.habits.clear()
                await plannerDb.habitLogs.clear()

                if (habits.length) await plannerDb.habits.bulkAdd(habits)
                if (habitLogs.length) await plannerDb.habitLogs.bulkAdd(habitLogs)
            }
        )

        result.habitsCount = habits.length
        result.habitLogsCount = habitLogs.length
        result.success = true

        saveMigrationFlags({
            ...flags,
            habitsMigrated: true,
        })

        console.log('[Migration] Habits data migrated successfully:', result)

    } catch (error) {
        result.errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`)
        console.error('[Migration] Habits migration failed:', error)
    }

    return result
}

/**
 * Run full migration
 */
export async function runFullMigration(): Promise<MigrationResult> {
    const plannerResult = await migratePlannerData()
    const habitsResult = await migrateHabitsData()

    return {
        success: plannerResult.success && habitsResult.success,
        coursesCount: plannerResult.coursesCount,
        unitsCount: plannerResult.unitsCount,
        tasksCount: plannerResult.tasksCount,
        eventsCount: plannerResult.eventsCount,
        personalTasksCount: plannerResult.personalTasksCount,
        habitsCount: habitsResult.habitsCount,
        habitLogsCount: habitsResult.habitLogsCount,
        errors: [...plannerResult.errors, ...habitsResult.errors],
        warnings: [...plannerResult.warnings, ...habitsResult.warnings],
    }
}

// ============================================
// Backup & Rollback
// ============================================

/**
 * Backup legacy data for potential rollback
 */
function backupLegacyData(key: string, data: unknown): void {
    try {
        const backup = {
            key,
            data,
            backedUpAt: nowISO(),
        }

        const existingBackups = getLegacyBackups()
        existingBackups[key] = backup

        localStorage.setItem(LEGACY_DATA_BACKUP_KEY, JSON.stringify(existingBackups))
    } catch (error) {
        console.warn('[Migration] Failed to backup legacy data:', error)
    }
}

/**
 * Get all legacy backups
 */
function getLegacyBackups(): Record<string, unknown> {
    try {
        const raw = localStorage.getItem(LEGACY_DATA_BACKUP_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

/**
 * Check if rollback is still possible
 */
export function canRollback(): boolean {
    const flags = getMigrationFlags()
    if (!flags.rollbackAvailable || flags.legacyDataPurged) {
        return false
    }

    // Check if within rollback window
    if (flags.migrationDate) {
        const migrationDate = new Date(flags.migrationDate)
        const now = new Date()
        const daysSinceMigration = (now.getTime() - migrationDate.getTime()) / (1000 * 60 * 60 * 24)

        if (daysSinceMigration > ROLLBACK_WINDOW_DAYS) {
            return false
        }
    }

    return !!localStorage.getItem(LEGACY_DATA_BACKUP_KEY)
}

/**
 * Rollback migration (restore from localStorage)
 */
export async function rollbackMigration(): Promise<boolean> {
    if (!canRollback()) {
        console.warn('[Migration] Rollback not available')
        return false
    }

    try {
        // Clear Dexie data
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

        // Reset flags
        saveMigrationFlags({
            plannerMigrated: false,
            habitsMigrated: false,
            migrationDate: '',
            rollbackAvailable: false,
            legacyDataPurged: false,
        })

        console.log('[Migration] Rollback completed')
        return true

    } catch (error) {
        console.error('[Migration] Rollback failed:', error)
        return false
    }
}

/**
 * Purge legacy data after rollback window expires
 */
export function purgeLegacyData(): void {
    const flags = getMigrationFlags()

    if (!flags.plannerMigrated || !flags.habitsMigrated) {
        console.warn('[Migration] Cannot purge - migration not complete')
        return
    }

    if (flags.migrationDate) {
        const migrationDate = new Date(flags.migrationDate)
        const now = new Date()
        const daysSinceMigration = (now.getTime() - migrationDate.getTime()) / (1000 * 60 * 60 * 24)

        if (daysSinceMigration < ROLLBACK_WINDOW_DAYS) {
            console.log(`[Migration] Rollback window still active (${Math.ceil(ROLLBACK_WINDOW_DAYS - daysSinceMigration)} days remaining)`)
            return
        }
    }

    // Remove legacy data
    localStorage.removeItem(PLANNER_STORAGE_KEY)
    localStorage.removeItem(HABITS_STORAGE_KEY)
    localStorage.removeItem(LEGACY_DATA_BACKUP_KEY)

    // Update flags
    saveMigrationFlags({
        ...flags,
        rollbackAvailable: false,
        legacyDataPurged: true,
    })

    console.log('[Migration] Legacy data purged')
}
