import { Course, Task } from '@/types';

export const getCourseProgress = (course: Course, completedTasks: Set<string>) => {
  let total = 0;
  let completed = 0;

  course.units.forEach(unit => {
    unit.tasks.forEach(task => {
      total += 1;
      if (completedTasks.has(task.id)) {
        completed += 1;
      }
    });
  });

  return total === 0 ? 0 : Math.round((completed / total) * 100);
};

export const getNextTask = (
  course: Course,
  completedTasks: Set<string>
): { unit: string; task: Task } | null => {
  for (const unit of course.units) {
    for (const task of unit.tasks) {
      if (!completedTasks.has(task.id)) {
        return { unit: unit.title, task };
      }
    }
  }
  return null;
};

export const getTotalProgress = (courses: Course[], completedTasks: Set<string>) => {
  let total = 0;
  let completed = 0;

  courses.forEach(course => {
    course.units.forEach(unit => {
      unit.tasks.forEach(task => {
        total += 1;
        if (completedTasks.has(task.id)) {
          completed += 1;
        }
      });
    });
  });

  return total === 0 ? 0 : Math.round((completed / total) * 100);
};
