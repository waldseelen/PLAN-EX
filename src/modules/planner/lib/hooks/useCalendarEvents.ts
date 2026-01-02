/**
 * useCalendarEvents Hook
 *
 * Calendar events için DB query hook'u.
 * Date range bazlı events fetch eder ve gruplama yapar.
 */

import { plannerDb, todayKey } from '@/db/planner/database'
import type { DBCourse, DBPlannerEvent } from '@/db/planner/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'

// ============================================
// Types
// ============================================

export interface EventWithCourse extends DBPlannerEvent {
    course?: DBCourse
    courseName?: string
    courseColor?: string
}

export interface EventsByDateMap {
    [dateISO: string]: EventWithCourse[]
}

export interface UpcomingExam {
    event: EventWithCourse
    daysUntil: number
}

// ============================================
// Query Functions
// ============================================

async function fetchEventsWithCourses(
    startISO: string,
    endISO: string
): Promise<EventWithCourse[]> {
    const [events, courses] = await Promise.all([
        plannerDb.events
            .where('dateISO')
            .between(startISO, endISO, true, true)
            .toArray(),
        plannerDb.courses.toArray(),
    ])

    const courseMap = new Map(courses.map(c => [c.id, c]))

    return events.map(event => {
        const course = event.courseId ? courseMap.get(event.courseId) : undefined
        return {
            ...event,
            course,
            courseName: course?.title,
            courseColor: course?.color,
        }
    })
}

async function fetchUpcomingExams(limit: number = 10): Promise<UpcomingExam[]> {
    const today = todayKey()
    const todayDate = new Date(today)

    const [events, courses] = await Promise.all([
        plannerDb.events
            .where('[type+dateISO]')
            .between(['exam', today], ['exam', '9999-12-31'], true, true)
            .limit(limit)
            .toArray(),
        plannerDb.courses.toArray(),
    ])

    const courseMap = new Map(courses.map(c => [c.id, c]))

    return events.map(event => {
        const course = event.courseId ? courseMap.get(event.courseId) : undefined
        const eventDate = new Date(event.dateISO)
        const daysUntil = Math.ceil(
            (eventDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        return {
            event: {
                ...event,
                course,
                courseName: course?.title,
                courseColor: course?.color,
            },
            daysUntil,
        }
    })
}

async function fetchTodayEvents(): Promise<EventWithCourse[]> {
    const today = todayKey()
    return fetchEventsWithCourses(today, today)
}

// ============================================
// Hooks
// ============================================

/**
 * Hook: Get events in date range with course info
 */
export function useCalendarEvents(
    startISO: string,
    endISO: string
): EventWithCourse[] {
    return useLiveQuery(
        () => fetchEventsWithCourses(startISO, endISO),
        [startISO, endISO],
        []
    )
}

/**
 * Hook: Get events grouped by date
 */
export function useCalendarEventsGrouped(
    startISO: string,
    endISO: string
): EventsByDateMap {
    const events = useCalendarEvents(startISO, endISO)

    return useMemo(() => {
        const grouped: EventsByDateMap = {}

        for (const event of events) {
            if (!grouped[event.dateISO]) {
                grouped[event.dateISO] = []
            }
            grouped[event.dateISO].push(event)
        }

        // Sort events within each day (exams first, then by title)
        for (const dateISO of Object.keys(grouped)) {
            grouped[dateISO].sort((a, b) => {
                // Exams first
                if (a.type === 'exam' && b.type !== 'exam') return -1
                if (a.type !== 'exam' && b.type === 'exam') return 1
                // Then by title
                return a.title.localeCompare(b.title)
            })
        }

        return grouped
    }, [events])
}

/**
 * Hook: Get today's events
 */
export function useTodayEventsWithCourses(): EventWithCourse[] {
    return useLiveQuery(fetchTodayEvents, [], [])
}

/**
 * Hook: Get upcoming exams with days until
 */
export function useUpcomingExamsWithDays(limit: number = 10): UpcomingExam[] {
    return useLiveQuery(
        () => fetchUpcomingExams(limit),
        [limit],
        []
    )
}

/**
 * Hook: Get events for a specific date
 */
export function useEventsForDate(dateISO: string): EventWithCourse[] {
    return useCalendarEvents(dateISO, dateISO)
}

/**
 * Hook: Count events by type for a date
 */
export function useEventCountsForDate(dateISO: string): { exams: number; events: number } {
    const events = useEventsForDate(dateISO)

    return useMemo(() => ({
        exams: events.filter(e => e.type === 'exam').length,
        events: events.filter(e => e.type === 'event').length,
    }), [events])
}
