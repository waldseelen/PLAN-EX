/**
 * Migration Provider
 *
 * React context ile migration durumunu yönetir.
 * App başlangıcında otomatik migration çalıştırır.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
    canRollback,
    getMigrationFlags,
    isMigrationNeeded,
    purgeLegacyData,
    rollbackMigration,
    runFullMigration,
} from './migrationService'
import type { MigrationFlags, MigrationResult } from './types'

// ============================================
// Types
// ============================================

interface MigrationContextValue {
    /** Migration tamamlandı mı */
    isReady: boolean
    /** Migration şu an çalışıyor mu */
    isMigrating: boolean
    /** Migration sonucu */
    migrationResult: MigrationResult | null
    /** Migration flags */
    flags: MigrationFlags
    /** Rollback mümkün mü */
    canRollback: boolean
    /** Rollback yap */
    rollback: () => Promise<boolean>
    /** Legacy data'yı temizle */
    purgeLegacy: () => void
    /** Migration'ı tekrar çalıştır (debug için) */
    retryMigration: () => Promise<void>
}

const MigrationContext = createContext<MigrationContextValue | null>(null)

// ============================================
// Provider
// ============================================

interface MigrationProviderProps {
    children: React.ReactNode
    /** Migration sırasında gösterilecek fallback UI */
    fallback?: React.ReactNode
    /** Hata durumunda gösterilecek UI */
    errorFallback?: (error: string) => React.ReactNode
    /** Migration atla (test için) */
    skipMigration?: boolean
}

export function MigrationProvider({
    children,
    fallback = null,
    errorFallback,
    skipMigration = false,
}: MigrationProviderProps) {
    const [isReady, setIsReady] = useState(false)
    const [isMigrating, setIsMigrating] = useState(false)
    const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
    const [flags, setFlags] = useState<MigrationFlags>(getMigrationFlags)
    const [error, setError] = useState<string | null>(null)

    const runMigration = useCallback(async () => {
        if (skipMigration) {
            setIsReady(true)
            return
        }

        // Check if migration is needed
        if (!isMigrationNeeded()) {
            setIsReady(true)
            setFlags(getMigrationFlags())
            return
        }

        setIsMigrating(true)
        setError(null)

        try {
            const result = await runFullMigration()
            setMigrationResult(result)
            setFlags(getMigrationFlags())

            if (!result.success && result.errors.length > 0) {
                setError(result.errors.join('; '))
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Migration failed'
            setError(errorMessage)
        } finally {
            setIsMigrating(false)
            setIsReady(true)
        }
    }, [skipMigration])

    useEffect(() => {
        runMigration()
    }, [runMigration])

    const handleRollback = useCallback(async (): Promise<boolean> => {
        const success = await rollbackMigration()
        if (success) {
            setFlags(getMigrationFlags())
            setMigrationResult(null)
            // Page reload needed to reset Zustand stores
            window.location.reload()
        }
        return success
    }, [])

    const handlePurgeLegacy = useCallback(() => {
        purgeLegacyData()
        setFlags(getMigrationFlags())
    }, [])

    const retryMigration = useCallback(async () => {
        await runMigration()
    }, [runMigration])

    const value: MigrationContextValue = {
        isReady,
        isMigrating,
        migrationResult,
        flags,
        canRollback: canRollback(),
        rollback: handleRollback,
        purgeLegacy: handlePurgeLegacy,
        retryMigration,
    }

    // Show fallback while migrating
    if (isMigrating && fallback) {
        return <>{fallback}</>
    }

    // Show error fallback if migration failed
    if (error && errorFallback) {
        return <>{errorFallback(error)}</>
    }

    // Wait until ready
    if (!isReady && fallback) {
        return <>{fallback}</>
    }

    return (
        <MigrationContext.Provider value={value}>
            {children}
        </MigrationContext.Provider>
    )
}

// ============================================
// Hook
// ============================================

/**
 * Hook to access migration context
 */
export function useMigration(): MigrationContextValue {
    const context = useContext(MigrationContext)

    if (!context) {
        throw new Error('useMigration must be used within a MigrationProvider')
    }

    return context
}

/**
 * Hook to check if app is ready (migration completed)
 */
export function useIsAppReady(): boolean {
    const context = useContext(MigrationContext)
    return context?.isReady ?? true
}
