import {
    AcademicCapIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    HomeIcon,
    PlusIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import {
    AcademicCapIcon as AcademicCapIconSolid,
    CalendarDaysIcon as CalendarDaysIconSolid,
    CheckCircleIcon as CheckCircleIconSolid,
    HomeIcon as HomeIconSolid,
} from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
    {
        to: '/',
        label: 'Ana Sayfa',
        icon: HomeIcon,
        activeIcon: HomeIconSolid,
    },
    {
        to: '/courses',
        label: 'Dersler',
        icon: AcademicCapIcon,
        activeIcon: AcademicCapIconSolid,
    },
    {
        // Placeholder for center FAB
        to: null,
        label: '',
        icon: null,
        activeIcon: null,
    },
    {
        to: '/calendar',
        label: 'Takvim',
        icon: CalendarDaysIcon,
        activeIcon: CalendarDaysIconSolid,
    },
    {
        to: '/habits',
        label: 'Alışkanlıklar',
        icon: CheckCircleIcon,
        activeIcon: CheckCircleIconSolid,
    },
]

const fabActions = [
    {
        icon: AcademicCapIcon,
        label: 'Ders Ekle',
        path: '/courses',
        gradient: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/30'
    },
    {
        icon: ClipboardDocumentListIcon,
        label: 'Görev Ekle',
        path: '/tasks',
        gradient: 'from-green-500 to-green-600',
        shadow: 'shadow-green-500/30'
    },
    {
        icon: CheckCircleIcon,
        label: 'Alışkanlık',
        path: '/habits',
        gradient: 'from-orange-500 to-orange-600',
        shadow: 'shadow-orange-500/30'
    },
    {
        icon: ClockIcon,
        label: 'Pomodoro',
        path: '/productivity',
        gradient: 'from-red-500 to-red-600',
        shadow: 'shadow-red-500/30'
    },
]

export function BottomNavigation() {
    const navigate = useNavigate()
    const location = useLocation()
    const [fabOpen, setFabOpen] = useState(false)
    const fabRef = useRef<HTMLLIElement>(null)

    // Close FAB when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
                setFabOpen(false)
            }
        }

        if (fabOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [fabOpen])

    // Close FAB on route change
    useEffect(() => {
        setFabOpen(false)
    }, [location.pathname])

    const handleFabAction = (path: string) => {
        setFabOpen(false)
        navigate(path)
    }

    return (
        <>
            {/* Overlay when FAB is open */}
            {fabOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setFabOpen(false)}
                />
            )}

            <nav className="fixed bottom-0 left-0 right-0 glass border-t border-primary-200/40 dark:border-primary-800/30 safe-area-inset-bottom z-40">
                <ul className="flex justify-around items-center h-16 relative">
                    {navItems.map((item, _index) => {
                        // Center FAB button
                        if (item.to === null) {
                            return (
                                <li key="fab" className="flex-1 flex justify-center" ref={fabRef}>
                                    {/* FAB Action Menu */}
                                    <div className={clsx(
                                        'absolute bottom-20 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out z-50',
                                        fabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                                    )}>
                                        <div className="flex flex-col items-center gap-3 pb-3">
                                            {fabActions.map((action, index) => (
                                                <button
                                                    key={action.path}
                                                    onClick={() => handleFabAction(action.path)}
                                                    className={clsx(
                                                        'flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg transition-all duration-200',
                                                        'bg-gradient-to-r', action.gradient, action.shadow,
                                                        'hover:scale-105 active:scale-95',
                                                        'transform',
                                                        fabOpen && 'animate-fade-in-up'
                                                    )}
                                                    style={{
                                                        animationDelay: `${index * 50}ms`,
                                                        animationFillMode: 'backwards'
                                                    }}
                                                >
                                                    <action.icon className="w-5 h-5 text-white" />
                                                    <span className="text-sm font-medium text-white whitespace-nowrap">
                                                        {action.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Main FAB Button */}
                                    <button
                                        onClick={() => setFabOpen(!fabOpen)}
                                        className={clsx(
                                            'w-14 h-14 -mt-6 rounded-full text-white flex items-center justify-center shadow-xl transition-all duration-300',
                                            fabOpen
                                                ? 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-500/30 rotate-45'
                                                : 'gradient-primary shadow-primary-500/40 hover:shadow-glow',
                                            'active:scale-95'
                                        )}
                                    >
                                        {fabOpen ? (
                                            <XMarkIcon className="w-7 h-7 transition-transform -rotate-45" />
                                        ) : (
                                            <PlusIcon className="w-7 h-7" />
                                        )}
                                    </button>
                                </li>
                            )
                        }

                        return (
                            <li key={item.to} className="flex-1">
                                <NavLink
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) =>
                                        clsx(
                                            // Minimum 44x44px dokunmatik alan sağla
                                            'flex flex-col items-center justify-center py-2 gap-0.5',
                                            'min-h-[48px] min-w-[48px]', // Erişilebilirlik için
                                            'transition-all duration-200',
                                            'active:scale-95', // Dokunma geri bildirimi
                                            isActive
                                                ? 'text-primary-500 dark:text-primary-400'
                                                : 'text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300'
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={clsx(
                                                'p-2 rounded-xl transition-all duration-200',
                                                isActive && 'bg-gradient-to-r from-primary-100/80 to-accent-100/50 dark:from-primary-900/40 dark:to-accent-900/20 shadow-sm'
                                            )}>
                                                {isActive && item.activeIcon ? (
                                                    <item.activeIcon className="w-5 h-5" />
                                                ) : item.icon ? (
                                                    <item.icon className="w-5 h-5" />
                                                ) : null}
                                            </div>
                                            <span className="text-[10px] font-medium leading-none">{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </>
    )
}
