export const STORAGE_KEYS = {
  COURSES: 'planner_data_v2',
  COMPLETED_TASKS: 'planner_completed',
  COMPLETION_HISTORY: 'planner_history',
  DARK_MODE: 'planner_dark_mode',
  LAST_BACKUP: 'planner_last_backup'
} as const;

export const COLORS = {
  courses: [
    { name: 'Blue', bg: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-400' },
    { name: 'Purple', bg: 'bg-purple-500', gradient: 'from-purple-500 to-pink-400' },
    { name: 'Green', bg: 'bg-green-500', gradient: 'from-green-500 to-emerald-400' },
    { name: 'Orange', bg: 'bg-orange-500', gradient: 'from-orange-500 to-red-400' },
    { name: 'Indigo', bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-blue-400' },
    { name: 'Pink', bg: 'bg-pink-500', gradient: 'from-pink-500 to-rose-400' },
    { name: 'Teal', bg: 'bg-teal-500', gradient: 'from-teal-500 to-cyan-400' },
    { name: 'Red', bg: 'bg-red-500', gradient: 'from-red-500 to-pink-400' }
  ]
} as const;

export const LIMITS = {
  MAX_COURSES: 20,
  MAX_UNITS_PER_COURSE: 50,
  MAX_TASKS_PER_UNIT: 100,
  MAX_TASK_TEXT_LENGTH: 500,
  MAX_NOTE_LENGTH: 5000,
  MAX_TAGS: 10,
  MAX_SUBTASKS: 20
} as const;

export const POMODORO_PRESETS = [
  { label: '25/5', work: 25 * 60, break: 5 * 60 },
  { label: '45/15', work: 45 * 60, break: 15 * 60 },
  { label: '50/10', work: 50 * 60, break: 10 * 60 }
] as const;

export const AUTO_SAVE_DELAY = 500;
export const TOAST_DURATION = 3000;
