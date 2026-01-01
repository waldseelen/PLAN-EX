/**
 * Planner Habits Store - Zustand
 *
 * Planner modülündeki alışkanlıklar için store.
 * NOT: Bu Plan.Ex'in kendi habits store'undan AYRI.
 * İleride birleştirilecek, şimdilik migration için ayrı tutuluyor.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
    FrequencyRule,
    Habit,
    HABIT_COLORS,
    HabitLog,
    HabitType,
    LIMITS,
} from '../types'

// ================== HELPERS ==================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getToday(): string {
    return new Date().toISOString().split('T')[0]
}

function isHabitDueOnDate(habit: Habit, dateISO: string): boolean {
    const date = new Date(dateISO)
    const dayOfWeek = date.getDay()

    switch (habit.frequency.type) {
        case 'weeklyTarget':
            return true
        case 'specificDays':
            return habit.frequency.days.includes(dayOfWeek)
        case 'everyXDays': {
            const startDate = new Date(habit.createdAt)
            const diffDays = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            return diffDays >= 0 && diffDays % habit.frequency.interval === 0
        }
        default:
            return true
    }
}

// ================== TYPES ==================

interface PlannerHabitsState {
    habits: Habit[]
    habitLogs: Record<string, HabitLog[]> // habitId -> logs
    isLoading: boolean
    isInitialized: boolean
}

interface HabitWithStats {
    habit: Habit
    isDueToday: boolean
    isCompletedToday: boolean
    streak: number
    currentStreak: number
    longestStreak: number
    totalCompletions: number
    score: number
    weeklyProgress: { done: number; target: number }
}

interface PlannerHabitsActions {
    initialize: () => void

    // CRUD
    addHabit: (data: {
        title: string
        type: HabitType
        frequency: FrequencyRule
        color?: string
        emoji?: string
        description?: string
        target?: number
        unit?: string
    }) => void
    updateHabit: (id: string, updates: Partial<Habit>) => void
    deleteHabit: (id: string) => void
    archiveHabit: (id: string) => void
    unarchiveHabit: (id: string) => void

    // Logging
    logHabit: (habitId: string, dateISO: string, value?: number) => void

    // Import
    importHabits: (habits: Habit[], logs: HabitLog[]) => void

    // Selectors
    getHabit: (id: string) => Habit | undefined
    getHabitLogs: (habitId: string) => HabitLog[]
    getTodayHabits: () => HabitWithStats[]
    getHabitWithStats: (habitId: string) => HabitWithStats | undefined
}

type PlannerHabitsStore = PlannerHabitsState & PlannerHabitsActions

const initialState: PlannerHabitsState = {
    habits: [],
    habitLogs: {},
    isLoading: false,
    isInitialized: false,
}

export const usePlannerHabitsStore = create<PlannerHabitsStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            initialize: () => {
                set({ isInitialized: true, isLoading: false })
            },

            addHabit: (data) => {
                const state = get()
                if (state.habits.length >= LIMITS.MAX_HABITS) {
                    console.warn('Max habits limit reached')
                    return
                }

                const colorIndex = state.habits.length % HABIT_COLORS.length
                const now = new Date().toISOString()

                const newHabit: Habit = {
                    id: generateId(),
                    title: data.title,
                    emoji: data.emoji || '✨',
                    description: data.description,
                    type: data.type,
                    frequency: data.frequency,
                    color: data.color || HABIT_COLORS[colorIndex],
                    target: data.target,
                    unit: data.unit,
                    isArchived: false,
                    createdAt: now,
                    updatedAt: now,
                }

                set({ habits: [...state.habits, newHabit] })
            },

            updateHabit: (id, updates) => {
                set(state => ({
                    habits: state.habits.map(h =>
                        h.id === id
                            ? { ...h, ...updates, updatedAt: new Date().toISOString() }
                            : h
                    ),
                }))
            },

            deleteHabit: (id) => {
                set(state => {
                    const newLogs = { ...state.habitLogs }
                    delete newLogs[id]
                    return {
                        habits: state.habits.filter(h => h.id !== id),
                        habitLogs: newLogs,
                    }
                })
            },

            archiveHabit: (id) => {
                set(state => ({
                    habits: state.habits.map(h =>
                        h.id === id
                            ? { ...h, isArchived: true, updatedAt: new Date().toISOString() }
                            : h
                    ),
                }))
            },

            unarchiveHabit: (id) => {
                set(state => ({
                    habits: state.habits.map(h =>
                        h.id === id
                            ? { ...h, isArchived: false, updatedAt: new Date().toISOString() }
                            : h
                    ),
                }))
            },

            logHabit: (habitId, dateISO, value) => {
                const habit = get().getHabit(habitId)
                if (!habit) return

                const log: HabitLog = {
                    habitId,
                    dateISO,
                    done: true,
                    value,
                    timestamp: new Date().toISOString(),
                }

                set(state => {
                    const existingLogs = state.habitLogs[habitId] || []
                    const filteredLogs = existingLogs.filter(l => l.dateISO !== dateISO)
                    return {
                        habitLogs: {
                            ...state.habitLogs,
                            [habitId]: [...filteredLogs, log],
                        },
                    }
                })
            },

            importHabits: (habits, logs) => {
                const logsMap: Record<string, HabitLog[]> = {}
                logs.forEach(log => {
                    if (!logsMap[log.habitId]) {
                        logsMap[log.habitId] = []
                    }
                    logsMap[log.habitId].push(log)
                })

                set({
                    habits,
                    habitLogs: logsMap,
                })
            },

            getHabit: (id) => {
                return get().habits.find(h => h.id === id)
            },

            getHabitLogs: (habitId) => {
                return get().habitLogs[habitId] || []
            },

            getTodayHabits: () => {
                const state = get()
                const today = getToday()

                return state.habits
                    .filter(h => !h.isArchived)
                    .map(habit => {
                        const logs = state.habitLogs[habit.id] || []
                        const todayLog = logs.find(l => l.dateISO === today)
                        const isDueToday = isHabitDueOnDate(habit, today)

                        // Simple streak calculation
                        let streak = 0
                        const sortedLogs = [...logs].sort((a, b) =>
                            b.dateISO.localeCompare(a.dateISO)
                        )
                        for (const log of sortedLogs) {
                            if (log.value !== undefined || habit.type === 'boolean') {
                                streak++
                            } else {
                                break
                            }
                        }

                        // Weekly progress
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        const weekAgoISO = weekAgo.toISOString().split('T')[0]
                        const weekLogs = logs.filter(l => l.dateISO >= weekAgoISO)
                        const weeklyDone = weekLogs.length

                        let weeklyTarget = 7
                        if (habit.frequency.type === 'weeklyTarget') {
                            weeklyTarget = habit.frequency.timesPerWeek
                        } else if (habit.frequency.type === 'specificDays') {
                            weeklyTarget = habit.frequency.days.length
                        }

                        // Calculate longest streak
                        let longestStreak = 0
                        let tempStreak = 0
                        for (const log of sortedLogs) {
                            if (log.done || log.value !== undefined) {
                                tempStreak++
                                if (tempStreak > longestStreak) {
                                    longestStreak = tempStreak
                                }
                            } else {
                                tempStreak = 0
                            }
                        }

                        return {
                            habit,
                            isDueToday,
                            isCompletedToday: !!todayLog,
                            streak,
                            currentStreak: streak,
                            longestStreak,
                            totalCompletions: logs.length,
                            score: Math.min(100, Math.round((streak / 30) * 100)),
                            weeklyProgress: { done: weeklyDone, target: weeklyTarget },
                        }
                    })
            },

            getHabitWithStats: (habitId) => {
                const allHabits = get().getTodayHabits()
                return allHabits.find(h => h.habit.id === habitId)
            },
        }),
        {
            name: 'lifeflow-planner-habits',
            version: 1,
            partialize: (state) => ({
                habits: state.habits,
                habitLogs: state.habitLogs,
            }),
        }
    )
)

// ================== HOOKS ==================

export function usePlannerHabits() {
    return usePlannerHabitsStore()
}
