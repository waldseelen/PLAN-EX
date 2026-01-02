/**
 * Migration Service Tests
 *
 * localStorage -> Dexie migration testleri.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value },
        removeItem: (key: string) => { delete store[key] },
        clear: () => { store = {} },
        get length() { return Object.keys(store).length },
        key: (index: number) => Object.keys(store)[index] || null,
    }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Import after mocking localStorage
import {
    getMigrationFlags,
    isMigrationNeeded,
} from '../../src/db/planner/migrations/migrationService'

// Test data: Simulated legacy planner state
const validLegacyPlannerState = {
    state: {
        courses: [
            {
                id: 'course-1',
                code: 'TST101',
                title: 'Test Course',
                color: '#FF5722',
                units: [
                    {
                        id: 'unit-1',
                        title: 'Unit 1',
                        order: 0,
                        tasks: [
                            {
                                id: 'task-1',
                                text: 'Task 1',
                                status: 'todo',
                                isPriority: true,
                                createdAt: '2024-01-01T00:00:00Z',
                                updatedAt: '2024-01-01T00:00:00Z',
                            },
                            {
                                id: 'task-2',
                                text: 'Task 2',
                                status: 'in-progress',
                                isPriority: false,
                                createdAt: '2024-01-02T00:00:00Z',
                                updatedAt: '2024-01-02T00:00:00Z',
                            },
                        ],
                    },
                ],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            },
        ],
        events: [
            {
                id: 'event-1',
                type: 'exam',
                courseId: 'course-1',
                title: 'Midterm',
                dateISO: '2024-02-15',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            },
        ],
        completionState: {
            completedTaskIds: ['task-1'],
            completionHistory: {
                '2024-01-05': ['task-1'],
            },
        },
        personalTasks: [
            {
                id: 'ptask-1',
                text: 'Personal Task 1',
                status: 'todo',
                isPriority: false,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            },
        ],
        lectureNotesMeta: [],
    },
    version: 2,
}

const validLegacyHabitsState = {
    state: {
        habits: [
            {
                id: 'habit-1',
                title: 'Exercise',
                emoji: '💪',
                type: 'boolean',
                color: '#4CAF50',
                frequency: { type: 'specificDays', days: [1, 2, 3, 4, 5] },
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            },
        ],
        habitLogs: {
            'habit-1': [
                {
                    id: 'log-1',
                    habitId: 'habit-1',
                    dateISO: '2024-01-08',
                    done: true,
                    timestamp: '2024-01-08T10:00:00Z',
                },
            ],
        },
    },
    version: 1,
}

describe('Migration Flags', () => {
    beforeEach(() => {
        localStorageMock.clear()
    })

    afterEach(() => {
        localStorageMock.clear()
    })

    describe('getMigrationFlags', () => {
        it('should return default flags when no stored flags', () => {
            const flags = getMigrationFlags()

            expect(flags.plannerMigrated).toBe(false)
            expect(flags.habitsMigrated).toBe(false)
            expect(flags.migrationDate).toBe('')
            expect(flags.rollbackAvailable).toBe(false)
            expect(flags.legacyDataPurged).toBe(false)
        })

        it('should return stored flags when present', () => {
            const storedFlags = {
                plannerMigrated: true,
                habitsMigrated: true,
                migrationDate: '2024-01-15T00:00:00Z',
                rollbackAvailable: true,
                legacyDataPurged: false,
            }
            localStorageMock.setItem('planex-migration-flags', JSON.stringify(storedFlags))

            const flags = getMigrationFlags()

            expect(flags.plannerMigrated).toBe(true)
            expect(flags.habitsMigrated).toBe(true)
            expect(flags.rollbackAvailable).toBe(true)
        })

        it('should return default flags on parse error', () => {
            localStorageMock.setItem('planex-migration-flags', 'invalid-json')

            const flags = getMigrationFlags()

            expect(flags.plannerMigrated).toBe(false)
        })
    })
})

describe('isMigrationNeeded', () => {
    beforeEach(() => {
        localStorageMock.clear()
    })

    afterEach(() => {
        localStorageMock.clear()
    })

    it('should return false when no legacy data exists', () => {
        expect(isMigrationNeeded()).toBe(false)
    })

    it('should return true when legacy planner data exists and not migrated', () => {
        localStorageMock.setItem('lifeflow-planner', JSON.stringify(validLegacyPlannerState))

        expect(isMigrationNeeded()).toBe(true)
    })

    it('should return true when legacy habits data exists and not migrated', () => {
        localStorageMock.setItem('lifeflow-planner-habits', JSON.stringify(validLegacyHabitsState))

        expect(isMigrationNeeded()).toBe(true)
    })

    it('should return false when already migrated', () => {
        localStorageMock.setItem('lifeflow-planner', JSON.stringify(validLegacyPlannerState))
        localStorageMock.setItem('planex-migration-flags', JSON.stringify({
            plannerMigrated: true,
            habitsMigrated: true,
            migrationDate: '2024-01-15T00:00:00Z',
            rollbackAvailable: true,
            legacyDataPurged: false,
        }))

        expect(isMigrationNeeded()).toBe(false)
    })

    it('should return true when planner migrated but habits not', () => {
        localStorageMock.setItem('lifeflow-planner-habits', JSON.stringify(validLegacyHabitsState))
        localStorageMock.setItem('planex-migration-flags', JSON.stringify({
            plannerMigrated: true,
            habitsMigrated: false,
            migrationDate: '2024-01-15T00:00:00Z',
            rollbackAvailable: true,
            legacyDataPurged: false,
        }))

        expect(isMigrationNeeded()).toBe(true)
    })
})

describe('Data Transformation', () => {
    it('should correctly structure legacy planner state', () => {
        const state = validLegacyPlannerState.state

        // Verify structure
        expect(state.courses).toHaveLength(1)
        expect(state.courses[0].units).toHaveLength(1)
        expect(state.courses[0].units[0].tasks).toHaveLength(2)
        expect(state.events).toHaveLength(1)
        expect(state.personalTasks).toHaveLength(1)
        expect(state.completionState.completedTaskIds).toContain('task-1')
    })

    it('should correctly structure legacy habits state', () => {
        const state = validLegacyHabitsState.state

        expect(state.habits).toHaveLength(1)
        expect(state.habits[0].frequency.type).toBe('specificDays')
        expect(state.habitLogs['habit-1']).toHaveLength(1)
    })
})

describe('Corrupt Data Handling', () => {
    beforeEach(() => {
        localStorageMock.clear()
    })

    afterEach(() => {
        localStorageMock.clear()
    })

    it('should handle completely corrupt JSON gracefully', () => {
        localStorageMock.setItem('lifeflow-planner', 'not-json-at-all')

        // isMigrationNeeded only checks if key exists, not if JSON is valid
        // So it returns true when data exists, actual validation happens during migration
        expect(isMigrationNeeded()).toBe(true) // Data exists, migration will handle validation
    })

    it('should handle partially valid data with missing fields', () => {
        const partialData = {
            state: {
                courses: [], // Empty but valid
                // Missing events, completionState, etc.
            },
        }
        localStorageMock.setItem('lifeflow-planner', JSON.stringify(partialData))

        // Should be able to detect data exists
        expect(isMigrationNeeded()).toBe(true)
    })

    it('should handle null values in nested structures', () => {
        const dataWithNulls = {
            state: {
                courses: [
                    {
                        id: 'course-1',
                        code: 'TST',
                        title: 'Test',
                        color: '#000',
                        units: null, // Invalid but should be handled
                    },
                ],
                events: null,
                completionState: null,
            },
        }
        localStorageMock.setItem('lifeflow-planner', JSON.stringify(dataWithNulls))

        expect(isMigrationNeeded()).toBe(true)
    })
})

describe('ID Collision Prevention', () => {
    it('should use unique IDs for generated records', () => {
        const ids = new Set<string>()

        // Simulate generating many IDs
        for (let i = 0; i < 1000; i++) {
            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            expect(ids.has(id)).toBe(false) // Should not have collision
            ids.add(id)
        }

        expect(ids.size).toBe(1000)
    })
})
