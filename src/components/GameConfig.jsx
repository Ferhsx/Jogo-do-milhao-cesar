import React, { useState, useEffect } from 'react';
import { api } from '../service/api';
import { Settings, RefreshCw, PlayCircle, Hash, Copy } from 'lucide-react';

function GameConfig() {
    const [config, setConfig] = useState({
        temas_ativos: [],
        modo_de_jogo: 'classico',
        permitir_repeticao: false,
    });
    const [availableThemes, setAvailableThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(''); // Para feedback ao usuário
    const [createdPin, setCreatedPin] = useState(null);

    // Busca os dados iniciais (configuração atual e temas disponíveis)
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const configResponse = await api.getConfig();
                const themesResponse = await api.getAllThemes();

                if (configResponse.success) {
                    setConfig(configResponse.data);
                }
                if (themesResponse.success) {
                    setAvailableThemes(themesResponse.data);
                }
            } catch (error) {
                setMessage('Erro ao carregar configurações.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleThemeChange = (theme) => {
        const newThemes = config.temas_ativos.includes(theme)
            ? config.temas_ativos.filter(t => t !== theme) // Desmarca
            : [...config.temas_ativos, theme]; // Marca

        setConfig(prev => ({ ...prev, temas_ativos: newThemes }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setConfig(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async () => {
        setMessage('Salvando...');
        const response = await api.saveConfig(config);
        if (response.success) {
            setMessage('Configurações salvas!');
        } else {
            setMessage('Falha ao salvar.');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleResetHistory = async () => {
        if (window.confirm("Isso limpará o histórico de questões usadas de TODOS os jogadores. Deseja continuar?")) {
            setMessage('Resetando...');
            const response = await api.resetHistory();
            if (response.success) {
                setMessage('Histórico resetado!');
            } else {
                setMessage('Falha ao resetar.');
            }
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleCreateRoom = async () => {
        try {
            setMessage('Criando sala...');
            const response = await api.createRoom(config);
            if (response.success) {
                setCreatedPin(response.data.pin); // Backend retorna o PIN
                setMessage('');
            } else {
                setMessage('Erro ao criar sala: ' + (response.message || 'Falha desconhecida'));
                setTimeout(() => setMessage(''), 5000);
            }
        } catch (error) {
            setMessage('Erro de conexão ao criar sala.');
            setTimeout(() => setMessage(''), 5000);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">

            {createdPin ? (
                <div className="flex flex-col items-center justify-center py-8 animate-scale-in">
                    <div className="bg-purple-600 text-white p-8 md:p-12 text-center rounded-2xl shadow-xl max-w-lg w-full">
                        <h3 className="text-xl md:text-2xl font-bold mb-2 opacity-90">Sala Pronta!</h3>
                        <p className="text-purple-200 mb-6 text-sm">Compartilhe o código abaixo com seus alunos</p>

                        <div className="relative inline-block group cursor-pointer" onClick={() => navigator.clipboard.writeText(createdPin)}>
                            <div className="bg-white/10 text-6xl font-black tracking-[0.2em] px-8 py-4 rounded-xl border-2 border-white/20 shadow-inner backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                                {createdPin}
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                Clique para copiar
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setCreatedPin(null)}
                                className="text-white/60 hover:text-white underline text-sm transition-colors"
                            >
                                Gerar novo código
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {/* Seleção de Temas */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Hash size={14} /> Temas Ativos
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableThemes.map(theme => (
                                    <label key={theme} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-all shadow-sm">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={config.temas_ativos.includes(theme)}
                                                onChange={() => handleThemeChange(theme)}
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-purple-500 checked:bg-purple-500 hover:border-purple-400"
                                            />
                                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 capitalize">{theme}</span>
                                    </label>
                                ))}
                                {availableThemes.length === 0 && <p className="text-gray-400 text-sm">Nenhum tema encontrado.</p>}
                            </div>
                        </div>

                        {/* Configurações Gerais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Settings size={14} /> Modo de Jogo
                                </h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-purple-300 transition-colors">
                                        <input type="radio" name="modo_de_jogo" value="classico" checked={config.modo_de_jogo === 'classico'} onChange={handleChange} className="text-purple-600 focus:ring-purple-500 h-4 w-4" />
                                        <span className="text-sm font-medium">Clássico</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-purple-300 transition-colors">
                                        <input type="radio" name="modo_de_jogo" value="alternativo" checked={config.modo_de_jogo === 'alternativo'} onChange={handleChange} className="text-purple-600 focus:ring-purple-500 h-4 w-4" />
                                        <span className="text-sm font-medium">Alternativo</span>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    Outras Opções
                                </h3>
                                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-purple-300 transition-colors mb-auto">
                                    <input type="checkbox" name="permitir_repeticao" checked={config.permitir_repeticao} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                    <span className="text-sm font-medium">Repetir perguntas já usadas</span>
                                </label>

                                <button onClick={handleResetHistory} className="mt-4 flex items-center justify-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors border border-dashed border-red-200 hover:border-red-300 text-sm">
                                    <RefreshCw size={14} />
                                    Resetar Histórico
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-between pt-4 gap-4">
                        <button
                            onClick={handleSave}
                            disabled={!!message}
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95 disabled:opacity-50 text-sm"
                        >
                            {message || 'Salvar Alterações'}
                        </button>

                        <button
                            onClick={handleCreateRoom}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold py-3 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
                        >
                            <PlayCircle size={24} />
                            CRIAR SALA
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default GameConfig;