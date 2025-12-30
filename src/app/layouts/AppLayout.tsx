import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { Outlet } from 'react-router-dom'
import { BottomNavigation } from '../components/BottomNavigation'
import { Sidebar } from '../components/Sidebar'

export function AppLayout() {
    const isDesktop = useMediaQuery('(min-width: 1024px)')

    return (
        <div className="min-h-screen flex">
            {/* Desktop Sidebar */}
            {isDesktop && <Sidebar />}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                <div className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            {!isDesktop && <BottomNavigation />}
        </div>
    )
}
