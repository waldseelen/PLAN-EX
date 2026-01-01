import { CheckCircle, Clock, Flame, Sparkles, Star, Target, TrendingUp, Trophy, Zap } from 'lucide-react';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { usePlannerContext } from '@/context/AppContext';
import { useStreak } from '@/hooks/useStreak';
import { getCourseProgress, getNextTask } from '@/utils/course';
import { getDaysLeft } from '@/utils/time';
import { DailyPlan } from '../DailyPlan/DailyPlan';

// Motivation messages
const MOTIVATION_MESSAGES = [
    { threshold: 0, message: "Every great journey starts with a single step! 🚀", subtext: "Complete your first task" },
    { threshold: 10, message: "Great start! Keep going! 💪", subtext: "You're building momentum" },
    { threshold: 25, message: "Quarter way there! Amazing! ⭐", subtext: "Consistency is key" },
    { threshold: 50, message: "Halfway there! Don't give up! 🔥", subtext: "The peak is getting closer" },
    { threshold: 75, message: "Final stretch! 🏃", subtext: "The finish line is in sight" },
    { threshold: 90, message: "Almost done! Final push! 🎯", subtext: "Champions never quit" },
    { threshold: 100, message: "AMAZING! You completed everything! 🏆", subtext: "You're a legend!" },
];

const getMotivationMessage = (progress: number) => {
    for (let i = MOTIVATION_MESSAGES.length - 1; i >= 0; i--) {
        if (progress >= MOTIVATION_MESSAGES[i].threshold) {
            return MOTIVATION_MESSAGES[i];
        }
    }
    return MOTIVATION_MESSAGES[0];
};

interface Props {
    onNavigateCourse: (courseId: string) => void;
    onNavigateDaily: () => void;
}

export const Overview = ({ onNavigateCourse, onNavigateDaily }: Props) => {
    const { courses, completedTasks, completionHistory } = usePlannerContext();
    const completedCount = completedTasks.size;
    const { streak, weeklyCount, hasCompletedToday } = useStreak(completionHistory);

    // Calculate total progress
    // Calculate total progress and detailed statistics
    const { totalTasks, activeTasks, totalProgress, kanbanStats } = (() => {
        let total = 0;
        let done = 0;
        let todo = 0;
        let inProgress = 0;
        let review = 0;

        courses.forEach(course => {
            course.units.forEach(unit => {
                unit.tasks.forEach(task => {
                    total += 1;
                    if (completedTasks.has(task.id)) {
                        done += 1;
                    } else {
                        // Check kanban status
                        const status = task.status || 'todo';
                        if (status === 'todo') todo++;
                        else if (status === 'in-progress') inProgress++;
                        else if (status === 'review') review++;
                    }
                });
            });
        });

        const active = total - done;

        return {
            totalTasks: total,
            activeTasks: active,
            totalProgress: total === 0 ? 0 : Math.round((done / total) * 100),
            kanbanStats: { todo, inProgress, review }
        };
    })();

    const motivation = getMotivationMessage(totalProgress);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const activityData = last7Days.map(date => {
        const count = Object.values(completionHistory).filter(d => typeof d === 'string' && d.startsWith(date)).length;
        return { date, count };
    });

    const maxCount = Math.max(...activityData.map(d => d.count), 1);

    // Calculate upcoming exams (future only)
    const upcomingExams = courses
        .flatMap(course =>
            (course.exams || []).map(exam => ({
                ...exam,
                course,
                daysLeft: Math.ceil((new Date(exam.date).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24))
            }))
        )
        .filter(exam => exam.daysLeft >= 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5); // First 5 exams

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="mb-6">
                <div className="card-tech bg-circuit rounded-2xl p-5 md:p-6 border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(0,174,239,0.35),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,210,0,0.22),transparent_26%)]" />
                    <div className="relative flex flex-col lg:flex-row gap-6 lg:items-center">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[var(--color-accent)] font-semibold">
                                <Sparkles size={14} />
                                Plan. Execute. Be Expert.
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                                <span className="brand-gradient">Plan</span>
                                <span className="text-[var(--color-accent)]">.Ex</span> Productivity OS
                            </h1>
                            <p className="text-slate-300 max-w-2xl">
                                Manage your tasks, courses, and daily plan in a single dark-mode experience with aviation panel discipline and cybersecurity refinement.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        document.getElementById('daily-plan-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    Hemen Başla
                                </button>
                                <button className="btn-cta-outline" onClick={() => onNavigateCourse('courses')}>
                                    Derslere Git
                                </button>
                                <StreakBadge streak={streak} weeklyCount={weeklyCount} hasCompletedToday={hasCompletedToday} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                            <div className="p-3 rounded-xl bg-[#181c24] border border-white/10 shadow-glow-sm">
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                    <Clock size={16} className="text-cyan-300" />
                                    Yaklaşan İşler
                                </div>
                                <p className="text-2xl font-bold text-white mt-1">{activeTasks}</p>
                                <p className="text-[11px] text-slate-500">Aktif görev</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#181c24] border border-white/10 shadow-glow-sm">
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                    <Trophy size={16} className="text-[var(--color-accent)]" />
                                    Tamamlanan
                                </div>
                                <p className="text-2xl font-bold text-white mt-1">{completedCount}</p>
                                <p className="text-[11px] text-slate-500">Görev bitti</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#181c24] border border-white/10 shadow-glow-sm">
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                    <Zap size={16} className="text-cyan-300" />
                                    Odak Skoru
                                </div>
                                <p className="text-2xl font-bold text-white mt-1">%{totalProgress}</p>
                                <p className="text-[11px] text-slate-500">Completion rate</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#181c24] border border-white/10 shadow-glow-sm">
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                    <Sparkles size={16} className="text-cyan-300" />
                                    Motivasyon
                                </div>
                                <p className="text-sm font-semibold text-white mt-1">{motivation.message}</p>
                                <p className="text-[11px] text-slate-500">{motivation.subtext}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Upcoming Exams Alert */}
            {/* Dashboard Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-tech bg-[#13131a] p-4 rounded-xl border border-white/8 relative overflow-hidden group hover:border-cyan-400/40">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-[rgba(0,174,239,0.14)] rounded-lg text-cyan-300">
                            <Target size={20} />
                        </div>
                        <span className="text-xs text-slate-500">Total</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{totalTasks}</h3>
                    <p className="text-xs text-slate-400">All tasks</p>
                </div>

                <div className="card-tech bg-[#13131a] p-4 rounded-xl border border-white/8 relative overflow-hidden group hover:border-cyan-400/40">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-[rgba(0,174,239,0.14)] rounded-lg text-cyan-300">
                            <Zap size={20} />
                        </div>
                        <span className="text-xs text-slate-500">Active</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{activeTasks}</h3>
                    <p className="text-xs text-slate-400">In progress</p>
                </div>

                <div className="card-tech bg-[#13131a] p-4 rounded-xl border border-white/8 relative overflow-hidden group hover:border-[rgba(0,174,239,0.5)]">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-[rgba(0,174,239,0.14)] rounded-lg text-[var(--color-accent)]">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-xs text-slate-500">Done</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{completedCount}</h3>
                    <p className="text-xs text-slate-400">Completed</p>
                </div>

                <div className="card-tech bg-[#13131a] p-4 rounded-xl border border-white/8 relative overflow-hidden group hover:border-[rgba(255,210,0,0.5)]">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-[rgba(255,210,0,0.12)] rounded-lg text-[var(--color-accent)]">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-xs text-slate-500">Rate</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">%{totalProgress}</h3>
                    <p className="text-xs text-slate-400">Completion rate</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Completed Tasks Stats */}
                <div className="lg:col-span-2 card-tech bg-[#13131a] p-6 rounded-xl border border-white/8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Completed Tasks</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-xs rounded-lg border border-white/10 text-slate-200">Year</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-[#181c24] p-4 rounded-xl border border-cyan-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy size={16} className="text-[var(--color-accent)]" />
                                <span className="text-xs text-slate-400">Tasks Done</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{completedCount}</p>
                        </div>
                        <div className="bg-[#181c24] p-4 rounded-xl border border-cyan-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={16} className="text-cyan-300" />
                                <span className="text-xs text-slate-400">Efficiency</span>
                            </div>
                            <p className="text-2xl font-bold text-white">%{totalProgress}</p>
                        </div>
                        <div className="bg-[#181c24] p-4 rounded-xl border border-cyan-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame size={16} className="text-[var(--color-accent)]" />
                                <span className="text-xs text-slate-400">Streak</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{streak} Days</p>
                        </div>
                        <div className="bg-[#181c24] p-4 rounded-xl border border-cyan-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Star size={16} className="text-[var(--color-accent)]" />
                                <span className="text-xs text-slate-400">Points</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{completedCount * 35}</p>
                        </div>
                    </div>
                </div>

                {/* Application Stats (Kanban Dist) */}
                <div className="card-tech bg-[#13131a] p-6 rounded-xl border border-white/8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Application</h3>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <div className="flex flex-col items-center">
                            <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                                <svg className="transform -rotate-90 w-16 h-16">
                                    <circle cx="32" cy="32" r="28" stroke="#222" strokeWidth="4" fill="none" />
                                    <circle cx="32" cy="32" r="28" stroke="#00aeef" strokeWidth="4" fill="none" strokeDasharray={`${(kanbanStats.todo / totalTasks) * 175 || 0} 175`} />
                                </svg>
                                <span className="absolute text-sm font-bold text-white">%{totalTasks ? Math.round((kanbanStats.todo / totalTasks) * 100) : 0}</span>
                            </div>
                            <div className="text-center">
                                <div className="p-1.5 bg-[rgba(0,174,239,0.12)] rounded mb-1 inline-block">
                                    <Target size={14} className="text-cyan-300" />
                                </div>
                                <p className="text-xs text-slate-400">Todo</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                                <svg className="transform -rotate-90 w-16 h-16">
                                    <circle cx="32" cy="32" r="28" stroke="#222" strokeWidth="4" fill="none" />
                                    <circle cx="32" cy="32" r="28" stroke="#29c6cd" strokeWidth="4" fill="none" strokeDasharray={`${(kanbanStats.inProgress / totalTasks) * 175 || 0} 175`} />
                                </svg>
                                <span className="absolute text-sm font-bold text-white">%{totalTasks ? Math.round((kanbanStats.inProgress / totalTasks) * 100) : 0}</span>
                            </div>
                            <div className="text-center">
                                <div className="p-1.5 bg-[rgba(0,174,239,0.12)] rounded mb-1 inline-block">
                                    <Zap size={14} className="text-cyan-300" />
                                </div>
                                <p className="text-xs text-slate-400">In Progress</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                                <svg className="transform -rotate-90 w-16 h-16">
                                    <circle cx="32" cy="32" r="28" stroke="#222" strokeWidth="4" fill="none" />
                                    <circle cx="32" cy="32" r="28" stroke="#ffd200" strokeWidth="4" fill="none" strokeDasharray={`${(kanbanStats.review / totalTasks) * 175 || 0} 175`} />
                                </svg>
                                <span className="absolute text-sm font-bold text-white">%{totalTasks ? Math.round((kanbanStats.review / totalTasks) * 100) : 0}</span>
                            </div>
                            <div className="text-center">
                                <div className="p-1.5 bg-[rgba(255,210,0,0.12)] rounded mb-1 inline-block">
                                    <Star size={14} className="text-[var(--color-accent)]" />
                                </div>
                                <p className="text-xs text-slate-400">Review</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                                <svg className="transform -rotate-90 w-16 h-16">
                                    <circle cx="32" cy="32" r="28" stroke="#222" strokeWidth="4" fill="none" />
                                    <circle cx="32" cy="32" r="28" stroke="#29c6cd" strokeWidth="4" fill="none" strokeDasharray={`${(completedCount / totalTasks) * 175 || 0} 175`} />
                                </svg>
                                <span className="absolute text-sm font-bold text-white">%{totalProgress}</span>
                            </div>
                            <div className="text-center">
                                <div className="p-1.5 bg-[rgba(0,174,239,0.12)] rounded mb-1 inline-block">
                                    <CheckCircle size={14} className="text-cyan-300" />
                                </div>
                                <p className="text-xs text-slate-400">Done</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Focus Timeline */}
            <div className="card-tech bg-[#13131a] rounded-xl border border-white/8 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[rgba(255,210,0,0.12)] rounded-lg">
                            <Target size={20} className="text-[var(--color-accent)]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Daily Focus Plan</h2>
                            <p className="text-xs text-slate-400">Your priority tasks for today</p>
                        </div>
                    </div>
                    <button
                        onClick={onNavigateDaily}
                        className="px-4 py-2 bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#ffd200] text-[#0b0b0b] rounded-lg text-sm font-bold hover:brightness-110 transition-all"
                    >
                        View All
                    </button>
                </div>

                <div className="space-y-3">
                    {(() => {
                        const planTasks = courses
                            .map(course => {
                                let next: any = null;
                                for (const unit of course.units) {
                                    for (const task of unit.tasks) {
                                        if (completedTasks.has(task.id)) continue;
                                        if (task.dueDate && new Date(task.dueDate) < new Date()) {
                                            return { ...task, course, unit: unit.title, isOverdue: true };
                                        }
                                        if (!next) {
                                            next = { ...task, course, unit: unit.title };
                                        }
                                    }
                                }
                                return next;
                            })
                            .filter(Boolean)
                            .slice(0, 5);

                        return planTasks.length > 0 ? (
                            planTasks.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-4 bg-[#181c24] rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all group"
                                >
                                    <div
                                        className="w-1 h-12 rounded-full"
                                        style={{ backgroundColor: item.course.customColor || '#00aeef' }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-400">{item.course.code}</span>
                                            <span className="text-slate-600">•</span>
                                            <span className="text-xs text-slate-500 truncate">{item.unit}</span>
                                            {item.isOverdue && (
                                                <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-white truncate">{item.text}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const event = new CustomEvent('toast', {
                                                detail: { message: 'Task marked as complete!', type: 'success' }
                                            });
                                            window.dispatchEvent(event);
                                        }}
                                        className="p-2 text-slate-500 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 bg-[#181c24] rounded-xl border border-dashed border-white/10">
                                <Trophy size={32} className="mx-auto text-[var(--color-accent)] mb-2" />
                                <p className="text-sm font-bold text-white">All tasks completed!</p>
                                <p className="text-xs text-slate-500">Great job, time to rest.</p>
                            </div>
                        );
                    })()}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Course Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map(course => {
                        const progress = getCourseProgress(course, completedTasks);
                        const next = getNextTask(course, completedTasks);
                        const isComplete = progress === 100;
                        const daysLeft = getDaysLeft(course);
                        const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

                        return (
                            <div
                                key={course.id}
                                onClick={() => onNavigateCourse(course.id)}
                                className={`card-tech bg-[#13131a] rounded-xl overflow-hidden border ${isUrgent ? 'border-red-500/50' : 'border-white/8'
                                    } hover:border-cyan-400/40 transition-all cursor-pointer group flex flex-col h-full relative`}
                            >
                                {daysLeft !== null && daysLeft >= 0 && (
                                    <div
                                        className={`absolute top-2 left-2 z-20 px-2 py-1 rounded text-xs font-bold shadow-sm ${isUrgent ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-300'
                                            }`}
                                    >
                                        {daysLeft === 0 ? 'EXAM TODAY' : `${daysLeft} days left`}
                                    </div>
                                )}

                                <div className={`h-20 ${course.bgGradient} relative p-3`}>
                                    <div className="absolute bottom-0 left-0 w-full h-full bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    <span className="absolute top-3 right-3 bg-black/30 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                        {course.code}
                                    </span>
                                    <h3 className="text-white font-bold text-base mt-6 drop-shadow-md line-clamp-1">{course.title}</h3>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-medium text-slate-400">Progress</span>
                                        <span className={`text-sm font-bold ${isComplete ? 'text-green-400' : 'text-white'}`}>
                                            %{progress}
                                        </span>
                                    </div>
                                    <ProgressBar
                                        percentage={progress}
                                        colorClass={isComplete ? 'bg-green-500' : course.color.split(' ')[0]}
                                    />

                                    {next ? (
                                        <div className="mt-4 p-3 bg-[#181c24] rounded-lg border border-white/10 mt-auto">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Next Task</p>
                                            <p className="text-xs text-slate-300 line-clamp-2">{next.task.text}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20 mt-auto flex items-center gap-2">
                                            <Trophy size={14} className="text-green-400" />
                                            <p className="text-xs font-bold text-green-400">Completed!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Daily Plan Section */}
            <div id="daily-plan-section" className="pt-8 border-t border-white/10">
                <DailyPlan />
            </div>
        </div>
    );
};
