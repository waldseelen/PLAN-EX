import { GlobalErrorBoundary, PageErrorBoundary, PrivacyProvider, ToastProvider } from '@/shared/components'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { ThemeProvider } from './providers/ThemeProvider'

// Lazy load pages - Plan.Ex modules
const LazyDashboard = lazy(() => import('@/modules/planner/pages/OverviewPage').then(m => ({ default: m.OverviewPage })))
const LazyCalendar = lazy(() => import('@/modules/planner/pages/CalendarPage').then(m => ({ default: m.CalendarPage })))
const LazyStatistics = lazy(() => import('@/modules/planner/pages/StatisticsPage').then(m => ({ default: m.StatisticsPage })))
const LazyHabits = lazy(() => import('@/modules/planner/pages/HabitsDashboardPage').then(m => ({ default: m.HabitsDashboardPage })))
const LazyHabitDetail = lazy(() => import('@/modules/planner/pages/HabitDetailPage').then(m => ({ default: m.HabitDetailPage })))
const LazySettings = lazy(() => import('@/modules/settings/pages/Settings').then(m => ({ default: m.Settings })))
const LazyCourses = lazy(() => import('@/modules/planner/pages/CoursesPage').then(m => ({ default: m.CoursesPage })))
const LazyCourseDetail = lazy(() => import('@/modules/planner/pages/CourseDetailPage').then(m => ({ default: m.CourseDetailPage })))
const LazyTasks = lazy(() => import('@/modules/planner/pages/PersonalTasksPage').then(m => ({ default: m.PersonalTasksPage })))
const LazyProductivity = lazy(() => import('@/modules/planner/pages/ProductivityPage').then(m => ({ default: m.ProductivityPage })))

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="space-y-3 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent mx-auto"></div>
                <p className="text-sm text-surface-500">Yükleniyor...</p>
            </div>
        </div>
    )
}

export function App() {
    return (
        <GlobalErrorBoundary>
            <ThemeProvider>
                <PrivacyProvider>
                    <ToastProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<AppLayout />}>
                                    <Route index element={<Navigate to="/planner" replace />} />

                                    <Route path="planner">
                                        <Route index element={
                                            <PageErrorBoundary pageName="Ana Sayfa">
                                                <Suspense fallback={<LoadingFallback />}>
                                                    <LazyDashboard />
                                                </Suspense>
                                            </PageErrorBoundary>
                                        } />
                                        <Route path="courses" element={
                                            <PageErrorBoundary pageName="Dersler">
                                                <Suspense fallback={<LoadingFallback />}>
                                                    <LazyCourses />
                                                </Suspense>
                                            </PageErrorBoundary>
                                        } />
                                        <Route path="courses/:courseId" element={
                                            <PageErrorBoundary pageName="Ders Detay">
                                                <Suspense fallback={<LoadingFallback />}>
                                                    <LazyCourseDetail />
                                                </Suspense>
                                            </PageErrorBoundary>
                                        } />
                                        <Route path="tasks" element={
                                            <PageErrorBoundary pageName="Görevler">
                                                <Suspense fallback={<LoadingFallback />}>
                                                    <LazyTasks />
                                                </Suspense>
                                            </PageErrorBoundary>
                                        } />
                                        <Route path="productivity" element={
                                            <PageErrorBoundary pageName="Pomodoro">
                                                <Suspense fallback={<LoadingFallback />}>
                                                    <LazyProductivity />
                                                </Suspense>
                                            </PageErrorBoundary>
                                        } />
                                        <Route path="statistics" element={
                                            <PageErrorBoundary pageName="İstatistikler">
                                                <Suspense fallback={<LoadingFallback />}>
                                                    <LazyStatistics />
                                                </Suspense>
                                            </PageErrorBoundary>
                                        } />
                                    </Route>
                                    <Route path="calendar" element={
                                        <PageErrorBoundary pageName="Takvim">
                                            <Suspense fallback={<LoadingFallback />}>
                                                <LazyCalendar />
                                            </Suspense>
                                        </PageErrorBoundary>
                                    } />
                                    <Route path="tasks" element={<Navigate to="/planner/tasks" replace />} />
                                    <Route path="habits" element={
                                        <PageErrorBoundary pageName="Alışkanlıklar">
                                            <Suspense fallback={<LoadingFallback />}>
                                                <LazyHabits />
                                            </Suspense>
                                        </PageErrorBoundary>
                                    } />
                                    <Route path="habits/:habitId" element={
                                        <PageErrorBoundary pageName="Alışkanlık Detay">
                                            <Suspense fallback={<LoadingFallback />}>
                                                <LazyHabitDetail />
                                            </Suspense>
                                        </PageErrorBoundary>
                                    } />
                                    <Route path="productivity" element={<Navigate to="/planner/productivity" replace />} />
                                    <Route path="statistics" element={<Navigate to="/planner/statistics" replace />} />
                                    <Route path="settings" element={
                                        <PageErrorBoundary pageName="Ayarlar">
                                            <Suspense fallback={<LoadingFallback />}>
                                                <LazySettings />
                                            </Suspense>
                                        </PageErrorBoundary>
                                    } />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </ToastProvider>
                </PrivacyProvider>
            </ThemeProvider>
        </GlobalErrorBoundary>
    )
}
