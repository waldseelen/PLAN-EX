/**
 * Habit Queries
 *
 * Planner habits için Dexie query fonksiyonları.
 * Streak hesaplama ve günlük/haftalık progress.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { generateId, nowISO, plannerDb, todayKey } from '../database'
import type {
    DBPlannerHabit,
    DBPlannerHabitLog,
    PlannerFrequencyRule,
    PlannerHabitType
} from '../types'

// ============================================
// Helper Functions
// ============================================

/**
 * Check if habit is due on a specific date
 */
function isHabitDueOnDate(habit: DBPlannerHabit, dateISO: string): boolean {
    const date = new Date(dateISO)
    const dayOfWeek = date.getDay() // 0 = Sunday

    switch (habit.frequency.type) {
        case 'weeklyTarget':
            return true // Always shown, just need to hit target
        case 'specificDays':
            return habit.frequency.days?.includes(dayOfWeek) ?? false
        case 'everyXDays': {
            const startDate = new Date(habit.createdAt)
            const diffTime = date.getTime() - startDate.getTime()
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
            const interval = habit.frequency.interval ?? 1
            return diffDays >= 0 && diffDays % interval === 0
        }
        default:
            return true
    }
}

/**
 * Calculate streak for a habit
 */
async function calculateStreak(habitId: string): Promise<{
    currentStreak: number
    longestStreak: number
}> {
    const logs = await plannerDb.habitLogs
        .where('[habitId+dateISO]')
        .between([habitId, Dexie.minKey], [habitId, Dexie.maxKey])
        .filter(l => l.done)
        .sortBy('dateISO')

    if (logs.length === 0) {
        return { currentStreak: 0, longestStreak: 0 }
    }

    // Sort descending for current streak
    const sortedDesc = [...logs].sort((a, b) => b.dateISO.localeCompare(a.dateISO))

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    // Calculate current streak (from today backwards)
    const today = todayKey()
    let expectedDate = today

    for (const log of sortedDesc) {
        if (log.dateISO === expectedDate) {
            currentStreak++
            // Move expected date to previous day
            const d = new Date(expectedDate)
            d.setDate(d.getDate() - 1)
            expectedDate = d.toISOString().split('T')[0]
        } else if (log.dateISO < expectedDate) {
            // Gap found, streak broken
            break
        }
    }

    // Calculate longest streak
    for (let i = 0; i < logs.length; i++) {
        if (i === 0) {
            tempStreak = 1
            continue
        }

        const prevDate = new Date(logs[i - 1].dateISO)
        const currDate = new Date(logs[i].dateISO)
        const diffDays = Math.floor(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diffDays === 1) {
            tempStreak++
        } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return { currentStreak, longestStreak }
}

// ============================================
// Query Functions
// ============================================

/**
 * Get all habits ordered
 */
export async function getAllHabits(): Promise<DBPlannerHabit[]> {
    return plannerDb.habits.orderBy('order').toArray()
}

/**
 * Get active (non-archived) habits
 */
export async function getActiveHabits(): Promise<DBPlannerHabit[]> {
    return plannerDb.habits
        .where('[isArchived+order]')
        .between([false, Dexie.minKey], [false, Dexie.maxKey])
        .toArray()
}

/**
 * Get archived habits
 */
export async function getArchivedHabits(): Promise<DBPlannerHabit[]> {
    return plannerDb.habits
        .where('isArchived')
        .equals(1) // IndexedDB uses 1/0 for boolean
        .toArray()
}

/**
 * Get habit by ID
 */
export async function getHabitById(id: string): Promise<DBPlannerHabit | undefined> {
    return plannerDb.habits.get(id)
}

/**
 * Get habit logs for a habit
 */
export async function getHabitLogs(habitId: string): Promise<DBPlannerHabitLog[]> {
    return plannerDb.habitLogs
        .where('habitId')
        .equals(habitId)
        .sortBy('dateISO')
}

/**
 * Get habit log for specific date
 */
export async function getHabitLogForDate(
    habitId: string,
    dateISO: string
): Promise<DBPlannerHabitLog | undefined> {
    return plannerDb.habitLogs
        .where('[habitId+dateISO]')
        .equals([habitId, dateISO])
        .first()
}

/**
 * Get all habit logs for a date
 */
export async function getHabitLogsByDate(dateISO: string): Promise<DBPlannerHabitLog[]> {
    return plannerDb.habitLogs
        .where('dateISO')
        .equals(dateISO)
        .toArray()
}

/**
 * Get today's habits with status
 */
export async function getTodayHabitsWithStatus(): Promise<Array<{
    habit: DBPlannerHabit
    isDueToday: boolean
    isCompletedToday: boolean
    todayLog: DBPlannerHabitLog | undefined
    currentStreak: number
    longestStreak: number
}>> {
    const today = todayKey()
    const habits = await getActiveHabits()
    const todayLogs = await getHabitLogsByDate(today)

    const todayLogsMap = new Map(todayLogs.map(l => [l.habitId, l]))

    return Promise.all(
        habits.map(async (habit) => {
            const todayLog = todayLogsMap.get(habit.id)
            const isDueToday = isHabitDueOnDate(habit, today)
            const isCompletedToday = todayLog?.done ?? false
            const { currentStreak, longestStreak } = await calculateStreak(habit.id)

            return {
                habit,
                isDueToday,
                isCompletedToday,
                todayLog,
                currentStreak,
                longestStreak,
            }
        })
    )
}

/**
 * Get weekly progress for a habit
 */
export async function getHabitWeeklyProgress(habitId: string): Promise<{
    done: number
    target: number
}> {
    const habit = await getHabitById(habitId)
    if (!habit) return { done: 0, target: 7 }

    // Get this week's dates
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const startISO = monday.toISOString().split('T')[0]
    const endISO = sunday.toISOString().split('T')[0]

    const logs = await plannerDb.habitLogs
        .where('[habitId+dateISO]')
        .between([habitId, startISO], [habitId, endISO], true, true)
        .filter(l => l.done)
        .toArray()

    let target = 7
    if (habit.frequency.type === 'weeklyTarget') {
        target = habit.frequency.timesPerWeek ?? 7
    } else if (habit.frequency.type === 'specificDays') {
        target = habit.frequency.days?.length ?? 7
    }

    return {
        done: logs.length,
        target,
    }
}

// ============================================
// Mutation Functions
// ============================================

import Dexie from 'dexie'

// Default colors for habits
const HABIT_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e',
]

/**
 * Add a new habit
 */
export async function addHabit(data: {
    title: string
    type: PlannerHabitType
    frequency: PlannerFrequencyRule
    description?: string
    emoji?: string
    target?: number
    unit?: string
    color?: string
}): Promise<string> {
    const count = await plannerDb.habits.count()
    const now = nowISO()
    const id = generateId()

    await plannerDb.habits.add({
        id,
        title: data.title,
        description: data.description,
        emoji: data.emoji ?? '✨',
        type: data.type,
        target: data.target,
        unit: data.unit,
        color: data.color ?? HABIT_COLORS[count % HABIT_COLORS.length],
        frequency: data.frequency,
        isArchived: false,
        order: count,
        createdAt: now,
        updatedAt: now,
    })

    return id
}

/**
 * Update a habit
 */
export async function updateHabit(
    id: string,
    updates: Partial<Omit<DBPlannerHabit, 'id' | 'createdAt'>>
): Promise<void> {
    await plannerDb.habits.update(id, {
        ...updates,
        updatedAt: nowISO(),
    })
}

/**
 * Delete a habit and its logs
 */
export async function deleteHabit(id: string): Promise<void> {
    await plannerDb.transaction('rw',
        plannerDb.habits,
        plannerDb.habitLogs,
        async () => {
            await plannerDb.habitLogs.where('habitId').equals(id).delete()
            await plannerDb.habits.delete(id)
        }
    )
}

/**
 * Archive a habit
 */
export async function archiveHabit(id: string): Promise<void> {
    await updateHabit(id, { isArchived: true })
}

/**
 * Unarchive a habit
 */
export async function unarchiveHabit(id: string): Promise<void> {
    await updateHabit(id, { isArchived: false })
}

/**
 * Log a habit completion
 */
export async function logHabit(
    habitId: string,
    dateISO: string,
    done: boolean = true,
    value?: number
): Promise<void> {
    const existingLog = await getHabitLogForDate(habitId, dateISO)
    const now = nowISO()

    if (existingLog) {
        // Update existing log
        await plannerDb.habitLogs.update(existingLog.id, {
            done,
            value,
        })
    } else {
        // Create new log
        await plannerDb.habitLogs.add({
            id: generateId(),
            habitId,
            dateISO,
            done,
            value,
            createdAt: now,
        })
    }
}

/**
 * Toggle habit completion for today
 */
export async function toggleHabitToday(habitId: string): Promise<boolean> {
    const today = todayKey()
    const existingLog = await getHabitLogForDate(habitId, today)

    const newDone = !(existingLog?.done ?? false)
    await logHabit(habitId, today, newDone)

    return newDone
}

/**
 * Reorder habits
 */
export async function reorderHabits(orderedIds: string[]): Promise<void> {
    await plannerDb.transaction('rw', plannerDb.habits, async () => {
        const now = nowISO()
        const updates = orderedIds.map((id, index) =>
            plannerDb.habits.update(id, {
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
 * Hook: Get all habits (live)
 */
export function useHabits(): DBPlannerHabit[] {
    return useLiveQuery(getAllHabits, [], [])
}

/**
 * Hook: Get active habits (live)
 */
export function useActiveHabits(): DBPlannerHabit[] {
    return useLiveQuery(getActiveHabits, [], [])
}

/**
 * Hook: Get habit by ID (live)
 */
export function useHabit(id: string): DBPlannerHabit | undefined {
    return useLiveQuery(
        () => getHabitById(id),
        [id],
        undefined
    )
}

/**
 * Hook: Get today's habits with status (live)
 */
export function useTodayHabitsWithStatus() {
    return useLiveQuery(getTodayHabitsWithStatus, [], [])
}

/**
 * Hook: Get habit logs (live)
 */
export function useHabitLogs(habitId: string): DBPlannerHabitLog[] {
    return useLiveQuery(
        () => getHabitLogs(habitId),
        [habitId],
        []
    )
}

/**
 * Hook: Get habit weekly progress (live)
 */
export function useHabitWeeklyProgress(habitId: string) {
    return useLiveQuery(
        () => getHabitWeeklyProgress(habitId),
        [habitId],
        { done: 0, target: 7 }
    )
}
