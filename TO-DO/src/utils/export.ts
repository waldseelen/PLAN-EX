import { CompletionHistory, Course } from '@/types';

export const exportToCSV = (
    courses: Course[],
    completedTasks: Set<string>,
    history: CompletionHistory
) => {
    const headers = ['Course Code', 'Course Name', 'Unit', 'Task', 'Status', 'Completion Date'];
    const rows: string[][] = [headers];

    courses.forEach(course => {
        course.units.forEach(unit => {
            unit.tasks.forEach(task => {
                const isCompleted = completedTasks.has(task.id);
                const completionDate = history[task.id] || '-';

                rows.push([
                    course.code,
                    course.title,
                    unit.title,
                    task.text,
                    isCompleted ? 'Completed' : 'Pending',
                    isCompleted ? new Date(completionDate).toLocaleDateString('en-US') : '-'
                ]);
            });
        });
    });

    const csvContent = rows.map(row =>
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

export const exportCourseToMarkdown = (
    course: Course,
    completedTasks: Set<string>
): string => {
    let md = `# ${course.title} (${course.code})\n\n`;

    if (course.exams && course.exams.length > 0) {
        md += `## Exams\n\n`;
        course.exams.forEach(exam => {
            md += `- **${exam.title}**: ${new Date(exam.date).toLocaleDateString('en-US')}\n`;
        });
        md += '\n';
    }

    course.units.forEach((unit, idx) => {
        md += `## ${idx + 1}. ${unit.title}\n\n`;

        unit.tasks.forEach(task => {
            const isCompleted = completedTasks.has(task.id);
            md += `- [${isCompleted ? 'x' : ' '}] ${task.text}\n`;

            if (task.notes) {
                md += `  > ${task.notes.replace(/\n/g, '\n  > ')}\n`;
            }

            if (task.tags && task.tags.length > 0) {
                md += `  🏷️ ${task.tags.map(tag => `\`${tag}\``).join(' ')}\n`;
            }

            if (task.dueDate) {
                md += `  📅 Due Date: ${new Date(task.dueDate).toLocaleDateString('en-US')}\n`;
            }
        });
        md += '\n';
    });

    return md;
};
