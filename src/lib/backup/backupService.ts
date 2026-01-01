/**
 * LifeFlow - Veri Yedekleme ve Geri Yükleme Servisi
 *
 * Kullanıcı verilerini JSON formatında dışa aktarma ve içe aktarma.
 * IndexedDB silinse bile verilerin kurtarılabilmesini sağlar.
 */

import { DB_CONSTANTS } from '@/config'
import { db } from '@/db'

// ============================================
// Types
// ============================================

export interface ExportOptions {
    /** Aktiviteleri dahil et */
    includeActivities?: boolean | undefined
    /** Zaman oturumlarını dahil et */
    includeSessions?: boolean | undefined
    /** Alışkanlıkları dahil et */
    includeHabits?: boolean | undefined
    /** Alışkanlık loglarını dahil et */
    includeHabitLogs?: boolean | undefined
    /** Kuralları dahil et */
    includeRules?: boolean | undefined
    /** Ayarları dahil et */
    includeSettings?: boolean | undefined
    /** Kategorileri dahil et */
    includeCategories?: boolean | undefined
}

export interface ImportResult {
    success: boolean
    error?: string | undefined
    stats?: {
        activities: number
        sessions: number
        habits: number
        habitLogs: number
        rules: number
        categories: number
    } | undefined
}

export interface ExportResult {
    success: boolean
    data?: string | undefined
    filename?: string | undefined
    error?: string | undefined
}

interface ExportData {
    version: number
    exportedAt: number
    data: {
        categories?: unknown[]
        activities?: unknown[]
        timeSessions?: unknown[]
        habits?: unknown[]
        habitLogs?: unknown[]
        rules?: unknown[]
        settings?: Record<string, unknown>
    }
}

// ============================================
// Export Functions
// ============================================

/**
 * Tüm verileri JSON formatında dışa aktar
 */
export async function exportAllData(options: ExportOptions = {}): Promise<ExportResult> {
    const {
        includeActivities = true,
        includeSessions = true,
        includeHabits = true,
        includeHabitLogs = true,
        includeRules = true,
        includeSettings = true,
        includeCategories = true,
    } = options

    try {
        const exportData: ExportData = {
            version: DB_CONSTANTS.SCHEMA_VERSION,
            exportedAt: Date.now(),
            data: {},
        }

        // Kategorileri al
        if (includeCategories) {
            exportData.data.categories = await db.categories.toArray()
        }

        // Aktiviteleri al
        if (includeActivities) {
            exportData.data.activities = await db.activities.toArray()
        }

        // Oturumları al
        if (includeSessions) {
            exportData.data.timeSessions = await db.timeSessions.toArray()
        }

        // Alışkanlıkları al
        if (includeHabits) {
            exportData.data.habits = await db.habits.toArray()
        }

        // Alışkanlık loglarını al
        if (includeHabitLogs) {
            exportData.data.habitLogs = await db.habitLogs.toArray()
        }

        // Kuralları al
        if (includeRules) {
            exportData.data.rules = await db.rules.toArray()
        }

        // Ayarları al
        if (includeSettings) {
            const settings = await db.settings.toArray()
            const settingsObj: Record<string, unknown> = {}
            settings.forEach(s => {
                settingsObj[s.key] = s.value
            })
            exportData.data.settings = settingsObj
        }

        // JSON string oluştur
        const jsonString = JSON.stringify(exportData, null, 2)
        const filename = `lifeflow-backup-${new Date().toISOString().split('T')[0]}.json`

        return {
            success: true,
            data: jsonString,
            filename,
        }
    } catch (error) {
        console.error('[BackupService] Export failed:', error)
        return {
            success: false,
            error: `Dışa aktarma hatası: ${String(error)}`,
        }
    }
}

/**
 * Yedek dosyasını indir
 */
export function downloadBackup(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
}

// ============================================
// Import Functions
// ============================================

/**
 * JSON dosyasından verileri içe aktar
 */
export async function importData(jsonString: string, merge = false): Promise<ImportResult> {
    try {
        // JSON parse
        let rawData: unknown
        try {
            rawData = JSON.parse(jsonString)
        } catch {
            return {
                success: false,
                error: 'Geçersiz JSON formatı',
            }
        }

        // Temel yapı kontrolü
        if (!rawData || typeof rawData !== 'object') {
            return {
                success: false,
                error: 'Geçersiz veri yapısı',
            }
        }

        const exportData = rawData as ExportData

        // Versiyon kontrolü
        if (typeof exportData.version !== 'number') {
            return {
                success: false,
                error: 'Versiyon bilgisi eksik',
            }
        }

        if (exportData.version > DB_CONSTANTS.SCHEMA_VERSION) {
            return {
                success: false,
                error: `Bu yedek dosyası daha yeni bir sürüme ait (v${exportData.version}). Lütfen uygulamayı güncelleyin.`,
            }
        }

        const stats = {
            activities: 0,
            sessions: 0,
            habits: 0,
            habitLogs: 0,
            rules: 0,
            categories: 0,
        }

        // Transaction ile güvenli import
        await db.transaction('rw',
            [db.activities, db.timeSessions, db.habits, db.habitLogs, db.rules, db.categories, db.settings],
            async () => {
                // Merge değilse mevcut verileri temizle
                if (!merge) {
                    await db.activities.clear()
                    await db.timeSessions.clear()
                    await db.habits.clear()
                    await db.habitLogs.clear()
                    await db.rules.clear()
                    await db.categories.clear()
                }

                // Kategorileri içe aktar
                const categories = exportData.data.categories as Array<{ id: string }> | undefined
                if (categories?.length) {
                    for (const category of categories) {
                        if (merge) {
                            const existing = await db.categories.get(category.id)
                            if (!existing) {
                                await db.categories.add(category as Parameters<typeof db.categories.add>[0])
                                stats.categories++
                            }
                        } else {
                            await db.categories.add(category as Parameters<typeof db.categories.add>[0])
                            stats.categories++
                        }
                    }
                }

                // Aktiviteleri içe aktar
                const activities = exportData.data.activities as Array<{ id: string }> | undefined
                if (activities?.length) {
                    for (const activity of activities) {
                        if (merge) {
                            const existing = await db.activities.get(activity.id)
                            if (!existing) {
                                await db.activities.add(activity as Parameters<typeof db.activities.add>[0])
                                stats.activities++
                            }
                        } else {
                            await db.activities.add(activity as Parameters<typeof db.activities.add>[0])
                            stats.activities++
                        }
                    }
                }

                // Oturumları içe aktar
                const sessions = exportData.data.timeSessions as Array<{ id: string }> | undefined
                if (sessions?.length) {
                    for (const session of sessions) {
                        if (merge) {
                            const existing = await db.timeSessions.get(session.id)
                            if (!existing) {
                                await db.timeSessions.add(session as Parameters<typeof db.timeSessions.add>[0])
                                stats.sessions++
                            }
                        } else {
                            await db.timeSessions.add(session as Parameters<typeof db.timeSessions.add>[0])
                            stats.sessions++
                        }
                    }
                }

                // Alışkanlıkları içe aktar
                const habits = exportData.data.habits as Array<{ id: string }> | undefined
                if (habits?.length) {
                    for (const habit of habits) {
                        if (merge) {
                            const existing = await db.habits.get(habit.id)
                            if (!existing) {
                                await db.habits.add(habit as Parameters<typeof db.habits.add>[0])
                                stats.habits++
                            }
                        } else {
                            await db.habits.add(habit as Parameters<typeof db.habits.add>[0])
                            stats.habits++
                        }
                    }
                }

                // Alışkanlık loglarını içe aktar
                const habitLogs = exportData.data.habitLogs as Array<{ id: string }> | undefined
                if (habitLogs?.length) {
                    for (const log of habitLogs) {
                        if (merge) {
                            const existing = await db.habitLogs.get(log.id)
                            if (!existing) {
                                await db.habitLogs.add(log as Parameters<typeof db.habitLogs.add>[0])
                                stats.habitLogs++
                            }
                        } else {
                            await db.habitLogs.add(log as Parameters<typeof db.habitLogs.add>[0])
                            stats.habitLogs++
                        }
                    }
                }

                // Kuralları içe aktar
                const rules = exportData.data.rules as Array<{ id: string }> | undefined
                if (rules?.length) {
                    for (const rule of rules) {
                        if (merge) {
                            const existing = await db.rules.get(rule.id)
                            if (!existing) {
                                await db.rules.add(rule as Parameters<typeof db.rules.add>[0])
                                stats.rules++
                            }
                        } else {
                            await db.rules.add(rule as Parameters<typeof db.rules.add>[0])
                            stats.rules++
                        }
                    }
                }

                // Ayarları içe aktar
                if (exportData.data.settings && typeof exportData.data.settings === 'object') {
                    for (const [key, value] of Object.entries(exportData.data.settings)) {
                        const typedValue = value as string | number | boolean | object
                        await db.settings.put({ key, value: typedValue })
                    }
                }
            }
        )

        return {
            success: true,
            stats,
        }
    } catch (error) {
        console.error('[BackupService] Import failed:', error)
        return {
            success: false,
            error: `İçe aktarma hatası: ${String(error)}`,
        }
    }
}

/**
 * Dosya seçici aç ve içe aktar
 */
export function openFileAndImport(onComplete: (result: ImportResult) => void, merge = false): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) {
            onComplete({ success: false, error: 'Dosya seçilmedi' })
            return
        }

        try {
            const text = await file.text()
            const result = await importData(text, merge)
            onComplete(result)
        } catch (error) {
            onComplete({ success: false, error: `Dosya okuma hatası: ${String(error)}` })
        }
    }

    input.click()
}
