import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../service/api';

function Game() {
    const navigate = useNavigate();
    const location = useLocation();

    // Recupera dados passados pela Home (Lobby)
    const { sessionId: initialSessionId, firstQuestion, nickname } = location.state || {}; // Adiciona valor padrão de segurança

    // Estados do Jogo
    const [sessionId, setSessionId] = useState(initialSessionId);
    const [question, setQuestion] = useState(firstQuestion);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isGameOver, setIsGameOver] = useState(false);

    // Ajuda
    const [helpResult, setHelpResult] = useState(null);

    // Proteção: Se não houver sessão, volta para Home
    useEffect(() => {
        if (!initialSessionId) {
            navigate('/');
        }
    }, [initialSessionId, navigate]);

    const handleAnswer = async (answer) => {
        if (!sessionId || !question) return;

        setLoading(true);
        const response = await api.sendAnswer(sessionId, question.id, answer);

        if (response.success) {
            const data = response.data; // { correct, feedback, gameOver, nextQuestion, score }

            setFeedback(data.feedback);
            setScore(data.score);

            if (data.gameOver) {
                // Pequeno delay para ler o feedback antes da tela de fim
                setTimeout(() => setIsGameOver(true), 1500);
            } else if (data.nextQuestion) {
                // Aguarda um pouco para ler o feedback e vai para a próxima
                setTimeout(() => {
                    setQuestion(data.nextQuestion);
                    // O backend pode não retornar o nível na resposta de answer, então incrementamos ou ajustamos se vier
                    // Se o backend mandar 'level', usamos. Senão, assumimos lógica local ou mantemos.
                    // Assumindo que o backend não manda level no answer (pelo código visto antes), 
                    // a lógica de nível está no backend. Vamos confiar que o próximo getQuestion trará dados corretos se necessário,
                    // mas aqui 'nextQuestion' tem a estrutura da questão.
                    if (data.nextQuestion.nivel) setLevel(data.nextQuestion.nivel);

                    setFeedback('');
                    setHelpResult(null); // Limpa ajudas da tela
                }, 2000);
            }
        } else {
            alert("Erro ao enviar resposta: " + response.message);
        }
        setLoading(false);
    };

    const handleHelp = async (type) => {
        if (!sessionId || !question) return;
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
            alert(response.message); // Exibe erro (ex: ajuda já usada)
        }
        setLoading(false);
    };

    if (isGameOver) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4 animate-fadeIn">
                <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <h1 className="text-4xl font-black text-gray-800 mb-4">Fim de Jogo!</h1>
                    <p className="text-xl text-gray-600 mb-6 font-medium">{feedback}</p>

                    <div className="bg-blue-100 p-6 rounded-xl mb-8">
                        <p className="text-sm text-blue-600 uppercase tracking-wide font-bold">Pontuação Final</p>
                        <p className="text-5xl font-black text-blue-600">{score}</p>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-transform active:scale-95 shadow-lg"
                    >
                        Jogar Novamente
                    </button>
                </div>
            </div>
        );
    }

    // Se não tiver questão (e não for game over), mostra loading ou nada (pois deve estar redirecionando)
    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl font-semibold text-gray-500 animate-pulse">Carregando Jogo...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md mb-6 max-w-4xl mx-auto border-b-4 border-gray-200">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jogador</span>
                    <span className="text-lg font-bold text-gray-800">{nickname || 'Visitante'}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pontuação</span>
                    <span className="text-2xl font-black text-blue-600">{score}</span>
                </div>
            </div>

            {/* Questão */}
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl relative overflow-hidden">
                {/* Loader bar se estiver carregando */}
                {loading && (
                    <div className="absolute top-0 left-0 w-full h-2 bg-blue-100">
                        <div className="h-full bg-blue-500 animate-loading-bar"></div>
                    </div>
                )}

                <div className="flex gap-2 mb-6">
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {question.tema}
                    </span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Nível {level} • {question.dificuldade}
                    </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-tight">
                    {question.enunciado}
                </h2>

                {/* Feedback Visual */}
                {feedback && (
                    <div className={`p-4 mb-6 rounded-xl text-center font-bold text-lg animate-bounce-in ${feedback.includes('Correto') ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-red-100 text-red-700 border-2 border-red-200'}`}>
                        {feedback}
                    </div>
                )}

                {/* Alternativas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.alternativas.map((alt, idx) => {
                        const isEliminated = helpResult?.type === 'eliminar' && helpResult.remove.includes(alt);

                        if (isEliminated) {
                            return (
                                <div key={idx} className="p-4 border-2 border-transparent bg-gray-50 rounded-xl opacity-30 flex items-center justify-center">
                                    <span className="text-gray-400 font-bold">ELIMINADO</span>
                                </div>
                            );
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(alt)}
                                disabled={!!feedback || loading}
                                className={`
                                    text-left w-full p-5 border-2 rounded-xl transition-all duration-200 relative group
                                    ${feedback
                                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md active:scale-[0.98]'
                                    }
                                `}
                            >
                                <div className="flex items-center">
                                    <span className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 font-bold rounded-full mr-4 group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="text-lg font-medium">{alt}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Ajudas */}
            <div className="max-w-4xl mx-auto mt-8 grid grid-cols-3 gap-4">
                <button
                    onClick={() => handleHelp('eliminar')}
                    disabled={!!feedback || loading || helpResult?.type === 'eliminar' /* Deveria checar se eliminado já foi usado no global se possível */}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-b-4 border-purple-200 hover:border-purple-400 active:translate-y-1"
                >
                    <span className="text-xl mb-1">✂️</span>
                    <span className="font-bold text-gray-600 text-sm">Eliminar</span>
                </button>
                <button
                    onClick={() => handleHelp('plateia')}
                    disabled={!!feedback || loading}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-b-4 border-orange-200 hover:border-orange-400 active:translate-y-1"
                >
                    <span className="text-xl mb-1">👥</span>
                    <span className="font-bold text-gray-600 text-sm">Plateia</span>
                </button>
                <button
                    onClick={() => handleHelp('chat')}
                    disabled={!!feedback || loading}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-b-4 border-green-200 hover:border-green-400 active:translate-y-1"
                >
                    <span className="text-xl mb-1">🤖</span>
                    <span className="font-bold text-gray-600 text-sm">IA Ajuda</span>
                </button>
            </div>

            {/* Resultado da Ajuda */}
            {helpResult && helpResult.msg && (
                <div className="max-w-4xl mx-auto mt-6 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r shadow-sm animate-slide-up">
                    <div className="flex items-start">
                        <span className="text-2xl mr-4">💡</span>
                        <div>
                            <h4 className="font-bold text-yellow-800 mb-1">Dica da Ajuda</h4>
                            <p className="text-yellow-700 italic">"{helpResult.msg}"</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Game;