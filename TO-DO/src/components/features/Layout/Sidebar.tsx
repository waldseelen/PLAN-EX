import {
    BarChart3,
    Calendar,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    LayoutDashboard,
    Pin,
    PinOff,
    Plus,
    Search,
    Settings as SettingsIcon,
    Sun as SunIcon,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { AmbientSoundPlayer } from '@/components/features/Productivity/AmbientSoundPlayer';
import { PomodoroTimer } from '@/components/features/Productivity/PomodoroTimer';
import { usePlannerContext } from '@/context/AppContext';
import { getCourseProgress } from '@/utils/course';

interface SidebarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    activeView: string;
    onNavigate: (view: string) => void;
    onOpenSettings: () => void;
    onCreateCourse: () => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
    totalProgress: number;
    isOpen: boolean;
}

export const Sidebar = ({
    searchQuery,
    onSearchChange,
    activeView,
    onNavigate,
    onOpenSettings,
    onCreateCourse,
    darkMode,
    toggleDarkMode,
    totalProgress,
    isOpen
}: SidebarProps) => {
    const { courses, completedTasks } = usePlannerContext();
    const regularCourses = courses.filter(course => course.id !== 'personal');
    const personalCourses = courses.filter(course => course.id === 'personal');

    // Sidebar collapsed state (for desktop)
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Pinned state (prevents auto-collapse)
    const [isPinned, setIsPinned] = useState(() => {
        const saved = localStorage.getItem('sidebar-pinned');
        return saved ? JSON.parse(saved) : true;
    });

    // Save states to localStorage
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    useEffect(() => {
        localStorage.setItem('sidebar-pinned', JSON.stringify(isPinned));
    }, [isPinned]);

    const handleNavigate = (view: string) => {
        onNavigate(view);
        // Auto-collapse if not pinned (mobile stays open)
        if (!isPinned && window.innerWidth >= 768) {
            setIsCollapsed(true);
        }
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const togglePin = () => {
        setIsPinned(!isPinned);
        if (!isPinned) {
            setIsCollapsed(false);
        }
    };

    // Collapsed width: 72px, Expanded width: 288px (w-72)
    // Mobile: Always w-72, Desktop: Responsive
    const sidebarWidth = isCollapsed ? 'w-72 md:w-[72px]' : 'w-72';

    return (
        <aside
            className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 ${sidebarWidth} h-full bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 ease-in-out flex flex-col shadow-sm`}
        >
            {/* Header */}
            <div className={`border-b border-slate-100 dark:border-slate-700 ${isCollapsed ? 'p-3' : 'p-4'}`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {isCollapsed ? (
                        <button
                            onClick={toggleCollapse}
                            className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 transition-all"
                            title="Expand"
                        >
                            <GraduationCap size={20} />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={toggleCollapse}
                                className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 transition-all"
                                title="Collapse"
                            >
                                <GraduationCap size={20} />
                            </button>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={togglePin}
                                    className={`p-1.5 rounded-lg transition-all ${isPinned ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    title={isPinned ? 'Unpin' : 'Pin'}
                                >
                                    {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
                                </button>
                                <button onClick={onOpenSettings} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                    <SettingsIcon size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search tasks or tags..."
                            value={searchQuery}
                            onChange={event => onSearchChange(event.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                {/* Productivity Tools - Only show when expanded */}
                {!isCollapsed && (
                    <div className="space-y-2">
                        <PomodoroTimer onOpenSettings={onOpenSettings} />
                        <AmbientSoundPlayer />
                    </div>
                )}

                {/* Main Navigation */}
                <div className={`space-y-1 ${isCollapsed ? 'px-1' : ''}`}>
                    <button
                        onClick={() => handleNavigate('overview')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 p-2.5 px-3'} rounded-xl transition-all ${activeView === 'overview'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 font-semibold shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        title={isCollapsed ? 'Overview' : undefined}
                    >
                        <LayoutDashboard size={20} />
                        {!isCollapsed && <span className="text-sm">Overview</span>}
                    </button>
                    <button
                        onClick={() => handleNavigate('daily')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 p-2.5 px-3'} rounded-xl transition-all ${activeView === 'daily'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 font-semibold shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        title={isCollapsed ? 'Daily Plan' : undefined}
                    >
                        <SunIcon size={20} />
                        {!isCollapsed && <span className="text-sm">Daily Plan</span>}
                    </button>
                    <button
                        onClick={() => handleNavigate('statistics')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 p-2.5 px-3'} rounded-xl transition-all ${activeView === 'statistics'
                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 font-semibold shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        title={isCollapsed ? 'Statistics' : undefined}
                    >
                        <BarChart3 size={20} />
                        {!isCollapsed && <span className="text-sm">Statistics</span>}
                    </button>
                    <button
                        onClick={() => handleNavigate('calendar')}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 p-2.5 px-3'} rounded-xl transition-all ${activeView === 'calendar'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        title={isCollapsed ? 'Calendar' : undefined}
                    >
                        <Calendar size={20} />
                        {!isCollapsed && <span className="text-sm">Calendar</span>}
                    </button>
                </div>

                {/* Courses */}
                <div>
                    {!isCollapsed && (
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Courses</h3>
                            <button onClick={onCreateCourse} className="text-indigo-500 hover:text-indigo-700 text-xs flex items-center gap-0.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-1.5 py-0.5 rounded-md transition-colors">
                                <Plus size={12} /> New
                            </button>
                        </div>
                    )}
                    <div className="space-y-1">
                        {regularCourses.map(course => {
                            const progress = getCourseProgress(course, completedTasks);
                            return (
                                <button
                                    key={course.id}
                                    onClick={() => handleNavigate(course.id)}
                                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5 px-3'} rounded-xl transition-all group ${activeView === course.id
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                    title={isCollapsed ? `${course.title} (${progress}%)` : undefined}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-2.5 h-2.5 rounded-full ${course.color} shadow-sm`}></div>
                                        {!isCollapsed && <span className="truncate max-w-[130px] text-sm">{course.title}</span>}
                                    </div>
                                    {!isCollapsed && (
                                        <span className="text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-medium">{progress}%</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Personal */}
                <div>
                    {!isCollapsed && (
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Personal</h3>
                    )}
                    {personalCourses.map(course => {
                        const progress = getCourseProgress(course, completedTasks);
                        return (
                            <button
                                key={course.id}
                                onClick={() => handleNavigate(course.id)}
                                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5 px-3'} rounded-xl border border-slate-200/50 dark:border-slate-700/50 transition-all ${activeView === course.id
                                    ? 'bg-slate-800 text-white dark:bg-white dark:text-black shadow-md'
                                    : 'text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                                    }`}
                                title={isCollapsed ? `${course.title} (${progress}%)` : undefined}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
                                    {!isCollapsed && <span className="text-sm">{course.title}</span>}
                                </div>
                                {!isCollapsed && <span className="text-[11px] opacity-70">{progress}%</span>}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className={`border-t border-slate-100 dark:border-slate-700 ${isCollapsed ? 'p-2' : 'p-3'}`}>
                <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div className="text-[11px] text-slate-400 font-medium">{totalProgress}% Completed</div>
                    )}
                    <button
                        onClick={toggleCollapse}
                        className="hidden md:flex p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
            </div>
        </aside>
    );
};

