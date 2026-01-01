import {
    AcademicCapIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    Cog6ToothIcon,
    HomeIcon,
} from '@heroicons/react/24/outline'
import {
    AcademicCapIcon as AcademicCapIconSolid,
    CalendarDaysIcon as CalendarDaysIconSolid,
    CheckCircleIcon as CheckCircleIconSolid,
    Cog6ToothIcon as Cog6ToothIconSolid,
    HomeIcon as HomeIconSolid,
} from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { NavLink } from 'react-router-dom'

const navItems = [
    { to: '/planner', label: 'Ana Sayfa', icon: HomeIcon, activeIcon: HomeIconSolid },
    { to: '/planner/courses', label: 'Dersler', icon: AcademicCapIcon, activeIcon: AcademicCapIconSolid },
    { to: '/calendar', label: 'Takvim', icon: CalendarDaysIcon, activeIcon: CalendarDaysIconSolid },
    { to: '/habits', label: 'Alışkanlıklar', icon: CheckCircleIcon, activeIcon: CheckCircleIconSolid },
    { to: '/settings', label: 'Ayarlar', icon: Cog6ToothIcon, activeIcon: Cog6ToothIconSolid },
] as const

export function BottomNavigation() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-primary-200/40 dark:border-primary-800/30 safe-area-inset-bottom z-40 md:hidden">
            <ul className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <li key={item.to} className="flex-1">
                        <NavLink
                            to={item.to}
                            end={item.to === '/planner'}
                            className={({ isActive }) =>
                                clsx(
                                    'flex flex-col items-center justify-center py-2 gap-0.5',
                                    'min-h-[48px] min-w-[48px]',
                                    'transition-all duration-200',
                                    'active:scale-95',
                                    isActive
                                        ? 'text-primary-500 dark:text-primary-400'
                                        : 'text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div
                                        className={clsx(
                                            'p-2 rounded-xl transition-all duration-200',
                                            isActive &&
                                            'bg-gradient-to-r from-primary-100/80 to-accent-100/50 dark:from-primary-900/40 dark:to-accent-900/20 shadow-sm'
                                        )}
                                    >
                                        {isActive ? (
                                            <item.activeIcon className="w-5 h-5" />
                                        ) : (
                                            <item.icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-medium leading-none">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

