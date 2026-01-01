import { db } from '@/db'
import type { Setting, SettingKey } from '@/db/types'
import { eventBus } from '@/events'
import { create } from 'zustand'

interface SettingsState {
    // Settings values
    rolloverHour: number
    weekStart: 1 | 7
    theme: 'light' | 'dark' | 'system'
    language: string
    multitaskingEnabled: boolean
    mergeThresholdMinutes: number
    defaultPomodoroConfigId: string | null

    // Pomodoro settings
    pomodoroWorkDuration: number // in minutes
    pomodoroBreakDuration: number // in minutes
    pomodoroLongBreakDuration: number // in minutes
    pomodoroSessionsBeforeLongBreak: number
    pomodoroAutoStartBreak: boolean
    pomodoroAutoStartWork: boolean
    pomodoroSoundEnabled: boolean

    // State
    isLoading: boolean
    isInitialized: boolean

    // Actions
    initialize: () => Promise<void>
    updateSetting: <K extends SettingKey>(key: K, value: Setting['value']) => Promise<void>
    getSetting: <K extends SettingKey>(key: K) => Setting['value'] | undefined
    setRolloverHour: (hour: number) => Promise<void>
    setWeekStart: (day: 1 | 7) => Promise<void>
    setPomodoroSetting: (key: string, value: number | boolean) => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    // Default values
    rolloverHour: 4,
    weekStart: 1,
    theme: 'system',
    language: 'tr',
    multitaskingEnabled: false,
    mergeThresholdMinutes: 5,
    defaultPomodoroConfigId: null,

    // Pomodoro defaults
    pomodoroWorkDuration: 25,
    pomodoroBreakDuration: 5,
    pomodoroLongBreakDuration: 15,
    pomodoroSessionsBeforeLongBreak: 4,
    pomodoroAutoStartBreak: false,
    pomodoroAutoStartWork: false,
    pomodoroSoundEnabled: true,

    isLoading: true,
    isInitialized: false,

    initialize: async () => {
        try {
            const settings = await db.settings.toArray()

            const settingsMap = new Map<string, Setting['value']>()
            settings.forEach((s) => {
                settingsMap.set(s.key, s.value)
            })

            // Load Pomodoro settings from localStorage
            const pomodoroSettings = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}')

            set({
                rolloverHour: (settingsMap.get('rolloverHour') as number) ?? 4,
                weekStart: (settingsMap.get('weekStart') as 1 | 7) ?? 1,
                theme: (settingsMap.get('theme') as 'light' | 'dark' | 'system') ?? 'system',
                language: (settingsMap.get('language') as string) ?? 'tr',
                multitaskingEnabled: (settingsMap.get('multitaskingEnabled') as boolean) ?? false,
                mergeThresholdMinutes: (settingsMap.get('mergeThresholdMinutes') as number) ?? 5,
                defaultPomodoroConfigId: (settingsMap.get('defaultPomodoroConfigId') as string) ?? null,
                // Pomodoro settings from localStorage
                pomodoroWorkDuration: pomodoroSettings.workDuration ?? 25,
                pomodoroBreakDuration: pomodoroSettings.breakDuration ?? 5,
                pomodoroLongBreakDuration: pomodoroSettings.longBreakDuration ?? 15,
                pomodoroSessionsBeforeLongBreak: pomodoroSettings.sessionsBeforeLongBreak ?? 4,
                pomodoroAutoStartBreak: pomodoroSettings.autoStartBreak ?? false,
                pomodoroAutoStartWork: pomodoroSettings.autoStartWork ?? false,
                pomodoroSoundEnabled: pomodoroSettings.soundEnabled ?? true,
                isLoading: false,
                isInitialized: true,
            })
        } catch (error) {
            console.error('Failed to initialize settings:', error)
            set({ isLoading: false })
        }
    },

    updateSetting: async (key, value) => {
        const oldValue = get()[key as keyof SettingsState]

        try {
            await db.settings.put({ key, value })

            set({ [key]: value } as Partial<SettingsState>)

            // Publish event
            await eventBus.publish('SETTING_CHANGED', {
                key,
                oldValue,
                newValue: value,
            })
        } catch (error) {
            console.error(`Failed to update setting ${key}:`, error)
            throw error
        }
    },

    getSetting: (key) => {
        return get()[key as keyof SettingsState] as Setting['value'] | undefined
    },

    setRolloverHour: async (hour) => {
        const oldValue = get().rolloverHour
        try {
            await db.settings.put({ key: 'rolloverHour', value: hour })
            set({ rolloverHour: hour })
            await eventBus.publish('SETTING_CHANGED', {
                key: 'rolloverHour',
                oldValue,
                newValue: hour,
            })
        } catch (error) {
            console.error('Failed to update rolloverHour:', error)
        }
    },

    setWeekStart: async (day) => {
        const oldValue = get().weekStart
        try {
            await db.settings.put({ key: 'weekStart', value: day })
            set({ weekStart: day })
            await eventBus.publish('SETTING_CHANGED', {
                key: 'weekStart',
                oldValue,
                newValue: day,
            })
        } catch (error) {
            console.error('Failed to update weekStart:', error)
        }
    },

    setPomodoroSetting: (key, value) => {
        // Update state
        set({ [key]: value } as Partial<SettingsState>)

        // Persist to localStorage
        const current = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}')
        const keyMap: Record<string, string> = {
            pomodoroWorkDuration: 'workDuration',
            pomodoroBreakDuration: 'breakDuration',
            pomodoroLongBreakDuration: 'longBreakDuration',
            pomodoroSessionsBeforeLongBreak: 'sessionsBeforeLongBreak',
            pomodoroAutoStartBreak: 'autoStartBreak',
            pomodoroAutoStartWork: 'autoStartWork',
            pomodoroSoundEnabled: 'soundEnabled',
        }
        if (keyMap[key]) {
            current[keyMap[key]] = value
            localStorage.setItem('pomodoroSettings', JSON.stringify(current))
        }
    },
}))
