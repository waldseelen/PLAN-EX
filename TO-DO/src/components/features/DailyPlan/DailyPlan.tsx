import { AlertCircle, Calendar, Sun, Trophy } from 'lucide-react';

import { Checkmark } from '@/components/ui/Checkmark';
import { usePlannerContext } from '@/context/AppContext';

export const DailyPlan = () => {
    const { courses, completedTasks, toggleTask } = usePlannerContext();

    const planTasks = courses
        .map(course => {
            let next: (typeof courses)[number]['units'][number]['tasks'][number] & {
                course: (typeof courses)[number];
                unit: string;
                isOverdue?: boolean;
            } | null = null;

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
        .filter(Boolean) as Array<{ id: string; text: string; course: (typeof courses)[number]; unit: string; dueDate?: string; isOverdue?: boolean }>;

    return (
        <div className="p-6 max-w-3xl mx-auto animate-fade-in pt-16 md:pt-6">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/40 text-amber-500 rounded-full mb-4">
                    <Sun size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Daily Focus Plan</h1>
                <p className="text-slate-500 dark:text-slate-400">Your priority and upcoming tasks compiled.</p>
            </div>

            <div className="space-y-4">
                {planTasks.length > 0 ? (
                    planTasks.map(item => (
                        <div
                            key={item.id}
                            className={`group flex items-start gap-4 p-5 bg-white dark:bg-dark-surface rounded-xl shadow-sm border ${item.isOverdue ? 'border-red-300 dark:border-red-800' : 'border-slate-100 dark:border-slate-700'
                                } transition-all hover:shadow-md`}
                        >
                            <div className={`w-1.5 self-stretch rounded-full ${item.course.color.split(' ')[0]}`}></div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        {item.course.title}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span className="text-xs text-slate-400 truncate">{item.unit}</span>
                                    {item.isOverdue && (
                                        <span className="text-xs font-bold text-red-500 flex items-center gap-1 bg-red-100 px-2 py-0.5 rounded-full dark:bg-red-900/30">
                                            <AlertCircle size={10} /> Overdue
                                        </span>
                                    )}
                                </div>
                                <p className={`text-lg ${completedTasks.has(item.id) ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {item.text}
                                </p>
                                {item.dueDate && (
                                    <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(item.dueDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => toggleTask(item.id)} className="mt-1 p-1 rounded-full transition-colors">
                                <Checkmark checked={completedTasks.has(item.id)} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-10 bg-white dark:bg-dark-surface rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Trophy size={48} className="mx-auto text-yellow-400 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">All tasks completed!</h3>
                        <p className="text-slate-500">Great job, now it's time to rest.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
