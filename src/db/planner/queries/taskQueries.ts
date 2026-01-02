/**
 * Task Queries
 *
 * Dexie query fonksiyonları ve React hooks.
 * Index-based queries for performance.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { generateId, nowISO, plannerDb, todayKey } from '../database'
import type { DBTask, TaskFilter, TaskStatus } from '../types'

// ============================================
// Query Functions
// ============================================

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<DBTask | undefined> {
    return plannerDb.tasks.get(id)
}

/**
 * Get tasks by unit (ordered)
 */
export async function getTasksByUnit(courseId: string, unitId: string): Promise<DBTask[]> {
    return plannerDb.tasks
        .where('[courseId+unitId+order]')
        .between(
            [courseId, unitId, Dexie.minKey],
            [courseId, unitId, Dexie.maxKey]
        )
        .toArray()
}

/**
 * Get tasks by course
 */
export async function getTasksByCourse(courseId: string): Promise<DBTask[]> {
    return plannerDb.tasks
        .where('courseId')
        .equals(courseId)
        .toArray()
}

/**
 * Get tasks by status for a course
 */
export async function getTasksByCourseAndStatus(
    courseId: string,
    status: TaskStatus
): Promise<DBTask[]> {
    return plannerDb.tasks
        .where('[courseId+status]')
        .equals([courseId, status])
        .toArray()
}

/**
 * Get tasks with due date in range
 */
export async function getTasksByDueDateRange(
    startISO: string,
    endISO: string
): Promise<DBTask[]> {
    return plannerDb.tasks
        .where('dueDateISO')
        .between(startISO, endISO, true, true)
        .toArray()
}

/**
 * Get tasks due today
 */
export async function getTasksDueToday(): Promise<DBTask[]> {
    const today = todayKey()
    return plannerDb.tasks
        .where('dueDateISO')
        .equals(today)
        .toArray()
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(): Promise<DBTask[]> {
    const today = todayKey()
    return plannerDb.tasks
        .where('dueDateISO')
        .below(today)
        .filter(t => t.status !== 'done')
        .toArray()
}

/**
 * Get completed tasks count by course
 */
export async function getCompletedTasksCount(courseId: string): Promise<number> {
    return plannerDb.tasks
        .where('[courseId+status]')
        .equals([courseId, 'done'])
        .count()
}

/**
 * Get total tasks count by course
 */
export async function getTotalTasksCount(courseId: string): Promise<number> {
    return plannerDb.tasks
        .where('courseId')
        .equals(courseId)
        .count()
}

/**
 * Get task with course and unit info (for lookups)
 */
export async function getTaskWithContext(taskId: string): Promise<{
    task: DBTask
    courseName: string
    unitName: string
} | undefined> {
    const task = await getTaskById(taskId)
    if (!task) return undefined

    const [course, unit] = await Promise.all([
        plannerDb.courses.get(task.courseId),
        plannerDb.units.get(task.unitId),
    ])

    return {
        task,
        courseName: course?.title ?? '',
        unitName: unit?.title ?? '',
    }
}

/**
 * Filter tasks with multiple criteria
 */
export async function filterTasks(filter: TaskFilter): Promise<DBTask[]> {
    let collection = plannerDb.tasks.toCollection()

    if (filter.courseId && filter.status) {
        collection = plannerDb.tasks
            .where('[courseId+status]')
            .equals([filter.courseId, filter.status])
    } else if (filter.unitId && filter.status) {
        collection = plannerDb.tasks
            .where('[unitId+status]')
            .equals([filter.unitId, filter.status])
    } else if (filter.courseId) {
        collection = plannerDb.tasks.where('courseId').equals(filter.courseId)
    } else if (filter.unitId) {
        collection = plannerDb.tasks.where('unitId').equals(filter.unitId)
    } else if (filter.status) {
        collection = plannerDb.tasks.where('status').equals(filter.status)
    }

    let results = await collection.toArray()

    // Additional in-memory filters for complex criteria
    if (filter.hasDueDate !== undefined) {
        results = results.filter(t =>
            filter.hasDueDate ? !!t.dueDateISO : !t.dueDateISO
        )
    }

    if (filter.isPriority !== undefined) {
        results = results.filter(t => t.isPriority === filter.isPriority)
    }

    return results
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Add a new task
 */
export async function addTask(data: {
    courseId: string
    unitId: string
    text: string
    status?: TaskStatus
    isPriority?: boolean
    dueDateISO?: string
    tags?: string[]
    note?: string
}): Promise<string> {
    const existingTasks = await getTasksByUnit(data.courseId, data.unitId)
    const now = nowISO()
    const id = generateId()

    await plannerDb.tasks.add({
        id,
        courseId: data.courseId,
        unitId: data.unitId,
        text: data.text,
        status: data.status ?? 'todo',
        isPriority: data.isPriority,
        dueDateISO: data.dueDateISO,
        tags: data.tags,
        note: data.note,
        order: existingTasks.length,
        createdAt: now,
        updatedAt: now,
    })

    return id
}

/**
 * Update a task
 */
export async function updateTask(
    id: string,
    updates: Partial<Omit<DBTask, 'id' | 'courseId' | 'unitId' | 'createdAt'>>
): Promise<void> {
    const task = await getTaskById(id)
    if (!task) return

    const now = nowISO()
    const updateData: Partial<DBTask> = {
        ...updates,
        updatedAt: now,
    }

    // If status changed to done, record completedAt
    if (updates.status === 'done' && task.status !== 'done') {
        updateData.completedAt = now

        // Add completion record
        await plannerDb.completionRecords.add({
            id: generateId(),
            taskId: id,
            completedAt: now,
            dateKey: todayKey(),
        })
    } else if (updates.status && updates.status !== 'done' && task.status === 'done') {
        // Status changed from done to something else
        updateData.completedAt = undefined

        // Remove completion record
        await plannerDb.completionRecords
            .where('taskId')
            .equals(id)
            .delete()
    }

    await plannerDb.tasks.update(id, updateData)
}

/**
 * Toggle task completion
 */
export async function toggleTaskCompletion(id: string): Promise<boolean> {
    const task = await getTaskById(id)
    if (!task) return false

    const isDone = task.status === 'done'
    const newStatus: TaskStatus = isDone ? 'todo' : 'done'

    await updateTask(id, { status: newStatus })

    return !isDone
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
    await plannerDb.transaction('rw',
        plannerDb.tasks,
        plannerDb.completionRecords,
        async () => {
            await plannerDb.completionRecords
                .where('taskId')
                .equals(id)
                .delete()
            await plannerDb.tasks.delete(id)
        }
    )
}

/**
 * Reorder tasks within a unit
 */
export async function reorderTasks(
    courseId: string,
    unitId: string,
    orderedIds: string[]
): Promise<void> {
    await plannerDb.transaction('rw', plannerDb.tasks, async () => {
        const now = nowISO()
        const updates = orderedIds.map((id, index) =>
            plannerDb.tasks.update(id, {
                order: index,
                updatedAt: now,
            })
        )
        await Promise.all(updates)
    })
}

// ============================================
// React Hooks
// ============================================

import Dexie from 'dexie'

/**
 * Hook: Get task by ID (live)
 */
export function useTask(id: string): DBTask | undefined {
    return useLiveQuery(
        () => getTaskById(id),
        [id],
        undefined
    )
}

/**
 * Hook: Get tasks by unit (live)
 */
export function useTasksByUnit(courseId: string, unitId: string): DBTask[] {
    return useLiveQuery(
        () => getTasksByUnit(courseId, unitId),
        [courseId, unitId],
        []
    )
}

/**
 * Hook: Get tasks by course (live)
 */
export function useTasksByCourse(courseId: string): DBTask[] {
    return useLiveQuery(
        () => getTasksByCourse(courseId),
        [courseId],
        []
    )
}

/**
 * Hook: Get tasks due today (live)
 */
export function useTasksDueToday(): DBTask[] {
    return useLiveQuery(getTasksDueToday, [], [])
}

/**
 * Hook: Get overdue tasks (live)
 */
export function useOverdueTasks(): DBTask[] {
    return useLiveQuery(getOverdueTasks, [], [])
}

/**
 * Hook: Get course progress (live)
 */
export function useCourseProgress(courseId: string): { total: number; completed: number; percent: number } {
    return useLiveQuery(
        async () => {
            const [total, completed] = await Promise.all([
                getTotalTasksCount(courseId),
                getCompletedTasksCount(courseId),
            ])
            return {
                total,
                completed,
                percent: total > 0 ? Math.round((completed / total) * 100) : 0,
            }
        },
        [courseId],
        { total: 0, completed: 0, percent: 0 }
    )
}
