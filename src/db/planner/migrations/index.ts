/**
 * Migration Module Index
 */

export {
    canRollback, getMigrationFlags, isMigrationNeeded, migrateHabitsData, migratePlannerData, purgeLegacyData, rollbackMigration, runFullMigration
} from './migrationService'

export {
    MigrationProvider, useIsAppReady, useMigration
} from './MigrationProvider'

export type {
    LegacyCourse, LegacyEvent, LegacyHabit,
    LegacyHabitLog, LegacyHabitsState, LegacyPersonalTask, LegacyPlannerState, LegacyTask, LegacyUnit, MigrationFlags, MigrationResult
} from './types'

