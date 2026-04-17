// src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../service/api';
import { motion } from 'framer-motion';
import { Play, User, Gamepad2, GraduationCap } from 'lucide-react';

function Home() {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEnterGame = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!pin || !nickname) {
            alert("Preencha todos os campos");
            setLoading(false);
            return;
        }

        const response = await api.startGame(pin, nickname);

        if (response.success) {
            navigate('/play', {
                state: {
                    sessionId: response.sessionId,
                    firstQuestion: response.question,
                    nickname: nickname || 'Jogador',
                    gameConfig: response.config || {},
                    roomId: response.roomId || null
                }
            });
        } else {
            alert("Erro ao iniciar: " + response.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-800 via-[#000c24] to-black flex flex-col items-center justify-center p-4 overflow-hidden relative">

            {/* Background Animated Shapes */}
            <motion.div
                animate={{ rotate: 360, y: [0, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 left-10 w-64 h-64 border-[40px] border-yellow-500/10 rounded-full blur-sm"
            />
            <motion.div
                animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            />

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="glass-panel p-8 md:p-12 rounded-[40px] w-full max-w-md z-10 perspective-1000"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0, rotateY: -180 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        transition={{ delay: 0.2, type: "spring", duration: 1.5 }}
                        className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 rounded-full mb-6 shadow-[0_0_30px_rgba(255,215,0,0.6)] border-4 border-yellow-100 relative"
                    >
                        <div className="absolute inset-1 rounded-full border border-yellow-600/50"></div>
                        <span className="text-6xl font-black text-yellow-900 drop-shadow-[1px_1px_0_rgba(255,255,255,0.7)]">$</span>
                    </motion.div>
                    
                    <div className="flex flex-col items-center justify-center -mt-4 mb-2">
                        <h2 className="text-4xl md:text-5xl font-black tracking-widest text-show-inward uppercase transform -skew-x-6 z-10 relative">
                            Show
                        </h2>
                        <div className="flex items-center gap-2 mt-[-15px] z-20">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-show-outward uppercase">
                                do Cesão
                            </h1>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleEnterGame} className="flex flex-col gap-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-blue-300 group-focus-within:text-yellow-400 transition-colors">#</span>
                            </div>
                            <input
                                type="text"
                                placeholder="PIN DA SALA"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full pl-10 pr-4 py-4 bg-[#000c24]/80 text-white rounded-full border-2 border-blue-500/50 focus:border-yellow-400 focus:bg-black/90 focus:outline-none transition-all font-bold placeholder-blue-300/50 text-center tracking-widest text-xl shadow-inner"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="text-blue-300 group-focus-within:text-yellow-400 transition-colors" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="SEU APELIDO"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-[#000c24]/80 text-white rounded-full border-2 border-blue-500/50 focus:border-yellow-400 focus:bg-black/90 focus:outline-none transition-all font-bold placeholder-blue-300/50 shadow-inner"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-950 font-black text-xl rounded-full shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:shadow-[0_0_25px_rgba(255,215,0,0.8)] border border-yellow-300 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                        {loading ? (
                            <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <>
                                ENTRAR <Play size={24} className="fill-current group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-12 text-center"
            >
                <button
                    onClick={() => navigate('/login')}
                    //tornar as cores do botão para ter maior contraste com a do fundo
                    className="flex items-center gap-2 text-blue-200/60 hover:text-white transition-colors bg-blue-950 px-6 py-2 rounded-full hover:bg-yellow-400/80 backdrop-blur-sm border border-blue-500/30"
                >
                    <GraduationCap size={18} />
                    Sou Professor
                </button>
            </motion.div>
        </div>
    );
}

export default Home;