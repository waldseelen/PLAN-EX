/**
 * Statistics Component
 * Haftalık ve aylık görev tamamlama istatistiklerini gösterir.
 */

import { Award, Calendar, Flame, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { usePlannerContext } from '@/context/AppContext';
import { usePomodoroSettings } from '@/hooks/usePomodoroSettings';
import { CompletionHistory } from '@/types';

interface StatsData {
    todayCount: number;
    weekCount: number;
    monthCount: number;
    streak: number;
    bestStreak: number;
    averagePerDay: number;
    weeklyData: { date: string; count: number }[];
    monthlyData: { week: string; count: number }[];
}

const calculateStats = (history: CompletionHistory): StatsData => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const dateCounts: Record<string, number> = {};

    Object.values(history).forEach(dateStr => {
        const date = dateStr.split('T')[0];
        dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const todayCount = dateCounts[today] || 0;

    const weekData: { date: string; count: number }[] = [];
    let weekCount = 0;

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = dateCounts[dateStr] || 0;
        weekCount += count;
        weekData.push({
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            count
        });
    }

    let monthCount = 0;
    const monthlyData: { week: string; count: number }[] = [];

    for (let w = 3; w >= 0; w--) {
        let weekTotal = 0;
        for (let d = 0; d < 7; d++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (w * 7 + d));
            const dateStr = date.toISOString().split('T')[0];
            weekTotal += dateCounts[dateStr] || 0;
        }
        monthCount += weekTotal;
        monthlyData.push({
            week: `Week ${4 - w}`,
            count: weekTotal
        });
    }

    let streak = 0;
    let currentDate = new Date(now);

    while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (dateCounts[dateStr] && dateCounts[dateStr] > 0) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    const sortedDates = Object.keys(dateCounts).sort();
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    sortedDates.forEach(dateStr => {
        const current = new Date(dateStr);
        if (prevDate) {
            const diffDays = Math.round((current.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
        } else {
            tempStreak = 1;
        }
        bestStreak = Math.max(bestStreak, tempStreak);
        prevDate = current;
    });

    const averagePerDay = monthCount / 30;

    return {
        todayCount,
        weekCount,
        monthCount,
        streak,
        bestStreak,
        averagePerDay: Math.round(averagePerDay * 10) / 10,
        weeklyData: weekData,
        monthlyData
    };
};

export const Statistics = () => {
    const { completionHistory, completedTasks, courses } = usePlannerContext();

    const stats = useMemo(() => calculateStats(completionHistory), [completionHistory]);

    const totalTasks = useMemo(() => {
        return courses.reduce((acc, course) => {
            return acc + course.units.reduce((unitAcc, unit) => unitAcc + unit.tasks.length, 0);
        }, 0);
    }, [courses]);

    const completionRate = totalTasks > 0
        ? Math.round((completedTasks.size / totalTasks) * 100)
        : 0;

    const maxWeekCount = Math.max(...stats.weeklyData.map(d => d.count), 1);

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    📊 Statistics
                </h1>
                <p className="text-slate-400 text-sm">Your productivity performance and progress data</p>
            </header>

            {/* Ana Metrikler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#1a1625] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Zap size={18} className="text-green-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Today</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.todayCount}</p>
                    <p className="text-[10px] text-slate-500 mt-1">tasks completed</p>
                </div>

                <div className="bg-[#1a1625] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Calendar size={18} className="text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">This Week</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.weekCount}</p>
                    <p className="text-[10px] text-slate-500 mt-1">tasks completed</p>
                </div>

                <div className="bg-[#1a1625] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Flame size={18} className="text-orange-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.streak}</p>
                    <p className="text-[10px] text-slate-500 mt-1">consecutive days</p>
                </div>

                <div className="bg-[#1a1625] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Award size={18} className="text-purple-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Best Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.bestStreak}</p>
                    <p className="text-[10px] text-slate-500 mt-1">days</p>
                </div>
            </div>

            {/* Haftalık Grafik */}
            <div className="bg-[#1a1625] p-5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                        <TrendingUp size={18} className="text-purple-400" />
                        Weekly Activity
                    </h3>
                    <span className="text-xs text-slate-500">
                        Daily Avg: <span className="font-bold text-slate-300">{stats.averagePerDay}</span>
                    </span>
                </div>

                <div className="flex items-end justify-between gap-2 h-32">
                    {stats.weeklyData.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col items-center justify-end h-24">
                                <span className="text-[10px] font-bold text-slate-400 mb-1">
                                    {day.count > 0 ? day.count : ''}
                                </span>
                                <div
                                    className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-md transition-all duration-500"
                                    style={{
                                        height: `${Math.max((day.count / maxWeekCount) * 100, day.count > 0 ? 10 : 0)}%`,
                                        minHeight: day.count > 0 ? '6px' : '0'
                                    }}
                                />
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">{day.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Genel İlerleme */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-xl shadow-lg text-white">
                <h3 className="font-bold text-base mb-3">🎯 Overall Progress</h3>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-100 text-sm">Completed / Total</span>
                    <span className="font-bold">{completedTasks.size} / {totalTasks}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                    <div
                        className="bg-white rounded-full h-3 transition-all duration-1000"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
                <p className="text-right text-lg font-bold">%{completionRate}</p>
            </div>

            {/* Motivasyon Kartı */}
            {stats.streak >= 3 && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 rounded-xl shadow-lg text-white text-center">
                    <div className="text-3xl mb-2">🔥</div>
                    <h3 className="text-lg font-bold mb-1">You're Doing Great!</h3>
                    <p className="text-amber-100 text-sm">
                        You're maintaining a {stats.streak}-day streak. Keep it up!
                    </p>
                </div>
            )}

            {/* Pomodoro Timer - Right Aligned at Bottom */}
            <div className="flex justify-end mt-8">
                <div className="w-full max-w-md">
                    <div className="bg-[#1a1625] p-5 rounded-xl border border-white/10 shadow-lg">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-500/20 rounded">
                                <Zap size={16} className="text-indigo-400" />
                            </div>
                            Pomodoro Timer
                        </h3>
                        <PomodoroTimerWidget />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Pomodoro Timer Widget Component
const PomodoroTimerWidget = () => {
    const { settings } = usePomodoroSettings();
    const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [sessionCount, setSessionCount] = useState(0);

    useEffect(() => {
        if (!isActive) {
            switch (mode) {
                case 'work':
                    setTimeLeft(settings.workDuration * 60);
                    break;
                case 'shortBreak':
                    setTimeLeft(settings.shortBreakDuration * 60);
                    break;
                case 'longBreak':
                    setTimeLeft(settings.longBreakDuration * 60);
                    break;
            }
        }
    }, [settings, mode, isActive]);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (mode === 'work') {
                const newSessionCount = sessionCount + 1;
                setSessionCount(newSessionCount);
                if (newSessionCount >= settings.sessionsBeforeLongBreak) {
                    setMode('longBreak');
                    setTimeLeft(settings.longBreakDuration * 60);
                    setSessionCount(0);
                } else {
                    setMode('shortBreak');
                    setTimeLeft(settings.shortBreakDuration * 60);
                }
            } else {
                setMode('work');
                setTimeLeft(settings.workDuration * 60);
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, mode, sessionCount, settings]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getModeLabel = () => {
        switch (mode) {
            case 'work': return 'Focus';
            case 'shortBreak': return 'Short Break';
            case 'longBreak': return 'Long Break';
        }
    };

    const getModeColor = () => {
        switch (mode) {
            case 'work': return 'text-indigo-400';
            case 'shortBreak': return 'text-green-400';
            case 'longBreak': return 'text-blue-400';
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">{getModeLabel()}</p>
                <p className={`text-5xl font-mono font-bold ${isActive ? getModeColor() : 'text-white'}`}>
                    {formatTime(timeLeft)}
                </p>
            </div>

            {/* Session Dots */}
            <div className="flex justify-center gap-2">
                {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${i < sessionCount ? 'bg-indigo-500' : 'bg-slate-700'
                            }`}
                    />
                ))}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                <button
                    onClick={() => setIsActive(!isActive)}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${isActive
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                        }`}
                >
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={() => {
                        setIsActive(false);
                        setMode('work');
                        setTimeLeft(settings.workDuration * 60);
                        setSessionCount(0);
                    }}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};
