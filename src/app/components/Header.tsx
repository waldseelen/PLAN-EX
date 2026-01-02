import { usePlannerStore } from '@/modules/planner/store'
import type { Task } from '@/modules/planner/types'
import { Bell, Bot, Calendar, Clock, Globe, Plus, Search, X, Youtube } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as InputKeyboardEvent } from 'react'
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

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
    onCalendarClick?: () => void
}

export const Header = memo(function Header({
    searchQuery,
    onSearchChange,
    onCalendarClick,
}: HeaderProps) {
    const [searchFocused, setSearchFocused] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [hasReadNotifications, setHasReadNotifications] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    const [activeEngine, setActiveEngine] = useState<'local' | 'google' | 'youtube' | 'chatgpt'>('local')
    const searchRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const courses = usePlannerStore(state => state.courses)
    const completionState = usePlannerStore(state => state.completionState)

    // Debounced search query
    const debouncedQuery = useDebounce(searchQuery || '', 300)
    const escapedQuery = useMemo(() => escapeRegExp(debouncedQuery), [debouncedQuery])

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

    const runExternalSearch = useCallback((engine: 'google' | 'youtube' | 'chatgpt', value: string) => {
        const trimmed = value.trim()
        if (!trimmed) return
        const encoded = encodeURIComponent(trimmed)
        if (engine === 'google') {
            window.open(`https://www.google.com/search?q=${encoded}`, '_blank', 'noopener,noreferrer')
            return
        }
        if (engine === 'youtube') {
            window.open(`https://www.youtube.com/results?search_query=${encoded}`, '_blank', 'noopener,noreferrer')
            return
        }
        window.open(`https://chat.openai.com/?q=${encoded}`, '_blank', 'noopener,noreferrer')
    }, [])

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications)
        if (upcomingDeadlines.length > 0) {
            setHasReadNotifications(true)
        }
    }

    const handleSearchKeyDown = useCallback((event: InputKeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Tab') {
            event.preventDefault()
            const engines: Array<'local' | 'google' | 'youtube' | 'chatgpt'> = ['local', 'google', 'youtube', 'chatgpt']
            const currentIndex = engines.findIndex(e => e === activeEngine)
            const next = engines[(currentIndex + 1) % engines.length]
            setActiveEngine(next)
            return
        }

        if (event.key === 'Enter') {
            // Enter her zaman yerel arama açsın; dış aramalar butonlarla tetiklenir
            setShowSearchResults(true)
            setActiveEngine('local')
        }
    }, [activeEngine, setShowSearchResults])

    return (
        <header className="mb-3 md:mb-5 relative z-50">
            <div className="glass-panel rounded-2xl p-3 md:p-4 border border-white/5 bg-circuit overflow-visible">
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex items-center gap-3 justify-between h-14 md:h-auto">
                        <NavLink to="/planner" className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0">
                                <img
                                    src="/logo.png"
                                    alt="Plan.Ex Logo"
                                    className="h-10 w-10 rounded-xl shadow-glow-sm object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1 brand-logo text-lg md:text-xl">
                                    <span className="brand-gradient">PLAN</span>
                                    <span className="brand-accent">.EX</span>
                                </div>
                                <p className="hidden sm:block text-xs text-slate-400 uppercase tracking-[0.14em]">
                                    Plan. Execute. Be Expert
                                </p>
                            </div>
                        </NavLink>

                        <div className="flex-1" />

                        <div className="flex items-center gap-2 relative">
                            <button
                                onClick={() => setMobileSearchOpen(prev => !prev)}
                                className="w-11 h-11 flex items-center justify-center bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] rounded-full transition-all border border-white/10 sm:hidden"
                                title="Ara"
                                aria-label="Ara"
                                aria-expanded={mobileSearchOpen}
                            >
                                <Search size={18} className="text-slate-300" />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={handleNotificationClick}
                                    aria-label="View notifications"
                                    aria-expanded={showNotifications}
                                    className={`w-11 h-11 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.12)] rounded-full transition-all border border-white/10 relative flex items-center justify-center touch-manipulation ${showNotifications ? 'ring-2 ring-cyan-400/40' : ''}`}
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
                                                className="text-slate-400 hover:text-white"
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
                                                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                                                <Clock size={12} />
                                                                <span>
                                                                    {new Date(item.task.dueDateISO!).toLocaleDateString('tr-TR')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-slate-400">
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
                                className="w-11 h-11 items-center justify-center bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] rounded-full transition-all border border-white/10 hidden sm:flex"
                                title="Calendar"
                            >
                                <Calendar size={18} className="text-slate-300" />
                            </button>

                            <button
                                className="h-11 px-4 bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#00d9ff] text-[#0b0b0b] rounded-full font-bold text-sm shadow-glow-sm hover:brightness-110 transition-all flex items-center gap-2"
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('smartfab:open-menu'))
                                }}
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Hemen Basla</span>
                                <span className="sm:hidden">Başla</span>
                            </button>
                        </div>
                    </div>

                    {/* Search (Desktop) */}
                    <div className="hidden md:flex flex-col md:flex-row gap-3 items-stretch">
                        <div
                            ref={searchRef}
                            className={`flex flex-1 items-center bg-[#181c24] px-4 py-2 rounded-full border transition-all relative ${searchFocused ? 'border-cyan-400/50 shadow-glow-sm' : 'border-white/5'
                                }`}
                        >
                            <Search size={16} className="text-slate-300 mr-3 flex-shrink-0" />
                            <input
                                type="text"
                                value={searchQuery || ''}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Görev veya ders ara..."
                                className="bg-transparent border-none outline-none text-white placeholder-slate-400 w-full text-sm"
                            />
                            <div className="flex items-center gap-2 pl-3 ml-3 border-l border-white/5">
                                {[
                                    { id: 'local', label: 'Site', icon: <Search size={14} /> },
                                    { id: 'google', label: 'Google', icon: <Globe size={14} /> },
                                    { id: 'youtube', label: 'YouTube', icon: <Youtube size={14} /> },
                                    { id: 'chatgpt', label: 'GPT', icon: <Bot size={14} /> },
                                ].map(engine => (
                                    <button
                                        key={engine.id}
                                        type="button"
                                        onClick={() => {
                                            if (engine.id !== 'local' && (searchQuery || '').trim()) {
                                                runExternalSearch(engine.id as 'google' | 'youtube' | 'chatgpt', searchQuery || '')
                                            }
                                            // Dış arama sonrası yereli açık tut
                                            setActiveEngine('local')
                                        }}
                                        className={`px-2.5 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1 ${activeEngine === engine.id
                                            ? 'border-cyan-400/60 bg-white/10 text-white'
                                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                                            }`}
                                    >
                                        {engine.icon}
                                        <span>{engine.label}</span>
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">Ctrl+K</span>
                            {searchQuery && (
                                <button
                                    onClick={() => onSearchChange?.('')}
                                    className="text-slate-400 hover:text-white ml-2"
                                >
                                    ×
                                </button>
                            )}

                            {/* Arama Sonuçları Dropdown */}
                            {showSearchResults && activeEngine === 'local' && searchResults.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[70] max-h-80 overflow-y-auto custom-scrollbar">
                                    <div className="p-2 border-b border-white/5">
                                        <p className="text-xs text-slate-400 px-2">{searchResults.length} sonuç bulundu</p>
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
                                                    {result.title.split(new RegExp(`(${escapedQuery})`, 'gi')).map((part, i) =>
                                                        part.toLowerCase() === debouncedQuery.toLowerCase() ?
                                                            <mark key={i} className="bg-cyan-400/30 text-white rounded px-0.5">{part}</mark> : part
                                                    )}
                                                </p>
                                                {result.subtitle && (
                                                    <p className="text-xs text-slate-400 mt-0.5">{result.subtitle}</p>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Sonuç bulunamadı */}
                            {showSearchResults && activeEngine === 'local' && debouncedQuery.length >= 2 && searchResults.length === 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[70] p-6 text-center">
                                    <Search size={24} className="mx-auto mb-2 text-slate-400 opacity-50" />
                                    <p className="text-sm text-slate-300">"{debouncedQuery}" için sonuç bulunamadı</p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Search (Mobile - toggle) */}
                    {mobileSearchOpen && (
                        <div className="md:hidden flex flex-col gap-3">
                            <div
                                ref={searchRef}
                                className={`flex items-center bg-[#181c24] px-4 py-2 rounded-full border transition-all relative ${searchFocused ? 'border-cyan-400/50 shadow-glow-sm' : 'border-white/5'
                                    }`}
                            >
                                <Search size={16} className="text-slate-300 mr-3 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery || ''}
                                    onChange={(e) => onSearchChange?.(e.target.value)}
                                    onFocus={handleSearchFocus}
                                    onBlur={handleSearchBlur}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder="Görev veya ders ara..."
                                    className="bg-transparent border-none outline-none text-white placeholder-slate-400 w-full text-sm"
                                    autoFocus
                                />
                                <div className="flex items-center gap-2 ml-2">
                                    {[
                                        { id: 'local', label: 'Site', icon: <Search size={14} /> },
                                        { id: 'google', label: 'Google', icon: <Globe size={14} /> },
                                        { id: 'youtube', label: 'YouTube', icon: <Youtube size={14} /> },
                                        { id: 'chatgpt', label: 'GPT', icon: <Bot size={14} /> },
                                    ].map(engine => (
                                        <button
                                            key={engine.id}
                                            type="button"
                                            onClick={() => {
                                                if (engine.id !== 'local' && (searchQuery || '').trim()) {
                                                    runExternalSearch(engine.id as 'google' | 'youtube' | 'chatgpt', searchQuery || '')
                                                }
                                                setActiveEngine('local')
                                            }}
                                            className={`px-2.5 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1 ${activeEngine === engine.id
                                                ? 'border-cyan-400/60 bg-white/10 text-white'
                                                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                                                }`}
                                        >
                                            {engine.icon}
                                            <span>{engine.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        onSearchChange?.('')
                                        setMobileSearchOpen(false)
                                    }}
                                    className="text-slate-300 hover:text-white ml-2"
                                    aria-label="Aramayı kapat"
                                    title="Kapat"
                                >
                                    <X size={16} />
                                </button>

                                {/* Arama Sonuçları Dropdown */}
                                {showSearchResults && activeEngine === 'local' && searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-2 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[70] max-h-80 overflow-y-auto custom-scrollbar">
                                        <div className="p-2 border-b border-white/5">
                                            <p className="text-xs text-slate-400 px-2">{searchResults.length} sonuç bulundu</p>
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
                                                        {result.title.split(new RegExp(`(${escapedQuery})`, 'gi')).map((part, i) =>
                                                            part.toLowerCase() === debouncedQuery.toLowerCase() ?
                                                                <mark key={i} className="bg-cyan-400/30 text-white rounded px-0.5">{part}</mark> : part
                                                        )}
                                                    </p>
                                                    {result.subtitle && (
                                                        <p className="text-xs text-slate-400 mt-0.5">{result.subtitle}</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Sonuç bulunamadı */}
                                {showSearchResults && activeEngine === 'local' && debouncedQuery.length >= 2 && searchResults.length === 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-2 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[70] p-6 text-center">
                                        <Search size={24} className="mx-auto mb-2 text-slate-400 opacity-50" />
                                        <p className="text-sm text-slate-300">"{debouncedQuery}" için sonuç bulunamadı</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
})




