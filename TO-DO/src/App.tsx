import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import { Calendar } from '@/components/features/Calendar/Calendar';
import { CourseDetail } from '@/components/features/CourseDetail/CourseDetail';
import { CoursesPage } from '@/components/features/Courses/CoursesPage';
import { DailyPlan } from '@/components/features/DailyPlan/DailyPlan';
import { Overview } from '@/components/features/Overview/Overview';
import { PersonalTasks } from '@/components/features/PersonalTasks/PersonalTasks';
import { QuickAddTask } from '@/components/features/QuickAdd/QuickAddTask';
import { SearchResults } from '@/components/features/Search/SearchResults';
import { SettingsModal } from '@/components/features/Settings/SettingsModal';
import { Statistics } from '@/components/features/Statistics/Statistics';
import { TaskDetailModal } from '@/components/features/Task/TaskDetailModal';
import AppLayout from '@/components/layout/AppLayout';
import { Confetti } from '@/components/ui/Confetti';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { PlannerProvider, usePlannerContext } from '@/context/AppContext';
import { useBackupReminder } from '@/hooks/useBackupReminder';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';
import { Task } from '@/types';
import { generateDailyMarkdown } from '@/utils/markdown';

const AppContent = () => {
    const {
        courses,
        completedTasks,
        completionHistory,
        createNewCourse,
        setCourses,
        hydrateTasks,
        undo,
        showConfetti,
        updateTaskStatus
    } = usePlannerContext();

    // Theme management (now stored in localStorage)
    const { isDark, toggleDarkMode, mode: themeMode } = useTheme();

    // Backup reminder
    const {
        shouldRemind: showBackupReminder,
        recordBackup,
    } = useBackupReminder();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeView, setActiveView] = useState<'overview' | 'tasks' | 'statistics' | 'calendar' | string>('tasks');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    // Calculate total progress
    const totalProgress = useMemo(() => {
        let total = 0;
        let done = 0;
        courses.forEach(course => {
            course.units.forEach(unit => {
                unit.tasks.forEach(task => {
                    total += 1;
                    if (completedTasks.has(task.id)) {
                        done += 1;
                    }
                });
            });
        });
        return total === 0 ? 0 : Math.round((done / total) * 100);
    }, [courses, completedTasks]);

    // Navigation handlers
    const handleNavigate = useCallback((view: string) => {
        setActiveView(view);
        setSearchQuery('');
        setMobileMenuOpen(false);
    }, []);

    const handleCreateCourse = useCallback(() => {
        const nextCourse = createNewCourse();
        handleNavigate(nextCourse.id);
    }, [createNewCourse, handleNavigate]);

    const handleOpenTaskDetails = useCallback((task: Task) => {
        setSelectedTask(task);
        setDetailsModalOpen(true);
    }, []);

    const handleTaskUpdate = useCallback((updatedTask: Task) => {
        setCourses(prevCourses =>
            prevCourses.map(course => ({
                ...course,
                units: course.units.map(unit => ({
                    ...unit,
                    tasks: unit.tasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
                }))
            }))
        );
    }, [setCourses]);

    // Export/Import handlers
    const handleExportData = useCallback(() => {
        try {
            const payload = {
                courses,
                completedTasks: Array.from(completedTasks),
                completionHistory,
                exportDate: new Date().toISOString(),
                version: '2.0'
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
            anchor.click();
            URL.revokeObjectURL(url);

            // Record backup date
            recordBackup();

            const event = new CustomEvent('toast', {
                detail: { message: 'Backup completed!', type: 'success' }
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('Export error:', error);
            const event = new CustomEvent('toast', {
                detail: { message: 'Backup failed', type: 'error' }
            });
            window.dispatchEvent(event);
        }
    }, [courses, completedTasks, completionHistory, recordBackup]);

    const handleExportToday = useCallback(async () => {
        try {
            const markdown = generateDailyMarkdown(courses, completedTasks, completionHistory);
            await navigator.clipboard.writeText(markdown);

            const event = new CustomEvent('toast', {
                detail: { message: 'Daily log copied successfully!', type: 'success' }
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('Export today error:', error);
            const event = new CustomEvent('toast', {
                detail: { message: 'Copy failed', type: 'error' }
            });
            window.dispatchEvent(event);
        }
    }, [courses, completedTasks, completionHistory]);

    const handleImportData = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target?.result as string);

                if (!data.courses || !Array.isArray(data.courses)) {
                    throw new Error('Invalid data format');
                }

                setCourses(data.courses);

                if (data.completedTasks || data.completionHistory) {
                    hydrateTasks(data.completedTasks ?? [], data.completionHistory ?? {});
                }

                const toastEvent = new CustomEvent('toast', {
                    detail: { message: 'Data imported successfully!', type: 'success' }
                });
                window.dispatchEvent(toastEvent);
                setIsSettingsOpen(false);
            } catch (error) {
                console.error('Import error:', error);
                const toastEvent = new CustomEvent('toast', {
                    detail: { message: 'Invalid file format!', type: 'error' }
                });
                window.dispatchEvent(toastEvent);
            }
        };

        reader.readAsText(file);
    }, [setCourses, hydrateTasks]);

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 's',
            ctrl: true,
            description: 'Backup',
            callback: handleExportData
        },
        {
            key: 'z',
            ctrl: true,
            description: 'Undo',
            callback: undo
        },
        {
            key: 'k',
            ctrl: true,
            description: 'Search',
            callback: () => document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus()
        },
        {
            key: ',',
            ctrl: true,
            description: 'Settings',
            callback: () => setIsSettingsOpen(true)
        },
        {
            key: 'd',
            ctrl: true,
            shift: true,
            description: 'Toggle Theme',
            callback: toggleDarkMode
        },
        {
            key: 'n',
            ctrl: true,
            description: 'New Task',
            callback: () => setIsQuickAddOpen(true)
        },
        {
            key: 'Escape',
            description: 'Close',
            callback: () => {
                if (isQuickAddOpen) {
                    setIsQuickAddOpen(false);
                } else if (detailsModalOpen) {
                    setDetailsModalOpen(false);
                    setSelectedTask(null);
                } else if (isSettingsOpen) {
                    setIsSettingsOpen(false);
                } else if (mobileMenuOpen) {
                    setMobileMenuOpen(false);
                }
            },
            allowInInput: true
        }
    ]);

    const currentCourse = courses.find(course => course.id === activeView);

    const renderContent = () => {
        const content = (() => {
            if (searchQuery) {
                return <SearchResults query={searchQuery} />;
            }

            if (activeView === 'overview') {
                return (
                    <Overview
                        onNavigateCourse={courseId => handleNavigate(courseId)}
                        onNavigateDaily={() => handleNavigate('daily')}
                    />
                );
            }

            if (activeView === 'courses') {
                return (
                    <CoursesPage
                        onNavigateCourse={courseId => handleNavigate(courseId)}
                        onCreateCourse={handleCreateCourse}
                    />
                );
            }

            if (activeView === 'tasks') {
                return (
                    <PersonalTasks
                        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                    />
                );
            }

            if (activeView === 'daily') {
                return <DailyPlan />;
            }

            if (activeView === 'statistics') {
                return <Statistics />;
            }

            if (activeView === 'calendar') {
                return <Calendar onSelectCourse={handleNavigate} />;
            }

            if (currentCourse) {
                return <CourseDetail courseId={currentCourse.id} onOpenTaskDetails={handleOpenTaskDetails} />;
            }

            return <Overview onNavigateCourse={courseId => handleNavigate(courseId)} onNavigateDaily={() => handleNavigate('daily')} />;
        })();

        return (
            <div className="animate-fade-in">
                {content}
            </div>
        );
    };

    return (
        <div className="h-screen bg-[#0f0f0f] text-white font-inter bg-circuit">
            <Confetti active={showConfetti} />

            <TaskDetailModal
                isOpen={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setSelectedTask(null);
                }}
                task={selectedTask}
                onUpdate={handleTaskUpdate}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onExport={handleExportData}
                onImport={handleImportData}
                onExportToday={handleExportToday}
            />

            {/* Quick Task Add */}
            <QuickAddTask
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
            />

            <ToastContainer />

            <AppLayout
                activeView={activeView}
                onNavigate={handleNavigate}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewTask={() => setIsQuickAddOpen(true)}
                onSettingsClick={() => setIsSettingsOpen(true)}
                onCalendarClick={() => handleNavigate('calendar')}
                showBackupReminder={showBackupReminder}
                isDarkMode={isDark}
                onToggleTheme={toggleDarkMode}
            >
                {renderContent()}
            </AppLayout>
        </div>
    );
};

const App = () => (
    <PlannerProvider>
        <AppContent />
    </PlannerProvider>
);

export default App;
