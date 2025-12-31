import { clsx } from 'clsx'
import type { ReactNode } from 'react'

// ============================================
// Category Color Utils
// ============================================

/**
 * Önceden tanımlı kategori renkleri
 */
export const categoryColors = {
    blue: {
        name: 'Mavi',
        bg: 'bg-blue-500',
        bgLight: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-700',
        dot: 'bg-blue-500',
        ring: 'ring-blue-500',
    },
    green: {
        name: 'Yeşil',
        bg: 'bg-green-500',
        bgLight: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
        dot: 'bg-green-500',
        ring: 'ring-green-500',
    },
    red: {
        name: 'Kırmızı',
        bg: 'bg-red-500',
        bgLight: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-300 dark:border-red-700',
        dot: 'bg-red-500',
        ring: 'ring-red-500',
    },
    orange: {
        name: 'Turuncu',
        bg: 'bg-orange-500',
        bgLight: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-300 dark:border-orange-700',
        dot: 'bg-orange-500',
        ring: 'ring-orange-500',
    },
    yellow: {
        name: 'Sarı',
        bg: 'bg-yellow-500',
        bgLight: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700',
        dot: 'bg-yellow-500',
        ring: 'ring-yellow-500',
    },
    purple: {
        name: 'Mor',
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-300 dark:border-purple-700',
        dot: 'bg-purple-500',
        ring: 'ring-purple-500',
    },
    pink: {
        name: 'Pembe',
        bg: 'bg-pink-500',
        bgLight: 'bg-pink-100 dark:bg-pink-900/30',
        text: 'text-pink-600 dark:text-pink-400',
        border: 'border-pink-300 dark:border-pink-700',
        dot: 'bg-pink-500',
        ring: 'ring-pink-500',
    },
    cyan: {
        name: 'Cyan',
        bg: 'bg-cyan-500',
        bgLight: 'bg-cyan-100 dark:bg-cyan-900/30',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-300 dark:border-cyan-700',
        dot: 'bg-cyan-500',
        ring: 'ring-cyan-500',
    },
    gray: {
        name: 'Gri',
        bg: 'bg-gray-500',
        bgLight: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-300 dark:border-gray-700',
        dot: 'bg-gray-500',
        ring: 'ring-gray-500',
    },
} as const

export type CategoryColorKey = keyof typeof categoryColors

/**
 * Renk koduna göre stil döndürür
 */
export function getCategoryColorStyles(colorKey: CategoryColorKey | string) {
    return categoryColors[colorKey as CategoryColorKey] || categoryColors.gray
}

// ============================================
// Category Dot
// ============================================

interface CategoryDotProps {
    color: CategoryColorKey | string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

/**
 * Kategori renk noktası
 * Liste öğelerinin solunda gösterilir
 */
export function CategoryDot({ color, size = 'md', className }: CategoryDotProps) {
    const styles = getCategoryColorStyles(color)
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
    }

    return (
        <span
            className={clsx(
                'rounded-full flex-shrink-0',
                styles.dot,
                sizeClasses[size],
                className
            )}
        />
    )
}

// ============================================
// Category Border
// ============================================

interface CategoryBorderProps {
    color: CategoryColorKey | string
    children: ReactNode
    position?: 'left' | 'top' | 'right' | 'bottom'
    className?: string
}

/**
 * Kategori renk bordürü
 * Kartların veya liste öğelerinin kenarında gösterilir
 */
export function CategoryBorder({
    color,
    children,
    position = 'left',
    className,
}: CategoryBorderProps) {
    const styles = getCategoryColorStyles(color)
    const borderClasses = {
        left: 'border-l-4',
        top: 'border-t-4',
        right: 'border-r-4',
        bottom: 'border-b-4',
    }

    return (
        <div
            className={clsx(
                borderClasses[position],
                styles.border,
                className
            )}
        >
            {children}
        </div>
    )
}

// ============================================
// Category Badge
// ============================================

interface CategoryBadgeProps {
    color: CategoryColorKey | string
    label: string
    size?: 'sm' | 'md'
    className?: string
}

/**
 * Kategori etiketi (badge)
 * Kompakt kategori gösterimi için
 */
export function CategoryBadge({ color, label, size = 'sm', className }: CategoryBadgeProps) {
    const styles = getCategoryColorStyles(color)
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    }

    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1.5 rounded-full font-medium',
                styles.bgLight,
                styles.text,
                sizeClasses[size],
                className
            )}
        >
            <CategoryDot color={color} size="sm" />
            {label}
        </span>
    )
}

// ============================================
// Category Color Picker
// ============================================

interface CategoryColorPickerProps {
    value: CategoryColorKey
    onChange: (color: CategoryColorKey) => void
    className?: string
}

/**
 * Kategori renk seçici
 * Kategori oluşturma/düzenleme modalında kullanılır
 */
export function CategoryColorPicker({ value, onChange, className }: CategoryColorPickerProps) {
    return (
        <div className={clsx('flex flex-wrap gap-2', className)}>
            {Object.entries(categoryColors).map(([key, colorStyles]) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onChange(key as CategoryColorKey)}
                    className={clsx(
                        'w-8 h-8 rounded-full transition-all duration-200',
                        colorStyles.bg,
                        value === key
                            ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-surface-800 scale-110'
                            : 'hover:scale-105',
                        value === key && colorStyles.ring
                    )}
                    title={colorStyles.name}
                />
            ))}
        </div>
    )
}
