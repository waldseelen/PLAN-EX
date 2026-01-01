import { AlertTriangle, Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight, Circle, GraduationCap } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { usePlannerContext } from '@/context/AppContext';
import { Course, Exam, Task } from '@/types';

interface CalendarProps {
    onSelectCourse?: (courseId: string) => void;
}

interface DayTasks {
    completed: Array<{ task: Task; course: Course }>;
    pending: Array<{ task: Task; course: Course }>;
    total: number;
}

interface DayExam {
    exam: Exam;
    course: Course;
}

const DAYS_TR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS_TR = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const Calendar: React.FC<CalendarProps> = ({ onSelectCourse }) => {
    const { courses, completedTasks, completionHistory } = usePlannerContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Ayın ilk ve son günlerini hesapla
    const { firstDayOfMonth, daysInMonth, year, month } = useMemo(() => {
        const y = currentDate.getFullYear();
        const m = currentDate.getMonth();
        const first = new Date(y, m, 1);
        const days = new Date(y, m + 1, 0).getDate();
        // Pazartesi'den başla (0 = Pzt, 6 = Paz)
        let firstDay = first.getDay() - 1;
        if (firstDay < 0) firstDay = 6;
        return { firstDayOfMonth: firstDay, daysInMonth: days, year: y, month: m };
    }, [currentDate]);

    // Tüm görevleri tarihe göre grupla
    const tasksByDate = useMemo(() => {
        const map: Record<string, DayTasks> = {};

        courses.forEach(course => {
            course.units.forEach(unit => {
                unit.tasks.forEach(task => {
                    // Due date'e göre grupla
                    if (task.dueDate) {
                        const dateKey = task.dueDate;
                        if (!map[dateKey]) {
                            map[dateKey] = { completed: [], pending: [], total: 0 };
                        }
                        const isCompleted = completedTasks.has(task.id);
                        if (isCompleted) {
                            map[dateKey].completed.push({ task, course });
                        } else {
                            map[dateKey].pending.push({ task, course });
                        }
                        map[dateKey].total++;
                    }
                });
            });
        });

        // Tamamlanma geçmişinden de ekle (due date olmayan ama tamamlanan görevler)
        Object.entries(completionHistory).forEach(([taskId, dateStr]) => {
            // Görevin zaten due date ile eklenip eklenmediğini kontrol et
            let alreadyAdded = false;
            courses.forEach(course => {
                course.units.forEach(unit => {
                    unit.tasks.forEach(task => {
                        if (task.id === taskId && task.dueDate) {
                            alreadyAdded = true;
                        }
                    });
                });
            });

            if (!alreadyAdded) {
                // Tarihi YYYY-MM-DD formatına çevir
                const d = new Date(dateStr as string);
                const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                // Görevi bul
                courses.forEach(course => {
                    course.units.forEach(unit => {
                        unit.tasks.forEach(task => {
                            if (task.id === taskId) {
                                if (!map[dateKey]) {
                                    map[dateKey] = { completed: [], pending: [], total: 0 };
                                }
                                map[dateKey].completed.push({ task, course });
                                map[dateKey].total++;
                            }
                        });
                    });
                });
            }
        });

        return map;
    }, [courses, completedTasks, completionHistory]);

    // Sınavları tarihe göre grupla
    const examsByDate = useMemo(() => {
        const map: Record<string, DayExam[]> = {};

        courses.forEach(course => {
            (course.exams || []).forEach(exam => {
                const dateKey = exam.date;
                if (!map[dateKey]) {
                    map[dateKey] = [];
                }
                map[dateKey].push({ exam, course });
            });
        });

        return map;
    }, [courses]);

    // Takvim günlerini oluştur
    const calendarDays = useMemo(() => {
        const days: Array<{ day: number | null; dateKey: string | null; isToday: boolean; isPast: boolean }> = [];
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // Önceki aydan boş günler
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ day: null, dateKey: null, isToday: false, isPast: false });
        }

        // Ayın günleri
        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayDate = new Date(year, month, d);
            days.push({
                day: d,
                dateKey,
                isToday: dateKey === todayKey,
                isPast: dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
            });
        }

        return days;
    }, [firstDayOfMonth, daysInMonth, year, month]);

    // Ay değiştir
    const changeMonth = useCallback((delta: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
        setSelectedDate(null);
    }, []);

    // Bugüne git
    const goToToday = useCallback(() => {
        setCurrentDate(new Date());
        setSelectedDate(null);
    }, []);

    // Seçili günün görevleri
    const selectedDayTasks = selectedDate ? tasksByDate[selectedDate] : null;
    const selectedDayExams = selectedDate ? examsByDate[selectedDate] : null;

    // Aylık istatistikler
    const monthlyStats = useMemo(() => {
        let completed = 0;
        let pending = 0;

        calendarDays.forEach(({ dateKey }) => {
            if (dateKey && tasksByDate[dateKey]) {
                completed += tasksByDate[dateKey].completed.length;
                pending += tasksByDate[dateKey].pending.length;
            }
        });

        return { completed, pending, total: completed + pending };
    }, [calendarDays, tasksByDate]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Başlık */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <CalendarIcon className="w-7 h-7 text-purple-500" />
                    Monthly Calendar
                </h1>
                <button
                    onClick={goToToday}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors shadow-lg shadow-purple-500/20"
                >
                    Today
                </button>
            </div>

            {/* Aylık İstatistikler */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
                    <div className="text-3xl font-bold text-green-400">{monthlyStats.completed}</div>
                    <div className="text-sm text-green-300">Completed</div>
                </div>
                <div className="bg-orange-500/10 rounded-xl p-4 text-center border border-orange-500/20">
                    <div className="text-3xl font-bold text-orange-400">{monthlyStats.pending}</div>
                    <div className="text-sm text-orange-300">Pending</div>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-4 text-center border border-purple-500/20">
                    <div className="text-3xl font-bold text-purple-400">{monthlyStats.total}</div>
                    <div className="text-sm text-purple-300">Total</div>
                </div>
            </div>

            {/* Yaklaşan Sınavlar */}
            {(() => {
                const today = new Date();
                const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const upcomingExams: Array<{ exam: Exam; course: Course; date: string }> = [];

                const sortedDates = Object.keys(examsByDate)
                    .filter(date => date >= todayKey)
                    .sort((a, b) => a.localeCompare(b))
                    .slice(0, 5);

                sortedDates.forEach(date => {
                    const exams = examsByDate[date];
                    if (exams) {
                        exams.forEach(e => upcomingExams.push({ ...e, date }));
                    }
                });

                if (upcomingExams.length === 0) return null;

                return (
                    <div className="mb-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-4 border border-red-500/30">
                        <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Upcoming Exams
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {upcomingExams.map(({ exam, course, date }) => {
                                const examDate = new Date(date + 'T00:00:00');
                                const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div
                                        key={exam.id}
                                        onClick={() => onSelectCourse?.(course.id)}
                                        className="flex items-center gap-3 p-3 bg-[#1e1a28] rounded-lg cursor-pointer hover:bg-[#2a2438] transition-all border-l-4"
                                        style={{ borderLeftColor: course.customColor || '#ef4444' }}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">
                                                {course.code} - {exam.title}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {examDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                {exam.time && ` • ${exam.time}`}
                                            </p>
                                        </div>
                                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${daysLeft <= 3 ? 'bg-red-500 text-white' :
                                            daysLeft <= 7 ? 'bg-orange-500 text-white' :
                                                'bg-[#2a2438] text-slate-300'
                                            }`}>
                                            {daysLeft}d
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* Ay Navigasyonu */}
            <div className="flex items-center justify-between mb-4 bg-[#1a1625] rounded-xl p-4 border border-white/5">
                <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 rounded-lg hover:bg-[#2a2438] transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
                <h2 className="text-xl font-semibold text-white">
                    {MONTHS_TR[month]} {year}
                </h2>
                <button
                    onClick={() => changeMonth(1)}
                    className="p-2 rounded-lg hover:bg-[#2a2438] transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
            </div>

            {/* Takvim Grid */}
            <div className="bg-[#1a1625] rounded-xl shadow-sm overflow-hidden border border-white/5">
                {/* Gün başlıkları */}
                <div className="grid grid-cols-7 border-b border-white/5">
                    {DAYS_TR.map(day => (
                        <div
                            key={day}
                            className="py-3 text-center text-sm font-medium text-slate-400"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Takvim günleri */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((dayInfo, index) => {
                        const { day, dateKey, isToday, isPast } = dayInfo;
                        const dayTasks = dateKey ? tasksByDate[dateKey] : null;
                        const dayExams = dateKey ? examsByDate[dateKey] : null;
                        const hasCompleted = dayTasks && dayTasks.completed.length > 0;
                        const hasPending = dayTasks && dayTasks.pending.length > 0;
                        const hasExam = dayExams && dayExams.length > 0;
                        const isSelected = dateKey === selectedDate;

                        return (
                            <button
                                key={index}
                                onClick={() => dateKey && setSelectedDate(isSelected ? null : dateKey)}
                                disabled={!day}
                                className={`
                  relative min-h-[80px] p-2 border-b border-r border-white/5
                  transition-all duration-200
                  ${!day ? 'bg-[#13111a] cursor-default' : 'hover:bg-[#2a2438] cursor-pointer'}
                  ${isToday ? 'bg-purple-500/20' : ''}
                  ${isSelected ? 'ring-2 ring-purple-500 ring-inset bg-[#2a2438]' : ''}
                  ${hasExam && !isPast ? 'bg-red-500/10' : ''}
                  ${isPast && !isToday ? 'opacity-60' : ''}
                `}
                            >
                                {day && (
                                    <>
                                        <span
                                            className={`
                        text-sm font-medium
                        ${isToday ? 'bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center' : ''}
                        ${!isToday && isPast ? 'text-slate-500' : 'text-slate-200'}
                      `}
                                        >
                                            {day}
                                        </span>

                                        {/* Sınav göstergeleri - dot formatında */}
                                        {hasExam && (
                                            <div className="absolute top-1 right-1 flex gap-0.5">
                                                {dayExams.map(({ exam, course }) => (
                                                    <div
                                                        key={exam.id}
                                                        className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white dark:ring-[#1a1625]"
                                                        style={{ backgroundColor: course.customColor || '#ef4444' }}
                                                        title={`${course.code}: ${exam.title}`}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Görev göstergeleri */}
                                        {dayTasks && dayTasks.total > 0 && (
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                                {hasCompleted && (
                                                    <div className="flex items-center gap-0.5">
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                        <span className="text-xs text-green-600 dark:text-green-400">
                                                            {dayTasks.completed.length}
                                                        </span>
                                                    </div>
                                                )}
                                                {hasPending && (
                                                    <div className="flex items-center gap-0.5">
                                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                                        <span className="text-xs text-orange-600 dark:text-orange-400 mb-0.5">
                                                            {dayTasks.pending.length}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Seçili Günün Görevleri ve Sınavları */}
            {selectedDate && (
                <div className="mt-6 bg-[#1a1625] rounded-xl shadow-sm p-4 border border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </h3>

                    {/* Sınavlar */}
                    {selectedDayExams && selectedDayExams.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                                <GraduationCap size={16} /> Exams
                            </h4>
                            <div className="space-y-2">
                                {selectedDayExams.map(({ exam, course }) => (
                                    <div
                                        key={exam.id}
                                        onClick={() => onSelectCourse?.(course.id)}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 cursor-pointer hover:bg-red-500/20 transition-colors border border-red-500/20"
                                    >
                                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white">
                                                {exam.title}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {course.title} {exam.time && `• ${exam.time}`}
                                            </p>
                                        </div>
                                        <div
                                            className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-[#1a1625]"
                                            style={{ backgroundColor: course.customColor || '#ef4444' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedDayTasks && selectedDayTasks.total > 0 ? (
                        <div className="space-y-3">
                            {/* Tamamlanan görevler */}
                            {selectedDayTasks.completed.map(({ task, course }) => (
                                <div
                                    key={task.id}
                                    onClick={() => onSelectCourse?.(course.id)}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 cursor-pointer hover:bg-green-500/20 transition-colors border border-green-500/20"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white line-through">
                                            {task.text}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {course.title}
                                        </p>
                                    </div>
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: course.customColor || '#3b82f6' }}
                                    />
                                </div>
                            ))}

                            {/* Bekleyen görevler */}
                            {selectedDayTasks.pending.map(({ task, course }) => (
                                <div
                                    key={task.id}
                                    onClick={() => onSelectCourse?.(course.id)}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 cursor-pointer hover:bg-orange-500/20 transition-colors border border-orange-500/20"
                                >
                                    <Circle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white">
                                            {task.text}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {course.title}
                                        </p>
                                    </div>
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: course.customColor || '#3b82f6' }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : !selectedDayExams?.length && (
                        <p className="text-slate-400 text-center py-4">
                            No events on this date
                        </p>
                    )}
                </div>
            )}

            {/* Renk Açıklaması */}
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-400 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Exam</span>
                </div>
            </div>

            {/* Ders Renkleri Legend */}
            <div className="mt-4 bg-[#1a1625] rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Course Colors</h4>
                <div className="flex flex-wrap gap-3">
                    {courses.filter(c => c.exams && c.exams.length > 0).map(course => (
                        <div
                            key={course.id}
                            onClick={() => onSelectCourse?.(course.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2438] rounded-lg cursor-pointer hover:bg-[#352f42] transition-colors"
                        >
                            <div
                                className="w-3 h-3 rounded-full ring-1 ring-slate-600"
                                style={{ backgroundColor: course.customColor || '#3b82f6' }}
                            />
                            <span className="text-xs font-medium text-slate-300">
                                {course.code}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
