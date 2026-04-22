import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, HomeIcon } from 'lucide-react';
import RankingModal from './RankingModal';

function GameOverScreen({ score, feedback, exibirRanking, roomId, nickname }) {
    const navigate = useNavigate();
    const [showRanking, setShowRanking] = useState(false);

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

export default GameOverScreen;
