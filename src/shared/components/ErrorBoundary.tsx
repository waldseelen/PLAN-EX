/**
 * Plan.Ex - Error Boundary Bileşenleri
 *
 * React hata sınırları ile uygulama çökmelerini önler.
 * Modül bazlı koruma sağlar - bir widget çökse bile tüm sayfa gitmez.
 */

import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Component, type ErrorInfo, type ReactNode } from 'react'

// ============================================
// Types
// ============================================

interface ErrorBoundaryProps {
    /** Alt bileşenler */
    children: ReactNode
    /** Fallback UI (opsiyonel - varsayılan error UI kullanılır) */
    fallback?: ReactNode | undefined
    /** Hata callback'i (logging için) */
    onError?: ((error: Error, errorInfo: ErrorInfo) => void) | undefined
    /** Bileşen adı (hata mesajlarında kullanılır) */
    componentName?: string | undefined
    /** Minimal mod - sadece ikon göster */
    minimal?: boolean | undefined
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

// ============================================
// Error Boundary Component
// ============================================

/**
 * Genel Error Boundary bileşeni
 * Class component olmak zorunda - React hook'ları error boundary desteklemiyor
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo })

        // Hata callback'i çağır
        this.props.onError?.(error, errorInfo)

        // Console'a log
        console.error('[ErrorBoundary] Caught error:', error)
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
    }

    handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    render(): ReactNode {
        const { hasError, error } = this.state
        const { children, fallback, componentName, minimal } = this.props

        if (hasError) {
            // Custom fallback varsa onu kullan
            if (fallback) {
                return fallback
            }

            // Minimal mod
            if (minimal) {
                return (
                    <div className="flex items-center justify-center p-4 text-red-500">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                    </div>
                )
            }

            // Varsayılan hata UI
            return (
                <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                    <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                        {componentName ? `${componentName} yüklenemedi` : 'Bir hata oluştu'}
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4 max-w-md">
                        {error?.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Tekrar Dene
                    </button>
                </div>
            )
        }

        return children
    }
}

// ============================================
// Specialized Error Boundaries
// ============================================

interface WidgetErrorBoundaryProps {
    children: ReactNode
    widgetName: string
    onError?: ((error: Error, errorInfo: ErrorInfo) => void) | undefined
}

/**
 * Widget için özelleştirilmiş Error Boundary
 * Daha kompakt tasarım
 */
export function WidgetErrorBoundary({ children, widgetName, onError }: WidgetErrorBoundaryProps) {
    return (
        <ErrorBoundary
            componentName={widgetName}
            onError={onError}
            fallback={
                <div className="card p-4 flex items-center gap-3 bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/30">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300 truncate">
                            {widgetName} yüklenemedi
                        </p>
                    </div>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    )
}

interface PageErrorBoundaryProps {
    children: ReactNode
    pageName?: string | undefined
    onError?: ((error: Error, errorInfo: ErrorInfo) => void) | undefined
}

/**
 * Sayfa için Error Boundary
 * Tam sayfa hata ekranı gösterir
 */
export function PageErrorBoundary({ children, pageName, onError }: PageErrorBoundaryProps) {
    return (
        <ErrorBoundary
            componentName={pageName}
            onError={onError}
            fallback={
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
                    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                        <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
                        Sayfa Yüklenemedi
                    </h2>
                    <p className="text-surface-600 dark:text-surface-400 text-center mb-6 max-w-md">
                        {pageName
                            ? `${pageName} sayfası yüklenirken bir hata oluştu.`
                            : 'Bu sayfa yüklenirken bir hata oluştu.'
                        }
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary"
                        >
                            <ArrowPathIcon className="w-4 h-4 mr-2" />
                            Sayfayı Yenile
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="btn-secondary"
                        >
                            Geri Dön
                        </button>
                    </div>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    )
}

// ============================================
// Global Error Boundary
// ============================================

interface GlobalErrorBoundaryProps {
    children: ReactNode
}

/**
 * Uygulama genelinde Error Boundary
 * En üst seviyede kullanılır
 */
export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
    const handleError = (error: Error, errorInfo: ErrorInfo) => {
        // Buraya error tracking servisi eklenebilir (Sentry, LogRocket vb.)
        console.error('[GlobalErrorBoundary] Unhandled error:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        })
    }

    return (
        <ErrorBoundary
            onError={handleError}
            fallback={
                <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-surface-50 dark:bg-surface-950">
                    <div className="max-w-md text-center">
                        <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-8">
                            <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4">
                            Uygulama Hatası
                        </h1>
                        <p className="text-surface-600 dark:text-surface-400 mb-8">
                            Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyerek tekrar deneyin.
                            Sorun devam ederse, tarayıcı önbelleğini temizlemeyi deneyin.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary"
                            >
                                <ArrowPathIcon className="w-4 h-4 mr-2" />
                                Sayfayı Yenile
                            </button>
                            <button
                                onClick={() => {
                                    // LocalStorage ve SessionStorage temizle
                                    localStorage.clear()
                                    sessionStorage.clear()
                                    window.location.reload()
                                }}
                                className="btn-secondary"
                            >
                                Önbelleği Temizle
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    )
}
