import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

function GameHeader({
    nickname,
    score,
    tempoBase,
    timeLeft,
    timerColor,
    timerPercentage,
    timerBarColor
}) {
    return (
        <div className="w-full">
            {/* Header / Top Bar */}
            <div className="max-w-5xl mx-auto pt-6 px-4 w-full">
                <div className="glass-panel py-3 px-6 rounded-full flex justify-between items-center border-b-4 border-yellow-500 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
                            {nickname ? nickname.charAt(0).toUpperCase() : 'J'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Jogador</span>
                            <span className="text-sm md:text-md font-bold text-white leading-tight">{nickname || 'Visitante'}</span>
                        </div>
                    </div>

                    {/* Timer no Header */}
                    {tempoBase > 0 && (
                        <div className={`flex items-center gap-2 ${timerColor} font-black text-2xl`}>
                            <Clock size={20} className={timeLeft <= 5 ? 'animate-pulse' : ''} />
                            <span>{timeLeft}s</span>
                        </div>
                    )}

                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Placar</span>
                        <span className="text-2xl font-black text-yellow-400 drop-shadow-sm leading-none">{score}</span>
                    </div>
                </div>
            </div>

            {/* Timer Bar */}
            {tempoBase > 0 && (
                <div className="max-w-5xl mx-auto w-full mt-4 px-4">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full ${timerBarColor} rounded-full`}
                            initial={{ width: '100%' }}
                            animate={{ width: `${timerPercentage}%` }}
                            transition={{ duration: 0.5, ease: 'linear' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default GameHeader;
