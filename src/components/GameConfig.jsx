import React, { useState, useEffect } from 'react';
import { api } from '../service/api';

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
                const themesResponse = await api.getAllThemes(); // Precisamos desta função na API mock

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
            setMessage('Configurações salvas com sucesso!');
        } else {
            setMessage('Falha ao salvar as configurações.');
        }
        // Limpa a mensagem após alguns segundos
        setTimeout(() => setMessage(''), 3000);
    };

    const handleResetHistory = async () => {
        if (window.confirm("Isso limpará o histórico de questões usadas de TODOS os jogadores. Deseja continuar?")) {
            setMessage('Resetando...');
            const response = await api.resetHistory();
            if (response.success) {
                setMessage('Histórico resetado com sucesso!');
            } else {
                setMessage('Falha ao resetar o histórico.');
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
                setMessage(''); // Limpa mensagem de status se deu certo (mudará a tela)
            } else {
                setMessage('Erro ao criar sala: ' + (response.message || 'Falha desconhecida'));
                setTimeout(() => setMessage(''), 5000);
            }
        } catch (error) {
            setMessage('Erro de conexão ao criar sala.');
            setTimeout(() => setMessage(''), 5000);
        }
    };

    if (loading) return <p>Carregando configurações...</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">

            {createdPin ? (
                <div className="bg-purple-100 border-2 border-purple-500 p-8 text-center rounded-xl mb-6">
                    <h3 className="text-xl text-purple-900 mb-2">Sala Criada com Sucesso!</h3>
                    <p className="text-sm text-gray-600 mb-4">Compartilhe este código com seus alunos:</p>
                    <div className="text-6xl font-black text-purple-700 tracking-widest bg-white inline-block px-8 py-4 rounded shadow-inner">
                        {createdPin}
                    </div>
                    <button
                        onClick={() => setCreatedPin(null)}
                        className="block mx-auto mt-6 text-purple-600 underline"
                    >
                        Criar outra sala
                    </button>
                </div>
            ) : (
                <>
                    <h2 className="text-2xl font-semibold mb-4">Configuração do Jogo</h2>

                    <div className="space-y-6">
                        {/* Seleção de Temas */}
                        <div>
                            <h3 className="text-lg font-medium">Temas Ativos</h3>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                {availableThemes.map(theme => (
                                    <label key={theme} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={config.temas_ativos.includes(theme)}
                                            onChange={() => handleThemeChange(theme)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>{theme}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Modo de Jogo */}
                        <div>
                            <h3 className="text-lg font-medium">Modo de Jogo</h3>
                            <div className="mt-2 flex gap-4">
                                <label className="flex items-center">
                                    <input type="radio" name="modo_de_jogo" value="classico" checked={config.modo_de_jogo === 'classico'} onChange={handleChange} className="mr-2" />
                                    Clássico
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="modo_de_jogo" value="alternativo" checked={config.modo_de_jogo === 'alternativo'} onChange={handleChange} className="mr-2" />
                                    Alternativo
                                </label>
                            </div>
                        </div>

                        {/* Permitir Repetição */}
                        <div>
                            <label className="flex items-center">
                                <input type="checkbox" name="permitir_repeticao" checked={config.permitir_repeticao} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                                Permitir repetição de questões já usadas
                            </label>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="mt-8 pt-4 border-t flex justify-between items-center">
                        <div>
                            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Salvar Configurações
                            </button>
                            {message && <span className="ml-4 text-gray-600">{message}</span>}
                        </div>
                        <button onClick={handleResetHistory} className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                            Resetar Histórico dos Jogadores
                        </button>
                    </div>

                    <div className="mt-8 pt-4 border-t">
                        <button
                            onClick={handleCreateRoom}
                            className="w-full bg-blue-600 text-white text-xl font-bold py-4 rounded shadow hover:bg-blue-700 transition-transform hover:scale-[1.02]"
                        >
                            CRIAR SALA AO VIVO
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default GameConfig;