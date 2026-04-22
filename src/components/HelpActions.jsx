import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Users, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

function HelpButton({ icon, label, onClick, disabled, color }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[80px] group
                ${disabled
                    ? 'opacity-40 cursor-not-allowed grayscale'
                    : 'cursor-pointer hover:scale-105'
                }
            `}
        >
            <div className={`p-4 rounded-full border-2 border-yellow-500 bg-blue-900 shadow-[0_0_10px_rgba(255,215,0,0.3)] group-hover:bg-blue-800 transition-colors ${disabled ? 'text-gray-500 border-gray-500' : color}`}>
                {icon}
            </div>
            <span className="text-[11px] font-black text-yellow-400 uppercase tracking-widest mt-1 drop-shadow-md">{label}</span>
        </button>
    );
}

function HelpActions({ handleHelp, helpResult, setHelpResult, feedback, loading }) {
    return (
        <>
            {/* Bottom Bar: Help Actions */}
            <div className="fixed bottom-0 left-0 w-full glass-panel border-t-0 p-2 z-20 rounded-t-[30px]">
                <div className="max-w-5xl mx-auto flex justify-around md:justify-center md:gap-12">
                    <HelpButton
                        icon={<Scissors size={24} />}
                        label="Cartas"
                        onClick={() => handleHelp('eliminar')}
                        disabled={helpResult?.type === 'eliminar' || !!feedback || loading}
                        color="text-yellow-400"
                    />
                    <HelpButton
                        icon={<Users size={24} />}
                        label="Convidados"
                        onClick={() => handleHelp('plateia')}
                        disabled={!!feedback || loading}
                        color="text-yellow-400"
                    />
                    <HelpButton
                        icon={<MessageCircle size={24} />}
                        label="Universitário (IA)"
                        onClick={() => handleHelp('chat')}
                        disabled={!!feedback || loading}
                        color="text-yellow-400"
                    />
                </div>
            </div>

            {/* Help Result Modal/Toast */}
            <AnimatePresence>
                {helpResult && helpResult.msg && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 max-w-lg w-[90%] glass bg-indigo-900/95 text-white p-6 rounded-2xl shadow-2xl border border-yellow-500/50 z-30 flex gap-4 items-start max-h-[60vh] overflow-hidden"
                    >
                        <div className="bg-yellow-400/20 p-2 rounded-lg shrink-0">
                            <CheckCircle className="text-yellow-400" size={24} />
                        </div>
                        <div className="overflow-y-auto pr-2 custom-scrollbar">
                            <h4 className="font-bold text-yellow-400 mb-1 text-sm uppercase tracking-wide sticky top-0 bg-indigo-900/0 backdrop-blur-none">Resposta da Ajuda</h4>
                            <p className="text-gray-100 leading-relaxed text-sm md:text-base whitespace-pre-wrap">{helpResult.msg}</p>
                        </div>
                        <button onClick={() => setHelpResult(null)} className="absolute top-2 right-2 text-white/50 hover:text-white p-1 shrink-0">
                            <XCircle size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default HelpActions;
