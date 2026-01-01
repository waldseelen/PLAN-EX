import {
    BarChart2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Inbox,
    LayoutDashboard,
    Settings,
    User
} from 'lucide-react';
import React from 'react';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
    onSettingsClick: () => void;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

const Sidebar = ({ activeView, onNavigate, onSettingsClick, collapsed = false, onToggleCollapse }: SidebarProps) => {
    return (
        <aside className={`h-full flex flex-col items-center py-4 bg-[#13131a] border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-16' : 'w-20'
            }`}>
            {/* Logo */}
            <div
                onClick={() => onNavigate('overview')}
                className="w-10 h-10 rounded-xl mb-6 shadow-lg shadow-[rgba(0,174,239,0.35)] cursor-pointer hover:scale-105 transition-transform overflow-hidden"
            >
                <img
                    src="/logo.png"
                    alt="Plan.Ex Logo"
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 flex-1 w-full px-2">
                <NavItem
                    icon={<LayoutDashboard size={20} />}
                    active={activeView === 'overview'}
                    onClick={() => onNavigate('overview')}
                    label="Overview"
                    collapsed={collapsed}
                />
                <NavItem
                    icon={<Inbox size={20} />}
                    active={activeView === 'tasks'}
                    onClick={() => onNavigate('tasks')}
                    label="Personal"
                    collapsed={collapsed}
                />
                <NavItem
                    icon={<FolderOpen size={20} />}
                    active={activeView === 'courses'}
                    onClick={() => onNavigate('courses')}
                    label="Courses"
                    collapsed={collapsed}
                />
                <NavItem
                    icon={<Calendar size={20} />}
                    active={activeView === 'calendar'}
                    onClick={() => onNavigate('calendar')}
                    label="Calendar"
                    collapsed={collapsed}
                />
                <NavItem
                    icon={<BarChart2 size={20} />}
                    active={activeView === 'statistics'}
                    onClick={() => onNavigate('statistics')}
                    label="Statistics"
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
                    icon={<Settings size={20} />}
                    active={false}
                    onClick={onSettingsClick}
                    label="Settings"
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
        </aside >
    );
};

interface NavItemProps {
    icon: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    label: string;
    collapsed?: boolean;
}

const NavItem = ({ icon, active, onClick, label, collapsed }: NavItemProps) => (
    <button
        onClick={onClick}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        title={label}
        className={`w-full min-h-[44px] h-11 flex items-center justify-center rounded-lg transition-all relative group touch-manipulation ${active
            ? 'text-white bg-[rgba(0,174,239,0.15)] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,174,239,0.18)]'
            : 'text-slate-500 hover:text-white hover:bg-white/5 active:bg-white/10'
            }`}
    >
        {icon}
        {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-[#00aeef] via-[#29c6cd] to-[#ffd200] rounded-r-full" />
        )}

        {/* Tooltip */}
        <div className={`absolute left-full ml-2 px-2 py-1 bg-[#2a2438] text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none ${collapsed ? '' : 'hidden'
            }`}>
            {label}
        </div>
    </button>
);

export default Sidebar;
