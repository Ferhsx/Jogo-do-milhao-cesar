import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { GameProvider, useGame } from '../context/GameContext';
import GameOverScreen from '../components/GameOverScreen';
import GameHeader from '../components/GameHeader';
import HelpActions from '../components/HelpActions';

function GameContent() {
    const navigate = useNavigate();
    const { 
        nickname, score, level, question, feedback, feedbackType,
        isGameOver, selectedAnswer, helpResult, tempoBase,
        handleAnswer, esconderNivel 
    } = useGame();

    if (isGameOver) {
        return <GameOverScreen />;
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-800 via-[#000c24] to-black flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(255,215,0,0.5)]"></div>
                <p className="text-yellow-400 font-black text-2xl animate-pulse tracking-widest uppercase">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white font-['Outfit'] overflow-x-hidden relative flex flex-col bg-show-radial">
            <GameHeader />

            <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col justify-center pb-20 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                    >
                        <div className="glass-question p-8 md:p-12 mb-8 mx-auto w-full md:w-[90%] text-center">
                            <div className="flex justify-center gap-2 mb-6">
                                <span className="bg-blue-800 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide border border-yellow-500/50">
                                    {question.tema}
                                </span>
                                {!esconderNivel && (
                                    <span className="bg-blue-800 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide border border-blue-500">
                                        Nível {level} • {question.dificuldade}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight drop-shadow-lg px-4 md:px-16">
                                {question.enunciado}
                            </h2>
                        </div>

                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mb-6 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg border ${feedbackType === 'success'
                                        ? 'bg-green-500/20 border-green-500/50 text-green-100'
                                        : feedbackType === 'warning'
                                            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100'
                                            : 'bg-red-500/20 border-red-500/50 text-red-100'
                                        }`}
                                >
                                    {feedbackType === 'success' ? <CheckCircle size={28} className="text-green-400" /> : feedbackType === 'warning' ? <Clock size={28} className="text-yellow-400" /> : <XCircle size={28} className="text-red-400" />}
                                    <span className="text-lg font-bold">{feedback}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
                            {question.alternativas.map((alt, idx) => {
                                const isEliminated = helpResult?.type === 'eliminar' && helpResult.remove.includes(alt);
                                const isSelected = selectedAnswer === alt;
                                let buttonClass = "glass-answer hover:bg-blue-800 hover:border-yellow-400 text-white";
                                let letterClass = "bg-blue-900 text-yellow-400 border-2 border-yellow-500";
                                if (isSelected) {
                                    if (feedbackType === 'success') {
                                        buttonClass = "bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-[1.02] rounded-full";
                                        letterClass = "bg-green-700 text-white border-white";
                                    } else if (feedbackType === 'error') {
                                        buttonClass = "bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-[1.02] rounded-full";
                                        letterClass = "bg-red-700 text-white border-white";
                                    } else if (feedbackType === 'warning') {
                                        buttonClass = "bg-yellow-500 border-yellow-300 text-blue-900 shadow-[0_0_20px_rgba(255,215,0,0.8)] rounded-full";
                                        letterClass = "bg-yellow-600 text-white border-white";
                                    } else {
                                        buttonClass = "bg-orange-500 border-orange-300 text-white rounded-full";
                                        letterClass = "bg-orange-600 text-white border-white";
                                    }
                                }
                                if (isEliminated) return (
                                    <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-black/20 opacity-30 flex items-center justify-center">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Eliminado</span>
                                    </div>
                                );
                                return (
                                    <motion.button
                                        key={idx}
                                        whileHover={!isSelected && !feedback ? { scale: 1.02 } : {}}
                                        whileTap={!isSelected && !feedback ? { scale: 0.98 } : {}}
                                        onClick={() => handleAnswer(alt)}
                                        disabled={!!feedback || !!selectedAnswer}
                                        className={`px-6 py-4 rounded-full text-left transition-all duration-200 relative group w-full ${buttonClass} ${feedback ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                                    >
                                        <div className="flex items-center">
                                            <span className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full font-black text-xl mr-4 transition-colors ${letterClass}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="text-lg md:text-xl font-bold leading-snug">{alt}</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            <HelpActions />
        </div>
    );
}

function Game() {
    const navigate = useNavigate();
    const location = useLocation();
    const { sessionId } = location.state || {};

    useEffect(() => {
        if (!sessionId) navigate('/');
    }, [sessionId, navigate]);

    if (!location.state) return null;

    return (
        <GameProvider initialData={location.state}>
            <GameContent />
        </GameProvider>
    );
}

export default Game;