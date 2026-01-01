import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    footer?: React.ReactNode;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
};

export function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = 'md',
    showCloseButton = true,
    footer,
}: ModalProps) {
    // Escape tuşu ile kapatma
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Body scroll'u engelle
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container - Centered */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                                type: 'spring',
                                stiffness: 350,
                                damping: 30
                            }}
                            className={cn(
                                'w-full pointer-events-auto',
                                'max-h-[90vh] flex flex-col',
                                sizeClasses[size]
                            )}
                        >
                            <div className="bg-card border border-default rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                {/* Header */}
                                {(title || showCloseButton) && (
                                    <div className="flex items-start justify-between px-6 py-5 border-b border-default bg-secondary/30 flex-shrink-0">
                                        <div className="flex-1 min-w-0 pr-4">
                                            {title && (
                                                <h2 className="text-xl font-semibold text-primary">{title}</h2>
                                            )}
                                            {subtitle && (
                                                <p className="text-sm text-secondary mt-1">{subtitle}</p>
                                            )}
                                        </div>
                                        {showCloseButton && (
                                            <button
                                                onClick={onClose}
                                                className="p-2 -m-2 rounded-xl hover:bg-secondary transition-colors flex-shrink-0 group"
                                                aria-label="Kapat"
                                            >
                                                <X className="w-5 h-5 text-tertiary group-hover:text-primary transition-colors" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Content - Scrollable */}
                                <div className="flex-1 overflow-y-auto overscroll-contain">
                                    <div className="p-6">{children}</div>
                                </div>

                                {/* Footer */}
                                {footer && (
                                    <div className="px-6 py-4 border-t border-default bg-secondary/30 flex-shrink-0">
                                        {footer}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
