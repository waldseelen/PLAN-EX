/**
 * Event Queries
 *
 * Calendar events/exams için Dexie query fonksiyonları.
 * Index-based date range queries.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { generateId, nowISO, plannerDb, todayKey } from '../database'
import type { DBPlannerEvent, EventsByDate, PlannerEventType } from '../types'

// ============================================
// Query Functions
// ============================================

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<DBPlannerEvent | undefined> {
    return plannerDb.events.get(id)
}

/**
 * Get events by date
 */
export async function getEventsByDate(dateISO: string): Promise<DBPlannerEvent[]> {
    return plannerDb.events
        .where('dateISO')
        .equals(dateISO)
        .toArray()
}

/**
 * Get events in date range (inclusive)
 */
export async function getEventsByDateRange(
    startISO: string,
    endISO: string
): Promise<DBPlannerEvent[]> {
    return plannerDb.events
        .where('dateISO')
        .between(startISO, endISO, true, true)
        .toArray()
}

/**
 * Get events by date range, grouped by date
 */
export async function getEventsByDateRangeGrouped(
    startISO: string,
    endISO: string
): Promise<EventsByDate> {
    const events = await getEventsByDateRange(startISO, endISO)

    const grouped: EventsByDate = {}
    for (const event of events) {
        if (!grouped[event.dateISO]) {
            grouped[event.dateISO] = []
        }
        grouped[event.dateISO].push(event)
    }

    // Sort events within each day
    for (const dateISO of Object.keys(grouped)) {
        grouped[dateISO].sort((a, b) => a.type.localeCompare(b.type))
    }

    return grouped
}

/**
 * Get events by course
 */
export async function getEventsByCourse(courseId: string): Promise<DBPlannerEvent[]> {
    return plannerDb.events
        .where('courseId')
        .equals(courseId)
        .sortBy('dateISO')
}

/**
 * Get events by type in date range
 */
export async function getEventsByTypeAndDateRange(
    type: PlannerEventType,
    startISO: string,
    endISO: string
): Promise<DBPlannerEvent[]> {
    return plannerDb.events
        .where('[type+dateISO]')
        .between([type, startISO], [type, endISO], true, true)
        .toArray()
}

/**
 * Get upcoming exams (from today onwards)
 */
export async function getUpcomingExams(limit: number = 10): Promise<DBPlannerEvent[]> {
    const today = todayKey()
    return plannerDb.events
        .where('[type+dateISO]')
        .between(['exam', today], ['exam', '9999-12-31'], true, true)
        .limit(limit)
        .toArray()
}

/**
 * Get today's events
 */
export async function getTodayEvents(): Promise<DBPlannerEvent[]> {
    const today = todayKey()
    return getEventsByDate(today)
}

/**
 * Get upcoming events (exams + events) within N days
 */
export async function getUpcomingEventsWithinDays(days: number): Promise<DBPlannerEvent[]> {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + days)

    const startISO = today.toISOString().split('T')[0]
    const endISO = endDate.toISOString().split('T')[0]

    return getEventsByDateRange(startISO, endISO)
}

/**
 * Count events by type
 */
export async function countEventsByType(type: PlannerEventType): Promise<number> {
    return plannerDb.events.where('type').equals(type).count()
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Add a new event
 */
export async function addEvent(data: {
    type: PlannerEventType
    title: string
    dateISO: string
    courseId?: string
    description?: string
    color?: string
}): Promise<string> {
    const now = nowISO()
    const id = generateId()

    await plannerDb.events.add({
        id,
        type: data.type,
        title: data.title,
        dateISO: data.dateISO,
        courseId: data.courseId,
        description: data.description,
        color: data.color,
        createdAt: now,
        updatedAt: now,
    })

    return id
}

/**
 * Update an event
 */
export async function updateEvent(
    id: string,
    updates: Partial<Omit<DBPlannerEvent, 'id' | 'createdAt'>>
): Promise<void> {
    await plannerDb.events.update(id, {
        ...updates,
        updatedAt: nowISO(),
    })
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<void> {
    await plannerDb.events.delete(id)
}

/**
 * Delete all events for a course
 */
export async function deleteEventsByCourse(courseId: string): Promise<void> {
    await plannerDb.events.where('courseId').equals(courseId).delete()
}

// ============================================
// React Hooks
// ============================================

/**
 * Hook: Get event by ID (live)
 */
export function useEvent(id: string): DBPlannerEvent | undefined {
    return useLiveQuery(
        () => getEventById(id),
        [id],
        undefined
    )
}

/**
 * Hook: Get events by date (live)
 */
export function useEventsByDate(dateISO: string): DBPlannerEvent[] {
    return useLiveQuery(
        () => getEventsByDate(dateISO),
        [dateISO],
        []
    )
}

/**
 * Hook: Get events in date range (live)
 */
export function useEventsByDateRange(startISO: string, endISO: string): DBPlannerEvent[] {
    return useLiveQuery(
        () => getEventsByDateRange(startISO, endISO),
        [startISO, endISO],
        []
    )
}

/**
 * Hook: Get events grouped by date (live)
 */
export function useEventsByDateRangeGrouped(startISO: string, endISO: string): EventsByDate {
    return useLiveQuery(
        () => getEventsByDateRangeGrouped(startISO, endISO),
        [startISO, endISO],
        {}
    )
}

/**
 * Hook: Get today's events (live)
 */
export function useTodayEvents(): DBPlannerEvent[] {
    return useLiveQuery(getTodayEvents, [], [])
}

/**
 * Hook: Get upcoming exams (live)
 */
export function useUpcomingExams(limit: number = 10): DBPlannerEvent[] {
    return useLiveQuery(
        () => getUpcomingExams(limit),
        [limit],
        []
    )
}

/**
 * Hook: Get events by course (live)
 */
export function useEventsByCourse(courseId: string): DBPlannerEvent[] {
    return useLiveQuery(
        () => getEventsByCourse(courseId),
        [courseId],
        []
    )
}
