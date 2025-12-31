import { ArrowUturnLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

// ============================================
// Toast Types
// ============================================

type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'undo'

interface Toast {
    id: string
    message: string
    variant: ToastVariant
    duration: number
    action?: {
        label: string
        onClick: () => void
    } | undefined
}

interface ToastContextValue {
    toasts: Toast[]
    showToast: (message: string, options?: Partial<Omit<Toast, 'id' | 'message'>>) => string
    showUndoToast: (message: string, onUndo: () => void, duration?: number) => string
    hideToast: (id: string) => void
}

// ============================================
// Context
// ============================================

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// ============================================
// Provider
// ============================================

interface ToastProviderProps {
    children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const showToast = useCallback(
        (message: string, options: Partial<Omit<Toast, 'id' | 'message'>> = {}) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            const toast: Toast = {
                id,
                message,
                variant: options.variant || 'default',
                duration: options.duration || 3000,
                action: options.action,
            }

            setToasts(prev => [...prev, toast])

            // Otomatik kaldır
            if (toast.duration > 0) {
                setTimeout(() => hideToast(id), toast.duration)
            }

            return id
        },
        [hideToast]
    )

    const showUndoToast = useCallback(
        (message: string, onUndo: () => void, duration = 5000) => {
            return showToast(message, {
                variant: 'undo',
                duration,
                action: {
                    label: 'Geri Al',
                    onClick: onUndo,
                },
            })
        },
        [showToast]
    )

    return (
        <ToastContext.Provider value={{ toasts, showToast, showUndoToast, hideToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    )
}

// ============================================
// Toast Container
// ============================================

function ToastContainer() {
    const { toasts, hideToast } = useToast()

    return (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
            ))}
        </div>
    )
}

// ============================================
// Toast Item
// ============================================

interface ToastItemProps {
    toast: Toast
    onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
    const handleAction = () => {
        toast.action?.onClick()
        onClose()
    }

    const variantStyles = {
        default: 'bg-surface-800 dark:bg-surface-700 text-white',
        success: 'bg-success-500 text-white',
        warning: 'bg-amber-500 text-white',
        error: 'bg-red-500 text-white',
        undo: 'bg-surface-800 dark:bg-surface-700 text-white border-l-4 border-primary-500',
    }

    return (
        <div
            className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-md',
                'animate-slide-up',
                variantStyles[toast.variant]
            )}
        >
            {toast.variant === 'undo' && (
                <ArrowUturnLeftIcon className="w-5 h-5 text-primary-400 flex-shrink-0" />
            )}

            <p className="flex-1 text-sm font-medium">{toast.message}</p>

            {toast.action && (
                <button
                    onClick={handleAction}
                    className={clsx(
                        'px-3 py-1 rounded-lg text-sm font-semibold transition-colors',
                        toast.variant === 'undo'
                            ? 'bg-primary-500 hover:bg-primary-600 text-white'
                            : 'bg-white/20 hover:bg-white/30'
                    )}
                >
                    {toast.action.label}
                </button>
            )}

            <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    )
}
