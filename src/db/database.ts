import Dexie, { type EntityTable } from 'dexie'
import type {
    Activity,
    Category,
    Goal,
    Habit,
    HabitLog,
    PomodoroConfig,
    Reminder,
    Rule,
    RunningTimer,
    Setting,
    Tag,
    TimeSession,
} from './types'

// Current schema version
export const SCHEMA_VERSION = 1

export class LifeFlowDB extends Dexie {
    // Tables
    categories!: EntityTable<Category, 'id'>
    tags!: EntityTable<Tag, 'id'>
    activities!: EntityTable<Activity, 'id'>
    timeSessions!: EntityTable<TimeSession, 'id'>
    runningTimers!: EntityTable<RunningTimer, 'id'>
    pomodoroConfigs!: EntityTable<PomodoroConfig, 'id'>
    habits!: EntityTable<Habit, 'id'>
    habitLogs!: EntityTable<HabitLog, 'id'>
    goals!: EntityTable<Goal, 'id'>
    rules!: EntityTable<Rule, 'id'>
    reminders!: EntityTable<Reminder, 'id'>
    settings!: EntityTable<Setting, 'key'>

    constructor() {
        super('LifeFlowDB')

        this.version(SCHEMA_VERSION).stores({
            // Core
            categories: 'id, name, archived, createdAt',
            tags: 'id, name, groupId',
            activities: 'id, name, categoryId, archived, createdAt',

            // Time Tracking
            timeSessions: 'id, activityId, startAt, endAt, dateKey, [activityId+startAt], [dateKey]',
            runningTimers: 'id, activityId, startedAt',
            pomodoroConfigs: 'id, name, isDefault',

            // Habits
            habits: 'id, name, categoryId, archived, createdAt',
            habitLogs: 'id, habitId, dateKey, status, [habitId+dateKey], [dateKey]',

            // Goals & Rules
            goals: 'id, activityId, habitId, enabled',
            rules: 'id, trigger, enabled',

            // Notifications
            reminders: 'id, kind, habitId, activityId, enabled',

            // Settings
            settings: 'key',
        })
    }
}

// Singleton instance
export const db = new LifeFlowDB()

// Default data seeding
export async function seedDefaultData() {
    const settingsCount = await db.settings.count()

    if (settingsCount === 0) {
        // Seed default settings
        await db.settings.bulkAdd([
            { key: 'rolloverHour', value: 4 },
            { key: 'weekStart', value: 1 }, // Monday
            { key: 'theme', value: 'system' },
            { key: 'language', value: 'tr' },
            { key: 'multitaskingEnabled', value: false },
            { key: 'mergeThresholdMinutes', value: 5 },
        ])
    }

    const pomodoroCount = await db.pomodoroConfigs.count()

    if (pomodoroCount === 0) {
        // Seed default pomodoro config
        await db.pomodoroConfigs.add({
            id: 'default-pomodoro',
            name: 'Standart Pomodoro',
            workDuration: 25 * 60, // 25 minutes
            shortBreakDuration: 5 * 60, // 5 minutes
            longBreakDuration: 15 * 60, // 15 minutes
            sessionsBeforeLongBreak: 4,
            isDefault: true,
        })
    }

    const categoryCount = await db.categories.count()

    if (categoryCount === 0) {
        // Seed sample categories
        const now = Date.now()
        await db.categories.bulkAdd([
            {
                id: 'cat-work',
                name: 'İş',
                color: '#06b6d4',
                icon: '💼',
                archived: false,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: 'cat-personal',
                name: 'Kişisel',
                color: '#22c55e',
                icon: '🏠',
                archived: false,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: 'cat-health',
                name: 'Sağlık',
                color: '#a3e635',
                icon: '❤️',
                archived: false,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: 'cat-learning',
                name: 'Öğrenme',
                color: '#f59e0b',
                icon: '📚',
                archived: false,
                createdAt: now,
                updatedAt: now,
            },
        ])
    }
}
