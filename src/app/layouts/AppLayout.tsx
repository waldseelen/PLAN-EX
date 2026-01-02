import { usePlannerAppStore } from '@/modules/planner/store/plannerAppStore'
import { usePlannerStore } from '@/modules/planner/store/plannerStore'
import { CreateTypeModal, FocusModeProvider, OfflineIndicator, PrivacyToggle, ScrollToTop, SmartFab, useToast, type CreateType } from '@/shared/components'
import { useDocumentTitle, useDynamicFavicon, useKeyboardShortcuts } from '@/shared/hooks'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { BookOpenIcon, CalendarIcon, CheckCircleIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Header } from '../components/Header'
import { RightPanel } from '../components/RightPanel'
import { Sidebar } from '../components/SidebarNew'

export function AppLayout() {
    const isDesktop = useMediaQuery('(min-width: 1280px)')
    const isWide = useMediaQuery('(min-width: 1024px)')
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)')
    const isMobile = useMediaQuery('(max-width: 767px)')
    const navigate = useNavigate()
    const location = useLocation()
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    // Backup uyarısı kontrolü
    const { checkBackupWarning, backupWarning, setBackupWarning, updateSettings } = usePlannerAppStore()
    const { showToast } = useToast()

    // App başlangıcında backup uyarısını kontrol et
    useEffect(() => {
        checkBackupWarning()
    }, [checkBackupWarning])

    // Backup uyarısı göster
    useEffect(() => {
        if (backupWarning) {
            showToast('7 günden fazla yedekleme yapılmadı! Ayarlar > Yedekleme\'den verilerinizi yedekleyin.', {
                variant: 'warning',
                duration: 8000,
            })
            updateSettings({ lastBackupWarningISO: new Date().toISOString() })
            setBackupWarning(false)
        }
    }, [backupWarning, setBackupWarning, showToast, updateSettings])

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
        navigate('/planner')
    }, [navigate])

    const handleNewRecord = useCallback(() => {
        setIsCreateModalOpen(true)
    }, [])

    const handleOpenSettings = useCallback(() => {
        navigate('/settings')
    }, [navigate])

    // Arama kutusuna odaklan
    const handleFocusSearch = useCallback(() => {
        setIsSearchFocused(true)
        // Header'daki arama input'una focus ver
        const searchInput = document.querySelector('input[placeholder*="ara"]') as HTMLInputElement
        if (searchInput) {
            searchInput.focus()
        }
    }, [])

    // Geri al (undo)
    const handleUndo = useCallback(() => {
        const undo = usePlannerStore.getState().undo
        undo()
        showToast('Geri alındı', { variant: 'success' })
    }, [showToast])

    // Modal kapat (Escape)
    const handleCloseModal = useCallback(() => {
        setIsCreateModalOpen(false)
    }, [])

    useKeyboardShortcuts({
        shortcuts: [
            { key: ' ', action: handleGoHome, description: 'Ana Sayfa' },
            { key: 'n', action: handleNewRecord, description: 'Yeni Kayıt' },
            { key: ',', ctrl: true, action: handleOpenSettings, description: 'Ayarlar' },
            { key: 'k', ctrl: true, action: handleFocusSearch, description: 'Ara' },
            { key: 'z', ctrl: true, action: handleUndo, description: 'Geri Al', allowInInput: true },
            { key: 'Escape', action: handleCloseModal, description: 'Modal Kapat', allowInInput: true },
        ],
        enabled: isDesktop,
    })

    // Smart FAB actions - FAB click opens the create type modal
    const handleCreateTypeSelect = useCallback((type: CreateType) => {
        switch (type) {
            case 'task':
                navigate('/planner/tasks', { state: { openCreate: true } })
                break
            case 'habit':
                navigate('/habits', { state: { openCreate: true } })
                break
            case 'course':
                navigate('/planner/courses', { state: { openCreate: true } })
                break
            case 'event':
                navigate('/calendar', { state: { openCreate: true } })
                break
        }
    }, [navigate])

    const fabActions = useMemo(() => [
        {
            icon: <DocumentTextIcon className="w-5 h-5" />,
            label: 'Görev Ekle',
            onClick: () => navigate('/planner/tasks', { state: { openCreate: true } }),
            variant: 'default' as const,
        },
        {
            icon: <BookOpenIcon className="w-5 h-5" />,
            label: 'Ders Ekle',
            onClick: () => navigate('/planner/courses', { state: { openCreate: true } }),
            variant: 'default' as const,
        },
        {
            icon: <CheckCircleIcon className="w-5 h-5" />,
            label: 'Alışkanlık Ekle',
            onClick: () => navigate('/habits', { state: { openCreate: true } }),
            variant: 'success' as const,
        },
        {
            icon: <CalendarIcon className="w-5 h-5" />,
            label: 'Etkinlik/Sınav',
            onClick: () => navigate('/calendar', { state: { openCreate: true } }),
            variant: 'warning' as const,
        },
    ], [navigate])

    return (
        <FocusModeProvider>
            <ScrollToTop />
            <CreateTypeModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSelect={handleCreateTypeSelect}
            />
            <div className="flex h-screen w-full overflow-hidden bg-[#0f0f0f]">
                {/* Desktop Sidebar */}
                {(isDesktop || isTablet) && <Sidebar collapsed={isTablet} />}

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#13131a]">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4">
                            {/* Header Component */}
                            <Header
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                onNewTask={() => navigate('/planner/tasks')}
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

                {/* Right Panel - >= 1024px */}
                {isWide && (
                    <RightPanel
                        collapsed={rightPanelCollapsed}
                        onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                    />
                )}

                {/* Mobile Bottom Navigation */}
                {isMobile && <BottomNavigation />}

                {/* Global Create FAB */}
                <SmartFab
                    onPrimaryAction={() => setIsCreateModalOpen(true)}
                    secondaryActions={fabActions}
                    position="bottom-right"
                    icon={<PlusIcon className="w-7 h-7" />}
                />
            </div>
        </FocusModeProvider>
    )
}

