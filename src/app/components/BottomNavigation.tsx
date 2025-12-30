import {
    CalendarDaysIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    HomeIcon,
    PlusIcon,
} from '@heroicons/react/24/outline'
import {
    CalendarDaysIcon as CalendarDaysIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    Cog6ToothIcon as Cog6ToothIconSolid,
    HomeIcon as HomeIconSolid,
} from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
    {
        to: '/',
        label: 'Ana Sayfa',
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
        // Placeholder for center FAB
        to: null,
        label: '',
        icon: null,
        activeIcon: null,
    },
    {
        to: '/statistics',
        label: 'İstatistik',
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

export function BottomNavigation() {
    const navigate = useNavigate()

    const handleQuickAdd = () => {
        // Navigate to habits or activities based on context
        // For now, navigate to habits
        navigate('/habits')
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-primary-200/40 dark:border-primary-800/30 safe-area-inset-bottom z-40">
            <ul className="flex justify-around items-center h-16 relative">
                {navItems.map((item, _index) => {
                    // Center FAB button
                    if (item.to === null) {
                        return (
                            <li key="fab" className="flex-1 flex justify-center">
                                <button
                                    onClick={handleQuickAdd}
                                    className="w-14 h-14 -mt-6 rounded-full gradient-primary text-white flex items-center justify-center shadow-xl shadow-primary-500/40 active:scale-95 transition-transform duration-200 hover:shadow-glow"
                                >
                                    <PlusIcon className="w-7 h-7" />
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
                                        'flex flex-col items-center justify-center h-full gap-0.5 transition-all duration-200',
                                        isActive
                                            ? 'text-primary-500 dark:text-primary-400'
                                            : 'text-surface-400 dark:text-surface-500'
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={clsx(
                                            'p-1.5 rounded-xl transition-all duration-200',
                                            isActive && 'bg-gradient-to-r from-primary-100/80 to-accent-100/50 dark:from-primary-900/40 dark:to-accent-900/20 shadow-sm'
                                        )}>
                                            {isActive && item.activeIcon ? (
                                                <item.activeIcon className="w-5 h-5" />
                                            ) : item.icon ? (
                                                <item.icon className="w-5 h-5" />
                                            ) : null}
                                        </div>
                                        <span className="text-[10px] font-medium">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
