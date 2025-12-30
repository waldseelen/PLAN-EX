import { DateTime, Settings } from 'luxon'

// Configure Luxon defaults
Settings.defaultLocale = 'tr'

/**
 * Calculate effective date considering rollover hour
 * If current time is before rollover hour, it belongs to previous day
 */
export function getEffectiveDate(date: DateTime, rolloverHour: number): DateTime {
    if (date.hour < rolloverHour) {
        return date.minus({ days: 1 })
    }
    return date
}

/**
 * Get dateKey in YYYY-MM-DD format for the effective date
 */
export function getDateKey(date: DateTime, rolloverHour: number): string {
    const effectiveDate = getEffectiveDate(date, rolloverHour)
    return effectiveDate.toFormat('yyyy-MM-dd')
}

/**
 * Get today's dateKey
 */
export function getTodayKey(rolloverHour: number): string {
    return getDateKey(DateTime.now(), rolloverHour)
}

/**
 * Parse dateKey back to DateTime (start of day)
 */
export function parseDateKey(dateKey: string): DateTime {
    return DateTime.fromFormat(dateKey, 'yyyy-MM-dd').startOf('day')
}

/**
 * Format duration in seconds to human readable string
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
        return `${hours}s ${minutes}dk`
    }
    if (minutes > 0) {
        return `${minutes}dk ${secs}sn`
    }
    return `${secs}sn`
}

/**
 * Format duration for timer display (HH:MM:SS)
 */
export function formatTimerDisplay(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const pad = (n: number) => n.toString().padStart(2, '0')

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    }
    return `${pad(minutes)}:${pad(secs)}`
}

/**
 * Get week boundaries based on week start setting
 */
export function getWeekBoundaries(
    date: DateTime,
    weekStart: 1 | 7 // 1 = Monday, 7 = Sunday
): { start: DateTime; end: DateTime } {
    const weekday = date.weekday // 1 = Monday, 7 = Sunday

    let daysToSubtract: number
    if (weekStart === 1) {
        // Week starts on Monday
        daysToSubtract = weekday - 1
    } else {
        // Week starts on Sunday
        daysToSubtract = weekday === 7 ? 0 : weekday
    }

    const start = date.minus({ days: daysToSubtract }).startOf('day')
    const end = start.plus({ days: 6 }).endOf('day')

    return { start, end }
}

/**
 * Get all dates in a range
 */
export function getDateRange(start: DateTime, end: DateTime): DateTime[] {
    const dates: DateTime[] = []
    let current = start.startOf('day')
    const endDate = end.startOf('day')

    while (current <= endDate) {
        dates.push(current)
        current = current.plus({ days: 1 })
    }

    return dates
}
