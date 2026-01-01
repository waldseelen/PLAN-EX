import { Search } from 'lucide-react';

import { Checkmark } from '@/components/ui/Checkmark';
import { usePlannerContext } from '@/context/AppContext';

interface Props {
    query: string;
}

export const SearchResults = ({ query }: Props) => {
    const { courses, completedTasks, toggleTask } = usePlannerContext();
    const lowerQuery = query.toLowerCase();

    const results = courses.reduce(
        (acc, course) => {
            const matchingTasks: { taskId: string; text: string; unit: string; tags?: string[] }[] = [];
            course.units.forEach(unit => {
                unit.tasks.forEach(task => {
                    if (
                        task.text.toLowerCase().includes(lowerQuery) ||
                        task.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                        course.title.toLowerCase().includes(lowerQuery) ||
                        course.code.toLowerCase().includes(lowerQuery)
                    ) {
                        matchingTasks.push({ taskId: task.id, text: task.text, unit: unit.title, tags: task.tags });
                    }
                });
            });

            if (matchingTasks.length > 0) {
                acc.push({ course, matchingTasks });
            }
            return acc;
        },
        [] as { course: typeof courses[number]; matchingTasks: { taskId: string; text: string; unit: string; tags?: string[] }[] }[]
    );

    return (
        <div className="p-6 max-w-3xl mx-auto animate-fade-in pt-16 md:pt-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 rounded-full mb-4">
                    <Search size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Search Results</h1>
                <p className="text-slate-500 dark:text-slate-400">Tasks found for "{query}"</p>
            </div>

            <div className="space-y-8">
                {results.length > 0 ? (
                    results.map(({ course, matchingTasks }) => (
                        <div key={course.id} className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${course.color.split(' ')[0]}`}></div>
                                {course.title}
                            </h2>
                            <div className="space-y-2">
                                {matchingTasks.map(({ taskId, text, unit, tags }) => (
                                    <div
                                        key={taskId}
                                        onClick={() => toggleTask(taskId)}
                                        className="flex items-start gap-3 p-4 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700/50 cursor-pointer transition-all"
                                    >
                                        <div className="mt-0.5">
                                            <Checkmark checked={completedTasks.has(taskId)} />
                                        </div>
                                        <div>
                                            <p className={`text-sm ${completedTasks.has(taskId) ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {text}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-400">{unit}</span>
                                                {tags?.map(tag => (
                                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-12 bg-white dark:bg-dark-surface rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500">No matching tasks found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
