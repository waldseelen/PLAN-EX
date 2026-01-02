/**
 * Unit Queries
 *
 * Dexie query fonksiyonları ve React hooks.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { generateId, nowISO, plannerDb } from '../database'
import type { DBUnit, UnitWithTasks } from '../types'

// ============================================
// Query Functions
// ============================================

/**
 * Get units by course ID (ordered)
 */
export async function getUnitsByCourse(courseId: string): Promise<DBUnit[]> {
    return plannerDb.units
        .where('[courseId+order]')
        .between([courseId, Dexie.minKey], [courseId, Dexie.maxKey])
        .toArray()
}

/**
 * Get unit by ID
 */
export async function getUnitById(id: string): Promise<DBUnit | undefined> {
    return plannerDb.units.get(id)
}

/**
 * Get units with their tasks
 */
export async function getUnitsWithTasks(courseId: string): Promise<UnitWithTasks[]> {
    const units = await getUnitsByCourse(courseId)

    return Promise.all(
        units.map(async (unit) => {
            const tasks = await plannerDb.tasks
                .where('[courseId+unitId+order]')
                .between(
                    [courseId, unit.id, Dexie.minKey],
                    [courseId, unit.id, Dexie.maxKey]
                )
                .toArray()

            return {
                ...unit,
                tasks,
            }
        })
    )
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Add a new unit
 */
export async function addUnit(data: {
    courseId: string
    title: string
}): Promise<string> {
    const existingUnits = await getUnitsByCourse(data.courseId)
    const now = nowISO()
    const id = generateId()

    await plannerDb.units.add({
        id,
        courseId: data.courseId,
        title: data.title,
        order: existingUnits.length,
        createdAt: now,
        updatedAt: now,
    })

    // Update course updatedAt
    await plannerDb.courses.update(data.courseId, {
        updatedAt: now,
    })

    return id
}

/**
 * Update a unit
 */
export async function updateUnit(
    id: string,
    updates: Partial<Omit<DBUnit, 'id' | 'courseId' | 'createdAt'>>
): Promise<void> {
    const unit = await getUnitById(id)
    if (!unit) return

    await plannerDb.units.update(id, {
        ...updates,
        updatedAt: nowISO(),
    })

    // Update course updatedAt
    await plannerDb.courses.update(unit.courseId, {
        updatedAt: nowISO(),
    })
}

/**
 * Delete a unit and its tasks
 */
export async function deleteUnit(id: string): Promise<void> {
    const unit = await getUnitById(id)
    if (!unit) return

    await plannerDb.transaction('rw',
        plannerDb.units,
        plannerDb.tasks,
        plannerDb.completionRecords,
        plannerDb.courses,
        async () => {
            // Get all tasks for completion records cleanup
            const tasks = await plannerDb.tasks
                .where('unitId')
                .equals(id)
                .toArray()

            const taskIds = tasks.map(t => t.id)

            // Delete completion records
            if (taskIds.length > 0) {
                await plannerDb.completionRecords
                    .where('taskId')
                    .anyOf(taskIds)
                    .delete()
            }

            // Delete tasks
            await plannerDb.tasks.where('unitId').equals(id).delete()

            // Delete unit
            await plannerDb.units.delete(id)

            // Update course
            await plannerDb.courses.update(unit.courseId, {
                updatedAt: nowISO(),
            })
        }
    )
}

/**
 * Reorder units within a course
 */
export async function reorderUnits(courseId: string, orderedIds: string[]): Promise<void> {
    await plannerDb.transaction('rw', plannerDb.units, plannerDb.courses, async () => {
        const now = nowISO()
        const updates = orderedIds.map((id, index) =>
            plannerDb.units.update(id, {
                order: index,
                updatedAt: now,
            })
        )
        await Promise.all(updates)

        await plannerDb.courses.update(courseId, {
            updatedAt: now,
        })
    })
}

// ============================================
// React Hooks
// ============================================

// Import Dexie for minKey/maxKey
import Dexie from 'dexie'

/**
 * Hook: Get units by course (live)
 */
export function useUnitsByCourse(courseId: string): DBUnit[] {
    return useLiveQuery(
        () => getUnitsByCourse(courseId),
        [courseId],
        []
    )
}

/**
 * Hook: Get unit by ID (live)
 */
export function useUnit(id: string): DBUnit | undefined {
    return useLiveQuery(
        () => getUnitById(id),
        [id],
        undefined
    )
}

/**
 * Hook: Get units with tasks (live)
 */
export function useUnitsWithTasks(courseId: string): UnitWithTasks[] {
    return useLiveQuery(
        () => getUnitsWithTasks(courseId),
        [courseId],
        []
    )
}
