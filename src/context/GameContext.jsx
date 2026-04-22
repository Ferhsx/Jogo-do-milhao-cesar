import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { api } from '../service/api';

const GameContext = createContext();

export const GameProvider = ({ children, initialData }) => {
    const { sessionId: initialSessionId, firstQuestion, nickname, gameConfig, roomId } = initialData || {};

    const [sessionId, setSessionId] = useState(initialSessionId);
    const [question, setQuestion] = useState(firstQuestion);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [feedbackType, setFeedbackType] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [helpResult, setHelpResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const timerRef = useRef(null);
    const isAnsweringRef = useRef(false);
    const timerStartedRef = useRef(false);

    const tempoBase = gameConfig?.tempo_base || 0;
    const modoTempo = gameConfig?.modo_tempo || 'fixo';

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

    const handleAnswer = useCallback(async (answer) => {
        if (!sessionId || !question || isAnsweringRef.current) return;
        if (selectedAnswer && answer !== '__TEMPO_ESGOTADO__') return;

        isAnsweringRef.current = true;
        clearInterval(timerRef.current);
        setSelectedAnswer(answer === '__TEMPO_ESGOTADO__' ? null : answer);
        setLoading(true);

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
    }, [sessionId, question, selectedAnswer]);

    useEffect(() => {
        if (tempoBase > 0 && timeLeft === 0 && timerStartedRef.current && question && !feedback && !isGameOver && !selectedAnswer && !isAnsweringRef.current) {
            timerStartedRef.current = false;
            handleAnswer('__TEMPO_ESGOTADO__');
        }
    }, [timeLeft, tempoBase, question, feedback, isGameOver, selectedAnswer, handleAnswer]);

    const useHelp = async (type) => {
        if (!sessionId || !question || selectedAnswer) return;
        setLoading(true);
        const response = await api.useHelp(sessionId, type, question.id);
        if (response.success) {
            const data = response.data;
            if (type === 'eliminar') {
                setHelpResult({ type: 'eliminar', remove: data.remove });
            } else {
                setHelpResult({ type, msg: data.message });
            }
        } else {
            alert(response.message);
        }
        setLoading(false);
    };

    const timerPercentage = tempoBase > 0 ? (timeLeft / getTimeForLevel(level)) * 100 : 100;
    const timerColor = timeLeft > 10 ? 'text-green-400' : timeLeft > 5 ? 'text-yellow-400' : 'text-red-400';
    const timerBarColor = timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <GameContext.Provider value={{
            nickname, score, level, question, loading, feedback, feedbackType,
            isGameOver, selectedAnswer, helpResult, timeLeft, tempoBase,
            timerPercentage, timerColor, timerBarColor, roomId, exibirRanking: gameConfig?.exibir_ranking !== undefined ? gameConfig.exibir_ranking : true,
            esconderNivel: gameConfig?.esconder_nivel_visual || false,
            handleAnswer, useHelp, setHelpResult
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame deve ser usado dentro de um GameProvider');
    return context;
};
