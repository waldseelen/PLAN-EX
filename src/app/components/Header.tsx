import { usePlannerStore } from '@/modules/planner/store'
import type { Task } from '@/modules/planner/types'
import { Bell, Calendar, Clock, Plus, Search, X } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

interface SearchResult {
    type: 'course' | 'task' | 'unit';
    id: string;
    title: string;
    subtitle?: string;
    courseId?: string;
    unitId?: string;
    color?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface HeaderProps {
    searchQuery?: string
    onSearchChange?: (query: string) => void
    onNewTask?: () => void
    onCalendarClick?: () => void
}

export const Header = memo(function Header({
    searchQuery,
    onSearchChange,
    onNewTask,
    onCalendarClick,
}: HeaderProps) {
    const [searchFocused, setSearchFocused] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [hasReadNotifications, setHasReadNotifications] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const courses = usePlannerStore(state => state.courses)
    const completionState = usePlannerStore(state => state.completionState)

    // Debounced search query
    const debouncedQuery = useDebounce(searchQuery || '', 300)

    // Search results
    const searchResults = useMemo<SearchResult[]>(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) return []

        const query = debouncedQuery.toLowerCase()
        const results: SearchResult[] = []

        courses.forEach(course => {
            // Ders eşleşmesi
            if (course.title.toLowerCase().includes(query) ||
                (course.code && course.code.toLowerCase().includes(query))) {
                results.push({
                    type: 'course',
                    id: course.id,
                    title: course.title,
                    subtitle: course.code || `${course.units.length} ünite`,
                    color: course.color,
                })
            }

            // Ünite ve görev eşleşmeleri
            course.units.forEach(unit => {
                if (unit.title.toLowerCase().includes(query)) {
                    results.push({
                        type: 'unit',
                        id: unit.id,
                        title: unit.title,
                        subtitle: course.title,
                        courseId: course.id,
                        color: course.color,
                    })
                }

                unit.tasks.forEach(task => {
                    if (task.text.toLowerCase().includes(query)) {
                        results.push({
                            type: 'task',
                            id: task.id,
                            title: task.text,
                            subtitle: `${course.title} › ${unit.title}`,
                            courseId: course.id,
                            unitId: unit.id,
                            color: course.color,
                        })
                    }
                })
            })
        })

        return results.slice(0, 10) // İlk 10 sonuç
    }, [debouncedQuery, courses])

    // Dışarı tıklamayı dinle
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Sonuca tıklandığında yönlendir
    const handleResultClick = useCallback((result: SearchResult) => {
        setShowSearchResults(false)
        onSearchChange?.('')

        if (result.type === 'course' || result.type === 'unit' || result.type === 'task') {
            navigate(`/planner/courses/${result.courseId || result.id}`)
        }
    }, [navigate, onSearchChange])

    // Arama alanı odağı
    const handleSearchFocus = useCallback(() => {
        setSearchFocused(true)
        setShowSearchResults(true)
    }, [])

    const handleSearchBlur = useCallback(() => {
        setSearchFocused(false)
        // Delay to allow click on results
        setTimeout(() => setShowSearchResults(false), 200)
    }, [])

    // Calculate upcoming deadlines (next 3 days)
    const upcomingDeadlines = useMemo(() => {
        const deadlines: { task: Task; courseCode: string; daysLeft: number }[] = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        courses.forEach(course => {
            course.units.forEach(unit => {
                unit.tasks.forEach(task => {
                    const taskDueDate = task.dueDateISO
                    if (taskDueDate && !completionState.completedTaskIds.includes(task.id)) {
                        const dueDate = new Date(taskDueDate)
                        dueDate.setHours(0, 0, 0, 0)
                        const diffTime = dueDate.getTime() - today.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                        if (diffDays >= 0 && diffDays <= 3) {
                            deadlines.push({
                                task,
                                courseCode: course.code || course.title.slice(0, 6).toUpperCase(),
                                daysLeft: diffDays,
                            })
                        }
                    }
                })
            })
        })

        return deadlines.sort((a, b) => a.daysLeft - b.daysLeft)
    }, [courses, completionState])

    const hasUnread = upcomingDeadlines.length > 0 && !hasReadNotifications

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications)
        if (upcomingDeadlines.length > 0) {
            setHasReadNotifications(true)
        }
    }

    return (
        <header className="mb-6 relative z-50">
            <div className="glass-panel rounded-2xl p-4 md:p-5 border border-white/5 bg-circuit overflow-hidden">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-4 justify-between">
                        <NavLink to="/planner" className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <img
                                    src="/logo.png"
                                    alt="Plan.Ex Logo"
                                    className="h-11 w-11 rounded-xl shadow-glow-sm object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1 brand-logo text-lg md:text-xl">
                                    <span className="brand-gradient">PLAN</span>
                                    <span className="brand-accent">.EX</span>
                                </div>
                                <p className="text-[11px] text-slate-400 uppercase tracking-[0.14em]">
                                    Plan. Execute. Be Expert
                                </p>
                            </div>
                        </NavLink>

                        <div className="flex-1" />

                        <div className="flex items-center gap-2 relative">
                            <div className="relative">
                                <button
                                    onClick={handleNotificationClick}
                                    aria-label="View notifications"
                                    aria-expanded={showNotifications}
                                    className={`p-2.5 min-w-[44px] min-h-[44px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.12)] rounded-xl transition-all border border-white/10 relative flex items-center justify-center touch-manipulation ${showNotifications ? 'ring-2 ring-cyan-400/40' : ''}`}
                                    title="Notifications"
                                >
                                    <Bell size={20} className="text-slate-300" />
                                    {hasUnread && (
                                        <span
                                            className="absolute top-2 right-2 w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full animate-pulse"
                                            aria-label="Unread notifications"
                                        />
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60] backdrop-blur-xl">
                                        <div className="p-3 border-b border-white/5 flex items-center justify-between">
                                            <h3 className="font-bold text-white text-sm">Bildirimler</h3>
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                className="text-slate-500 hover:text-white"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                            {upcomingDeadlines.length > 0 ? (
                                                <div className="py-1">
                                                    {upcomingDeadlines.map((item, idx) => (
                                                        <div
                                                            key={`${item.task.id}-${idx}`}
                                                            className="px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="text-xs font-bold text-cyan-300">
                                                                    {item.courseCode}
                                                                </span>
                                                                <span
                                                                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.daysLeft === 0
                                                                        ? 'bg-red-500 text-white'
                                                                        : 'bg-[rgba(255,210,0,0.18)] text-[var(--color-accent)]'
                                                                        }`}
                                                                >
                                                                    {item.daysLeft === 0 ? 'Bugün' : `${item.daysLeft} gün`}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-white line-clamp-2">
                                                                {item.task.text}
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                                                <Clock size={12} />
                                                                <span>
                                                                    {new Date(item.task.dueDateISO!).toLocaleDateString('tr-TR')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-slate-500">
                                                    <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                                    <p className="text-xs">Yaklaşan deadline yok.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={onCalendarClick || (() => navigate('/calendar'))}
                                className="p-2.5 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] rounded-xl transition-all border border-white/10 hidden sm:flex"
                                title="Calendar"
                            >
                                <Calendar size={18} className="text-slate-300" />
                            </button>

                            <button
                                onClick={onNewTask || (() => navigate('/planner/tasks'))}
                                className="btn-cta-outline hidden sm:flex items-center gap-2 text-sm font-semibold"
                            >
                                <Plus size={18} />
                                Hemen Başla
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 items-stretch">
                        <div
                            ref={searchRef}
                            className={`flex flex-1 items-center bg-[#181c24] px-4 py-2.5 rounded-xl border transition-all relative ${searchFocused ? 'border-cyan-400/50 shadow-glow-sm' : 'border-white/5'
                                }`}
                        >
                            <Search size={16} className="text-slate-400 mr-3 flex-shrink-0" />
                            <input
                                type="text"
                                value={searchQuery || ''}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                placeholder="Görev veya ders ara... (Ctrl+K)"
                                className="bg-transparent border-none outline-none text-white placeholder-slate-500 w-full text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => onSearchChange?.('')}
                                    className="text-slate-500 hover:text-white ml-2"
                                >
                                    ×
                                </button>
                            )}

                            {/* Arama Sonuçları Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[70] max-h-80 overflow-y-auto custom-scrollbar">
                                    <div className="p-2 border-b border-white/5">
                                        <p className="text-xs text-slate-500 px-2">{searchResults.length} sonuç bulundu</p>
                                    </div>
                                    {searchResults.map((result, idx) => (
                                        <button
                                            key={`${result.type}-${result.id}-${idx}`}
                                            onClick={() => handleResultClick(result)}
                                            className="w-full px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-start gap-3 text-left"
                                        >
                                            <div
                                                className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                                                style={{ backgroundColor: result.color || '#6366f1' }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 uppercase">
                                                        {result.type === 'course' ? 'Ders' : result.type === 'unit' ? 'Ünite' : 'Görev'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white mt-1 line-clamp-1">
                                                    {/* Eşleşen metni vurgula */}
                                                    {result.title.split(new RegExp(`(${debouncedQuery})`, 'gi')).map((part, i) =>
                                                        part.toLowerCase() === debouncedQuery.toLowerCase() ?
                                                            <mark key={i} className="bg-cyan-400/30 text-white rounded px-0.5">{part}</mark> : part
                                                    )}
                                                </p>
                                                {result.subtitle && (
                                                    <p className="text-xs text-slate-500 mt-0.5">{result.subtitle}</p>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Sonuç bulunamadı */}
                            {showSearchResults && debouncedQuery.length >= 2 && searchResults.length === 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[70] p-6 text-center">
                                    <Search size={24} className="mx-auto mb-2 text-slate-500 opacity-50" />
                                    <p className="text-sm text-slate-500">"{debouncedQuery}" için sonuç bulunamadı</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={onNewTask || (() => navigate('/planner/tasks'))}
                                className="px-4 py-2.5 bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#00d9ff] text-[#0b0b0b] rounded-xl font-bold text-sm shadow-glow-sm hover:brightness-110 transition-all flex items-center gap-2"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Yeni Görev</span>
                                <span className="sm:hidden">Ekle</span>
                            </button>
                            <button
                                onClick={onCalendarClick || (() => navigate('/calendar'))}
                                className="px-4 py-2.5 bg-transparent border border-white/10 rounded-xl text-slate-300 hover:border-cyan-400/50 hover:text-white transition-all flex items-center gap-2 text-sm"
                            >
                                <Calendar size={16} />
                                <span className="hidden sm:inline">Takvim</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
})
