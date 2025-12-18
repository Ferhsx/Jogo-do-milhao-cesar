import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../service/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Trophy, HomeIcon, AlertCircle, CheckCircle, XCircle, Scissors } from 'lucide-react';

function Game() {
    const navigate = useNavigate();
    const location = useLocation();

    // Recupera dados passados pela Home (Lobby)
    const { sessionId: initialSessionId, firstQuestion, nickname } = location.state || {};

    // Estados do Jogo
    const [sessionId, setSessionId] = useState(initialSessionId);
    const [question, setQuestion] = useState(firstQuestion);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [feedackType, setFeedbackType] = useState(null); // 'success' or 'error'
    const [isGameOver, setIsGameOver] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    // Ajuda
    const [helpResult, setHelpResult] = useState(null);

    // Proteção: Se não houver sessão, volta para Home
    useEffect(() => {
        if (!initialSessionId) {
            navigate('/');
        }
    }, [initialSessionId, navigate]);

    const handleAnswer = async (answer) => {
        if (!sessionId || !question || selectedAnswer) return; // Evita duplo clique

        setSelectedAnswer(answer);
        setLoading(true);
        const response = await api.sendAnswer(sessionId, question.id, answer);

        if (response.success) {
            const data = response.data; // { correct, feedback, gameOver, nextQuestion, score }

            setFeedback(data.feedback);
            setFeedbackType(data.correct ? 'success' : 'error');
            setScore(data.score);

            if (data.gameOver) {
                setTimeout(() => setIsGameOver(true), 2000);
            } else if (data.nextQuestion) {
                setTimeout(() => {
                    setQuestion(data.nextQuestion);
                    if (data.nextQuestion.nivel) setLevel(data.nextQuestion.nivel);
                    setFeedback('');
                    setFeedbackType(null);
                    setSelectedAnswer(null);
                    setHelpResult(null);
                }, 2500);
            }
        } else {
            alert("Erro ao enviar resposta: " + response.message);
            setSelectedAnswer(null); // Reset para tentar de novo
        }
        setLoading(false);
    };

    const handleHelp = async (type) => {
        if (!sessionId || !question || selectedAnswer) return;
        setLoading(true);

        const response = await api.useHelp(sessionId, type, question.id);

        if (response.success) {
            const data = response.data;
            if (type === 'eliminar') {
                setHelpResult({ type: 'eliminar', remove: data.remove });
            } else if (type === 'plateia') {
                setHelpResult({ type: 'plateia', msg: data.message });
            } else if (type === 'chat') {
                setHelpResult({ type: 'chat', msg: data.message });
            }
        } else {
            // Exibe um toast ou modal pequeno em vez de alert seria ideal, mas por agora alert serve ou setFeedback temporário
            alert(response.message);
        }
        setLoading(false);
    };

    if (isGameOver) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass p-8 md:p-12 rounded-3xl max-w-md w-full text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                    <Trophy size={64} className="text-yellow-400 mx-auto mb-6 drop-shadow-lg" />
                    <h1 className="text-4xl font-black text-white mb-2">Fim de Jogo!</h1>
                    <p className="text-purple-200 mb-8 font-medium text-lg">{feedback}</p>

                    <div className="bg-white/10 p-6 rounded-2xl mb-8 backdrop-blur-sm border border-white/10">
                        <p className="text-sm text-purple-300 uppercase tracking-wide font-bold mb-1">Pontuação Final</p>
                        <p className="text-6xl font-black text-yellow-400 drop-shadow-md">{score}</p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')}
                        className="w-full bg-white text-purple-900 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        <HomeIcon size={20} /> Voltar ao Início
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white font-bold text-xl animate-pulse">Carregando Jogo...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 p-4 font-sans flex flex-col">

            {/* Header */}
            <header className="flex justify-between items-center glass p-4 rounded-2xl mb-6 shadow-lg z-10 mx-auto w-full max-w-5xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
                        {nickname ? nickname.charAt(0).toUpperCase() : 'J'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Jogador</span>
                        <span className="text-sm md:text-md font-bold text-white leading-tight">{nickname || 'Visitante'}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Placar</span>
                    <span className="text-2xl font-black text-yellow-400 drop-shadow-sm leading-none">{score}</span>
                </div>
            </header>

            {/* Main Game Area */}
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
                        {/* Card da Questão */}
                        <div className="glass p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden mb-6 border-t border-white/20">
                            {/* Tags */}
                            <div className="flex gap-2 mb-6">
                                <span className="bg-purple-600/50 text-purple-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-purple-500/30">
                                    {question.tema}
                                </span>
                                <span className="bg-blue-600/50 text-blue-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-blue-500/30">
                                    Nível {level} • {question.dificuldade}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight drop-shadow-md">
                                {question.enunciado}
                            </h2>
                        </div>

                        {/* Feedback Overlay/Message */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mb-6 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg border ${feedackType === 'success'
                                        ? 'bg-green-500/20 border-green-500/50 text-green-100'
                                        : 'bg-red-500/20 border-red-500/50 text-red-100'
                                        }`}
                                >
                                    {feedackType === 'success' ? <CheckCircle size={28} /> : <XCircle size={28} />}
                                    <span className="text-lg font-bold">{feedback}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Alternativas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.alternativas.map((alt, idx) => {
                                const isEliminated = helpResult?.type === 'eliminar' && helpResult.remove.includes(alt);
                                const isSelected = selectedAnswer === alt;

                                // Determine styles based on state
                                let buttonClass = "glass border-transparent hover:bg-white/10 hover:border-purple-400/50 text-white";
                                if (isSelected) {
                                    if (feedackType === 'success') buttonClass = "bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[1.02]";
                                    else if (feedackType === 'error') buttonClass = "bg-gradient-to-r from-red-500 to-rose-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-[1.02]";
                                    else buttonClass = "bg-yellow-500/50 border-yellow-400 text-white"; // Pending state (not used much due to fast API)
                                }

                                if (isEliminated) {
                                    return (
                                        <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-black/20 opacity-30 flex items-center justify-center">
                                            <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Eliminado</span>
                                        </div>
                                    );
                                }

                                return (
                                    <motion.button
                                        key={idx}
                                        whileHover={!isSelected && !feedback ? { scale: 1.02 } : {}}
                                        whileTap={!isSelected && !feedback ? { scale: 0.98 } : {}}
                                        onClick={() => handleAnswer(alt)}
                                        disabled={!!feedback || !!selectedAnswer}
                                        className={`
                                            p-6 rounded-2xl text-left border-2 transition-all duration-200 relative group
                                            ${buttonClass}
                                            ${feedback ? 'cursor-default opacity-80' : 'cursor-pointer'}
                                            ${!isSelected && !feedback ? 'hover:bg-white/20' : ''}
                                        `}
                                    >
                                        <div className="flex items-center">
                                            <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg mr-4 transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-yellow-400 group-hover:bg-white/20'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="text-lg md:text-xl font-medium leading-snug">{alt}</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Bar: Help Actions */}
            <div className="fixed bottom-0 left-0 w-full glass border-t border-white/10 p-2 z-20">
                <div className="max-w-5xl mx-auto flex justify-around md:justify-center md:gap-8">
                    <HelpButton
                        icon={<Scissors size={20} />}
                        label="Eliminar"
                        onClick={() => handleHelp('eliminar')}
                        disabled={helpResult?.type === 'eliminar' || !!feedback || loading}
                        color="text-purple-400"
                    />
                    <HelpButton
                        icon={<Users size={20} />}
                        label="Plateia"
                        onClick={() => handleHelp('plateia')}
                        disabled={!!feedback || loading}
                        color="text-blue-400"
                    />
                    <HelpButton
                        icon={<MessageCircle size={20} />}
                        label="IA Chat"
                        onClick={() => handleHelp('chat')}
                        disabled={!!feedback || loading}
                        color="text-green-400"
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

        </div>
    );
}

function HelpButton({ icon, label, onClick, disabled, color }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[70px]
                ${disabled
                    ? 'opacity-40 cursor-not-allowed grayscale'
                    : 'hover:bg-white/10 active:scale-95 cursor-pointer'
                }
            `}
        >
            <div className={`p-2 rounded-2xl bg-black/20 shadow-inner ${disabled ? 'text-gray-500' : color}`}>
                {icon}
            </div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{label}</span>
        </button>
    )
}

export default Game;