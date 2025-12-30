import { db } from '@/db'
import type { Habit, HabitLog, ScheduleSpec } from '@/db/types'
import { eventBus } from '@/events'
import { generateId, getTodayKey } from '@/shared/utils'
import { create } from 'zustand'

// ============================================
// Streak Calculation
// ============================================

interface StreakInfo {
    currentStreak: number
    longestStreak: number
    totalDone: number
    totalSkip: number
    totalFail: number
}

function calculateStreak(logs: HabitLog[], _schedule: ScheduleSpec): StreakInfo {
    // Sort logs by date descending
    const sortedLogs = [...logs].sort((a, b) => b.dateKey.localeCompare(a.dateKey))

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let totalDone = 0
    let totalSkip = 0
    let totalFail = 0

    for (const log of sortedLogs) {
        if (log.status === 'done') {
            totalDone++
            tempStreak++
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak
            }
        } else if (log.status === 'skip') {
            totalSkip++
            // Skip doesn't break streak but doesn't add to it
        } else {
            totalFail++
            // Fail breaks streak
            if (currentStreak === 0) {
                currentStreak = tempStreak
            }
            tempStreak = 0
        }
    }

    // If we never hit a fail, current streak is the temp streak
    if (currentStreak === 0) {
        currentStreak = tempStreak
    }

    return {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        totalDone,
        totalSkip,
        totalFail,
    }
}

// ============================================
// Habits Store
// ============================================

interface HabitsState {
    habits: Habit[]
    todayLogs: Map<string, HabitLog> // habitId -> log
    streaks: Map<string, StreakInfo> // habitId -> streak info
    isLoading: boolean

    // Actions
    initialize: (rolloverHour: number) => Promise<void>
    createHabit: (data: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
    updateHabit: (id: string, data: Partial<Habit>) => Promise<void>
    archiveHabit: (id: string) => Promise<void>
    deleteHabit: (id: string) => Promise<void>

    checkHabit: (habitId: string, value?: number, note?: string, rolloverHour?: number) => Promise<void>
    skipHabit: (habitId: string, note?: string, rolloverHour?: number) => Promise<void>
    failHabit: (habitId: string, note?: string, rolloverHour?: number) => Promise<void>
    uncheckHabit: (habitId: string, rolloverHour?: number) => Promise<void>

    // Selectors
    getHabitById: (id: string) => Habit | undefined
    getTodayLogForHabit: (habitId: string) => HabitLog | undefined
    getStreakForHabit: (habitId: string) => StreakInfo | undefined
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
    habits: [],
    todayLogs: new Map(),
    streaks: new Map(),
    isLoading: true,

    initialize: async (rolloverHour) => {
        try {
            const habits = await db.habits.where('archived').equals(0).toArray()
            const todayKey = getTodayKey(rolloverHour)

            // Get today's logs
            const logs = await db.habitLogs.where('dateKey').equals(todayKey).toArray()
            const todayLogsMap = new Map<string, HabitLog>()
            logs.forEach((log) => {
                todayLogsMap.set(log.habitId, log)
            })

            // Calculate streaks for each habit
            const streaksMap = new Map<string, StreakInfo>()
            for (const habit of habits) {
                const habitLogs = await db.habitLogs
                    .where('habitId')
                    .equals(habit.id)
                    .toArray()
                const streakInfo = calculateStreak(habitLogs, habit.scheduleSpec)
                streaksMap.set(habit.id, streakInfo)
            }

            set({
                habits,
                todayLogs: todayLogsMap,
                streaks: streaksMap,
                isLoading: false,
            })
        } catch (error) {
            console.error('Failed to initialize habits:', error)
            set({ isLoading: false })
        }
    },

    createHabit: async (data) => {
        const id = generateId()
        const now = Date.now()

        const habit: Habit = {
            ...data,
            id,
            createdAt: now,
            updatedAt: now,
        }

        await db.habits.add(habit)

        set((state) => ({
            habits: [...state.habits, habit],
        }))

        return id
    },

    updateHabit: async (id, data) => {
        const now = Date.now()
        await db.habits.update(id, { ...data, updatedAt: now })

        set((state) => ({
            habits: state.habits.map((h) =>
                h.id === id ? { ...h, ...data, updatedAt: now } : h
            ),
        }))
    },

    archiveHabit: async (id) => {
        await get().updateHabit(id, { archived: true })
        set((state) => ({
            habits: state.habits.filter((h) => h.id !== id),
        }))
    },

    deleteHabit: async (id) => {
        await db.transaction('rw', [db.habits, db.habitLogs], async () => {
            await db.habits.delete(id)
            await db.habitLogs.where('habitId').equals(id).delete()
        })

        set((state) => ({
            habits: state.habits.filter((h) => h.id !== id),
        }))
    },

    checkHabit: async (habitId, value, note, rolloverHour = 4) => {
        const dateKey = getTodayKey(rolloverHour)
        const existingLog = get().todayLogs.get(habitId)
        const now = Date.now()

        const log: HabitLog = {
            id: existingLog?.id ?? generateId(),
            habitId,
            dateKey,
            status: 'done',
            ...(value !== undefined && { value }),
            ...(note !== undefined && { note }),
            createdAt: existingLog?.createdAt ?? now,
            updatedAt: now,
        }

        await db.habitLogs.put(log)

        // Update streaks
        const habit = get().habits.find((h) => h.id === habitId)
        if (habit) {
            const habitLogs = await db.habitLogs.where('habitId').equals(habitId).toArray()
            const streakInfo = calculateStreak(habitLogs, habit.scheduleSpec)

            set((state) => {
                const newTodayLogs = new Map(state.todayLogs)
                newTodayLogs.set(habitId, log)

                const newStreaks = new Map(state.streaks)
                newStreaks.set(habitId, streakInfo)

                return { todayLogs: newTodayLogs, streaks: newStreaks }
            })

            await eventBus.publish('HABIT_CHECKED', {
                log,
                habitId,
                currentStreak: streakInfo.currentStreak,
            })
        }
    },

    skipHabit: async (habitId, note, rolloverHour = 4) => {
        const dateKey = getTodayKey(rolloverHour)
        const existingLog = get().todayLogs.get(habitId)
        const now = Date.now()

        const log: HabitLog = {
            id: existingLog?.id ?? generateId(),
            habitId,
            dateKey,
            status: 'skip',
            ...(note !== undefined && { note }),
            createdAt: existingLog?.createdAt ?? now,
            updatedAt: now,
        }

        await db.habitLogs.put(log)

        set((state) => {
            const newTodayLogs = new Map(state.todayLogs)
            newTodayLogs.set(habitId, log)
            return { todayLogs: newTodayLogs }
        })

        await eventBus.publish('HABIT_SKIPPED', { log, habitId })
    },

    failHabit: async (habitId, note, rolloverHour = 4) => {
        const dateKey = getTodayKey(rolloverHour)
        const existingLog = get().todayLogs.get(habitId)
        const now = Date.now()
        const previousStreak = get().streaks.get(habitId)?.currentStreak ?? 0

        const log: HabitLog = {
            id: existingLog?.id ?? generateId(),
            habitId,
            dateKey,
            status: 'fail',
            ...(note !== undefined && { note }),
            createdAt: existingLog?.createdAt ?? now,
            updatedAt: now,
        }

        await db.habitLogs.put(log)

        // Update streaks
        const habit = get().habits.find((h) => h.id === habitId)
        if (habit) {
            const habitLogs = await db.habitLogs.where('habitId').equals(habitId).toArray()
            const streakInfo = calculateStreak(habitLogs, habit.scheduleSpec)

            set((state) => {
                const newTodayLogs = new Map(state.todayLogs)
                newTodayLogs.set(habitId, log)

                const newStreaks = new Map(state.streaks)
                newStreaks.set(habitId, streakInfo)

                return { todayLogs: newTodayLogs, streaks: newStreaks }
            })

            await eventBus.publish('HABIT_FAILED', {
                log,
                habitId,
                streakBroken: previousStreak,
            })
        }
    },

    uncheckHabit: async (habitId, _rolloverHour = 4) => {
        const existingLog = get().todayLogs.get(habitId)

        if (existingLog) {
            await db.habitLogs.delete(existingLog.id)

            set((state) => {
                const newTodayLogs = new Map(state.todayLogs)
                newTodayLogs.delete(habitId)
                return { todayLogs: newTodayLogs }
            })
        }
    },

    getHabitById: (id) => {
        return get().habits.find((h) => h.id === id)
    },

    getTodayLogForHabit: (habitId) => {
        return get().todayLogs.get(habitId)
    },

    getStreakForHabit: (habitId) => {
        return get().streaks.get(habitId)
    },
}))
