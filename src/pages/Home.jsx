import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../service/mockApi';

function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleStartGame = async () => {
        setLoading(true);
        // Aqui simularíamos o POST /game/start
        // Como nosso mock de questões é simples, vamos apenas navegar para a tela do jogo
        // Na implementação real, receberíamos um id_sessao aqui.
        
        // Simula um delay de carregamento
        setTimeout(() => {
            navigate('/game');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white px-4">
            <div className="text-center space-y-8 max-w-lg">
                <h1 className="text-5xl font-extrabold drop-shadow-lg">
                    Quiz Educacional
                </h1>
                <p className="text-xl font-light opacity-90">
                    Teste seus conhecimentos e veja até onde você consegue chegar!
                </p>
                
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-xl">
                    <p className="mb-4 text-sm font-medium uppercase tracking-wider text-blue-100">
                        Pronto para o desafio?
                    </p>
                    <button 
                        onClick={handleStartGame}
                        disabled={loading}
                        className={`
                            w-full py-4 px-8 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-lg
                            ${loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300'}
                        `}
                    >
                        {loading ? 'Iniciando...' : 'INICIAR JOGO'}
                    </button>
                </div>

                <div className="mt-8 text-sm opacity-60">
                    <p>Modo Professor?</p>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="underline hover:text-yellow-300"
                    >
                        Acesse o Painel Administrativo
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;