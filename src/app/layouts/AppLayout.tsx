import { FocusModeProvider, OfflineIndicator, PrivacyToggle, ScrollToTop, SmartFab, ToastProvider } from '@/shared/components'
import { useDocumentTitle, useDynamicFavicon, useKeyboardShortcuts } from '@/shared/hooks'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { CheckCircleIcon, ClockIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useCallback, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Header } from '../components/Header'
import { RightPanel } from '../components/RightPanel'
import { Sidebar } from '../components/SidebarNew'

export function AppLayout() {
    const isDesktop = useMediaQuery('(min-width: 1280px)')
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)')
    const isMobile = useMediaQuery('(max-width: 767px)')
    const navigate = useNavigate()
    const location = useLocation()
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Dynamic document title
    useDocumentTitle({
        timerSeconds: 0,
        activityName: undefined,
        isRunning: false,
        defaultTitle: 'Plan.Ex - Akıllı Planlama',
    })

    // Dynamic favicon
    useDynamicFavicon(false)

    // Keyboard shortcuts
    const handleGoHome = useCallback(() => {
        navigate('/')
    }, [navigate])

    const handleNewRecord = useCallback(() => {
        navigate('/habits')
    }, [navigate])

    const handleOpenSettings = useCallback(() => {
        navigate('/settings')
    }, [navigate])

    useKeyboardShortcuts({
        shortcuts: [
            { key: ' ', action: handleGoHome, description: 'Ana Sayfa' },
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
                <ScrollToTop />
                <div className="flex h-screen w-full overflow-hidden bg-[#0f0f0f]">
                    {/* Desktop Sidebar */}
                    {(isDesktop || isTablet) && <Sidebar collapsed={isTablet} />}

                    {/* Main Content */}
                    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#13131a]">
                        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                                {/* Header Component */}
                                <Header
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onNewTask={() => navigate('/tasks')}
                                    onCalendarClick={() => navigate('/calendar')}
                                />

                                {/* Top bar with offline indicator and privacy toggle */}
                                <div className="flex items-center justify-end gap-2 mb-4">
                                    <OfflineIndicator variant="minimal" />
                                    <PrivacyToggle />
                                </div>

                                {/* Page Content */}
                                <div key={location.pathname} className="animate-fade-in">
                                    <Outlet />
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Right Panel - Desktop Only */}
                    {isDesktop && (
                        <RightPanel
                            collapsed={rightPanelCollapsed}
                            onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                        />
                    )}

                    {/* Mobile Bottom Navigation */}
                    {isMobile && <BottomNavigation />}

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
