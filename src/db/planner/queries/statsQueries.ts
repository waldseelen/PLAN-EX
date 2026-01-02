/**
 * Stats & Progress Queries
 *
 * Overview, statistics ve progress için aggregate queries.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { plannerDb, todayKey } from '../database'

// ============================================
// Aggregate Stats
// ============================================

export interface PlannerStats {
    totalCourses: number
    totalTasks: number
    completedTasks: number
    completionPercent: number
    totalHabits: number
    todayHabitsCompleted: number
    upcomingExamsCount: number
    personalTasksCount: number
}

/**
 * Get overall planner statistics
 */
export async function getPlannerStats(): Promise<PlannerStats> {
    const today = todayKey()

    const [
        totalCourses,
        totalTasks,
        completedTasks,
        totalHabits,
        todayHabitLogs,
        upcomingExamsCount,
        personalTasksCount,
    ] = await Promise.all([
        plannerDb.courses.count(),
        plannerDb.tasks.count(),
        plannerDb.tasks.where('status').equals('done').count(),
        plannerDb.habits.where('isArchived').equals(0).count(), // 0 for false in IndexedDB
        plannerDb.habitLogs.where('dateISO').equals(today).filter(l => l.done).count(),
        plannerDb.events
            .where('[type+dateISO]')
            .between(['exam', today], ['exam', '9999-12-31'], true, true)
            .count(),
        plannerDb.personalTasks.count(),
    ])

    return {
        totalCourses,
        totalTasks,
        completedTasks,
        completionPercent: totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
        totalHabits,
        todayHabitsCompleted: todayHabitLogs,
        upcomingExamsCount,
        personalTasksCount,
    }
}

/**
 * Get completion history for a date range
 */
export async function getCompletionHistory(
    startISO: string,
    endISO: string
): Promise<Map<string, number>> {
    const records = await plannerDb.completionRecords
        .where('dateKey')
        .between(startISO, endISO, true, true)
        .toArray()

    const countByDate = new Map<string, number>()
    for (const record of records) {
        const current = countByDate.get(record.dateKey) ?? 0
        countByDate.set(record.dateKey, current + 1)
    }

    return countByDate
}

/**
 * Get daily activity (tasks + habits completed) for heatmap
 */
export async function getDailyActivity(
    startISO: string,
    endISO: string
): Promise<Array<{ date: string; count: number }>> {
    const [taskCompletions, habitLogs] = await Promise.all([
        plannerDb.completionRecords
            .where('dateKey')
            .between(startISO, endISO, true, true)
            .toArray(),
        plannerDb.habitLogs
            .where('dateISO')
            .between(startISO, endISO, true, true)
            .filter(l => l.done)
            .toArray(),
    ])

    const countByDate = new Map<string, number>()

    for (const record of taskCompletions) {
        const current = countByDate.get(record.dateKey) ?? 0
        countByDate.set(record.dateKey, current + 1)
    }

    for (const log of habitLogs) {
        const current = countByDate.get(log.dateISO) ?? 0
        countByDate.set(log.dateISO, current + 1)
    }

    return Array.from(countByDate.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get productivity score for a date
 */
export async function getProductivityScore(dateISO: string): Promise<number> {
    const [taskCompletions, habitLogs] = await Promise.all([
        plannerDb.completionRecords
            .where('dateKey')
            .equals(dateISO)
            .count(),
        plannerDb.habitLogs
            .where('dateISO')
            .equals(dateISO)
            .filter(l => l.done)
            .count(),
    ])

    // Simple score: tasks * 10 + habits * 5
    return (taskCompletions * 10) + (habitLogs * 5)
}

// ============================================
// React Hooks
// ============================================

/**
 * Hook: Get planner stats (live)
 */
export function usePlannerStats(): PlannerStats {
    return useLiveQuery(
        getPlannerStats,
        [],
        {
            totalCourses: 0,
            totalTasks: 0,
            completedTasks: 0,
            completionPercent: 0,
            totalHabits: 0,
            todayHabitsCompleted: 0,
            upcomingExamsCount: 0,
            personalTasksCount: 0,
        }
    )
}

/**
 * Hook: Get daily activity for heatmap (live)
 */
export function useDailyActivity(startISO: string, endISO: string) {
    return useLiveQuery(
        () => getDailyActivity(startISO, endISO),
        [startISO, endISO],
        []
    )
}

/**
 * Hook: Get completion history (live)
 */
export function useCompletionHistory(startISO: string, endISO: string) {
    return useLiveQuery(
        async () => {
            const map = await getCompletionHistory(startISO, endISO)
            // Convert Map to object for easier use in React
            return Object.fromEntries(map)
        },
        [startISO, endISO],
        {}
    )
}
