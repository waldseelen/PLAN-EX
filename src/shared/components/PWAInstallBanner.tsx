import { ArrowDownTrayIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallBannerProps {
    /** Görünüm modu */
    variant?: 'card' | 'banner' | 'minimal'
    /** Ayarlarda göster */
    showInSettings?: boolean
    className?: string
}

/**
 * PWA Kurulum Banner'ı
 * Tarayıcının varsayılan yükle uyarısı yerine özel tasarlanmış bir kart
 */
export function PWAInstallBanner({
    variant = 'card',
    showInSettings = false,
    className,
}: PWAInstallBannerProps) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [isDismissed, setIsDismissed] = useState(() => {
        return localStorage.getItem('lifeflow_pwa_dismissed') === 'true'
    })

    useEffect(() => {
        // Zaten PWA olarak yüklü mü kontrol et
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
        }

        const handleAppInstalled = () => {
            setIsInstalled(true)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setIsInstalled(true)
        }

        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setIsDismissed(true)
        localStorage.setItem('lifeflow_pwa_dismissed', 'true')
    }

    // Ayarlar sayfasında her zaman göster (farklı bir görünümle)
    if (showInSettings) {
        return (
            <div className={clsx('card p-6', className)}>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                            Uygulamayı Yükle
                        </h3>
                        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                            {isInstalled
                                ? 'Plan.Ex cihazınıza yüklendi! Ana ekrandan hızlica erişebilirsiniz.'
                                : 'Plan.Ex\'i ana ekranınıza ekleyerek daha hızlı erişim sağlayın. Çevrimdışı bile çalışır!'}
                        </p>
                        {!isInstalled && deferredPrompt && (
                            <button
                                onClick={handleInstall}
                                className="btn-primary mt-4 gap-2"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Ana Ekrana Ekle
                            </button>
                        )}
                        {isInstalled && (
                            <div className="flex items-center gap-2 mt-3 text-success-500">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">Yüklendi</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Gösterilmemesi gereken durumlar
    if (isInstalled || isDismissed || !deferredPrompt) {
        return null
    }

    // Banner variant
    if (variant === 'banner') {
        return (
            <div
                className={clsx(
                    'fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96',
                    'card p-4 shadow-xl z-40 animate-slide-up',
                    className
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                            Plan.Ex'i Yükle
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                            Hızlı erişim için ana ekrana ekle
                        </p>
                    </div>
                    <button
                        onClick={handleInstall}
                        className="btn-primary text-sm px-3 py-2"
                    >
                        Yükle
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )
    }

    // Minimal variant
    if (variant === 'minimal') {
        return (
            <button
                onClick={handleInstall}
                className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl',
                    'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
                    'hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors',
                    className
                )}
            >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Uygulamayı Yükle</span>
            </button>
        )
    }

    // Card variant (default)
    return (
        <div
            className={clsx(
                'card p-6 relative overflow-hidden',
                'bg-gradient-to-br from-primary-50 via-accent-50 to-success-50',
                'dark:from-primary-900/20 dark:via-accent-900/10 dark:to-success-900/10',
                className
            )}
        >
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/30 dark:bg-primary-700/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-200/30 dark:bg-accent-700/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
                    <SparklesIcon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gradient mb-2">
                    Plan.Ex'i Yükle
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-6 max-w-xs">
                    Ana ekranına ekle, internet olmadan bile kullan. Tam uygulama deneyimi!
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleInstall}
                        className="btn-primary gap-2"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Ana Ekrana Ekle
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="btn-ghost text-surface-500"
                    >
                        Daha Sonra
                    </button>
                </div>

                {/* Feature badges */}
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {['Çevrimdışı', 'Hızlı Erişim', 'Bildirimler'].map(feature => (
                        <span
                            key={feature}
                            className="px-2 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-surface-800/80 text-surface-600 dark:text-surface-300"
                        >
                            {feature}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
