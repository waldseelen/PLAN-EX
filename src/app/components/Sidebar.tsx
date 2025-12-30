import {
    CalendarDaysIcon,
    ChartBarIcon,
    CheckCircleIcon,
    Cog6ToothIcon,
    HomeIcon,
    RectangleStackIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline'
import {
    CalendarDaysIcon as CalendarDaysIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    CheckCircleIcon as CheckCircleIconSolid,
    Cog6ToothIcon as Cog6ToothIconSolid,
    HomeIcon as HomeIconSolid,
    RectangleStackIcon as RectangleStackIconSolid,
} from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { NavLink } from 'react-router-dom'

const navItems = [
    {
        to: '/',
        label: 'Dashboard',
        icon: HomeIcon,
        activeIcon: HomeIconSolid,
    },
    {
        to: '/calendar',
        label: 'Takvim',
        icon: CalendarDaysIcon,
        activeIcon: CalendarDaysIconSolid,
    },
    {
        to: '/statistics',
        label: 'İstatistikler',
        icon: ChartBarIcon,
        activeIcon: ChartBarIconSolid,
    },
    {
        to: '/activities',
        label: 'Aktiviteler',
        icon: RectangleStackIcon,
        activeIcon: RectangleStackIconSolid,
    },
    {
        to: '/habits',
        label: 'Alışkanlıklar',
        icon: CheckCircleIcon,
        activeIcon: CheckCircleIconSolid,
    },
    {
        to: '/settings',
        label: 'Ayarlar',
        icon: Cog6ToothIcon,
        activeIcon: Cog6ToothIconSolid,
    },
]

export function Sidebar() {
    return (
        <aside className="w-72 glass-primary flex flex-col border-r border-primary-200/40 dark:border-primary-800/30">
            {/* Logo */}
            <div className="h-20 flex items-center px-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-xl font-bold text-gradient">
                            LifeFlow
                        </span>
                        <p className="text-xs text-primary-500 dark:text-primary-400">Yaşam Akışı</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
                <p className="text-xs font-semibold text-primary-400 dark:text-primary-500 uppercase tracking-wider mb-4 px-3">
                    Menü
                </p>
                <ul className="space-y-1.5">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200',
                                        isActive
                                            ? 'bg-gradient-to-r from-primary-100/80 to-accent-100/50 dark:from-primary-900/40 dark:to-accent-900/20 text-primary-600 dark:text-primary-400 shadow-sm neon-border'
                                            : 'text-surface-600 dark:text-surface-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20'
                                    )
                                }
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
                                        <span className="font-medium">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 mx-4 mb-4 rounded-2xl bg-gradient-to-r from-primary-100/60 via-accent-100/40 to-success-100/40 dark:from-primary-900/30 dark:via-accent-900/20 dark:to-success-900/20 border border-primary-200/40 dark:border-primary-700/30">
                <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                    LifeFlow v0.1.0
                </p>
                <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-0.5">
                    Offline-First PWA
                </p>
            </div>
        </aside>
    )
}
