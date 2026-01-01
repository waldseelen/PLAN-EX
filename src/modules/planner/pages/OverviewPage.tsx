import { motion } from 'framer-motion'
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    Calendar,
    CheckCircle,
    ListTodo,
    Settings,
    Target,
    Timer
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { GlobalSearchBoxes } from '../components/features/GlobalSearchBoxes'
import { QuickNotes } from '../components/features/QuickNotes'
import { Button } from '../components/ui/Button'
import { Badge, Card, CardHeader, ProgressBar, ProgressRing } from '../components/ui/Card'
import { calculateCourseProgress, cn, getUpcomingEvents } from '../lib/utils'
import { usePlannerHabits, usePlannerStore } from '../store'

// Quick navigation items
const quickNavItems = [
    { to: '/planner/courses', icon: BookOpen, label: 'Dersler', color: 'bg-blue-500', description: 'Ders ve görevlerini yönet' },
    { to: '/calendar', icon: Calendar, label: 'Takvim', color: 'bg-purple-500', description: 'Sınavlar ve etkinlikler' },
    { to: '/planner/tasks', icon: ListTodo, label: 'Görevler', color: 'bg-green-500', description: 'Kişisel görevlerin' },
    { to: '/habits', icon: Target, label: 'Alışkanlıklar', color: 'bg-orange-500', description: 'Günlük rutinlerin' },
    { to: '/planner/productivity', icon: Timer, label: 'Pomodoro', color: 'bg-red-500', description: 'Odaklan ve çalış' },
    { to: '/planner/statistics', icon: BarChart3, label: 'İstatistikler', color: 'bg-indigo-500', description: 'İlerleme raporu' },
]

export function OverviewPage() {
    const courses = usePlannerStore(state => state.courses)
    const events = usePlannerStore(state => state.events)
    const completionState = usePlannerStore(state => state.completionState)
    const { getTodayHabits } = usePlannerHabits()

    const todayHabits = getTodayHabits()

    // Calculate stats
    const stats = useMemo(() => {
        let totalTasks = 0
        let completedTasks = 0

        courses.forEach(course => {
            course.units.forEach(unit => {
                totalTasks += unit.tasks.length
                completedTasks += unit.tasks.filter(t =>
                    completionState.completedTaskIds.includes(t.id)
                ).length
            })
        })

        const habitsCompleted = todayHabits.filter(h => h.isCompletedToday).length

        return {
            totalCourses: courses.length,
            totalTasks,
            completedTasks,
            completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            todayHabits: todayHabits.length,
            habitsCompleted,
        }
    }, [courses, completionState, todayHabits])

    const upcomingExams = useMemo(
        () => getUpcomingEvents(courses, events, 14),
        [courses, events]
    )

    const courseProgress = useMemo(
        () =>
            courses.map(course => ({
                ...calculateCourseProgress(course, completionState.completedTaskIds),
                course,
            })),
        [courses, completionState.completedTaskIds]
    )

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with greeting */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Merhaba! 👋</h1>
                    <p className="text-secondary mt-1">Bugün ne yapmak istiyorsun?</p>
                </div>
                <Link to="/settings">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Ayarlar</span>
                    </Button>
                </Link>
            </div>

            {/* Quick Navigation Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickNavItems.map((item, index) => (
                    <motion.div
                        key={item.to}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link to={item.to}>
                            <Card className="p-4 hover:scale-[1.02] transition-all duration-200 hover:shadow-lg group cursor-pointer h-full">
                                <div className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110',
                                    item.color
                                )}>
                                    <item.icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="font-medium text-primary text-sm">{item.label}</p>
                                <p className="text-xs text-tertiary mt-0.5 hidden md:block">{item.description}</p>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Global Search Boxes */}
            <GlobalSearchBoxes />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="text-center">
                        <div className="p-3 rounded-full bg-blue-500/10 w-fit mx-auto mb-3">
                            <BookOpen className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-primary">{stats.totalCourses}</p>
                        <p className="text-sm text-secondary">Ders</p>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="text-center">
                        <div className="p-3 rounded-full bg-green-500/10 w-fit mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-primary">
                            {stats.completedTasks}/{stats.totalTasks}
                        </p>
                        <p className="text-sm text-secondary">Görev Tamamlandı</p>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="text-center">
                        <div className="p-3 rounded-full bg-purple-500/10 w-fit mx-auto mb-3">
                            <Target className="w-6 h-6 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold text-primary">
                            {stats.habitsCompleted}/{stats.todayHabits}
                        </p>
                        <p className="text-sm text-secondary">Bugünkü Alışkanlık</p>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="text-center">
                        <div className="p-3 rounded-full bg-orange-500/10 w-fit mx-auto mb-3">
                            <Calendar className="w-6 h-6 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold text-primary">{upcomingExams.length}</p>
                        <p className="text-sm text-secondary">Yaklaşan Sınav</p>
                    </Card>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 auto-rows-min">
                {/* Course Progress */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card>
                        <CardHeader
                            title="Ders İlerlemesi"
                            action={
                                <Link to="/planner/courses">
                                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                        Tümü
                                    </Button>
                                </Link>
                            }
                        />

                        {courseProgress.length === 0 ? (
                            <div className="text-center py-8">
                                <BookOpen className="w-12 h-12 text-tertiary mx-auto mb-3" />
                                <p className="text-secondary">Henüz ders eklenmemiş</p>
                                <Link to="/planner/courses">
                                    <Button variant="primary" size="sm" className="mt-3">
                                        Ders Ekle
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {courseProgress.slice(0, 4).map(({ course, percentage }) => (
                                    <Link key={course.id} to={`/planner/courses/${course.id}`}>
                                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: course.color }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-primary truncate">{course.title}</p>
                                                <ProgressBar value={percentage} size="sm" className="mt-1" />
                                            </div>
                                            <span className="text-sm text-secondary">{percentage}%</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Upcoming Exams */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Card>
                        <CardHeader
                            title="Yaklaşan Sınavlar"
                            action={
                                <Link to="/calendar">
                                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                        Takvim
                                    </Button>
                                </Link>
                            }
                        />

                        {upcomingExams.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-tertiary mx-auto mb-3" />
                                <p className="text-secondary">Yaklaşan sınav yok</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingExams.slice(0, 4).map(({ event, course, daysLeft }) => (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            'flex items-center gap-4 p-3 rounded-lg transition-all',
                                            daysLeft <= 3 ? 'bg-red-500/10 animate-pulse-slow' : daysLeft <= 7 ? 'bg-orange-500/10' : 'bg-secondary',
                                            daysLeft <= 1 && 'ring-2 ring-red-500/50 shadow-lg shadow-red-500/20'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'w-3 h-3 rounded-full flex-shrink-0',
                                                daysLeft <= 3 && 'animate-ping-slow'
                                            )}
                                            style={{ backgroundColor: course.color }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                'font-medium text-primary truncate',
                                                daysLeft <= 1 && 'text-red-400 font-bold'
                                            )}>
                                                {event.title}
                                            </p>
                                            <p className="text-sm text-secondary">{course.title}</p>
                                        </div>
                                        <Badge
                                            color={daysLeft <= 3 ? '#ef4444' : daysLeft <= 7 ? '#f97316' : '#6366f1'}
                                        >
                                            {daysLeft === 0 ? '🔥 BUGÜN' : daysLeft === 1 ? '⚠️ YARIN' : `${daysLeft} gün`}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Today's Habits */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <Card>
                        <CardHeader
                            title="Bugünkü Alışkanlıklar"
                            action={
                                <Link to="/habits">
                                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                        Tümü
                                    </Button>
                                </Link>
                            }
                        />

                        {todayHabits.length === 0 ? (
                            <div className="text-center py-8">
                                <Target className="w-12 h-12 text-tertiary mx-auto mb-3" />
                                <p className="text-secondary">Bugün için alışkanlık yok</p>
                                <Link to="/habits">
                                    <Button variant="primary" size="sm" className="mt-3">
                                        Alışkanlık Ekle
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todayHabits.slice(0, 4).map(({ habit, isCompletedToday, score }) => (
                                    <Link key={habit.id} to={`/habits/${habit.id}`}>
                                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                                            <div
                                                className={cn(
                                                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                                    isCompletedToday ? 'bg-green-500' : 'border-2'
                                                )}
                                                style={{ borderColor: !isCompletedToday ? habit.color : undefined }}
                                            >
                                                {isCompletedToday && <CheckCircle className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-primary truncate">{habit.title}</p>
                                                <p className="text-sm text-secondary">Skor: {score}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                    <Card>
                        <CardHeader title="Genel İlerleme" />

                        <div className="flex items-center justify-center py-4">
                            <ProgressRing value={stats.completionPercentage} size={120} strokeWidth={10}>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">{stats.completionPercentage}%</p>
                                    <p className="text-xs text-secondary">Tamamlandı</p>
                                </div>
                            </ProgressRing>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="text-center p-3 bg-secondary rounded-lg">
                                <p className="text-lg font-semibold text-primary">{stats.completedTasks}</p>
                                <p className="text-xs text-secondary">Tamamlanan Görev</p>
                            </div>
                            <div className="text-center p-3 bg-secondary rounded-lg">
                                <p className="text-lg font-semibold text-primary">{stats.totalTasks - stats.completedTasks}</p>
                                <p className="text-xs text-secondary">Kalan Görev</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Quick Notes */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                    <QuickNotes />
                </motion.div>
            </div>
        </div>
    );
}
