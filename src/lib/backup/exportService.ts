/**
 * LifeFlow - Data Export/Import Service
 *
 * Kullanıcı verilerinin yedeklenmesi ve geri yüklenmesi.
 * JSON formatında export, validation ile güvenli import.
 */

import { db } from '@/db'
import { ExportDataSchema, formatValidationError } from '@/lib/validation/schemas'

// ============================================
// Types
// ============================================

export interface ExportOptions {
    /** Kategorileri dahil et */
    includeCategories?: boolean
    /** Aktiviteleri dahil et */
    includeActivities?: boolean
    /** Zaman oturumlarını dahil et */
    includeTimeSessions?: boolean
    /** Alışkanlıkları dahil et */
    includeHabits?: boolean
    /** Alışkanlık loglarını dahil et */
    includeHabitLogs?: boolean
    /** Kuralları dahil et */
    includeRules?: boolean
    /** Ayarları dahil et */
    includeSettings?: boolean
    /** Tüm verileri dahil et (varsayılan) */
    includeAll?: boolean
}

export interface ImportOptions {
    /** Mevcut verileri temizle */
    clearExisting?: boolean
    /** Çakışma stratejisi */
    conflictStrategy?: 'skip' | 'overwrite' | 'merge'
    /** Doğrulama hataları için katı mod */
    strictMode?: boolean
}

export interface ImportResult {
    success: boolean
    imported: {
        categories: number
        activities: number
        timeSessions: number
        habits: number
        habitLogs: number
        rules: number
    }
    skipped: number
    errors: string[]
}

interface ExportData {
    version: number
    exportedAt: number
    appVersion: string
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
 * Tüm verileri JSON olarak export et
 *
 * @example
 * const blob = await exportAllData()
 * downloadBlob(blob, 'lifeflow-backup.json')
 */
export async function exportAllData(options: ExportOptions = { includeAll: true }): Promise<Blob> {
    const { includeAll = true } = options

    const data: ExportData = {
        version: 1,
        exportedAt: Date.now(),
        appVersion: import.meta.env.VITE_APP_VERSION || '0.1.0',
        data: {},
    }

    // Kategoriler
    if (includeAll || options.includeCategories) {
        data.data.categories = await db.categories.toArray()
    }

    // Aktiviteler
    if (includeAll || options.includeActivities) {
        data.data.activities = await db.activities.toArray()
    }

    // Zaman oturumları
    if (includeAll || options.includeTimeSessions) {
        data.data.timeSessions = await db.timeSessions.toArray()
    }

    // Alışkanlıklar
    if (includeAll || options.includeHabits) {
        data.data.habits = await db.habits.toArray()
    }

    // Alışkanlık logları
    if (includeAll || options.includeHabitLogs) {
        data.data.habitLogs = await db.habitLogs.toArray()
    }

    // Kurallar
    if (includeAll || options.includeRules) {
        data.data.rules = await db.rules.toArray()
    }

    // Ayarlar
    if (includeAll || options.includeSettings) {
        const settings = await db.settings.toArray()
        data.data.settings = Object.fromEntries(
            settings.map(s => [s.key, s.value])
        )
    }

    const json = JSON.stringify(data, null, 2)
    return new Blob([json], { type: 'application/json' })
}

/**
 * Sadece zaman verilerini export et (hafif backup)
 */
export async function exportTimeData(): Promise<Blob> {
    return exportAllData({
        includeActivities: true,
        includeTimeSessions: true,
        includeCategories: true,
    })
}

/**
 * Sadece alışkanlık verilerini export et
 */
export async function exportHabitData(): Promise<Blob> {
    return exportAllData({
        includeHabits: true,
        includeHabitLogs: true,
        includeCategories: true,
    })
}

// ============================================
// Import Functions
// ============================================

/**
 * JSON verisini import et
 *
 * @example
 * const file = await fileInput.files[0].text()
 * const result = await importData(file)
 * if (result.success) {
 *   toast.success(`${result.imported.activities} aktivite import edildi`)
 * }
 */
export async function importData(
    jsonString: string,
    options: ImportOptions = {}
): Promise<ImportResult> {
    const {
        clearExisting = false,
        conflictStrategy = 'skip',
        strictMode = false,
    } = options

    const result: ImportResult = {
        success: false,
        imported: {
            categories: 0,
            activities: 0,
            timeSessions: 0,
            habits: 0,
            habitLogs: 0,
            rules: 0,
        },
        skipped: 0,
        errors: [],
    }

    try {
        // JSON parse
        let data: unknown
        try {
            data = JSON.parse(jsonString)
        } catch {
            result.errors.push('Geçersiz JSON formatı')
            return result
        }

        // Schema validation
        const validation = ExportDataSchema.safeParse(data)
        if (!validation.success) {
            if (strictMode) {
                result.errors.push(`Şema doğrulama hatası: ${formatValidationError(validation.error)}`)
                return result
            }
            // Relaxed mode - uyarı ekle ama devam et
            result.errors.push(`Uyarı: Bazı veriler şemaya uymuyor, atlanacak`)
        }

        const exportData = data as ExportData

        // Version kontrolü
        if (exportData.version > 1) {
            result.errors.push(`Desteklenmeyen export versiyonu: ${exportData.version}`)
            return result
        }

        // Mevcut verileri temizle (opsiyonel)
        if (clearExisting) {
            await db.transaction('rw', [
                db.categories,
                db.activities,
                db.timeSessions,
                db.habits,
                db.habitLogs,
                db.rules,
            ], async () => {
                await db.categories.clear()
                await db.activities.clear()
                await db.timeSessions.clear()
                await db.habits.clear()
                await db.habitLogs.clear()
                await db.rules.clear()
            })
        }

        // Import işlemi (transaction içinde)
        await db.transaction('rw', [
            db.categories,
            db.activities,
            db.timeSessions,
            db.habits,
            db.habitLogs,
            db.rules,
            db.settings,
        ], async () => {
            // Kategoriler
            if (exportData.data.categories) {
                for (const item of exportData.data.categories) {
                    try {
                        const existing = await db.categories.get((item as { id: string }).id)
                        if (existing && conflictStrategy === 'skip') {
                            result.skipped++
                            continue
                        }
                        if (existing && conflictStrategy === 'overwrite') {
                            await db.categories.put(item as never)
                        } else {
                            await db.categories.add(item as never)
                        }
                        result.imported.categories++
                    } catch {
                        result.skipped++
                    }
                }
            }

            // Aktiviteler
            if (exportData.data.activities) {
                for (const item of exportData.data.activities) {
                    try {
                        const existing = await db.activities.get((item as { id: string }).id)
                        if (existing && conflictStrategy === 'skip') {
                            result.skipped++
                            continue
                        }
                        if (existing && conflictStrategy === 'overwrite') {
                            await db.activities.put(item as never)
                        } else {
                            await db.activities.add(item as never)
                        }
                        result.imported.activities++
                    } catch {
                        result.skipped++
                    }
                }
            }

            // Zaman oturumları
            if (exportData.data.timeSessions) {
                for (const item of exportData.data.timeSessions) {
                    try {
                        const existing = await db.timeSessions.get((item as { id: string }).id)
                        if (existing && conflictStrategy === 'skip') {
                            result.skipped++
                            continue
                        }
                        if (existing && conflictStrategy === 'overwrite') {
                            await db.timeSessions.put(item as never)
                        } else {
                            await db.timeSessions.add(item as never)
                        }
                        result.imported.timeSessions++
                    } catch {
                        result.skipped++
                    }
                }
            }

            // Alışkanlıklar
            if (exportData.data.habits) {
                for (const item of exportData.data.habits) {
                    try {
                        const existing = await db.habits.get((item as { id: string }).id)
                        if (existing && conflictStrategy === 'skip') {
                            result.skipped++
                            continue
                        }
                        if (existing && conflictStrategy === 'overwrite') {
                            await db.habits.put(item as never)
                        } else {
                            await db.habits.add(item as never)
                        }
                        result.imported.habits++
                    } catch {
                        result.skipped++
                    }
                }
            }

            // Alışkanlık logları
            if (exportData.data.habitLogs) {
                for (const item of exportData.data.habitLogs) {
                    try {
                        const existing = await db.habitLogs.get((item as { id: string }).id)
                        if (existing && conflictStrategy === 'skip') {
                            result.skipped++
                            continue
                        }
                        if (existing && conflictStrategy === 'overwrite') {
                            await db.habitLogs.put(item as never)
                        } else {
                            await db.habitLogs.add(item as never)
                        }
                        result.imported.habitLogs++
                    } catch {
                        result.skipped++
                    }
                }
            }

            // Kurallar
            if (exportData.data.rules) {
                for (const item of exportData.data.rules) {
                    try {
                        const existing = await db.rules.get((item as { id: string }).id)
                        if (existing && conflictStrategy === 'skip') {
                            result.skipped++
                            continue
                        }
                        if (existing && conflictStrategy === 'overwrite') {
                            await db.rules.put(item as never)
                        } else {
                            await db.rules.add(item as never)
                        }
                        result.imported.rules++
                    } catch {
                        result.skipped++
                    }
                }
            }

            // Ayarlar
            if (exportData.data.settings) {
                for (const [key, value] of Object.entries(exportData.data.settings)) {
                    await db.settings.put({ key, value } as never)
                }
            }
        })

        result.success = true
        return result

    } catch (error) {
        result.errors.push(`Import hatası: ${error instanceof Error ? error.message : String(error)}`)
        return result
    }
}

// ============================================
// Download Helper
// ============================================

/**
 * Blob'u dosya olarak indir
 *
 * @example
 * const blob = await exportAllData()
 * downloadBlob(blob, `lifeflow-backup-${Date.now()}.json`)
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

/**
 * Tarihli dosya adı oluştur
 */
export function getBackupFileName(prefix = 'lifeflow-backup'): string {
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0]
    return `${prefix}-${dateStr}.json`
}

// ============================================
// File Upload Helper
// ============================================

/**
 * Dosya seçici aç ve içeriği oku
 *
 * @example
 * const json = await pickAndReadFile()
 * if (json) {
 *   const result = await importData(json)
 * }
 */
export function pickAndReadFile(): Promise<string | null> {
    return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json,application/json'

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) {
                resolve(null)
                return
            }

            try {
                const text = await file.text()
                resolve(text)
            } catch {
                resolve(null)
            }
        }

        input.click()
    })
}

// ============================================
// Backup Info
// ============================================

/**
 * Import dosyasının bilgilerini al (import etmeden önce)
 */
export function getBackupInfo(jsonString: string): {
    valid: boolean
    version?: number
    exportedAt?: Date
    appVersion?: string
    counts?: {
        categories: number
        activities: number
        timeSessions: number
        habits: number
        habitLogs: number
        rules: number
    }
    error?: string
} {
    try {
        const data = JSON.parse(jsonString) as ExportData

        const result: {
            valid: boolean
            version?: number
            exportedAt?: Date
            appVersion?: string
            counts: {
                categories: number
                activities: number
                timeSessions: number
                habits: number
                habitLogs: number
                rules: number
            }
        } = {
            valid: true,
            counts: {
                categories: data.data.categories?.length || 0,
                activities: data.data.activities?.length || 0,
                timeSessions: data.data.timeSessions?.length || 0,
                habits: data.data.habits?.length || 0,
                habitLogs: data.data.habitLogs?.length || 0,
                rules: data.data.rules?.length || 0,
            },
        }

        if (data.version !== undefined) {
            result.version = data.version
        }
        if (data.exportedAt) {
            result.exportedAt = new Date(data.exportedAt)
        }
        if (data.appVersion !== undefined) {
            result.appVersion = data.appVersion
        }

        return result
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Geçersiz dosya',
        }
    }
}

// ============================================
// Auto Backup
// ============================================

const AUTO_BACKUP_KEY = 'lifeflow_auto_backup'

/**
 * Otomatik yerel yedek al (IndexedDB'ye kaydet)
 */
export async function createAutoBackup(): Promise<void> {
    try {
        const blob = await exportAllData()
        const text = await blob.text()

        localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: text,
        }))
    } catch (error) {
        console.error('[Backup] Auto backup failed:', error)
    }
}

/**
 * Son otomatik yedek bilgisini al
 */
export function getAutoBackupInfo(): { timestamp: Date; size: number } | null {
    try {
        const stored = localStorage.getItem(AUTO_BACKUP_KEY)
        if (!stored) return null

        const { timestamp, data } = JSON.parse(stored)
        return {
            timestamp: new Date(timestamp),
            size: data.length,
        }
    } catch {
        return null
    }
}

/**
 * Otomatik yedekten geri yükle
 */
export async function restoreFromAutoBackup(): Promise<ImportResult | null> {
    try {
        const stored = localStorage.getItem(AUTO_BACKUP_KEY)
        if (!stored) return null

        const { data } = JSON.parse(stored)
        return importData(data, { clearExisting: true })
    } catch {
        return null
    }
}
