/**
 * GlobalSearchBoxes Component
 *
 * Ana sayfada Google, YouTube ve ChatGPT aramaları için
 * 3 ayrı search input bileşeni.
 *
 * Davranış:
 * - Input'a yaz → Enter
 * - Yeni sekmede arama açılır
 */

import { Bot, Search, Youtube } from 'lucide-react'
import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { cn } from '../../lib/utils'

interface SearchBoxProps {
    type: 'google' | 'youtube' | 'chatgpt'
    placeholder: string
    icon: React.ReactNode
    bgColor: string
    onSearch: (query: string) => void
}

function SearchBox({ type, placeholder, icon, bgColor, onSearch }: SearchBoxProps) {
    const [query, setQuery] = useState('')

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            onSearch(query.trim())
            setQuery('')
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            onSearch(query.trim())
            setQuery('')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div
                className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
                    'border-white/10 bg-white/5 hover:bg-white/8 focus-within:border-white/20 focus-within:bg-white/10'
                )}
            >
                <div
                    className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                        bgColor
                    )}
                >
                    {icon}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={cn(
                        'flex-1 bg-transparent border-none outline-none text-sm',
                        'text-white placeholder-gray-400'
                    )}
                    aria-label={`${type} araması`}
                />
                <button
                    type="submit"
                    className={cn(
                        'p-2 rounded-lg transition-colors',
                        'hover:bg-white/10 text-gray-400 hover:text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    disabled={!query.trim()}
                    aria-label="Ara"
                >
                    <Search className="w-4 h-4" />
                </button>
            </div>
        </form>
    )
}

export function GlobalSearchBoxes() {
    const openGoogleSearch = (query: string) => {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const openYouTubeSearch = (query: string) => {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const openChatGPTSearch = (query: string) => {
        const url = `https://chat.openai.com/?q=${encodeURIComponent(query)}`
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Hızlı Arama</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SearchBox
                    type="google"
                    placeholder="Google'da ara..."
                    icon={<Search className="w-4 h-4 text-white" />}
                    bgColor="bg-blue-500"
                    onSearch={openGoogleSearch}
                />

                <SearchBox
                    type="youtube"
                    placeholder="YouTube'da ara..."
                    icon={<Youtube className="w-4 h-4 text-white" />}
                    bgColor="bg-red-500"
                    onSearch={openYouTubeSearch}
                />

                <SearchBox
                    type="chatgpt"
                    placeholder="ChatGPT'ye sor..."
                    icon={<Bot className="w-4 h-4 text-white" />}
                    bgColor="bg-emerald-500"
                    onSearch={openChatGPTSearch}
                />
            </div>
        </div>
    )
}
