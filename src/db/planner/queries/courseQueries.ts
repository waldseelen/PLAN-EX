/**
 * Course Queries
 *
 * Dexie query fonksiyonları ve React hooks.
 * useLiveQuery ile reaktif veri okuma.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { generateId, nowISO, plannerDb } from '../database'
import type { CourseWithProgress, DBCourse } from '../types'

// ============================================
// Query Functions
// ============================================

/**
 * Get all courses ordered
 */
export async function getAllCourses(): Promise<DBCourse[]> {
    return plannerDb.courses.orderBy('order').toArray()
}

/**
 * Get course by ID
 */
export async function getCourseById(id: string): Promise<DBCourse | undefined> {
    return plannerDb.courses.get(id)
}

/**
 * Get courses with progress stats
 */
export async function getCoursesWithProgress(): Promise<CourseWithProgress[]> {
    const courses = await getAllCourses()

    return Promise.all(
        courses.map(async (course) => {
            const tasks = await plannerDb.tasks
                .where('courseId')
                .equals(course.id)
                .toArray()

            const totalTasks = tasks.length
            const completedTasks = tasks.filter(t => t.status === 'done').length
            const progressPercent = totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0

            return {
                ...course,
                totalTasks,
                completedTasks,
                progressPercent,
            }
        })
    )
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Add a new course
 */
export async function addCourse(data: {
    title: string
    code?: string
    color?: string
}): Promise<string> {
    const count = await plannerDb.courses.count()
    const now = nowISO()
    const id = generateId()

    await plannerDb.courses.add({
        id,
        title: data.title,
        code: data.code,
        color: data.color,
        order: count,
        createdAt: now,
        updatedAt: now,
    })

    return id
}

/**
 * Update a course
 */
export async function updateCourse(
    id: string,
    updates: Partial<Omit<DBCourse, 'id' | 'createdAt'>>
): Promise<void> {
    await plannerDb.courses.update(id, {
        ...updates,
        updatedAt: nowISO(),
    })
}

/**
 * Delete a course and all related data
 */
export async function deleteCourse(id: string): Promise<void> {
    await plannerDb.transaction('rw',
        [
            plannerDb.courses,
            plannerDb.units,
            plannerDb.tasks,
            plannerDb.events,
            plannerDb.lectureNotesMeta,
            plannerDb.completionRecords,
        ],
        async () => {
            // Get all tasks for completion records cleanup
            const tasks = await plannerDb.tasks
                .where('courseId')
                .equals(id)
                .toArray()

            const taskIds = tasks.map(t => t.id)

            // Delete in order
            await plannerDb.completionRecords
                .where('taskId')
                .anyOf(taskIds)
                .delete()
            await plannerDb.lectureNotesMeta.where('courseId').equals(id).delete()
            await plannerDb.events.where('courseId').equals(id).delete()
            await plannerDb.tasks.where('courseId').equals(id).delete()
            await plannerDb.units.where('courseId').equals(id).delete()
            await plannerDb.courses.delete(id)
        }
    )
}

/**
 * Reorder courses
 */
export async function reorderCourses(orderedIds: string[]): Promise<void> {
    await plannerDb.transaction('rw', plannerDb.courses, async () => {
        const updates = orderedIds.map((id, index) =>
            plannerDb.courses.update(id, {
                order: index,
                updatedAt: nowISO(),
            })
        )
        await Promise.all(updates)
    })
}

// ============================================
// React Hooks
// ============================================

/**
 * Hook: Get all courses (live)
 */
export function useCourses(): DBCourse[] {
    return useLiveQuery(getAllCourses, [], [])
}

/**
 * Hook: Get course by ID (live)
 */
export function useCourse(id: string): DBCourse | undefined {
    return useLiveQuery(
        () => getCourseById(id),
        [id],
        undefined
    )
}

/**
 * Hook: Get courses with progress (live)
 */
export function useCoursesWithProgress(): CourseWithProgress[] {
    return useLiveQuery(getCoursesWithProgress, [], [])
}

/**
 * Hook: Get course count (live)
 */
export function useCourseCount(): number {
    return useLiveQuery(
        () => plannerDb.courses.count(),
        [],
        0
    )
}
