import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { exportCourseToMarkdown, exportToCSV } from './export';
import { Course } from '@/types';

// Mock types
const mockCourse: Course = {
    id: 'course-1',
    code: 'CS101',
    title: 'Intro to CS',
    color: '#000000',
    bgGradient: '',
    units: [
        {
            title: 'Unit 1',
            tasks: [
                { id: 'task-1', text: 'Task 1', completed: false },
                { id: 'task-2', text: 'Task 2', completed: false, notes: 'Some notes' }
            ]
        }
    ],
    exams: [
        { id: 'exam-1', title: 'Midterm', date: '2023-10-10' }
    ]
};

describe('Export Utilities', () => {
    describe('exportCourseToMarkdown', () => {
        it('should generate markdown string correctly', () => {
            const completedTasks = new Set(['task-1']);
            const markdown = exportCourseToMarkdown(mockCourse, completedTasks);

            expect(markdown).toContain('# Intro to CS (CS101)');
            expect(markdown).toContain('## Exams');
            expect(markdown).toContain('Midterm');
            expect(markdown).toContain('## 1. Unit 1');
            expect(markdown).toContain('- [x] Task 1');
            expect(markdown).toContain('- [ ] Task 2');
            expect(markdown).toContain('> Some notes');
        });
    });

    describe('exportToCSV', () => {
        beforeAll(() => {
            // Mock URL.createObjectURL and URL.revokeObjectURL
            global.URL.createObjectURL = vi.fn(() => 'blob:url');
            global.URL.revokeObjectURL = vi.fn();

            // Mock document.createElement and click
            // This is a bit tricky in jsdom but workable
        });

        afterAll(() => {
            vi.restoreAllMocks();
        });

        it('should create a blob and trigger download', () => {
            const courses = [mockCourse];
            const completedTasks = new Set(['task-1']);
            const history = { 'task-1': new Date().toISOString() };

            // Mocking the DOM interaction parts
            const link = {
                click: vi.fn(),
                href: '',
                download: ''
            };

            const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(link as unknown as HTMLElement);

            exportToCSV(courses, completedTasks, history);

            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(link.download).toMatch(/tasks-\d{4}-\d{2}-\d{2}\.csv/);
            expect(link.click).toHaveBeenCalled();
            expect(global.URL.revokeObjectURL).toHaveBeenCalled();
        });
    });
});
