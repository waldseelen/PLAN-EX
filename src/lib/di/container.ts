/**
 * Plan.Ex - Service Container
 *
 * Dependency Injection için merkezi servis yönetimi.
 * Döngüsel bağımlılıkları önler ve test edilebilirliği artırır.
 */

import type { RuleActionConfig } from '@/db/types'

// Rule types defined locally (modules/rules removed)
interface RuleContext {
    habitId?: string
    activityId?: string
    timerId?: string
    [key: string]: unknown
}

interface ActionResult {
    success: boolean
    message?: string
}

// ============================================
// Service Interfaces
// ============================================

/**
 * Timer Service arayüzü
 * Timer işlemlerini soyutlar
 */
export interface ITimerService {
    startTimer(activityId: string, mode?: 'normal' | 'pomodoro'): Promise<string>
    stopTimer(timerId: string, rolloverHour?: number): Promise<unknown>
    pauseTimer(timerId: string): Promise<void>
    resumeTimer(timerId: string): Promise<void>
    getRunningTimers(): unknown[]
}

/**
 * Notification Service arayüzü
 * Bildirim işlemlerini soyutlar
 */
export interface INotificationService {
    send(title: string, body: string, icon?: string): Promise<boolean>
    requestPermission(): Promise<NotificationPermission>
    hasPermission(): boolean
}

/**
 * Habit Service arayüzü
 * Alışkanlık işlemlerini soyutlar
 */
export interface IHabitService {
    checkHabit(habitId: string, value?: number, note?: string, rolloverHour?: number): Promise<void>
    uncheckHabit(habitId: string, rolloverHour?: number): Promise<void>
    skipHabit(habitId: string, note?: string, rolloverHour?: number): Promise<void>
}

/**
 * Database Service arayüzü
 * Veritabanı işlemlerini soyutlar
 */
export interface IDatabaseService {
    getActivityById(id: string): Promise<unknown>
    getHabitById(id: string): Promise<unknown>
    getRuleById(id: string): Promise<unknown>
}

/**
 * Action Executor arayüzü
 * Kural aksiyonlarını çalıştırır
 */
export interface IActionExecutor {
    execute(action: RuleActionConfig, context: RuleContext): Promise<ActionResult>
}

// ============================================
// Service Container
// ============================================

type ServiceFactory<T> = () => T | Promise<T>

interface ServiceRegistration<T> {
    factory: ServiceFactory<T>
    singleton: boolean
    instance?: T
}

/**
 * IoC (Inversion of Control) Container
 * Servislerin merkezi yönetimi ve DI desteği
 */
class ServiceContainer {
    private services = new Map<string, ServiceRegistration<unknown>>()
    private resolving = new Set<string>()

    /**
     * Servis kaydet (singleton)
     */
    registerSingleton<T>(name: string, factory: ServiceFactory<T>): void {
        this.services.set(name, { factory, singleton: true })
    }

    /**
     * Servis kaydet (transient - her çağrıda yeni instance)
     */
    registerTransient<T>(name: string, factory: ServiceFactory<T>): void {
        this.services.set(name, { factory, singleton: false })
    }

    /**
     * Servis instance kaydet (hazır instance)
     */
    registerInstance<T>(name: string, instance: T): void {
        this.services.set(name, {
            factory: () => instance,
            singleton: true,
            instance
        })
    }

    /**
     * Servisi çözümle ve döndür
     */
    async resolve<T>(name: string): Promise<T> {
        const registration = this.services.get(name)

        if (!registration) {
            throw new Error(`Service '${name}' is not registered`)
        }

        // Döngüsel bağımlılık kontrolü
        if (this.resolving.has(name)) {
            throw new Error(`Circular dependency detected for service '${name}'`)
        }

        // Singleton ve zaten oluşturulmuşsa döndür
        if (registration.singleton && registration.instance !== undefined) {
            return registration.instance as T
        }

        // Yeni instance oluştur
        this.resolving.add(name)
        try {
            const instance = await registration.factory()

            if (registration.singleton) {
                registration.instance = instance
            }

            return instance as T
        } finally {
            this.resolving.delete(name)
        }
    }

    /**
     * Servis kayıtlı mı kontrol et
     */
    has(name: string): boolean {
        return this.services.has(name)
    }

    /**
     * Tüm servisleri temizle (test için)
     */
    clear(): void {
        this.services.clear()
        this.resolving.clear()
    }

    /**
     * Belirli bir servisi sil
     */
    unregister(name: string): void {
        this.services.delete(name)
    }
}

// Global container instance
export const container = new ServiceContainer()

// ============================================
// Service Names (Constants)
// ============================================

export const SERVICES = {
    TIMER: 'TimerService',
    NOTIFICATION: 'NotificationService',
    HABIT: 'HabitService',
    DATABASE: 'DatabaseService',
    ACTION_EXECUTOR: 'ActionExecutor',
} as const

// ============================================
// Default Service Implementations
// ============================================

/**
 * Varsayılan Notification Service implementasyonu
 */
export class DefaultNotificationService implements INotificationService {
    private defaultIcon = '/icons/icon-192.png'

    async send(title: string, body: string, icon?: string): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('Notifications not supported')
            return false
        }

        if (Notification.permission !== 'granted') {
            const permission = await this.requestPermission()
            if (permission !== 'granted') {
                return false
            }
        }

        try {
            new Notification(title, {
                body,
                icon: icon || this.defaultIcon
            })
            return true
        } catch (error) {
            console.error('Failed to send notification:', error)
            return false
        }
    }

    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            return 'denied'
        }
        return await Notification.requestPermission()
    }

    hasPermission(): boolean {
        return 'Notification' in window && Notification.permission === 'granted'
    }
}

// ============================================
// Container Initialization
// ============================================

/**
 * Servisleri başlat ve kaydet
 * Bu fonksiyon uygulama başlatılırken çağrılır
 */
export async function initializeServices(): Promise<void> {
    // Notification Service (varsayılan)
    container.registerSingleton(SERVICES.NOTIFICATION, () => new DefaultNotificationService())

    // Timer Service - Stub (Plan.Ex'te Pomodoro ayrı bir page)
    container.registerSingleton(SERVICES.TIMER, () => {
        return {
            startTimer: async () => '',
            stopTimer: async () => undefined,
            pauseTimer: async () => { },
            resumeTimer: async () => { },
            getRunningTimers: () => [],
        } satisfies ITimerService
    })

    // Habit Service - Lazy registration
    container.registerSingleton(SERVICES.HABIT, async () => {
        const { useHabitsStore } = await import('@/modules/habits/store/habitsStore')
        const store = useHabitsStore.getState()
        return {
            checkHabit: (habitId: string, value?: number, note?: string, rolloverHour?: number) =>
                store.checkHabit(habitId, value, note, rolloverHour),
            uncheckHabit: (habitId: string, rolloverHour?: number) =>
                store.uncheckHabit(habitId, rolloverHour),
            skipHabit: (habitId: string, note?: string, rolloverHour?: number) =>
                store.skipHabit(habitId, note, rolloverHour),
        } satisfies IHabitService
    })

    // Database Service
    container.registerSingleton(SERVICES.DATABASE, async () => {
        const { db } = await import('@/db')
        return {
            getActivityById: (id: string) => db.activities.get(id),
            getHabitById: (id: string) => db.habits.get(id),
            getRuleById: (id: string) => db.rules.get(id),
        } satisfies IDatabaseService
    })

    console.log('[ServiceContainer] Services initialized')
}

/**
 * Test için servisleri mock'la
 */
export function mockService<T>(name: string, mock: T): void {
    container.registerInstance(name, mock)
}
