/**
 * LifeFlow - Database Migrations
 *
 * Schema versiyonları arası veri dönüşümü.
 * Semantic versioning ve migration history.
 */

import { db } from '@/db/database'
import { captureException } from '@/shared/utils/errorTracking'

// ============================================
// Types
// ============================================

export interface MigrationInfo {
    fromVersion: number
    toVersion: number
    description: string
    executedAt?: number
    success?: boolean
}

export interface MigrationResult {
    success: boolean
    migrationsRun: MigrationInfo[]
    errors: string[]
}

type MigrationFunction = () => Promise<void>

interface Migration {
    version: number
    description: string
    up: MigrationFunction
    down?: MigrationFunction
}

// ============================================
// Migration Registry
// ============================================

const migrations: Migration[] = []

/**
 * Migration kaydet
 *
 * @example
 * registerMigration({
 *   version: 2,
 *   description: 'Add priority field to rules',
 *   up: async () => {
 *     await db.rules.toCollection().modify(rule => {
 *       rule.priority = rule.priority ?? 0
 *     })
 *   },
 *   down: async () => {
 *     await db.rules.toCollection().modify(rule => {
 *       delete rule.priority
 *     })
 *   }
 * })
 */
export function registerMigration(migration: Migration): void {
    migrations.push(migration)
    migrations.sort((a, b) => a.version - b.version)
}

// ============================================
// Migration History
// ============================================

const MIGRATION_HISTORY_KEY = 'lifeflow_migration_history'

function getMigrationHistory(): MigrationInfo[] {
    try {
        const stored = localStorage.getItem(MIGRATION_HISTORY_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function saveMigrationHistory(history: MigrationInfo[]): void {
    try {
        localStorage.setItem(MIGRATION_HISTORY_KEY, JSON.stringify(history))
    } catch {
        console.warn('[Migrations] Failed to save migration history')
    }
}

function recordMigration(info: MigrationInfo): void {
    const history = getMigrationHistory()
    history.push({
        ...info,
        executedAt: Date.now(),
    })
    saveMigrationHistory(history)
}

// ============================================
// Current Version
// ============================================

const CURRENT_VERSION_KEY = 'lifeflow_db_version'

/**
 * Mevcut veritabanı versiyonunu al
 */
export function getCurrentVersion(): number {
    try {
        const stored = localStorage.getItem(CURRENT_VERSION_KEY)
        return stored ? parseInt(stored, 10) : 1
    } catch {
        return 1
    }
}

/**
 * Veritabanı versiyonunu güncelle
 */
function setCurrentVersion(version: number): void {
    localStorage.setItem(CURRENT_VERSION_KEY, version.toString())
}

// ============================================
// Migration Runner
// ============================================

/**
 * Tüm bekleyen migration'ları çalıştır
 *
 * @example
 * // App başlangıcında
 * const result = await runMigrations()
 * if (!result.success) {
 *   console.error('Migration failed:', result.errors)
 * }
 */
export async function runMigrations(): Promise<MigrationResult> {
    const result: MigrationResult = {
        success: true,
        migrationsRun: [],
        errors: [],
    }

    const currentVersion = getCurrentVersion()
    const targetVersion = getLatestVersion()

    if (currentVersion >= targetVersion) {
        console.log('[Migrations] Database is up to date')
        return result
    }

    console.log(`[Migrations] Upgrading from v${currentVersion} to v${targetVersion}`)

    // Sırayla migration'ları çalıştır
    for (const migration of migrations) {
        if (migration.version <= currentVersion) continue
        if (migration.version > targetVersion) break

        const migrationInfo: MigrationInfo = {
            fromVersion: migration.version - 1,
            toVersion: migration.version,
            description: migration.description,
        }

        try {
            console.log(`[Migrations] Running migration v${migration.version}: ${migration.description}`)

            await migration.up()

            migrationInfo.success = true
            result.migrationsRun.push(migrationInfo)
            recordMigration(migrationInfo)
            setCurrentVersion(migration.version)

            console.log(`[Migrations] Migration v${migration.version} completed`)
        } catch (error) {
            migrationInfo.success = false
            result.success = false
            result.migrationsRun.push(migrationInfo)

            const errorMessage = error instanceof Error ? error.message : String(error)
            result.errors.push(`v${migration.version}: ${errorMessage}`)

            captureException(error, {
                context: 'DatabaseMigration',
                category: 'database',
                metadata: {
                    version: migration.version,
                    description: migration.description,
                },
            })

            console.error(`[Migrations] Migration v${migration.version} failed:`, error)

            // Migration başarısız olursa dur
            break
        }
    }

    return result
}

/**
 * Rollback - son migration'ı geri al
 */
export async function rollbackLastMigration(): Promise<boolean> {
    const currentVersion = getCurrentVersion()

    if (currentVersion <= 1) {
        console.log('[Migrations] Cannot rollback: already at version 1')
        return false
    }

    const migration = migrations.find(m => m.version === currentVersion)

    if (!migration?.down) {
        console.error('[Migrations] No rollback function for current version')
        return false
    }

    try {
        console.log(`[Migrations] Rolling back v${currentVersion}`)

        await migration.down()

        setCurrentVersion(currentVersion - 1)

        recordMigration({
            fromVersion: currentVersion,
            toVersion: currentVersion - 1,
            description: `Rollback: ${migration.description}`,
            success: true,
        })

        console.log(`[Migrations] Rollback to v${currentVersion - 1} completed`)
        return true
    } catch (error) {
        captureException(error, {
            context: 'DatabaseRollback',
            category: 'database',
        })

        console.error('[Migrations] Rollback failed:', error)
        return false
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * En son migration versiyonunu al
 */
export function getLatestVersion(): number {
    if (migrations.length === 0) return 1
    return Math.max(...migrations.map(m => m.version))
}

/**
 * Migration geçmişini al
 */
export function getMigrationLog(): MigrationInfo[] {
    return getMigrationHistory()
}

/**
 * Bekleyen migration var mı?
 */
export function hasPendingMigrations(): boolean {
    return getCurrentVersion() < getLatestVersion()
}

/**
 * Migration geçmişini temizle (sadece development)
 */
export function clearMigrationHistory(): void {
    if (!import.meta.env.DEV) return

    localStorage.removeItem(MIGRATION_HISTORY_KEY)
    localStorage.removeItem(CURRENT_VERSION_KEY)
}

// ============================================
// Built-in Migrations
// ============================================

// Version 2: Rules'a priority ekle
registerMigration({
    version: 2,
    description: 'Add priority field to rules',
    up: async () => {
        await db.rules.toCollection().modify((rule) => {
            const r = rule as unknown as Record<string, unknown>
            if (r.priority === undefined) {
                r.priority = 0
            }
        })
    },
    down: async () => {
        await db.rules.toCollection().modify((rule) => {
            const r = rule as unknown as Record<string, unknown>
            delete r.priority
        })
    },
})

// Version 3: Habits'e reminder field ekle
registerMigration({
    version: 3,
    description: 'Add reminder settings to habits',
    up: async () => {
        await db.habits.toCollection().modify((habit) => {
            const h = habit as unknown as Record<string, unknown>
            if (h.reminderEnabled === undefined) {
                h.reminderEnabled = false
                h.reminderTime = '09:00'
            }
        })
    },
    down: async () => {
        await db.habits.toCollection().modify((habit) => {
            const h = habit as unknown as Record<string, unknown>
            delete h.reminderEnabled
            delete h.reminderTime
        })
    },
})

// Version 4: Activities'e tags array ekle
registerMigration({
    version: 4,
    description: 'Add tags array to activities',
    up: async () => {
        await db.activities.toCollection().modify((activity) => {
            const a = activity as unknown as Record<string, unknown>
            if (!a.tags) {
                a.tags = []
            }
        })
    },
    down: async () => {
        await db.activities.toCollection().modify((activity) => {
            const a = activity as unknown as Record<string, unknown>
            delete a.tags
        })
    },
})

// Version 5: TimeSessions'a productivity score ekle
registerMigration({
    version: 5,
    description: 'Add productivity score to time sessions',
    up: async () => {
        await db.timeSessions.toCollection().modify((session) => {
            const s = session as unknown as Record<string, unknown>
            if (s.productivityScore === undefined) {
                s.productivityScore = null
            }
        })
    },
    down: async () => {
        await db.timeSessions.toCollection().modify((session) => {
            const s = session as unknown as Record<string, unknown>
            delete s.productivityScore
        })
    },
})

// ============================================
// Data Integrity Checks
// ============================================

/**
 * Veri bütünlüğünü kontrol et
 */
export async function checkDataIntegrity(): Promise<{
    valid: boolean
    issues: string[]
}> {
    const issues: string[] = []

    try {
        // Orphan sessions kontrolü (aktivitesi silinen session'lar)
        const sessions = await db.timeSessions.toArray()
        const activityIds = new Set((await db.activities.toArray()).map(a => a.id))

        for (const session of sessions) {
            if (!activityIds.has(session.activityId)) {
                issues.push(`Orphan session: ${session.id} (missing activity: ${session.activityId})`)
            }
        }

        // Orphan habit logs kontrolü
        const habitLogs = await db.habitLogs.toArray()
        const habitIds = new Set((await db.habits.toArray()).map(h => h.id))

        for (const log of habitLogs) {
            if (!habitIds.has(log.habitId)) {
                issues.push(`Orphan habit log: ${log.id} (missing habit: ${log.habitId})`)
            }
        }

        // Orphan activities kontrolü (kategorisi silinen aktiviteler)
        const activities = await db.activities.toArray()
        const categoryIds = new Set((await db.categories.toArray()).map(c => c.id))

        for (const activity of activities) {
            if (activity.categoryId && !categoryIds.has(activity.categoryId)) {
                issues.push(`Activity with missing category: ${activity.id} (category: ${activity.categoryId})`)
            }
        }

    } catch (error) {
        issues.push(`Integrity check failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    return {
        valid: issues.length === 0,
        issues,
    }
}

/**
 * Orphan kayıtları temizle
 */
export async function cleanupOrphanRecords(): Promise<number> {
    let cleaned = 0

    await db.transaction('rw', [db.timeSessions, db.habitLogs, db.activities], async () => {
        // Orphan sessions
        const activityIds = new Set((await db.activities.toArray()).map(a => a.id))
        const sessions = await db.timeSessions.toArray()

        for (const session of sessions) {
            if (!activityIds.has(session.activityId)) {
                await db.timeSessions.delete(session.id)
                cleaned++
            }
        }

        // Orphan habit logs
        const habitIds = new Set((await db.habits.toArray()).map(h => h.id))
        const habitLogs = await db.habitLogs.toArray()

        for (const log of habitLogs) {
            if (!habitIds.has(log.habitId)) {
                await db.habitLogs.delete(log.id)
                cleaned++
            }
        }
    })

    return cleaned
}
