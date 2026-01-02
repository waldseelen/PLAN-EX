/**
 * Planner Hooks Index
 *
 * Tüm custom hook'ların exportları.
 */

// Calendar hooks
export {
    DAY_NAMES_EN,
    DAY_NAMES_EN_LONG, DAY_NAMES_TR,
    DAY_NAMES_TR_LONG, useCalendarDayNames, useCalendarGrid, type CalendarDay,
    type CalendarGridResult
} from './useCalendarGrid'

export {
    useCalendarEvents,
    useCalendarEventsGrouped, useEventCountsForDate, useEventsForDate, useTodayEventsWithCourses,
    useUpcomingExamsWithDays, type EventWithCourse,
    type EventsByDateMap,
    type UpcomingExam
} from './useCalendarEvents'

export {
    useEventModal,
    type EventFormData, type EventModalActions, type EventModalState, type UseEventModalReturn
} from './useEventModal'

