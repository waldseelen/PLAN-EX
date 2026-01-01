import { useCallback } from 'react';

import { INITIAL_DATA } from '@/data/initialData';
import { Course, Task, Unit } from '@/types';

import { useLocalStorage } from './useLocalStorage';

export const useCourseData = () => {
  const [courses, setCourses] = useLocalStorage<Course[]>('planner_data_v2', INITIAL_DATA);

  const updateCourse = useCallback(
    (courseId: string, newUnits: Unit[]) => {
      setCourses(prev => prev.map(course => (course.id === courseId ? { ...course, units: newUnits } : course)));
    },
    [setCourses]
  );

  const updateCourseMeta = useCallback(
    (courseId: string, meta: Partial<Course>) => {
      setCourses(prev => prev.map(course => (course.id === courseId ? { ...course, ...meta } : course)));
    },
    [setCourses]
  );

  const addTaskToCourse = useCallback(
    (courseId: string, text: string, options?: { dueDate?: string; isPriority?: boolean; status?: Task['status']; unitId?: string }) => {
      setCourses(prev =>
        prev.map(course => {
          if (course.id !== courseId) return course;
          if (course.units.length === 0) return course;

          const newUnits = [...course.units];

          // Find target unit: specified unitId, or last unit
          let targetUnitIndex = newUnits.length - 1;
          if (options?.unitId) {
            const foundIndex = newUnits.findIndex(u => u.id === options.unitId);
            if (foundIndex !== -1) targetUnitIndex = foundIndex;
          }

          const targetUnit = newUnits[targetUnitIndex];

          const newTask: Task = {
            id: `${courseId}-custom-${Date.now()}`,
            text,
            dueDate: options?.dueDate,
            isPriority: options?.isPriority || false,
            status: options?.status || 'todo'
          };

          newUnits[targetUnitIndex] = {
            ...targetUnit,
            tasks: [...targetUnit.tasks, newTask]
          };

          return { ...course, units: newUnits };
        })
      );
    },
    [setCourses]
  );

  const createNewCourse = useCallback(() => {
    const newCourse: Course = {
      id: `custom-${Date.now()}`,
      code: 'NEW',
      title: 'Yeni Ders',
      color: 'bg-pink-500',
      bgGradient: 'from-pink-500 to-rose-500',
      exams: [],
      units: [{ title: 'Bölüm 1', tasks: [] }]
    };

    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  }, [setCourses]);

  const updateTaskStatus = useCallback((taskId: string, status: Task['status']) => {
    setCourses(prev => prev.map(course => {
      let courseModified = false;
      const newUnits = course.units.map(unit => {
        const taskIndex = unit.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          courseModified = true;
          const newTasks = [...unit.tasks];
          newTasks[taskIndex] = { ...newTasks[taskIndex], status };
          return { ...unit, tasks: newTasks };
        }
        return unit;
      });
      return courseModified ? { ...course, units: newUnits } : course;
    }));
  }, [setCourses]);

  const deleteCourse = useCallback((courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  }, [setCourses]);

  return {
    courses,
    updateCourse,
    updateCourseMeta,
    addTaskToCourse,
    createNewCourse,
    deleteCourse,
    updateTaskStatus,
    setCourses
  };
};
