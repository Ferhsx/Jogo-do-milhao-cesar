import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../service/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import GameOverScreen from '../components/GameOverScreen';
import GameHeader from '../components/GameHeader';
import HelpActions from '../components/HelpActions';

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
            <GameOverScreen
                score={score}
                feedback={feedback}
                exibirRanking={exibirRanking}
                roomId={roomId}
                nickname={nickname}
            />
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
            <GameHeader
                nickname={nickname}
                score={score}
                tempoBase={tempoBase}
                timeLeft={timeLeft}
                timerColor={timerColor}
                timerPercentage={timerPercentage}
                timerBarColor={timerBarColor}
            />

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

            <HelpActions
                handleHelp={handleHelp}
                helpResult={helpResult}
                setHelpResult={setHelpResult}
                feedback={feedback}
                loading={loading}
            />

        </div>
    );
}
export default Game;