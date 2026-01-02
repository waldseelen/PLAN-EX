import { usePlannerStats, usePlannerStore } from '@/modules/planner/store'
import {
    Award,
    CheckCircle2,
    Star,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react'
import { useMemo, useState } from 'react'

// Circular Progress Component
const CircularProgress = ({
    percentage,
    color,
    size = 60,
    strokeWidth = 4,
}: {
    percentage: number
    color: string
    size?: number
    strokeWidth?: number
}) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - percentage / 100)

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
    )
}

interface RightPanelProps {
    collapsed?: boolean
    onToggle?: () => void
}

export function RightPanel({ collapsed, onToggle }: RightPanelProps) {
    const [selectedPeriod, setSelectedPeriod] = useState('Today')
    const { totalTasks, completedTasks, completionPercentage } = usePlannerStats()
    const courses = usePlannerStore(state => state.courses)
    const completionState = usePlannerStore(state => state.completionState)

    // Calculate statistics
    const stats = useMemo(() => {
        let inProgress = 0
        let todo = 0
        let review = 0

        courses.forEach(course => {
            course.units.forEach(unit => {
                unit.tasks.forEach(task => {
                    const isCompleted = completionState.completedTaskIds.includes(task.id)
                    if (!isCompleted) {
                        const status = task.status || 'todo'
                        if (status === 'todo') todo++
                        else if (status === 'in-progress') inProgress++
                        else if (status === 'review') review++
                    }
                })
            })
        })

        return {
            total: totalTasks,
            completed: completedTasks,
            inProgress,
            todo,
            review,
            completionRate: completionPercentage,
        }
    }, [courses, completionState, totalTasks, completedTasks, completionPercentage])

    if (collapsed) {
        return (
            <aside className="w-14 h-full hidden lg:flex flex-col items-center justify-between py-4 bg-[var(--color-surface)] border-l border-white/5">
                <button
                    onClick={onToggle}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-[rgba(255,255,255,0.04)] hover:border-cyan-300/50 hover:shadow-glow-sm text-slate-200"
                    title="Expand panel"
                >
                    ↗
                </button>
                <div className="text-[10px] text-slate-400 rotate-90">Insights</div>
            </aside>
        )
    }

    return (
        <aside className="w-[340px] h-full p-5 hidden lg:flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-[var(--color-surface)] border-l border-white/5">
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
                    iconBg="bg-[rgba(0,174,239,0.12)]"
                    iconColor="text-cyan-300"
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
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                        Tamamlanan Görevler
                    </h3>
                    <button className="text-xs text-cyan-200 hover:text-white hover:underline underline-offset-4">Tümünü Gör</button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-4">
                    {['Today', 'Week', 'Month', 'Year'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedPeriod === period
                                ? 'bg-gradient-to-r from-[#00aeef] via-[#29c6cd] to-[#00d9ff] text-[#0b0b0b]'
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
                        label="Görev Bitti"
                        value={stats.completed}
                        gradient="from-[rgba(0,174,239,0.18)] to-[rgba(41,198,205,0.18)]"
                        border="border-cyan-400/30"
                        iconColor="text-cyan-200"
                    />
                    <GradientStatCard
                        icon={<Target size={14} />}
                        label="Verimlilik"
                        value={`${stats.completionRate}%`}
                        gradient="from-[rgba(0,174,239,0.18)] to-[rgba(41,198,205,0.18)]"
                        border="border-cyan-400/30"
                        iconColor="text-cyan-200"
                    />
                    <GradientStatCard
                        icon={<Zap size={14} />}
                        label="Seri"
                        value="7 Gün"
                        gradient="from-[rgba(41,198,205,0.18)] to-[rgba(0,174,239,0.18)]"
                        border="border-cyan-400/30"
                        iconColor="text-cyan-200"
                    />
                    <GradientStatCard
                        icon={<Star size={14} />}
                        label="Puan"
                        value={(stats.completed * 35).toLocaleString()}
                        gradient="from-[rgba(0,174,239,0.16)] to-[rgba(41,198,205,0.16)]"
                        border="border-cyan-400/30"
                        iconColor="text-cyan-200"
                    />
                </div>
            </div>

            {/* Application Progress */}
            <div className="bg-[var(--color-surface-2)] rounded-2xl p-4 border border-white/10">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">
                    Uygulama
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <CircularProgressItem
                        percentage={stats.todo > 0 ? Math.round((stats.todo / stats.total) * 100) : 0}
                        color="text-[var(--color-primary)]"
                        icon={<Target size={14} />}
                        iconBg="bg-[rgba(0,174,239,0.14)]"
                        iconColor="text-cyan-200"
                        label="Todo"
                    />
                    <CircularProgressItem
                        percentage={stats.inProgress > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}
                        color="text-[var(--color-primary-2)]"
                        icon={<Zap size={14} />}
                        iconBg="bg-[rgba(41,198,205,0.14)]"
                        iconColor="text-cyan-200"
                        label="Devam"
                    />
                    <CircularProgressItem
                        percentage={stats.review > 0 ? Math.round((stats.review / stats.total) * 100) : 0}
                        color="text-cyan-300"
                        icon={<Star size={14} />}
                        iconBg="bg-[rgba(0,174,239,0.14)]"
                        iconColor="text-cyan-200"
                        label="Review"
                    />
                    <CircularProgressItem
                        percentage={stats.completionRate}
                        color="text-emerald-400"
                        icon={<CheckCircle2 size={14} />}
                        iconBg="bg-emerald-500/20"
                        iconColor="text-emerald-400"
                        label="Bitti"
                    />
                </div>
            </div>
        </aside>
    )
}

// Helper Components
const StatCard = ({
    icon,
    label,
    value,
    iconBg,
    iconColor,
}: {
    icon: React.ReactNode
    label: string
    value: number | string
    iconBg: string
    iconColor: string
}) => (
    <div className="bg-[#1a1625] rounded-xl p-3 border border-white/5">
        <div className="flex items-center justify-between mb-1">
            <div className={`p-1.5 rounded-lg ${iconBg}`}>
                <span className={iconColor}>{icon}</span>
            </div>
            <span className="text-[10px] text-slate-400">{label}</span>
        </div>
        <div className="text-xl font-bold text-white">{value}</div>
    </div>
)

const GradientStatCard = ({
    icon,
    label,
    value,
    gradient,
    border,
    iconColor,
}: {
    icon: React.ReactNode
    label: string
    value: number | string
    gradient: string
    border: string
    iconColor: string
}) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-3 border ${border}`}>
        <div className="flex items-center gap-1.5 mb-1">
            <span className={iconColor}>{icon}</span>
            <span className="text-[10px] text-slate-300">{label}</span>
        </div>
        <div className="text-lg font-bold text-white">{value}</div>
    </div>
)

const CircularProgressItem = ({
    percentage,
    color,
    icon,
    iconBg,
    iconColor,
    label,
}: {
    percentage: number
    color: string
    icon: React.ReactNode
    iconBg: string
    iconColor: string
    label: string
}) => (
    <div className="flex flex-col items-center">
        <CircularProgress percentage={percentage} color={color} />
        <div className={`w-6 h-6 ${iconBg} rounded-lg flex items-center justify-center mt-2`}>
            <span className={iconColor}>{icon}</span>
        </div>
        <span className="text-[10px] text-slate-300 mt-1">{label}</span>
    </div>
)
