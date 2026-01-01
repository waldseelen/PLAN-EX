import { usePlannerContext } from '@/context/AppContext';
import {
    Award,
    BarChart3,
    CheckCircle2,
    Star,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import React from 'react';

// Circular Progress Component
const CircularProgress = ({
    percentage,
    color,
    size = 70,
    strokeWidth = 5
}: {
    percentage: number;
    color: string;
    size?: number;
    strokeWidth?: number;
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage / 100);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-white/10"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={color}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{percentage}%</span>
            </div>
        </div>
    );
};

const RightPanel = ({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void; }) => {
    const { courses, completedTasks } = usePlannerContext();
    const [selectedPeriod, setSelectedPeriod] = React.useState('Today');

    // Calculate statistics
    const stats = React.useMemo(() => {
        let totalTasks = 0;
        let completed = 0;
        let inProgress = 0;

        courses.forEach(course => {
            course.units.forEach(unit => {
                unit.tasks.forEach(task => {
                    totalTasks++;
                    if (completedTasks.has(task.id) || task.status === 'done') {
                        completed++;
                    } else if (task.status === 'in-progress') {
                        inProgress++;
                    }
                });
            });
        });

        return {
            total: totalTasks,
            completed,
            inProgress,
            completionRate: totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0
        };
    }, [courses, completedTasks]);

    if (collapsed) {
        return (
            <aside className="w-14 h-full hidden xl:flex flex-col items-center justify-between py-4 bg-[var(--color-surface)] border-l border-white/5">
                <button
                    onClick={onToggle}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-[rgba(255,255,255,0.04)] hover:border-cyan-300/50 hover:shadow-glow-sm text-slate-200"
                    title="Expand panel"
                >
                    ↗
                </button>
                <div className="text-[10px] text-slate-500 rotate-90">Insights</div>
            </aside>
        );
    }

    return (
        <aside className="w-[340px] h-full p-5 hidden xl:flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-[var(--color-surface)] border-l border-white/5">
            <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.22em] text-slate-400">Insights</h3>
                <button
                    onClick={onToggle}
                    className="px-2 py-1 text-[11px] rounded-lg border border-white/10 text-slate-300 hover:border-cyan-300/60 hover:text-white"
                >
                    Collapse
                </button>
            </div>

            {/* Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    icon={<Target size={16} />}
                    label="Total"
                    value={stats.total}
                    iconBg="bg-[rgba(0,174,239,0.14)]"
                    iconColor="text-cyan-300"
                />
                <StatCard
                    icon={<Zap size={16} />}
                    label="Active"
                    value={stats.inProgress}
                    iconBg="bg-[rgba(0,174,239,0.14)]"
                    iconColor="text-cyan-300"
                />
                <StatCard
                    icon={<CheckCircle2 size={16} />}
                    label="Done"
                    value={stats.completed}
                    iconBg="bg-[rgba(255,210,0,0.12)]"
                    iconColor="text-[var(--color-accent)]"
                />
                <StatCard
                    icon={<TrendingUp size={16} />}
                    label="Rate"
                    value={`${stats.completionRate}%`}
                    iconBg="bg-[rgba(0,174,239,0.12)]"
                    iconColor="text-cyan-300"
                />
            </div>

            {/* Completed Tasks Widget */}
            <div className="bg-[var(--color-surface-2)] rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Completed Tasks</h3>
                    <button className="text-xs text-cyan-300 hover:text-white">View All</button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-4">
                    {['Today', 'Week', 'Month', 'Year'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedPeriod === period
                                ? 'bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#ffd200] text-[#0b0b0b]'
                                : 'bg-[var(--color-surface-3)] hover:bg-[#262c38] text-slate-300'
                                }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <GradientStatCard
                        icon={<Award size={14} />}
                        label="Tasks Done"
                        value={stats.completed}
                        gradient="from-[rgba(0,174,239,0.18)] to-[rgba(41,198,205,0.18)]"
                        border="border-cyan-400/30"
                        iconColor="text-cyan-200"
                    />
                    <GradientStatCard
                        icon={<Target size={14} />}
                        label="Efficiency"
                        value={`${stats.completionRate}%`}
                        gradient="from-[rgba(0,174,239,0.18)] to-[rgba(255,210,0,0.18)]"
                        border="border-cyan-400/30"
                        iconColor="text-cyan-200"
                    />
                    <GradientStatCard
                        icon={<Zap size={14} />}
                        label="Streak"
                        value="7 Days"
                        gradient="from-[rgba(41,198,205,0.18)] to-[rgba(0,174,239,0.18)]"
                        border="border-cyan-400/30"
                        iconColor="text-cyan-200"
                    />
                    <GradientStatCard
                        icon={<Star size={14} />}
                        label="Points"
                        value="2,840"
                        gradient="from-[rgba(255,210,0,0.16)] to-[rgba(244,224,77,0.16)]"
                        border="border-[rgba(255,210,0,0.35)]"
                        iconColor="text-[var(--color-accent)]"
                    />
                </div>
            </div>

            {/* Application Progress */}
            <div className="bg-[var(--color-surface-2)] rounded-2xl p-4 border border-white/10">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Application</h3>

                <div className="grid grid-cols-2 gap-4">
                    <CircularProgressItem
                        percentage={75}
                        color="text-[var(--color-primary)]"
                        icon={<BarChart3 size={14} />}
                        iconBg="bg-[rgba(0,174,239,0.14)]"
                        iconColor="text-cyan-200"
                        label="Design"
                    />
                    <CircularProgressItem
                        percentage={60}
                        color="text-[var(--color-primary-2)]"
                        icon={<Target size={14} />}
                        iconBg="bg-[rgba(41,198,205,0.14)]"
                        iconColor="text-cyan-200"
                        label="Code"
                    />
                    <CircularProgressItem
                        percentage={45}
                        color="text-[var(--color-accent)]"
                        icon={<CheckCircle2 size={14} />}
                        iconBg="bg-[rgba(255,210,0,0.14)]"
                        iconColor="text-[var(--color-accent)]"
                        label="Testing"
                    />
                    <CircularProgressItem
                        percentage={85}
                        color="text-emerald-400"
                        icon={<Zap size={14} />}
                        iconBg="bg-emerald-500/20"
                        iconColor="text-emerald-400"
                        label="Deploy"
                    />
                </div>
            </div>
        </aside>
    );
};

// Helper Components
const StatCard = ({ icon, label, value, iconBg, iconColor }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    iconBg: string;
    iconColor: string;
}) => (
    <div className="bg-[#1a1625] rounded-xl p-3 border border-white/5">
        <div className="flex items-center justify-between mb-1">
            <div className={`p-1.5 rounded-lg ${iconBg}`}>
                <span className={iconColor}>{icon}</span>
            </div>
            <span className="text-[10px] text-slate-500">{label}</span>
        </div>
        <div className="text-xl font-bold text-white">{value}</div>
    </div>
);

const GradientStatCard = ({ icon, label, value, gradient, border, iconColor }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    gradient: string;
    border: string;
    iconColor: string;
}) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-3 border ${border}`}>
        <div className="flex items-center gap-1.5 mb-1">
            <span className={iconColor}>{icon}</span>
            <span className="text-[10px] text-slate-300">{label}</span>
        </div>
        <div className="text-lg font-bold text-white">{value}</div>
    </div>
);

const CircularProgressItem = ({ percentage, color, icon, iconBg, iconColor, label }: {
    percentage: number;
    color: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    label: string;
}) => (
    <div className="flex flex-col items-center">
        <CircularProgress percentage={percentage} color={color} />
        <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center mt-2`}>
            <span className={iconColor}>{icon}</span>
        </div>
        <span className="text-[10px] text-slate-400 mt-1">{label}</span>
    </div>
);

export default RightPanel;
