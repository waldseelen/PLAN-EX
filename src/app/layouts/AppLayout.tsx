import { useTimerStore } from '@/modules/core-time/store/timerStore'
import { FocusModeProvider, OfflineIndicator, PrivacyToggle, SmartFab, ToastProvider } from '@/shared/components'
import { useDocumentTitle, useDynamicFavicon, useKeyboardShortcuts } from '@/shared/hooks'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { CheckCircleIcon, ClockIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Sidebar } from '../components/Sidebar'

export function AppLayout() {
    const isDesktop = useMediaQuery('(min-width: 1024px)')
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
    const navigate = useNavigate()

    // Timer state for dynamic title
    const { runningTimers, getElapsedSeconds } = useTimerStore()
    const activeTimer = runningTimers[0]
    const elapsedSeconds = activeTimer ? getElapsedSeconds(activeTimer) : 0
    const isTimerRunning = runningTimers.length > 0

    // Dynamic document title when timer is running
    useDocumentTitle({
        timerSeconds: elapsedSeconds,
        activityName: activeTimer ? 'Timer' : undefined,
        isRunning: isTimerRunning,
        defaultTitle: 'LifeFlow - Yaşam Akışı',
    })

    // Dynamic favicon
    useDynamicFavicon(isTimerRunning)

    // Keyboard shortcuts
    const handleToggleTimer = useCallback(() => {
        // Timer toggle logic - navigates to dashboard if not there
        if (runningTimers.length === 0) {
            navigate('/')
        }
    }, [runningTimers, navigate])

    const handleNewRecord = useCallback(() => {
        navigate('/habits')
    }, [navigate])

    const handleOpenSettings = useCallback(() => {
        navigate('/settings')
    }, [navigate])

    useKeyboardShortcuts({
        shortcuts: [
            { key: ' ', action: handleToggleTimer, description: 'Timer Başlat/Durdur' },
            { key: 'n', action: handleNewRecord, description: 'Yeni Kayıt' },
            { key: ',', ctrl: true, action: handleOpenSettings, description: 'Ayarlar' },
        ],
        enabled: isDesktop,
    })

    // Smart FAB actions
    const fabActions = useMemo(() => [
        {
            icon: <ClockIcon className="w-5 h-5" />,
            label: 'Hızlı Timer',
            onClick: () => navigate('/'),
            variant: 'default' as const,
        },
        {
            icon: <CheckCircleIcon className="w-5 h-5" />,
            label: 'Habit Ekle',
            onClick: () => navigate('/habits'),
            variant: 'success' as const,
        },
        {
            icon: <PencilIcon className="w-5 h-5" />,
            label: 'Manuel Kayıt',
            onClick: () => navigate('/activities'),
            variant: 'default' as const,
        },
    ], [navigate])

    return (
        <ToastProvider>
            <FocusModeProvider>
                <div className="min-h-screen flex">
                    {/* Desktop Sidebar */}
                    {isDesktop && <Sidebar />}

                    {/* Tablet Collapsed Sidebar */}
                    {isTablet && <Sidebar collapsed />}

                    {/* Main Content */}
                    <main className="flex-1 flex flex-col min-h-screen">
                        {/* Top bar with offline indicator and privacy toggle */}
                        <div className="flex items-center justify-end gap-2 px-4 py-2 lg:px-6">
                            <OfflineIndicator variant="minimal" />
                            <PrivacyToggle />
                        </div>

                        <div className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
                            <Outlet />
                        </div>
                    </main>

                    {/* Mobile Bottom Navigation */}
                    {!isDesktop && !isTablet && <BottomNavigation />}

                    {/* Smart FAB for Desktop */}
                    {isDesktop && (
                        <SmartFab
                            onPrimaryAction={() => navigate('/')}
                            secondaryActions={fabActions}
                            position="bottom-right"
                        />
                    )}
                </div>
            </FocusModeProvider>
        </ToastProvider>
    )
}
