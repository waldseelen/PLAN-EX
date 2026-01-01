import { CompletionHistory, Course } from '@/types';

export const getTaskCompletionStats = (
  courses: Course[],
  completedTasks: Set<string>,
  history: CompletionHistory
) => {
  const totalTasks = courses.reduce(
    (sum, course) => sum + course.units.reduce((uSum, unit) => uSum + unit.tasks.length, 0),
    0
  );

  const completedCount = completedTasks.size;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedCount,
    remainingCount: totalTasks - completedCount,
    completionRate
  };
};

export const getWeeklyProgress = (history: CompletionHistory) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyCompletions = Object.values(history).filter(dateStr => {
    const date = new Date(dateStr);
    return date >= weekAgo && date <= now;
  });

  return weeklyCompletions.length;
};

export const getDailyStreak = (history: CompletionHistory) => {
  const dates = Object.values(history)
    .map(dateStr => dateStr.split('T')[0])
    .sort()
    .reverse();

  const uniqueDates = Array.from(new Set(dates));

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const dateStr of uniqueDates) {
    const taskDate = new Date(dateStr);
    taskDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const getCoursePerformance = (
  course: Course,
  completedTasks: Set<string>
) => {
  const totalTasks = course.units.reduce((sum, unit) => sum + unit.tasks.length, 0);
  const completedCount = course.units.reduce(
    (sum, unit) => sum + unit.tasks.filter(task => completedTasks.has(task.id)).length,
    0
  );

  return {
    courseId: course.id,
    courseName: course.title,
    totalTasks,
    completedCount,
    completionRate: totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
  };
};
