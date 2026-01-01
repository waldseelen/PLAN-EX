import {
    AcademicCapIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    Cog6ToothIcon,
    HomeIcon,
} from '@heroicons/react/24/outline'
import {
    AcademicCapIcon as AcademicCapIconSolid,
    CalendarDaysIcon as CalendarDaysIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    CheckCircleIcon as CheckCircleIconSolid,
    ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
    ClockIcon as ClockIconSolid,
    Cog6ToothIcon as Cog6ToothIconSolid,
    HomeIcon as HomeIconSolid,
} from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

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
        to: '/calendar',
        label: 'Takvim',
        icon: CalendarDaysIcon,
        activeIcon: CalendarDaysIconSolid,
    },
    {
        to: '/tasks',
        label: 'Görevler',
        icon: ClipboardDocumentListIcon,
        activeIcon: ClipboardDocumentListIconSolid,
    },
    {
        to: '/habits',
        label: 'Alışkanlıklar',
        icon: CheckCircleIcon,
        activeIcon: CheckCircleIconSolid,
    },
    {
        to: '/productivity',
        label: 'Pomodoro',
        icon: ClockIcon,
        activeIcon: ClockIconSolid,
    },
    {
        to: '/statistics',
        label: 'İstatistikler',
        icon: ChartBarIcon,
        activeIcon: ChartBarIconSolid,
    },
    {
        to: '/settings',
        label: 'Ayarlar',
        icon: Cog6ToothIcon,
        activeIcon: Cog6ToothIconSolid,
    },
]

interface SidebarProps {
    collapsed?: boolean
}

export function Sidebar({ collapsed: initialCollapsed = false }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)

    return (
        <aside className={clsx(
            'glass-primary flex flex-col border-r border-primary-200/40 dark:border-primary-800/30 transition-all duration-300',
            isCollapsed ? 'w-20' : 'w-72'
        )}>
            {/* Logo */}
            <div className={clsx('h-20 flex items-center', isCollapsed ? 'px-4 justify-center' : 'px-6')}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                        <span className="text-white font-bold text-xs">P.EX</span>
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in">
                            <span className="text-xl font-bold text-gradient">
                                PLAN.EX
                            </span>
                            <p className="text-xs text-primary-500 dark:text-primary-400">Akıllı Planlama</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-6 -right-3 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors z-10"
            >
                {isCollapsed ? (
                    <ChevronRightIcon className="w-4 h-4" />
                ) : (
                    <ChevronLeftIcon className="w-4 h-4" />
                )}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
                {!isCollapsed && (
                    <p className="text-xs font-semibold text-primary-400 dark:text-primary-500 uppercase tracking-wider mb-4 px-3">
                        Menü
                    </p>
                )}
                <ul className="space-y-1.5">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 rounded-2xl transition-all duration-200',
                                        isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                                        isActive
                                            ? 'bg-gradient-to-r from-primary-100/80 to-accent-100/50 dark:from-primary-900/40 dark:to-accent-900/20 text-primary-600 dark:text-primary-400 shadow-sm neon-border'
                                            : 'text-surface-600 dark:text-surface-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20'
                                    )
                                }
                                title={isCollapsed ? item.label : undefined}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={clsx(
                                            'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
                                            isActive
                                                ? 'gradient-primary shadow-md'
                                                : 'bg-surface-100 dark:bg-surface-800'
                                        )}>
                                            {isActive ? (
                                                <item.activeIcon className={clsx('w-4 h-4', isActive && 'text-white')} />
                                            ) : (
                                                <item.icon className="w-4 h-4" />
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <span className="font-medium">{item.label}</span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            {!isCollapsed && (
                <div className="p-4 mx-4 mb-4 rounded-2xl bg-gradient-to-r from-primary-100/60 via-accent-100/40 to-success-100/40 dark:from-primary-900/30 dark:via-accent-900/20 dark:to-success-900/20 border border-primary-200/40 dark:border-primary-700/30">
                    <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                        PLAN.EX v1.0.0
                    </p>
                    <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-0.5">
                        Offline-First PWA
                    </p>
                </div>
            )}
        </aside>
    )
}
