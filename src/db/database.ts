import { DB_CONSTANTS } from '@/config'
import {
    DEFAULT_CATEGORIES,
    DEFAULT_POMODORO_CONFIG,
    DEFAULT_SETTINGS_DATA
} from '@/config/defaults'
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

/**
 * LifeFlow Database
 *
 * Dexie.js ile IndexedDB yönetimi.
 * Schema migration desteği ile versiyon yönetimi.
 */

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
        super(DB_CONSTANTS.DB_NAME)

        // ============================================
        // Version 1 - Initial Schema
        // ============================================
        this.version(1).stores({
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

        // ============================================
        // Version 2 - Future Migration Example
        // Yeni alan eklendiğinde bu şekilde migrate edilir
        // ============================================
        // this.version(2).stores({
        //     // Yeni index ekle
        //     rules: 'id, trigger, enabled, priority',
        // }).upgrade(async tx => {
        //     // Mevcut rules'a priority ekle
        //     await tx.table('rules').toCollection().modify(rule => {
        //         rule.priority = rule.priority ?? 0
        //     })
        // })
    }
}

// Singleton instance
export const db = new LifeFlowDB()

/**
 * Default data seeding
 *
 * İlk kurulumda varsayılan verileri oluşturur.
 * Config/defaults.ts'den merkezi yapılandırma kullanılır.
 */
export async function seedDefaultData(): Promise<void> {
    try {
        // Settings
        const settingsCount = await db.settings.count()
        if (settingsCount === 0) {
            await db.settings.bulkAdd(DEFAULT_SETTINGS_DATA)
        }

        // Pomodoro Config
        const pomodoroCount = await db.pomodoroConfigs.count()
        if (pomodoroCount === 0) {
            await db.pomodoroConfigs.add(DEFAULT_POMODORO_CONFIG)
        }

        // Categories
        const categoryCount = await db.categories.count()
        if (categoryCount === 0) {
            const now = Date.now()
            const categories = DEFAULT_CATEGORIES.map(cat => ({
                ...cat,
                createdAt: now,
                updatedAt: now,
            }))
            await db.categories.bulkAdd(categories)
        }
    } catch (error) {
        console.error('[DB] Seed data error:', error)
        throw error
    }
}
