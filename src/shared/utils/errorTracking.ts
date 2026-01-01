/**
 * Plan.Ex - Error Tracking & Reporting
 *
 * Merkezi hata yakalama ve raporlama servisi.
 * Gelecekte Sentry/Posthog entegrasyonu için hazır.
 */

// ============================================
// Types
// ============================================

export interface ErrorContext {
    /** Hatanın oluştuğu bileşen/modül */
    context: string
    /** Ek meta veriler */
    metadata?: Record<string, unknown>
    /** Kullanıcı ID'si (anonim) */
    userId?: string
    /** Hata seviyesi */
    level?: 'error' | 'warning' | 'info'
    /** Hata kategorisi */
    category?: 'database' | 'network' | 'ui' | 'validation' | 'unknown'
}

interface ErrorReport {
    id: string
    timestamp: number
    message: string
    stack?: string
    context: ErrorContext
    userAgent: string
    url: string
    appVersion: string
}

// ============================================
// Error Storage (Local)
// ============================================

const ERROR_STORAGE_KEY = 'lifeflow_error_log'
const MAX_STORED_ERRORS = 50

/**
 * Hataları local storage'da sakla
 */
function storeError(report: ErrorReport): void {
    try {
        const stored = localStorage.getItem(ERROR_STORAGE_KEY)
        const errors: ErrorReport[] = stored ? JSON.parse(stored) : []

        // En yeni hatayı ekle
        errors.unshift(report)

        // Maksimum sayıyı aşarsa eskileri sil
        if (errors.length > MAX_STORED_ERRORS) {
            errors.splice(MAX_STORED_ERRORS)
        }

        localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(errors))
    } catch {
        // Storage hatası - sessizce devam et
        console.warn('[ErrorTracking] Failed to store error locally')
    }
}

/**
 * Saklanan hataları al
 */
export function getStoredErrors(): ErrorReport[] {
    try {
        const stored = localStorage.getItem(ERROR_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

/**
 * Saklanan hataları temizle
 */
export function clearStoredErrors(): void {
    localStorage.removeItem(ERROR_STORAGE_KEY)
}

// ============================================
// Error Capture
// ============================================

/**
 * Hatayı yakala ve raporla
 *
 * @example
 * try {
 *   await db.activities.add(activity)
 * } catch (error) {
 *   captureException(error, {
 *     context: 'ActivityStore.createActivity',
 *     category: 'database'
 *   })
 *   throw error
 * }
 */
export function captureException(
    error: unknown,
    errorContext: ErrorContext
): void {
    const err = error instanceof Error ? error : new Error(String(error))

    const report: ErrorReport = {
        id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        message: err.message,
        context: {
            level: 'error',
            category: 'unknown',
            ...errorContext
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        appVersion: import.meta.env.VITE_APP_VERSION || '0.1.0',
    }

    // stack varsa ekle
    if (err.stack) {
        report.stack = err.stack
    }

    // Console'a log (development)
    if (import.meta.env.DEV) {
        console.error(`[${errorContext.context}]`, err)
        if (errorContext.metadata) {
            console.error('Metadata:', errorContext.metadata)
        }
    }

    // Local storage'a kaydet
    storeError(report)

    // Gelecekte: Sentry/Posthog'a gönder
    // if (import.meta.env.PROD) {
    //     Sentry.captureException(err, { extra: errorContext })
    // }
}

/**
 * Mesaj olarak log (hata olmayan uyarılar için)
 */
export function captureMessage(
    message: string,
    context: Omit<ErrorContext, 'context'> & { context?: string }
): void {
    const reportContext: ErrorContext = {
        context: context.context || 'Unknown',
        level: context.level || 'info',
        category: context.category || 'unknown',
    }
    if (context.metadata) {
        reportContext.metadata = context.metadata
    }

    const report: ErrorReport = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        message,
        context: reportContext,
        userAgent: navigator.userAgent,
        url: window.location.href,
        appVersion: import.meta.env.VITE_APP_VERSION || '0.1.0',
    }

    if (import.meta.env.DEV) {
        console.log(`[${report.context.context}] ${message}`)
    }

    storeError(report)
}

// ============================================
// Error Boundary Helper
// ============================================

/**
 * Error Boundary için hata handler
 */
export function handleBoundaryError(
    error: Error,
    errorInfo: { componentStack?: string | null }
): void {
    captureException(error, {
        context: 'ErrorBoundary',
        category: 'ui',
        metadata: {
            componentStack: errorInfo.componentStack,
        },
    })
}

// ============================================
// Async Error Wrapper
// ============================================

/**
 * Async fonksiyonları sarmalayarak hataları otomatik yakala
 *
 * @example
 * const loadData = withErrorCapture(
 *   async () => await db.activities.toArray(),
 *   { context: 'Dashboard.loadActivities', category: 'database' }
 * )
 */
export function withErrorCapture<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    errorContext: ErrorContext
): T {
    return (async (...args: Parameters<T>) => {
        try {
            return await fn(...args)
        } catch (error) {
            captureException(error, errorContext)
            throw error
        }
    }) as T
}

// ============================================
// User-Friendly Error Messages
// ============================================

const ERROR_MESSAGES: Record<string, string> = {
    // Database errors
    'QuotaExceededError': 'Depolama alanı dolu. Lütfen bazı verileri silin.',
    'DatabaseClosedError': 'Veritabanı bağlantısı kesildi. Sayfayı yenileyin.',
    'TransactionInactiveError': 'İşlem zaman aşımına uğradı. Tekrar deneyin.',

    // Network errors
    'NetworkError': 'İnternet bağlantınızı kontrol edin.',
    'TimeoutError': 'İstek zaman aşımına uğradı. Tekrar deneyin.',

    // Generic
    'default': 'Bir hata oluştu. Lütfen tekrar deneyin.',
}

/**
 * Teknik hatayı kullanıcı dostu mesaja çevir
 */
export function getUserFriendlyMessage(error: unknown): string {
    if (error instanceof Error) {
        // Bilinen hata türlerini kontrol et
        for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
            if (error.name === key || error.message.includes(key)) {
                return message
            }
        }
    }

    return ERROR_MESSAGES['default'] ?? 'Bir hata oluştu. Lütfen tekrar deneyin.'
}

// ============================================
// Performance Tracking
// ============================================

const perfMarks = new Map<string, number>()

/**
 * Performans ölçümü başlat
 */
export function perfStart(label: string): void {
    perfMarks.set(label, performance.now())
}

/**
 * Performans ölçümü bitir ve logla
 */
export function perfEnd(label: string, warnThreshold = 100): number {
    const start = perfMarks.get(label)
    if (!start) return 0

    const duration = performance.now() - start
    perfMarks.delete(label)

    if (import.meta.env.DEV && duration > warnThreshold) {
        console.warn(`[Perf] ${label}: ${duration.toFixed(2)}ms (threshold: ${warnThreshold}ms)`)
    }

    return duration
}
