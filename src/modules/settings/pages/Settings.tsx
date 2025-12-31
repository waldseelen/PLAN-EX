import { useTheme } from '@/app/providers/ThemeProvider'
import { db } from '@/db'
import { PWAInstallBanner } from '@/shared/components'
import {
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    ComputerDesktopIcon,
    MoonIcon,
    ShieldCheckIcon,
    SparklesIcon,
    SunIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'

export function Settings() {
    const { theme, setTheme } = useTheme()
    const { rolloverHour, weekStart, setRolloverHour, setWeekStart, initialize } = useSettingsStore()
    const [isExporting, setIsExporting] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [importSuccess, setImportSuccess] = useState(false)

    useEffect(() => {
        initialize()
    }, [initialize])

    const themeOptions = [
        { value: 'light', label: 'Açık', icon: SunIcon, desc: 'Gündüz için' },
        { value: 'dark', label: 'Koyu', icon: MoonIcon, desc: 'Gece için' },
        { value: 'system', label: 'Sistem', icon: ComputerDesktopIcon, desc: 'Otomatik' },
    ] as const

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const [categories, tags, activities, timeSessions, habits, habitLogs, settings] = await Promise.all([
                db.categories.toArray(),
                db.tags.toArray(),
                db.activities.toArray(),
                db.timeSessions.toArray(),
                db.habits.toArray(),
                db.habitLogs.toArray(),
                db.settings.toArray(),
            ])

            const exportData = {
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                data: {
                    categories,
                    tags,
                    activities,
                    timeSessions,
                    habits,
                    habitLogs,
                    settings,
                }
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `lifeflow-backup-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Export failed:', error)
        } finally {
            setIsExporting(false)
        }
    }

    const handleImport = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return

            setIsImporting(true)
            try {
                const text = await file.text()
                const importData = JSON.parse(text)

                if (!importData.data) {
                    throw new Error('Invalid backup file')
                }

                // Clear existing data and import
                await db.transaction('rw', [db.categories, db.tags, db.activities, db.timeSessions, db.habits, db.habitLogs, db.settings], async () => {
                    if (importData.data.categories) {
                        await db.categories.clear()
                        await db.categories.bulkAdd(importData.data.categories)
                    }
                    if (importData.data.tags) {
                        await db.tags.clear()
                        await db.tags.bulkAdd(importData.data.tags)
                    }
                    if (importData.data.activities) {
                        await db.activities.clear()
                        await db.activities.bulkAdd(importData.data.activities)
                    }
                    if (importData.data.timeSessions) {
                        await db.timeSessions.clear()
                        await db.timeSessions.bulkAdd(importData.data.timeSessions)
                    }
                    if (importData.data.habits) {
                        await db.habits.clear()
                        await db.habits.bulkAdd(importData.data.habits)
                    }
                    if (importData.data.habitLogs) {
                        await db.habitLogs.clear()
                        await db.habitLogs.bulkAdd(importData.data.habitLogs)
                    }
                    if (importData.data.settings) {
                        await db.settings.clear()
                        await db.settings.bulkAdd(importData.data.settings)
                    }
                })

                setImportSuccess(true)
                setTimeout(() => {
                    setImportSuccess(false)
                    window.location.reload()
                }, 2000)
            } catch (error) {
                console.error('Import failed:', error)
                alert('İçe aktarma başarısız. Dosya formatı hatalı olabilir.')
            } finally {
                setIsImporting(false)
            }
        }
        input.click()
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gradient">
                    Ayarlar
                </h1>
                <p className="text-surface-500 dark:text-surface-400 mt-1">
                    Uygulama tercihlerini yönet
                </p>
            </div>

            {/* Appearance */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                    Görünüm
                </h2>

                <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                        Tema
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setTheme(option.value)}
                                className={clsx(
                                    'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
                                    theme === option.value
                                        ? 'border-primary-500 bg-gradient-to-br from-primary-50/80 to-accent-50/50 dark:from-primary-900/30 dark:to-accent-900/20 shadow-glow'
                                        : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600'
                                )}
                            >
                                <div className={clsx(
                                    'w-10 h-10 rounded-xl flex items-center justify-center',
                                    theme === option.value
                                        ? 'gradient-primary shadow-md'
                                        : 'bg-surface-100 dark:bg-surface-700'
                                )}>
                                    <option.icon className={clsx(
                                        'w-5 h-5',
                                        theme === option.value
                                            ? 'text-white'
                                            : 'text-surface-500'
                                    )} />
                                </div>
                                <span className={clsx(
                                    'text-sm font-medium',
                                    theme === option.value
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-surface-700 dark:text-surface-300'
                                )}>
                                    {option.label}
                                </span>
                                <span className="text-xs text-surface-500">
                                    {option.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Time Settings */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                    Zaman Ayarları
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Gün Bitiş Saati
                        </label>
                        <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">
                            Bu saatten önce yapılan aktiviteler önceki güne sayılır
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {[0, 3, 4, 5, 6].map((hour) => (
                                <button
                                    key={hour}
                                    onClick={() => setRolloverHour(hour)}
                                    className={clsx(
                                        'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                        rolloverHour === hour
                                            ? 'gradient-primary text-white shadow-glow'
                                            : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                    )}
                                >
                                    {hour.toString().padStart(2, '0')}:00
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Hafta Başlangıcı
                        </label>
                        <div className="flex gap-2">
                            {[
                                { value: 1 as const, label: 'Pazartesi' },
                                { value: 7 as const, label: 'Pazar' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setWeekStart(option.value)}
                                    className={clsx(
                                        'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                        weekStart === option.value
                                            ? 'gradient-primary text-white shadow-glow'
                                            : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                    Veri Yönetimi
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                                <ArrowDownTrayIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
                            </div>
                            <div>
                                <p className="font-medium text-surface-900 dark:text-white">Verileri Dışa Aktar</p>
                                <p className="text-sm text-surface-500 dark:text-surface-400">
                                    Tüm verilerini JSON formatında indir
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="btn-success"
                        >
                            {isExporting ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                                'Dışa Aktar'
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <ArrowUpTrayIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="font-medium text-surface-900 dark:text-white">Verileri İçe Aktar</p>
                                <p className="text-sm text-surface-500 dark:text-surface-400">
                                    Önceden dışa aktarılmış verileri yükle
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleImport}
                            disabled={isImporting}
                            className="btn-primary"
                        >
                            {isImporting ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : importSuccess ? (
                                '✓ Başarılı!'
                            ) : (
                                'İçe Aktar'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* PWA Install */}
            <PWAInstallBanner showInSettings />

            {/* About */}
            <div className="card p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                        <SparklesIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gradient">LifeFlow</h2>
                        <p className="text-sm text-surface-500">v0.1.0 (MVP)</p>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-br from-primary-50/50 to-success-50/30 dark:from-primary-900/20 dark:to-success-900/10 rounded-2xl border border-primary-200/40 dark:border-primary-700/30">
                    <div className="flex items-start gap-3">
                        <ShieldCheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-surface-600 dark:text-surface-400">
                            <p className="font-medium text-surface-900 dark:text-white mb-1">
                                Offline-First & Gizlilik Odaklı
                            </p>
                            <p>
                                Tüm verilerin cihazında saklanır. İnternet bağlantısı gerekmez.
                                Verileriniz asla sunucularımıza gönderilmez.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
