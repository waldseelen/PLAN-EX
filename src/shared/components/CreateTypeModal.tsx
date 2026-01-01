/**
 * Plan.Ex - Oluştur Tipi Seçme Modal
 *
 * Kullanıcıdan ne oluşturmak istediğini sorar:
 * - Görev
 * - Alışkanlık
 * - Ders
 * - Etkinlik/Sınav
 */

import { BookOpenIcon, CalendarIcon, CheckCircleIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { type ReactNode } from 'react'
import { Modal } from './Modal'

export type CreateType = 'task' | 'habit' | 'course' | 'event'

interface CreateTypeModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (type: CreateType) => void
}

interface CreateOption {
    id: CreateType
    label: string
    description: string
    icon: ReactNode
    color: string
}

const CREATE_OPTIONS: CreateOption[] = [
    {
        id: 'task',
        label: 'Görev',
        description: 'Kişisel veya dersle ilgili bir görev ekleyin',
        icon: <DocumentTextIcon className="w-8 h-8" />,
        color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    },
    {
        id: 'habit',
        label: 'Alışkanlık',
        description: 'Günlük alışkanlığınızı takip edin',
        icon: <CheckCircleIcon className="w-8 h-8" />,
        color: 'from-green-500/20 to-green-600/20 border-green-500/30',
    },
    {
        id: 'course',
        label: 'Ders',
        description: 'Yeni bir ders ekleyin',
        icon: <BookOpenIcon className="w-8 h-8" />,
        color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    },
    {
        id: 'event',
        label: 'Etkinlik / Sınav',
        description: 'Takvime sınav veya etkinlik ekleyin',
        icon: <CalendarIcon className="w-8 h-8" />,
        color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    },
]

export function CreateTypeModal({ isOpen, onClose, onSelect }: CreateTypeModalProps) {
    const handleSelect = (type: CreateType) => {
        onSelect(type)
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Ne Oluşturmak İstiyorsunuz?"
            size="md"
        >
            <div className="space-y-3">
                {CREATE_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={clsx(
                            'w-full p-4 rounded-xl border-2 transition-all duration-200',
                            'hover:scale-102 active:scale-98',
                            'flex items-center gap-4',
                            'bg-gradient-to-br',
                            option.color,
                            'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                        )}
                    >
                        <div className="text-white">{option.icon}</div>
                        <div className="text-left flex-1">
                            <h3 className="font-semibold text-white text-lg">{option.label}</h3>
                            <p className="text-white/70 text-sm">{option.description}</p>
                        </div>
                    </button>
                ))}

                {/* Kapat butonu */}
                <button
                    onClick={onClose}
                    className={clsx(
                        'w-full p-3 mt-4 rounded-lg border-2 border-default',
                        'text-secondary hover:text-primary',
                        'transition-colors duration-200',
                        'flex items-center justify-center gap-2'
                    )}
                >
                    <XMarkIcon className="w-4 h-4" />
                    <span>İptal</span>
                </button>
            </div>
        </Modal>
    )
}
