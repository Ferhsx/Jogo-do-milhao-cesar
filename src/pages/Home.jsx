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
                    nickname: nickname || 'Jogador'
                }
            });
        } else {
            alert("Erro ao iniciar: " + response.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 flex flex-col items-center justify-center p-4 overflow-hidden relative">

            {/* Background Animated Shapes */}
            <motion.div
                animate={{ rotate: 360, y: [0, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-30"
            />
            <motion.div
                animate={{ rotate: -360, x: [0, 30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-20 right-10 w-48 h-48 bg-pink-500 rounded-full blur-3xl opacity-30"
            />

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="glass p-8 md:p-12 rounded-3xl w-full max-w-md z-10 border-t border-white/30 perspective-1000"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="inline-flex items-center justify-center p-4 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm shadow-inner"
                    >
                        <Gamepad2 size={48} className="text-yellow-400" />
                    </motion.div>
                    <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg font-sans">
                        QUIZ<span className="text-yellow-400">APP</span>
                    </h1>
                    <p className="text-purple-200 mt-2 font-medium">Pronto para o desafio?</p>
                </div>

                <form onSubmit={handleEnterGame} className="flex flex-col gap-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-purple-300 group-focus-within:text-yellow-400 transition-colors">#</span>
                            </div>
                            <input
                                type="text"
                                placeholder="PIN DA SALA"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full pl-10 pr-4 py-4 bg-black/20 text-white rounded-xl border border-purple-500/30 focus:border-yellow-400 focus:bg-black/40 focus:outline-none transition-all font-bold placeholder-purple-300/50 text-center tracking-widest text-xl shadow-inner"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="text-purple-300 group-focus-within:text-yellow-400 transition-colors" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="SEU APELIDO"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 text-white rounded-xl border border-purple-500/30 focus:border-yellow-400 focus:bg-black/40 focus:outline-none transition-all font-bold placeholder-purple-300/50"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-black text-xl rounded-xl shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="flex items-center gap-2 text-purple-200/60 hover:text-white transition-colors bg-white/5 px-6 py-2 rounded-full hover:bg-white/10 backdrop-blur-sm"
                >
                    <GraduationCap size={18} />
                    Sou Professor
                </button>
            </motion.div>
        </div>
    );
}

export default Home;