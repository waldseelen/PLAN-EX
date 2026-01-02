/**
 * Personal Task Queries
 *
 * Dexie query fonksiyonları ve React hooks.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { generateId, nowISO, plannerDb, todayKey } from '../database'
import type { DBPersonalTask, TaskStatus } from '../types'

// ============================================
// Query Functions
// ============================================

/**
 * Get all personal tasks ordered
 */
export async function getAllPersonalTasks(): Promise<DBPersonalTask[]> {
    return plannerDb.personalTasks.orderBy('order').toArray()
}

/**
 * Get personal task by ID
 */
export async function getPersonalTaskById(id: string): Promise<DBPersonalTask | undefined> {
    return plannerDb.personalTasks.get(id)
}

/**
 * Get personal tasks by status
 */
export async function getPersonalTasksByStatus(status: TaskStatus): Promise<DBPersonalTask[]> {
    return plannerDb.personalTasks
        .where('status')
        .equals(status)
        .sortBy('order')
}

/**
 * Get personal tasks due today
 */
export async function getPersonalTasksDueToday(): Promise<DBPersonalTask[]> {
    const today = todayKey()
    return plannerDb.personalTasks
        .where('dueDateISO')
        .equals(today)
        .toArray()
}

/**
 * Get overdue personal tasks
 */
export async function getOverduePersonalTasks(): Promise<DBPersonalTask[]> {
    const today = todayKey()
    return plannerDb.personalTasks
        .where('dueDateISO')
        .below(today)
        .filter(t => t.status !== 'done')
        .toArray()
}

/**
 * Get incomplete personal tasks
 */
export async function getIncompletePersonalTasks(): Promise<DBPersonalTask[]> {
    const tasks = await getAllPersonalTasks()
    return tasks.filter(t => t.status !== 'done')
}

/**
 * Get completed personal tasks count
 */
export async function getCompletedPersonalTasksCount(): Promise<number> {
    return plannerDb.personalTasks
        .where('status')
        .equals('done')
        .count()
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Add a new personal task
 */
export async function addPersonalTask(data: {
    text: string
    status?: TaskStatus
    isPriority?: boolean
    dueDateISO?: string
    note?: string
}): Promise<string> {
    const count = await plannerDb.personalTasks.count()
    const now = nowISO()
    const id = generateId()

    await plannerDb.personalTasks.add({
        id,
        text: data.text,
        status: data.status ?? 'todo',
        isPriority: data.isPriority,
        dueDateISO: data.dueDateISO,
        note: data.note,
        order: count,
        createdAt: now,
        updatedAt: now,
    })

    return id
}

/**
 * Update a personal task
 */
export async function updatePersonalTask(
    id: string,
    updates: Partial<Omit<DBPersonalTask, 'id' | 'createdAt'>>
): Promise<void> {
    const task = await getPersonalTaskById(id)
    if (!task) return

    const now = nowISO()
    const updateData: Partial<DBPersonalTask> = {
        ...updates,
        updatedAt: now,
    }

    // Track completedAt
    if (updates.status === 'done' && task.status !== 'done') {
        updateData.completedAt = now
    } else if (updates.status && updates.status !== 'done' && task.status === 'done') {
        updateData.completedAt = undefined
    }

    await plannerDb.personalTasks.update(id, updateData)
}

/**
 * Toggle personal task completion
 */
export async function togglePersonalTaskCompletion(id: string): Promise<boolean> {
    const task = await getPersonalTaskById(id)
    if (!task) return false

    const isDone = task.status === 'done'
    const newStatus: TaskStatus = isDone ? 'todo' : 'done'

    await updatePersonalTask(id, { status: newStatus })

    return !isDone
}

/**
 * Delete a personal task
 */
export async function deletePersonalTask(id: string): Promise<void> {
    await plannerDb.personalTasks.delete(id)
}

/**
 * Reorder personal tasks
 */
export async function reorderPersonalTasks(orderedIds: string[]): Promise<void> {
    await plannerDb.transaction('rw', plannerDb.personalTasks, async () => {
        const now = nowISO()
        const updates = orderedIds.map((id, index) =>
            plannerDb.personalTasks.update(id, {
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

/**
 * Hook: Get all personal tasks (live)
 */
export function usePersonalTasks(): DBPersonalTask[] {
    return useLiveQuery(getAllPersonalTasks, [], [])
}

/**
 * Hook: Get personal task by ID (live)
 */
export function usePersonalTask(id: string): DBPersonalTask | undefined {
    return useLiveQuery(
        () => getPersonalTaskById(id),
        [id],
        undefined
    )
}

/**
 * Hook: Get personal tasks by status (live)
 */
export function usePersonalTasksByStatus(status: TaskStatus): DBPersonalTask[] {
    return useLiveQuery(
        () => getPersonalTasksByStatus(status),
        [status],
        []
    )
}

/**
 * Hook: Get incomplete personal tasks (live)
 */
export function useIncompletePersonalTasks(): DBPersonalTask[] {
    return useLiveQuery(getIncompletePersonalTasks, [], [])
}

/**
 * Hook: Get personal tasks due today (live)
 */
export function usePersonalTasksDueToday(): DBPersonalTask[] {
    return useLiveQuery(getPersonalTasksDueToday, [], [])
}
