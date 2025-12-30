import { db } from '@/db'
import type { Category, Tag } from '@/db/types'
import { generateId } from '@/shared/utils'
import { create } from 'zustand'

interface CategoriesState {
    categories: Category[]
    tags: Tag[]
    isLoading: boolean

    initialize: () => Promise<void>

    // Categories
    createCategory: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
    updateCategory: (id: string, data: Partial<Category>) => Promise<void>
    deleteCategory: (id: string) => Promise<void>

    // Tags
    createTag: (data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
    updateTag: (id: string, data: Partial<Tag>) => Promise<void>
    deleteTag: (id: string) => Promise<void>

    // Selectors
    getCategoryById: (id: string) => Category | undefined
    getTagById: (id: string) => Tag | undefined
    getTagsByIds: (ids: string[]) => Tag[]
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
    categories: [],
    tags: [],
    isLoading: true,

    initialize: async () => {
        try {
            const [categories, tags] = await Promise.all([
                db.categories.toArray(),
                db.tags.toArray(),
            ])
            set({ categories, tags, isLoading: false })
        } catch (error) {
            console.error('Failed to initialize categories:', error)
            set({ isLoading: false })
        }
    },

    createCategory: async (data) => {
        const id = generateId()
        const now = Date.now()

        const category: Category = {
            ...data,
            id,
            createdAt: now,
            updatedAt: now,
        }

        await db.categories.add(category)

        set((state) => ({
            categories: [...state.categories, category],
        }))

        return id
    },

    updateCategory: async (id, data) => {
        const now = Date.now()
        await db.categories.update(id, { ...data, updatedAt: now })

        set((state) => ({
            categories: state.categories.map((c) =>
                c.id === id ? { ...c, ...data, updatedAt: now } : c
            ),
        }))
    },

    deleteCategory: async (id) => {
        await db.categories.delete(id)

        set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
        }))
    },

    createTag: async (data) => {
        const id = generateId()
        const now = Date.now()

        const tag: Tag = {
            ...data,
            id,
            createdAt: now,
            updatedAt: now,
        }

        await db.tags.add(tag)

        set((state) => ({
            tags: [...state.tags, tag],
        }))

        return id
    },

    updateTag: async (id, data) => {
        const now = Date.now()
        await db.tags.update(id, { ...data, updatedAt: now })

        set((state) => ({
            tags: state.tags.map((t) =>
                t.id === id ? { ...t, ...data, updatedAt: now } : t
            ),
        }))
    },

    deleteTag: async (id) => {
        await db.tags.delete(id)

        set((state) => ({
            tags: state.tags.filter((t) => t.id !== id),
        }))
    },

    getCategoryById: (id) => {
        return get().categories.find((c) => c.id === id)
    },

    getTagById: (id) => {
        return get().tags.find((t) => t.id === id)
    },

    getTagsByIds: (ids) => {
        return get().tags.filter((t) => ids.includes(t.id))
    },
}))
