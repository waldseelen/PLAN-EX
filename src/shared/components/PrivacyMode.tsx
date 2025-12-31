import { clsx } from 'clsx'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

// ============================================
// Privacy Context
// ============================================

interface PrivacyContextValue {
    isPrivacyMode: boolean
    togglePrivacyMode: () => void
    enablePrivacyMode: () => void
    disablePrivacyMode: () => void
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null)

export function usePrivacyMode() {
    const context = useContext(PrivacyContext)
    if (!context) {
        throw new Error('usePrivacyMode must be used within a PrivacyProvider')
    }
    return context
}

// ============================================
// Provider
// ============================================

interface PrivacyProviderProps {
    children: ReactNode
}

export function PrivacyProvider({ children }: PrivacyProviderProps) {
    const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
        // LocalStorage'dan durumu oku
        return localStorage.getItem('lifeflow_privacy_mode') === 'true'
    })

    const togglePrivacyMode = useCallback(() => {
        setIsPrivacyMode(prev => {
            const newValue = !prev
            localStorage.setItem('lifeflow_privacy_mode', String(newValue))
            return newValue
        })
    }, [])

    const enablePrivacyMode = useCallback(() => {
        setIsPrivacyMode(true)
        localStorage.setItem('lifeflow_privacy_mode', 'true')
    }, [])

    const disablePrivacyMode = useCallback(() => {
        setIsPrivacyMode(false)
        localStorage.setItem('lifeflow_privacy_mode', 'false')
    }, [])

    return (
        <PrivacyContext.Provider
            value={{
                isPrivacyMode,
                togglePrivacyMode,
                enablePrivacyMode,
                disablePrivacyMode,
            }}
        >
            {children}
        </PrivacyContext.Provider>
    )
}

// ============================================
// Blur Component
// ============================================

interface PrivacyBlurProps {
    children: ReactNode
    /** Blur'u zorunlu olarak aktif et (context'i override eder) */
    forceBlur?: boolean
    /** Blur seviyesi */
    blurLevel?: 'light' | 'medium' | 'heavy'
    /** Tıklandığında geçici olarak göster */
    revealOnClick?: boolean
    /** Ek CSS sınıfı */
    className?: string
}

/**
 * Gizlilik modu için içeriği bulanıklaştıran bileşen
 * Halka açık alanda çalışanlar için notları ve habit isimlerini gizler
 */
export function PrivacyBlur({
    children,
    forceBlur,
    blurLevel = 'medium',
    revealOnClick = true,
    className,
}: PrivacyBlurProps) {
    const { isPrivacyMode } = usePrivacyMode()
    const [isRevealed, setIsRevealed] = useState(false)

    const shouldBlur = forceBlur ?? isPrivacyMode

    if (!shouldBlur) {
        return <>{children}</>
    }

    const blurValues = {
        light: 'blur-[2px]',
        medium: 'blur-[4px]',
        heavy: 'blur-[8px]',
    }

    const handleClick = () => {
        if (revealOnClick) {
            setIsRevealed(true)
            // 3 saniye sonra tekrar bulanıklaştır
            setTimeout(() => setIsRevealed(false), 3000)
        }
    }

    return (
        <span
            onClick={handleClick}
            className={clsx(
                'transition-all duration-300 select-none',
                !isRevealed && blurValues[blurLevel],
                revealOnClick && 'cursor-pointer hover:blur-[1px]',
                className
            )}
            title={revealOnClick ? 'Görmek için tıklayın' : undefined}
        >
            {children}
        </span>
    )
}

// ============================================
// Privacy Toggle Button
// ============================================

interface PrivacyToggleProps {
    className?: string
}

export function PrivacyToggle({ className }: PrivacyToggleProps) {
    const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode()

    return (
        <button
            onClick={togglePrivacyMode}
            className={clsx(
                'p-2 rounded-xl transition-all duration-200',
                isPrivacyMode
                    ? 'bg-surface-700 text-white'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700',
                className
            )}
            title={isPrivacyMode ? 'Gizlilik Modu: Açık' : 'Gizlilik Modu: Kapalı'}
        >
            {isPrivacyMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )}
        </button>
    )
}
