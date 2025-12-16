// src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../service/api';

function Home() {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEnterGame = async (e) => {
        e.preventDefault(); // Previne refresh se der enter no form
        setLoading(true);

        if(!pin || !nickname){
            alert("Preencha todos os campos");
            setLoading(false);
            return;
        }

        // 1. Chama a API para criar a sessão
        const response = await api.startGame(pin, nickname);

        if (response.success) {
            // 2. Navega para a tela de jogo levando os dados (sessão e 1ª pergunta)
            // Usamos o 'state' do navigate para passar dados sem sujar a URL
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
        <div className="min-h-screen bg-purple-700 flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {/* Formas Geométricas de Fundo (Estilo Kahoot) */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-red-500 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400 rotate-45 opacity-20"></div>
            
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md z-10">
                <h1 className="text-4xl font-black text-center text-gray-800 mb-8 font-sans">
                    QUIZ<span className="text-purple-600">APP</span>
                </h1>

                <form onSubmit={handleEnterGame} className="flex flex-col gap-4">

                    <input
                        type="text"
                        placeholder="Pin da sala"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-4 text-center text-xl font-bold bg-gray-100 border-b-4 border-gray-300 rounded focus:border-purple-500 focus:outline-none placeholder-gray-400 text-gray-700"
                    />

                    <input 
                        type="text" 
                        placeholder="Seu Apelido" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full p-4 text-center text-xl font-bold bg-gray-100 border-b-4 border-gray-300 rounded focus:border-purple-500 focus:outline-none placeholder-gray-400 text-gray-700"
                    />
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gray-900 text-white font-bold text-xl rounded shadow-[0_4px_0_rgb(0,0,0)] active:shadow-none active:translate-y-1 transition-all hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'ENTRAR'}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-white/50 text-sm">
                <button onClick={() => navigate('/login')} className="hover:text-white underline">
                    Acesso Professor
                </button>
            </div>
        </div>
    );
}

export default Home;