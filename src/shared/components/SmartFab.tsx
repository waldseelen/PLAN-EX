import { useLongPress } from '@/shared/hooks/useLongPress'
import {
    CheckCircleIcon,
    ClockIcon,
    PencilIcon,
    PlusIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useState, type ReactNode } from 'react'

interface SmartFabProps {
    /** Ana aksiyon (tek tıklama) */
    onPrimaryAction: () => void
    /** İkincil aksiyonlar (uzun basma menüsü) */
    secondaryActions?: {
        icon: ReactNode
        label: string
        onClick: () => void
        variant?: 'default' | 'success' | 'warning' | 'danger'
    }[]
    /** FAB ikonu */
    icon?: ReactNode
    /** Pozisyon */
    position?: 'bottom-right' | 'bottom-center'
    /** Görünür mü */
    visible?: boolean
    className?: string
}

/**
 * Akıllı Floating Action Button
 * Tek tıklama: Ana aksiyon (örn: Hızlı Timer Başlat)
 * Uzun basma veya yukarı sürükleme: Menü açılır (Habit Ekle, Manuel Kayıt vb.)
 */
export function SmartFab({
    onPrimaryAction,
    secondaryActions = [],
    icon = <PlusIcon className="w-7 h-7" />,
    position = 'bottom-right',
    visible = true,
    className,
}: SmartFabProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const { handlers, isLongPress } = useLongPress({
        delay: 400,
        onClick: () => {
            if (!isMenuOpen) {
                onPrimaryAction()
            }
        },
        onLongPress: () => {
            if (secondaryActions.length > 0) {
                setIsMenuOpen(true)
            }
        },
    })

    const handleMenuItemClick = (action: () => void) => {
        action()
        setIsMenuOpen(false)
    }

    const handleClose = () => {
        setIsMenuOpen(false)
    }

    if (!visible) return null

    return (
        <>
            {/* Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
                    onClick={handleClose}
                />
            )}

            {/* FAB Container */}
            <div
                className={clsx(
                    'fixed z-50 transition-all duration-300',
                    position === 'bottom-right' && 'bottom-20 right-4 lg:bottom-6 lg:right-6',
                    position === 'bottom-center' && 'bottom-20 left-1/2 -translate-x-1/2 lg:bottom-6',
                    !visible && 'scale-0 opacity-0',
                    className
                )}
            >
                {/* Secondary Actions Menu */}
                {isMenuOpen && secondaryActions.length > 0 && (
                    <div className="absolute bottom-16 right-0 mb-2 flex flex-col gap-2 animate-slide-up">
                        {secondaryActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleMenuItemClick(action.onClick)}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg transition-all duration-200',
                                    'backdrop-blur-md whitespace-nowrap',
                                    'animate-fade-in',
                                    action.variant === 'success' && 'bg-success-500/90 text-white hover:bg-success-600',
                                    action.variant === 'warning' && 'bg-amber-500/90 text-white hover:bg-amber-600',
                                    action.variant === 'danger' && 'bg-red-500/90 text-white hover:bg-red-600',
                                    (!action.variant || action.variant === 'default') &&
                                    'bg-white/90 dark:bg-surface-800/90 text-surface-900 dark:text-white hover:bg-white dark:hover:bg-surface-700'
                                )}
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                }}
                            >
                                <span className="w-5 h-5">{action.icon}</span>
                                <span className="font-medium">{action.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Main FAB Button */}
                <button
                    {...handlers}
                    className={clsx(
                        'w-14 h-14 rounded-full flex items-center justify-center',
                        'shadow-xl transition-all duration-300',
                        'active:scale-95',
                        isMenuOpen
                            ? 'bg-surface-600 dark:bg-surface-700 rotate-45'
                            : 'gradient-primary shadow-primary-500/40 hover:shadow-glow',
                        isLongPress && 'scale-110'
                    )}
                >
                    <span
                        className={clsx(
                            'text-white transition-transform duration-300',
                            isMenuOpen && 'rotate-45'
                        )}
                    >
                        {isMenuOpen ? <XMarkIcon className="w-7 h-7" /> : icon}
                    </span>
                </button>

                {/* Long press hint (ilk kullanımda) */}
                {!isMenuOpen && secondaryActions.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-400 animate-pulse" />
                )}
            </div>
        </>
    )
}

/**
 * Varsayılan FAB aksiyonları
 */
export const defaultFabActions = [
    {
        icon: <ClockIcon className="w-5 h-5" />,
        label: 'Hızlı Timer Başlat',
        onClick: () => { },
        variant: 'default' as const,
    },
    {
        icon: <CheckCircleIcon className="w-5 h-5" />,
        label: 'Habit Ekle',
        onClick: () => { },
        variant: 'success' as const,
    },
    {
        icon: <PencilIcon className="w-5 h-5" />,
        label: 'Manuel Kayıt',
        onClick: () => { },
        variant: 'default' as const,
    },
]
