import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function Modal({ isOpen, onClose, title, children }) {
    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-colors"
                    />

                    {/* Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-panel border border-yellow-500 rounded-[30px] shadow-[0_0_30px_rgba(255,215,0,0.2)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
                        >
                            <div className="flex justify-between items-center px-6 py-4 border-b border-yellow-500/30 bg-[#000c24]/50">
                                <h3 className="text-xl font-bold text-yellow-400 drop-shadow-sm">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full hover:bg-blue-800 text-blue-300 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

export default Modal;