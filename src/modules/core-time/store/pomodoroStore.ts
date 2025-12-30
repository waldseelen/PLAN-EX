import { db } from '@/db'
import type { PomodoroConfig } from '@/db/types'
import { eventBus } from '@/events'
import { create } from 'zustand'

// Pomodoro Session State
export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak' | 'idle'

interface PomodoroState {
    // Current session state
    isActive: boolean
    phase: PomodoroPhase
    currentActivityId: string | null
    timeRemaining: number // seconds
    sessionsCompleted: number

    // Config
    config: PomodoroConfig | null
    configs: PomodoroConfig[]

    // Auto-start settings
    autoStartBreaks: boolean
    autoStartWork: boolean

    // Loading
    isLoading: boolean

    // Actions
    initialize: () => Promise<void>
    startPomodoro: (activityId: string, configId?: string) => Promise<void>
    pausePomodoro: () => void
    resumePomodoro: () => void
    skipPhase: () => void
    stopPomodoro: () => Promise<void>
    tick: () => void

    // Config actions
    updateConfig: (id: string, data: Partial<PomodoroConfig>) => Promise<void>
    setAutoStartBreaks: (value: boolean) => void
    setAutoStartWork: (value: boolean) => void
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
    isActive: false,
    phase: 'idle',
    currentActivityId: null,
    timeRemaining: 0,
    sessionsCompleted: 0,
    config: null,
    configs: [],
    autoStartBreaks: true,
    autoStartWork: false,
    isLoading: true,

    initialize: async () => {
        try {
            const configs = await db.pomodoroConfigs.toArray()
            const defaultConfig = configs.find(c => c.isDefault) || configs[0]

            set({
                configs,
                config: defaultConfig || null,
                isLoading: false,
            })
        } catch (error) {
            console.error('Failed to initialize pomodoro:', error)
            set({ isLoading: false })
        }
    },

    startPomodoro: async (activityId, configId) => {
        const { configs, config: currentConfig } = get()

        let config = currentConfig
        if (configId) {
            config = configs.find(c => c.id === configId) || currentConfig
        }

        if (!config) {
            console.error('No pomodoro config found')
            return
        }

        set({
            isActive: true,
            phase: 'work',
            currentActivityId: activityId,
            timeRemaining: config.workDuration,
            sessionsCompleted: 0,
            config,
        })

        await eventBus.publish('POMODORO_STARTED', {
            activityId,
            phase: 'work',
            duration: config.workDuration,
        })
    },

    pausePomodoro: () => {
        set({ isActive: false })
    },

    resumePomodoro: () => {
        set({ isActive: true })
    },

    skipPhase: () => {
        const { phase, config, sessionsCompleted, autoStartBreaks, autoStartWork } = get()

        if (!config) return

        if (phase === 'work') {
            const newSessionsCompleted = sessionsCompleted + 1
            const isLongBreak = newSessionsCompleted % config.sessionsBeforeLongBreak === 0
            const nextPhase = isLongBreak ? 'longBreak' : 'shortBreak'
            const nextDuration = isLongBreak ? config.longBreakDuration : config.shortBreakDuration

            set({
                phase: nextPhase,
                timeRemaining: nextDuration,
                sessionsCompleted: newSessionsCompleted,
                isActive: autoStartBreaks,
            })
        } else {
            // Break ended, start work
            set({
                phase: 'work',
                timeRemaining: config.workDuration,
                isActive: autoStartWork,
            })
        }
    },

    stopPomodoro: async () => {
        const { currentActivityId, phase } = get()

        set({
            isActive: false,
            phase: 'idle',
            currentActivityId: null,
            timeRemaining: 0,
            sessionsCompleted: 0,
        })

        if (currentActivityId && phase === 'work') {
            await eventBus.publish('POMODORO_STOPPED', {
                activityId: currentActivityId,
            })
        }
    },

    tick: () => {
        const { isActive, timeRemaining, phase, config, sessionsCompleted, autoStartBreaks, autoStartWork, currentActivityId } = get()

        if (!isActive || timeRemaining <= 0 || !config) return

        const newTimeRemaining = timeRemaining - 1

        if (newTimeRemaining <= 0) {
            // Phase completed
            if (phase === 'work') {
                const newSessionsCompleted = sessionsCompleted + 1
                const isLongBreak = newSessionsCompleted % config.sessionsBeforeLongBreak === 0
                const nextPhase = isLongBreak ? 'longBreak' : 'shortBreak'
                const nextDuration = isLongBreak ? config.longBreakDuration : config.shortBreakDuration

                set({
                    phase: nextPhase,
                    timeRemaining: nextDuration,
                    sessionsCompleted: newSessionsCompleted,
                    isActive: autoStartBreaks,
                })

                // Publish event
                eventBus.publish('POMODORO_COMPLETED', {
                    activityId: currentActivityId!,
                    sessionNumber: newSessionsCompleted,
                    isLongBreakNext: isLongBreak,
                    sessionsCompleted: newSessionsCompleted,
                })

                // Browser notification
                if (Notification.permission === 'granted') {
                    new Notification('🍅 Pomodoro Tamamlandı!', {
                        body: `Harika! ${isLongBreak ? 'Uzun' : 'Kısa'} mola zamanı.`,
                        icon: '/icons/icon-192.png',
                    })
                }
            } else {
                // Break ended
                set({
                    phase: 'work',
                    timeRemaining: config.workDuration,
                    isActive: autoStartWork,
                })

                if (Notification.permission === 'granted') {
                    new Notification('⏰ Mola Bitti!', {
                        body: 'Çalışmaya devam etme zamanı.',
                        icon: '/icons/icon-192.png',
                    })
                }
            }
        } else {
            set({ timeRemaining: newTimeRemaining })
        }
    },

    updateConfig: async (id, data) => {
        await db.pomodoroConfigs.update(id, data)

        set((state) => ({
            configs: state.configs.map(c => c.id === id ? { ...c, ...data } : c),
            config: state.config?.id === id ? { ...state.config, ...data } : state.config,
        }))
    },

    setAutoStartBreaks: (value) => {
        set({ autoStartBreaks: value })
    },

    setAutoStartWork: (value) => {
        set({ autoStartWork: value })
    },
}))
