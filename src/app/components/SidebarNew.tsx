import {
    BarChart2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    FolderOpen,
    Inbox,
    LayoutDashboard,
    Settings,
    Target,
    User,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
    collapsed?: boolean
    onToggleCollapse?: () => void
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
    return (
        <aside
            className={`h-full flex flex-col items-center py-4 bg-[#13131a] border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-16' : 'w-20'
                }`}
        >
            {/* Logo */}
            <NavLink
                to="/planner"
                className="w-10 h-10 rounded-xl mb-6 shadow-lg shadow-[rgba(0,174,239,0.35)] cursor-pointer hover:scale-105 transition-transform overflow-hidden"
            >
                <img
                    src="/logo.png"
                    alt="Plan.Ex Logo"
                    className="w-full h-full object-cover rounded-xl"
                />
            </NavLink>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 flex-1 w-full px-2">
                <NavItem
                    to="/planner"
                    icon={<LayoutDashboard size={20} />}
                    label="Overview"
                    collapsed={collapsed}
                />
                <NavItem
                    to="/planner/tasks"
                    icon={<Inbox size={20} />}
                    label="Görevler"
                    collapsed={collapsed}
                />
                <NavItem
                    to="/planner/courses"
                    icon={<FolderOpen size={20} />}
                    label="Dersler"
                    collapsed={collapsed}
                />
                <NavItem
                    to="/calendar"
                    icon={<Calendar size={20} />}
                    label="Takvim"
                    collapsed={collapsed}
                />
                <NavItem
                    to="/habits"
                    icon={<Target size={20} />}
                    label="Alışkanlıklar"
                    collapsed={collapsed}
                />
                <NavItem
                    to="/planner/productivity"
                    icon={<Clock size={20} />}
                    label="Pomodoro"
                    collapsed={collapsed}
                />
                <NavItem
                    to="/planner/statistics"
                    icon={<BarChart2 size={20} />}
                    label="İstatistik"
                    collapsed={collapsed}
                />
            </nav>

            {/* Bottom */}
            <div className="flex flex-col gap-1 mt-auto w-full px-2">
                {/* Collapse Toggle */}
                {onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className="w-full min-h-[44px] h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all mb-2 touch-manipulation"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                )}

                <NavItem
                    to="/settings"
                    icon={<Settings size={20} />}
                    label="Ayarlar"
                    collapsed={collapsed}
                />

                {/* User Avatar */}
                <div className="w-full flex justify-center mt-2">
                    <button
                        aria-label="User profile"
                        className="min-w-[44px] min-h-[44px] w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform touch-manipulation"
                    >
                        <User size={18} className="text-white" />
                    </button>
                </div>
            </div>
        </aside>
    )
}

interface NavItemProps {
    to: string
    icon: React.ReactNode
    label: string
    collapsed?: boolean
}

const NavItem = ({ to, icon, label, collapsed: _collapsed }: NavItemProps) => (
    <NavLink
        to={to}
        end={to === '/'}
        aria-label={label}
        title={label}
        className={({ isActive }) =>
            `w-full min-h-[44px] h-11 flex items-center justify-center rounded-lg transition-all relative group touch-manipulation ${isActive
                ? 'text-white bg-[rgba(0,174,239,0.15)] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,174,239,0.18)]'
                : 'text-slate-500 hover:text-white hover:bg-white/5 active:bg-white/10'
            }`
        }
    >
        {({ isActive }) => (
            <>
                {icon}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-[#00aeef] via-[#29c6cd] to-[#ffd200] rounded-r-full" />
                )}

                {/* Tooltip */}
                <div
                    className={`absolute left-full ml-2 px-2 py-1 bg-[#2a2438] text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none`}
                >
                    {label}
                </div>
            </>
        )}
    </NavLink>
)
