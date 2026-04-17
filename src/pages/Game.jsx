import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../service/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Trophy, HomeIcon, AlertCircle, CheckCircle, XCircle, Scissors, Clock } from 'lucide-react';
import RankingModal from '../components/RankingModal';

function Game() {
    const navigate = useNavigate();
    const location = useLocation();

    // Recupera dados passados pela Home (Lobby)
    const { sessionId: initialSessionId, firstQuestion, nickname, gameConfig, roomId } = location.state || {};

    // Estados do Jogo
    const [sessionId, setSessionId] = useState(initialSessionId);
    const [question, setQuestion] = useState(firstQuestion);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [feedbackType, setFeedbackType] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showRanking, setShowRanking] = useState(false);

    // Ajuda
    const [helpResult, setHelpResult] = useState(null);

    // Timer
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    const isAnsweringRef = useRef(false);
    const timerStartedRef = useRef(false);

    // Config
    const tempoBase = gameConfig?.tempo_base || 0;
    const modoTempo = gameConfig?.modo_tempo || 'fixo';
    const esconderNivel = gameConfig?.esconder_nivel_visual || false;
    const exibirRanking = gameConfig?.exibir_ranking !== undefined ? gameConfig.exibir_ranking : true;

    // Calcula o tempo para o nível atual
    const getTimeForLevel = useCallback((lvl) => {
        if (tempoBase <= 0) return 0;
        switch (modoTempo) {
            case 'regressivo':
                return Math.max(5, Math.round(tempoBase * (1 - (lvl - 1) * 0.15)));
            case 'progressivo':
                return Math.round(tempoBase * (1 + (lvl - 1) * 0.20));
            default:
                return tempoBase;
        }
    }, [tempoBase, modoTempo]);

    // Inicia/reinicia o timer quando a pergunta muda
    useEffect(() => {
        if (tempoBase <= 0 || isGameOver || feedback) return;

        const time = getTimeForLevel(level);
        setTimeLeft(time);
        timerStartedRef.current = true;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [question?.id, tempoBase, level, isGameOver, feedback, getTimeForLevel]);

    // Quando o tempo acabar, envia resposta vazia (errou)
    useEffect(() => {
        if (tempoBase > 0 && timeLeft === 0 && timerStartedRef.current && question && !feedback && !isGameOver && !selectedAnswer && !isAnsweringRef.current) {
            timerStartedRef.current = false;
            handleAnswer('__TEMPO_ESGOTADO__');
        }
    }, [timeLeft]);

    // Proteção: Se não houver sessão, volta para Home
    useEffect(() => {
        if (!initialSessionId) {
            navigate('/');
        }
    }, [initialSessionId, navigate]);

    const handleAnswer = async (answer) => {
        if (!sessionId || !question || isAnsweringRef.current) return;
        if (selectedAnswer && answer !== '__TEMPO_ESGOTADO__') return;

        isAnsweringRef.current = true;
        clearInterval(timerRef.current);

        setSelectedAnswer(answer === '__TEMPO_ESGOTADO__' ? null : answer);
        setLoading(true);

        // Se o tempo esgotou, manda uma resposta inválida que vai errar
        const actualAnswer = answer === '__TEMPO_ESGOTADO__' ? '__TEMPO_ESGOTADO__' : answer;
        const response = await api.sendAnswer(sessionId, question.id, actualAnswer);

        if (response.success) {
            const data = response.data;

            if (answer === '__TEMPO_ESGOTADO__') {
                setFeedback(data.feedback || '⏰ Tempo esgotado!');
                setFeedbackType('warning');
            } else {
                setFeedback(data.feedback);
                setFeedbackType(data.correct ? 'success' : 'error');
            }
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
                    isAnsweringRef.current = false;
                }, 2500);
            }
        } else {
            alert("Erro ao enviar resposta: " + response.message);
            setSelectedAnswer(null);
            isAnsweringRef.current = false;
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
            alert(response.message);
        }
        setLoading(false);
    };

    // Timer visual helpers
    const timerPercentage = tempoBase > 0 ? (timeLeft / getTimeForLevel(level)) * 100 : 100;
    const timerColor = timeLeft > 10 ? 'text-green-400' : timeLeft > 5 ? 'text-yellow-400' : 'text-red-400';
    const timerBarColor = timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500';

    // ====== GAME OVER SCREEN ======
    if (isGameOver) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-800 via-[#000c24] to-black flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel p-8 md:p-12 rounded-[40px] max-w-md w-full text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                    <Trophy size={64} className="text-yellow-400 mx-auto mb-6 drop-shadow-lg" />
                    <h1 className="text-4xl font-black text-white mb-2">Fim de Jogo!</h1>
                    <p className="text-blue-200 mb-8 font-medium text-lg">{feedback}</p>

                    <div className="bg-white/10 p-6 rounded-2xl mb-8 backdrop-blur-sm border border-white/10">
                        <p className="text-sm text-blue-400 uppercase tracking-wide font-bold mb-1">Pontuação Final</p>
                        <p className="text-6xl font-black text-yellow-400 drop-shadow-md">{score}</p>
                    </div>

                    <div className="space-y-3">
                        {exibirRanking && roomId && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowRanking(true)}
                                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-4 rounded-xl font-bold hover:from-yellow-600 hover:to-amber-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <Trophy size={20} /> Ver Ranking
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className="w-full bg-white text-blue-900 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            <HomeIcon size={20} /> Voltar ao Início
                        </motion.button>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {showRanking && (
                        <RankingModal
                            roomId={roomId}
                            onClose={() => setShowRanking(false)}
                            playerScore={score}
                            playerNickname={nickname}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
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
                <div className="max-w-5xl mx-auto w-full mb-4">
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
                        <div className="glass-question p-8 md:p-12 mb-8 mx-auto w-full md:w-[90%] text-center">
                            {/* Timer Flutuante (Relógio) */}
                            {tempoBase > 0 && !feedback && (
                                <div className="absolute top-4 right-4 md:top-8 md:right-8 flex flex-col items-center">
                                    <div className={`relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${timeLeft <= 5 ? 'border-red-500 animate-pulse bg-red-900/50' : 'border-yellow-500 bg-blue-900/80'} backdrop-blur-md transition-colors duration-300 shadow-[0_0_15px_rgba(255,215,0,0.5)]`}>
                                        <Clock size={timeLeft <= 5 ? 24 : 32} className={`${timeLeft <= 5 ? 'text-red-400' : 'text-white/60'} absolute transition-all`} />
                                        <svg className="w-full h-full -rotate-90">
                                            <circle
                                                cx="50%"
                                                cy="50%"
                                                r="40%"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="transparent"
                                                className={`${timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'} transition-all duration-1000 ease-linear`}
                                                strokeDasharray="100"
                                                strokeDashoffset={100 - timerPercentage}
                                            />
                                        </svg>
                                        <span className={`absolute text-xl md:text-2xl font-black ${timeLeft <= 5 ? 'text-red-400' : 'text-white'} drop-shadow-md`}>
                                            {timeLeft}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-extrabold uppercase tracking-widest mt-2 ${timeLeft <= 5 ? 'text-red-400' : 'text-white/40'}`}>
                                        Segundos
                                    </span>
                                </div>
                            )}

                            {/* Tags */}
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

                        {/* Feedback Overlay/Message */}
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

                        {/* Alternativas */}
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
                                    }
                                    else if (feedbackType === 'error') {
                                        buttonClass = "bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-[1.02] rounded-full";
                                        letterClass = "bg-red-700 text-white border-white";
                                    }
                                    else if (feedbackType === 'warning') {
                                        buttonClass = "bg-yellow-500 border-yellow-300 text-blue-900 shadow-[0_0_20px_rgba(255,215,0,0.8)] rounded-full";
                                        letterClass = "bg-yellow-600 text-white border-white";
                                    }
                                    else {
                                        buttonClass = "bg-orange-500 border-orange-300 text-white rounded-full";
                                        letterClass = "bg-orange-600 text-white border-white";
                                    }
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
                                            px-6 py-4 rounded-full text-left transition-all duration-200 relative group w-full
                                            ${buttonClass}
                                            ${feedback ? 'cursor-default opacity-90' : 'cursor-pointer'}
                                        `}
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

        </div>
    );
}

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
    )
}

export default Game;