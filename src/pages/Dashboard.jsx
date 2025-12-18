import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionManager from '../components/QuestionManager';
import GameConfig from '../components/GameConfig';
import { LogOut, LayoutDashboard, User } from 'lucide-react';

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Professor';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Cabeçalho */}
            <header className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="text-yellow-400" />
                        <h1 className="text-xl font-bold tracking-tight">Painel do Professor</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="text-yellow-400" />
                        <h3 className="text-xl font-bold tracking-tight">{userName}</h3>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-white/10"
                    >
                        <LogOut size={16} />
                        Sair
                    </button>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="container mx-auto px-4 md:px-6 py-8 space-y-8 max-w-7xl">
                {/* Intro */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
                    <p className="text-gray-500">Gerencie as questões e inicie novas rodadas do jogo.</p>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Game Config (Lobby) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Controle do Jogo</h3>
                        <GameConfig />
                    </div>

                    {/* Question Manager - Wide if logical, but here side by side */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Banco de Questões</h3>
                        <QuestionManager />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;