import { Course } from '@/types';

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export const getDaysLeft = (course: Course) => {
  const now = new Date().getTime();
  let nearestDate: number | null = null;

  if (course.examDate) {
    const d = new Date(course.examDate).getTime();
    if (d > now) {
      nearestDate = d;
    }
  }

  if (course.exams && course.exams.length > 0) {
    course.exams.forEach(exam => {
      const examTime = new Date(exam.date).getTime();
      if (examTime > now && (nearestDate === null || examTime < nearestDate)) {
        nearestDate = examTime;
      }
    });
  }

  if (nearestDate === null) {
    return null;
  }

  return Math.ceil((nearestDate - now) / (1000 * 3600 * 24));
};
