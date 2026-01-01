import { CompletionHistory, Course } from '@/types';

export const generateMarkdown = (course: Course, completedTasks: Set<string>) => {
    let md = `# ${course.title} (${course.code})\n\n`;

    course.units.forEach(unit => {
        md += `## ${unit.title}\n`;
        unit.tasks.forEach(task => {
            const isDone = completedTasks.has(task.id);
            md += `- [${isDone ? 'x' : ' '}] ${task.text}\n`;
            if (task.notes) {
                md += `  > ${task.notes.replace(/\n/g, '\n  > ')}\n`;
            }
        });
        md += '\n';
    });

    return md;
};

export const generateDailyMarkdown = (
    courses: Course[],
    completedTasks: Set<string>,
    history: CompletionHistory
) => {
    const today = new Date().toISOString().split('T')[0];
    let md = `# Daily Log: ${today}\n\n`;

    courses.forEach(course => {
        const completedToday = course.units
            .flatMap(unit => unit.tasks)
            .filter(task => {
                const historyDate = history[task.id];
                return completedTasks.has(task.id) && historyDate && historyDate.startsWith(today);
            });

        if (completedToday.length > 0) {
            md += `### ${course.title}\n`;
            completedToday.forEach(task => {
                md += `- [x] ${task.text}\n`;
            });
            md += '\n';
        }
    });

    return md;
};
