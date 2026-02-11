import React, { useEffect, useState } from 'react';
import { api } from '../service/api';
import { motion } from 'framer-motion';
import { Trophy, Medal, XCircle, ClipboardList, Download, ChevronLeft } from 'lucide-react';

function RankingModal({ roomId, onClose, playerScore, playerNickname, isProfessor = false }) {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionDetails, setSessionDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const fetchRanking = async () => {
            if (!roomId || roomId === 'undefined' || roomId === 'null') {
                setLoading(false);
                return;
            }
            const response = await api.getRanking(roomId);
            if (response.success) {
                setRanking(response.data);
            }
            setLoading(false);
        };

        fetchRanking();

        // Polling para atualização automática (a cada 5 segundos)
        // Só faz polling se não estivermos vendo detalhes de um aluno específico
        const intervalId = setInterval(() => {
            if (!sessionDetails) {
                fetchRanking();
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [roomId, sessionDetails]);

    const handleViewDetails = async (sessionId) => {
        setSelectedSession(sessionId);
        setLoadingDetails(true);
        try {
            const response = await api.getSessionDetails(sessionId);
            if (response.success) {
                setSessionDetails(response.data);
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const downloadAllReports = async () => {
        try {
            setLoading(true);
            const response = await api.getAllRoomSessions(roomId);
            if (response.success && response.data.length > 0) {
                let text = `RELATÓRIO GERAL DA SALA - JOGO DO BILHÃO\n`;
                text += `==========================================\n`;
                text += `ID da Sala: ${roomId}\n`;
                text += `Data de Geração: ${new Date().toLocaleString('pt-BR')}\n`;
                text += `Total de Jogadores: ${response.data.length}\n`;
                text += `==========================================\n\n`;

                response.data.forEach((session, sIdx) => {
                    text += `JOGADOR ${sIdx + 1}: ${session.nickname.toUpperCase()}\n`;
                    text += `Pontuação: ${session.score} | Status: ${session.status.toUpperCase()}\n`;
                    text += `Data: ${new Date(session.completedAt).toLocaleString('pt-BR')}\n`;
                    text += `------------------------------------------\n`;

                    if (session.historico.length === 0) {
                        text += `Nenhum histórico de respostas.\n`;
                    } else {
                        session.historico.forEach((h, i) => {
                            text += `${i + 1}. ${h.enunciado}\n`;
                            text += `   R: ${h.resposta_usuario === '__TEMPO_ESGOTADO__' ? 'TEMPO ESGOTADO' : h.resposta_usuario}\n`;
                            text += `   Res. Correta: ${h.resposta_correta} | ${h.correto ? '✅ ACERTOU' : '❌ ERROU'}\n`;
                        });
                    }
                    text += `\n##########################################\n\n`;
                });

                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Relatorio_Geral_Sala_${roomId.substring(0, 5)}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert("Nenhum dado encontrado para gerar o relatório geral.");
            }
        } catch (error) {
            console.error("Erro ao baixar relatório geral:", error);
            alert("Erro ao gerar relatório geral.");
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        if (!sessionDetails) return;

        const date = new Date(sessionDetails.completedAt).toLocaleString('pt-BR');
        let text = `RELATÓRIO DE DESEMPENHO - JOGO DO BILHÃO\n`;
        text += `==========================================\n`;
        text += `Aluno: ${sessionDetails.nickname}\n`;
        text += `Data: ${date}\n`;
        text += `Pontuação Final: ${sessionDetails.score}\n`;
        text += `Status: ${sessionDetails.status.toUpperCase()}\n`;
        text += `==========================================\n\n`;
        text += `HISTÓRICO DE QUESTÕES:\n\n`;

        sessionDetails.historico.forEach((h, i) => {
            text += `${i + 1}. ${h.enunciado}\n`;
            text += `   Resposta do Aluno: ${h.resposta_usuario === '__TEMPO_ESGOTADO__' ? 'TEMPO ESGOTADO' : h.resposta_usuario}\n`;
            text += `   Resposta Correta: ${h.resposta_correta}\n`;
            text += `   Resultado: ${h.correto ? '✅ ACERTOU' : '❌ ERROU'}\n`;
            text += `------------------------------------------\n`;
        });

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Relatorio_${sessionDetails.nickname}_${roomId.substring(0, 5)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getMedalColor = (index) => {
        if (index === 0) return 'text-yellow-400';
        if (index === 1) return 'text-gray-300';
        if (index === 2) return 'text-amber-600';
        return 'text-purple-300';
    };

    const getMedalBg = (index) => {
        if (index === 0) return 'bg-yellow-400/20 border-yellow-400/50';
        if (index === 1) return 'bg-gray-300/10 border-gray-400/30';
        if (index === 2) return 'bg-amber-600/20 border-amber-500/30';
        return 'bg-white/5 border-white/10';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-b from-indigo-900 to-purple-950 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-purple-500/30 max-h-[85vh] overflow-hidden flex flex-col relative"
            >
                {/* Header */}
                <div className="text-center mb-6 relative">
                    {sessionDetails && (
                        <button
                            onClick={() => { setSessionDetails(null); setSelectedSession(null); }}
                            className="absolute left-0 top-0 text-white/60 hover:text-white flex items-center gap-1 text-sm font-bold uppercase tracking-widest"
                        >
                            <ChevronLeft size={18} /> Voltar
                        </button>
                    )}
                    <button onClick={onClose} className="absolute -top-1 -right-1 text-white/40 hover:text-white transition-colors">
                        <XCircle size={24} />
                    </button>
                    {!sessionDetails ? (
                        <>
                            <Trophy size={40} className="text-yellow-400 mx-auto mb-2 drop-shadow-lg" />
                            <h2 className="text-2xl font-black text-white px-8">Ranking da Sala</h2>
                            <p className="text-purple-300 text-sm mt-1 mb-4">Top 10 Jogadores</p>

                            {isProfessor && (
                                <button
                                    onClick={downloadAllReports}
                                    className="inline-flex items-center gap-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-blue-500/40 transition-all mb-2"
                                >
                                    <Download size={14} /> Baixar Relatório Geral (Todos)
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <ClipboardList size={40} className="text-blue-400 mx-auto mb-2 drop-shadow-lg" />
                            <h2 className="text-2xl font-black text-white truncate px-10">Desempenho: {sessionDetails.nickname}</h2>
                            <p className="text-purple-300 text-sm mt-1">Detalhes das respostas</p>
                        </>
                    )}
                </div>

                {/* Content: List or Details */}
                {!sessionDetails ? (
                    <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : ranking.length === 0 ? (
                            <p className="text-center text-purple-300 py-8">Nenhum jogador ainda.</p>
                        ) : (
                            ranking.map((entry, index) => {
                                const isCurrentPlayer = entry.nickname === playerNickname && entry.score === playerScore;
                                const isPlaying = entry.status === 'em_andamento';
                                return (
                                    <motion.div
                                        key={entry._id || index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-center gap-3 p-3 rounded-xl border ${getMedalBg(index)} ${isCurrentPlayer ? 'ring-2 ring-yellow-400/60' : ''}`}
                                    >
                                        {/* Position */}
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-lg ${getMedalColor(index)}`}>
                                            {index < 3 ? <Medal size={22} /> : <span className="text-sm">{index + 1}º</span>}
                                        </div>

                                        {/* Name & Status */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-bold text-sm truncate ${isCurrentPlayer ? 'text-yellow-400' : 'text-white'}`}>
                                                    {entry.nickname} {isCurrentPlayer && '(Você)'}
                                                </p>
                                                {isPlaying && (
                                                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Jogando agora"></span>
                                                )}
                                            </div>
                                            {isPlaying && (
                                                <p className="text-[9px] text-green-400 font-bold uppercase tracking-tighter">Jogando...</p>
                                            )}
                                        </div>

                                        {/* Score & Actions */}
                                        <div className="flex items-center gap-4">
                                            <div className={`font-black text-lg ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                                {entry.score}
                                            </div>
                                            {isProfessor && entry.playerSessionId && (
                                                <button
                                                    onClick={() => handleViewDetails(entry.playerSessionId)}
                                                    className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition-colors border border-blue-500/30"
                                                    title="Ver Detalhes"
                                                >
                                                    <ClipboardList size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-y-auto flex-1 space-y-4 pr-1 custom-scrollbar mb-4">
                            {sessionDetails.historico.length === 0 ? (
                                <p className="text-center text-purple-300 py-8">Nenhum dado de respostas disponível.</p>
                            ) : (
                                sessionDetails.historico.map((h, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                                        <div className="flex gap-2">
                                            <span className="bg-purple-600/50 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shrink-0 border border-purple-400/30">
                                                {i + 1}
                                            </span>
                                            <p className="text-white text-sm font-medium leading-relaxed">{h.enunciado}</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                            <div className={`p-2 rounded-lg border ${h.correto ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                                                <span className="opacity-60 block mb-1 font-bold uppercase tracking-tighter text-[9px]">Sua Resposta</span>
                                                <span className="font-bold">{h.resposta_usuario === '__TEMPO_ESGOTADO__' ? '⏰ Tempo Esgotado' : h.resposta_usuario}</span>
                                            </div>
                                            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-2 rounded-lg">
                                                <span className="opacity-60 block mb-1 font-bold uppercase tracking-tighter text-[9px]">Correta</span>
                                                <span className="font-bold">{h.resposta_correta}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            onClick={downloadReport}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transform transition-all active:scale-95 shadow-xl shadow-blue-900/40"
                        >
                            <Download size={20} />
                            BAIXAR RELATÓRIO (.TXT)
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default RankingModal;
