import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionManager from '../components/QuestionManager';
import GameConfig from '../components/GameConfig'; 

function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Cabeçalho */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Painel do Professor</h1>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="container mx-auto px-6 py-8 space-y-8">
                {/* Gerenciador de Questões */}
                <QuestionManager />
                <GameConfig />
            </main>
        </div>
    );
}

export default Dashboard;