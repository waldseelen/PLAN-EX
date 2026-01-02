/**
 * i18n Configuration
 *
 * Çok dilli destek için konfigürasyon.
 * Default: Türkçe (tr)
 */

// ============================================
// Types
// ============================================

export type Locale = 'tr' | 'en'
export type Namespace = 'common' | 'planner' | 'calendar' | 'habits' | 'settings'

// ============================================
// Constants
// ============================================

export const DEFAULT_LOCALE: Locale = 'tr'
export const SUPPORTED_LOCALES: Locale[] = ['tr', 'en']
export const NAMESPACES: Namespace[] = ['common', 'planner', 'calendar', 'habits', 'settings']

export const LOCALE_NAMES: Record<Locale, string> = {
    tr: 'Türkçe',
    en: 'English',
}

// ============================================
// Translation Resources
// ============================================

// Lazy loading için dynamic import
export async function loadTranslations(locale: Locale, namespace: Namespace): Promise<Record<string, unknown>> {
    try {
        const module = await import(`./locales/${locale}/${namespace}.json`)
        return module.default || module
    } catch {
        console.warn(`[i18n] Failed to load ${locale}/${namespace}, falling back to ${DEFAULT_LOCALE}`)
        const fallback = await import(`./locales/${DEFAULT_LOCALE}/${namespace}.json`)
        return fallback.default || fallback
    }
}

// Static imports for bundling (Turkish only for now)
import calendarTr from './locales/tr/calendar.json'
import commonTr from './locales/tr/common.json'
import habitsTr from './locales/tr/habits.json'
import plannerTr from './locales/tr/planner.json'
import settingsTr from './locales/tr/settings.json'

export const translations: Record<Locale, Record<Namespace, Record<string, unknown>>> = {
    tr: {
        common: commonTr,
        planner: plannerTr,
        calendar: calendarTr,
        habits: habitsTr,
        settings: settingsTr,
    },
    en: {
        // English translations not yet implemented
        common: {},
        planner: {},
        calendar: {},
        habits: {},
        settings: {},
    },
}

/**
 * Get translation value by key path
 */
export function getTranslation(
    locale: Locale,
    namespace: Namespace,
    key: string,
    params?: Record<string, string | number>
): string {
    const namespaceData = translations[locale]?.[namespace] || translations[DEFAULT_LOCALE]?.[namespace]
    if (!namespaceData) {
        console.warn(`[i18n] Namespace not found: ${namespace}`)
        return key
    }

    // Navigate nested keys
    const keys = key.split('.')
    let value: unknown = namespaceData

    for (const k of keys) {
        if (typeof value !== 'object' || value === null) {
            console.warn(`[i18n] Key not found: ${namespace}.${key}`)
            return key
        }
        value = (value as Record<string, unknown>)[k]
    }

    if (typeof value !== 'string') {
        console.warn(`[i18n] Key is not a string: ${namespace}.${key}`)
        return key
    }

    // Replace parameters
    if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
            return String(params[paramKey] ?? `{{${paramKey}}}`)
        })
    }

    return value
}

// ============================================
// Helper Functions
// ============================================

/**
 * Create a translation function for a specific namespace
 */
export function createT(locale: Locale, namespace: Namespace) {
    return (key: string, params?: Record<string, string | number>) =>
        getTranslation(locale, namespace, key, params)
}

/**
 * Get browser locale
 */
export function getBrowserLocale(): Locale {
    const browserLang = navigator.language.split('-')[0]
    return SUPPORTED_LOCALES.includes(browserLang as Locale)
        ? (browserLang as Locale)
        : DEFAULT_LOCALE
}

/**
 * Get stored locale preference
 */
export function getStoredLocale(): Locale | null {
    const stored = localStorage.getItem('planex-locale')
    if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
        return stored as Locale
    }
    return null
}

/**
 * Store locale preference
 */
export function setStoredLocale(locale: Locale): void {
    localStorage.setItem('planex-locale', locale)
}

/**
 * Get current locale (preference > browser > default)
 */
export function getCurrentLocale(): Locale {
    return getStoredLocale() || getBrowserLocale()
}
