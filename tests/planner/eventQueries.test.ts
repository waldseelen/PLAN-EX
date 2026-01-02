/**
 * Event Queries Tests
 *
 * Dexie event sorguları için testler.
 * fake-indexeddb kullanarak gerçek IndexedDB işlemlerini test eder.
 */

import Dexie from 'dexie'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { DBPlannerEvent } from '../../src/db/planner/types'

// Test için basit bir Dexie database
class TestDatabase extends Dexie {
    events!: Dexie.Table<DBPlannerEvent, string>

    constructor() {
        super('TestPlannerDB')
        this.version(1).stores({
            events: 'id, courseId, type, dateISO, [type+dateISO], [courseId+dateISO]',
        })
    }
}

// Test fixtures
const testEvents: DBPlannerEvent[] = [
    {
        id: 'event-1',
        title: 'Midterm Exam',
        type: 'exam',
        dateISO: '2024-01-15',
        courseId: 'course-1',
        description: 'Chapter 1-5',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'event-2',
        title: 'Final Exam',
        type: 'exam',
        dateISO: '2024-02-15',
        courseId: 'course-1',
        description: 'All chapters',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'event-3',
        title: 'Quiz 1',
        type: 'event',
        dateISO: '2024-01-20',
        courseId: 'course-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'event-4',
        title: 'Assignment Due',
        type: 'event',
        dateISO: '2024-01-25',
        courseId: 'course-2',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'event-5',
        title: 'Project Presentation',
        type: 'event',
        dateISO: '2024-01-30',
        courseId: 'course-2',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
]

describe('Event Queries with Dexie', () => {
    let db: TestDatabase

    beforeEach(async () => {
        // Her test için yeni database oluştur
        db = new TestDatabase()
        await db.open()
        await db.events.bulkAdd(testEvents)
    })

    afterEach(async () => {
        // Her testten sonra database'i temizle
        await db.delete()
    })

    describe('basic CRUD', () => {
        it('should add an event', async () => {
            const newEvent: DBPlannerEvent = {
                id: 'event-new',
                title: 'New Event',
                type: 'exam',
                dateISO: '2024-03-01',
                courseId: 'course-1',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            await db.events.add(newEvent)

            const event = await db.events.get('event-new')
            expect(event).toBeDefined()
            expect(event?.title).toBe('New Event')
        })

        it('should update an event', async () => {
            await db.events.update('event-1', { title: 'Updated Title' })

            const event = await db.events.get('event-1')
            expect(event?.title).toBe('Updated Title')
        })

        it('should delete an event', async () => {
            await db.events.delete('event-1')

            const event = await db.events.get('event-1')
            expect(event).toBeUndefined()
        })
    })

    describe('getByDateRange', () => {
        it('should return events within date range', async () => {
            const events = await db.events
                .where('dateISO')
                .between('2024-01-01', '2024-01-31', true, true)
                .toArray()

            // Should include events on Jan 15, 20, 25, 30
            expect(events).toHaveLength(4)
        })

        it('should return empty array for date range with no events', async () => {
            const events = await db.events
                .where('dateISO')
                .between('2024-03-01', '2024-03-31', true, true)
                .toArray()

            expect(events).toHaveLength(0)
        })

        it('should include boundary dates when inclusive', async () => {
            const events = await db.events
                .where('dateISO')
                .between('2024-01-15', '2024-01-20', true, true)
                .toArray()

            expect(events).toHaveLength(2) // Jan 15 and Jan 20
            expect(events.map(e => e.id).sort()).toEqual(['event-1', 'event-3'])
        })
    })

    describe('getByType', () => {
        it('should filter events by type', async () => {
            const exams = await db.events
                .where('type')
                .equals('exam')
                .toArray()

            expect(exams).toHaveLength(2)
            exams.forEach(e => expect(e.type).toBe('exam'))
        })

        it('should return empty array for non-existent type', async () => {
            const lectures = await db.events
                .where('type')
                .equals('lecture')
                .toArray()

            expect(lectures).toHaveLength(0)
        })
    })

    describe('getByCourse', () => {
        it('should filter events by courseId', async () => {
            const course1Events = await db.events
                .where('courseId')
                .equals('course-1')
                .toArray()

            expect(course1Events).toHaveLength(3) // 2 exams + 1 quiz
        })

        it('should return empty array for non-existent course', async () => {
            const events = await db.events
                .where('courseId')
                .equals('course-999')
                .toArray()

            expect(events).toHaveLength(0)
        })
    })

    describe('compound queries', () => {
        it('should filter by type and date range', async () => {
            // Get exams in January
            const events = await db.events
                .where('[type+dateISO]')
                .between(['exam', '2024-01-01'], ['exam', '2024-01-31'], true, true)
                .toArray()

            expect(events).toHaveLength(1) // Only midterm in January
            expect(events[0].title).toBe('Midterm Exam')
        })

        it('should filter by course and date range', async () => {
            // Get course-2 events in January
            const events = await db.events
                .where('[courseId+dateISO]')
                .between(['course-2', '2024-01-01'], ['course-2', '2024-01-31'], true, true)
                .toArray()

            expect(events).toHaveLength(2) // Assignment and Project
        })
    })

    describe('sorting', () => {
        it('should sort events by date ascending', async () => {
            const events = await db.events
                .orderBy('dateISO')
                .toArray()

            for (let i = 1; i < events.length; i++) {
                expect(events[i].dateISO >= events[i - 1].dateISO).toBe(true)
            }
        })

        it('should sort events by date descending', async () => {
            const events = await db.events
                .orderBy('dateISO')
                .reverse()
                .toArray()

            for (let i = 1; i < events.length; i++) {
                expect(events[i].dateISO <= events[i - 1].dateISO).toBe(true)
            }
        })
    })

    describe('count queries', () => {
        it('should count total events', async () => {
            const count = await db.events.count()
            expect(count).toBe(5)
        })

        it('should count events by type', async () => {
            const examCount = await db.events
                .where('type')
                .equals('exam')
                .count()

            expect(examCount).toBe(2)
        })
    })
})
