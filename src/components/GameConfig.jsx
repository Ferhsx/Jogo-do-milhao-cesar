import React, { useState, useEffect } from 'react';
import { api } from '../service/api';
import { Settings, RefreshCw, PlayCircle, Hash, Clock, Eye, EyeOff, Trophy, Zap } from 'lucide-react';
import RankingModal from './RankingModal';

function GameConfig() {
    const [config, setConfig] = useState({
        temas_ativos: [],
        modo_de_jogo: 'classico',
        permitir_repeticao: false,
        tempo_base: 0,
        modo_tempo: 'fixo',
        esconder_nivel_visual: false,
        exibir_ranking: true,
    });
    const [availableThemes, setAvailableThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [createdPin, setCreatedPin] = useState(() => localStorage.getItem('activeRoomPin'));
    const [activeRoomId, setActiveRoomId] = useState(() => localStorage.getItem('activeRoomId'));
    const [showRanking, setShowRanking] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const configResponse = await api.getConfig();
                const themesResponse = await api.getAllThemes();
                if (configResponse.success) setConfig(prev => ({ ...prev, ...configResponse.data }));
                if (themesResponse.success) setAvailableThemes(themesResponse.data);
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
            ? config.temas_ativos.filter(t => t !== theme)
            : [...config.temas_ativos, theme];
        setConfig(prev => ({ ...prev, temas_ativos: newThemes }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue;
        if (type === 'checkbox') newValue = checked;
        else if (type === 'number') newValue = Number(value);
        else newValue = value;
        setConfig(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async () => {
        setMessage('Salvando...');
        const response = await api.saveConfig(config);
        setMessage(response.success ? 'Configurações salvas!' : 'Falha ao salvar.');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleResetHistory = async () => {
        if (window.confirm("Isso limpará o histórico de questões usadas de TODOS os jogadores. Deseja continuar?")) {
            setMessage('Resetando...');
            const response = await api.resetHistory();
            setMessage(response.success ? 'Histórico resetado!' : 'Falha ao resetar.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleCreateRoom = async () => {
        try {
            setMessage('Criando sala...');
            const response = await api.createRoom(config);
            if (response.success) {
                setCreatedPin(response.data.pin);
                setActiveRoomId(response.data.roomId);

                if (response.data.pin) localStorage.setItem('activeRoomPin', response.data.pin);
                if (response.data.roomId) localStorage.setItem('activeRoomId', response.data.roomId);

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
                    <div className="bg-blue-900/50 border-2 border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.3)] text-white p-8 md:p-12 text-center rounded-3xl max-w-lg w-full">
                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-yellow-400">Sala Pronta!</h3>
                        <p className="text-blue-200 mb-6 text-sm font-bold">Compartilhe o código abaixo com seus alunos</p>
                        <div
                            className="relative inline-block group cursor-pointer"
                            onClick={() => {
                                if (navigator.clipboard) {
                                    navigator.clipboard.writeText(createdPin);
                                } else {
                                    alert("PIN: " + createdPin + " (Cópia automática não disponível no seu navegador)");
                                }
                            }}
                        >
                            <div className="bg-[#000c24]/80 text-yellow-400 text-6xl font-black tracking-[0.2em] px-8 py-4 rounded-xl border-2 border-yellow-500/50 shadow-inner backdrop-blur-sm group-hover:bg-black/80 transition-colors">
                                {createdPin}
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-yellow-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                Clique para copiar
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col gap-3">
                            <button
                                onClick={() => setShowRanking(true)}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-black py-4 rounded-xl flex items-center justify-center gap-2 transform transition-all active:scale-95 shadow-lg"
                            >
                                <Trophy size={20} />
                                VER RANKING E RELATÓRIOS
                            </button>
                            <button onClick={() => {
                                setCreatedPin(null);
                                setActiveRoomId(null);
                                localStorage.removeItem('activeRoomPin');
                                localStorage.removeItem('activeRoomId');
                            }} className="text-white/60 hover:text-white underline text-sm transition-colors mt-2">
                                Gerar novo código
                            </button>
                        </div>
                    </div>

                    {showRanking && (
                        <RankingModal
                            roomId={activeRoomId}
                            onClose={() => setShowRanking(false)}
                            isProfessor={true}
                        />
                    )}
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {/* Seleção de Temas */}
                        <div className="bg-[#000c24]/50 p-4 rounded-xl border border-blue-500/30">
                            <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Hash size={14} /> Temas Ativos
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableThemes.map(theme => (
                                    <label key={theme} className="flex items-center gap-3 p-3 bg-blue-900/40 border border-blue-500/50 rounded-lg cursor-pointer hover:border-yellow-400 transition-all shadow-sm">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={config.temas_ativos.includes(theme)}
                                                onChange={() => handleThemeChange(theme)}
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-blue-400 shadow-sm transition-all checked:border-yellow-400 checked:bg-yellow-500 hover:border-yellow-300"
                                            />
                                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-900 opacity-0 peer-checked:opacity-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-blue-100 capitalize">{theme}</span>
                                    </label>
                                ))}
                                {availableThemes.length === 0 && <p className="text-blue-300 text-sm">Nenhum tema encontrado.</p>}
                            </div>
                        </div>

                        {/* Configurações Gerais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Modo de Jogo */}
                            <div className="bg-[#000c24]/50 p-4 rounded-xl border border-blue-500/30">
                                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Settings size={14} /> Modo de Jogo
                                </h3>
                                <div className="space-y-2 text-white">
                                    <label className="flex items-center gap-3 p-3 bg-blue-900/40 rounded-lg border border-blue-500/50 cursor-pointer hover:border-yellow-400 transition-colors">
                                        <input type="radio" name="modo_de_jogo" value="classico" checked={config.modo_de_jogo === 'classico'} onChange={handleChange} className="text-yellow-500 focus:ring-yellow-500 h-4 w-4" />
                                        <span className="text-sm font-bold">Clássico</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-blue-900/40 rounded-lg border border-blue-500/50 cursor-pointer hover:border-yellow-400 transition-colors">
                                        <input type="radio" name="modo_de_jogo" value="alternativo" checked={config.modo_de_jogo === 'alternativo'} onChange={handleChange} className="text-yellow-500 focus:ring-yellow-500 h-4 w-4" />
                                        <span className="text-sm font-bold">Alternativo</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${config.modo_de_jogo === 'personalizado'
                                        ? 'bg-blue-800 border-yellow-400 ring-2 ring-yellow-500/50'
                                        : 'bg-blue-900/40 border-blue-500/50 hover:border-yellow-400'
                                        }`}>
                                        <input type="radio" name="modo_de_jogo" value="personalizado" checked={config.modo_de_jogo === 'personalizado'} onChange={handleChange} className="text-yellow-500 focus:ring-yellow-500 h-4 w-4" />
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-yellow-400" />
                                            <span className="text-sm font-bold">Personalizado</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Outras Opções */}
                            <div className="bg-[#000c24]/50 p-4 rounded-xl border border-blue-500/30 flex flex-col text-white">
                                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    Outras Opções
                                </h3>
                                <label className="flex items-center gap-3 p-3 bg-blue-900/40 rounded-lg border border-blue-500/50 cursor-pointer hover:border-yellow-400 transition-colors mb-auto">
                                    <input type="checkbox" name="permitir_repeticao" checked={config.permitir_repeticao} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
                                    <span className="text-sm font-bold">Repetir perguntas já usadas</span>
                                </label>
                                <button onClick={handleResetHistory} className="mt-4 flex items-center justify-center gap-2 text-red-400 hover:text-white hover:bg-red-900/50 p-2 rounded-lg transition-colors border border-dashed border-red-500/30 text-sm font-bold">
                                    <RefreshCw size={14} />
                                    Resetar Histórico
                                </button>
                            </div>
                        </div>

                        {/* Seção Personalizado — só aparece quando o modo "personalizado" está selecionado */}
                        {config.modo_de_jogo === 'personalizado' && (
                            <div className="bg-blue-900/30 p-5 rounded-xl border border-yellow-500/50">
                                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Zap size={14} /> Configurações do Modo Personalizado
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                                    {/* Timer */}
                                    <div className="bg-[#000c24]/60 p-4 rounded-xl border border-blue-500/30 shadow-sm">
                                        <label className="flex items-center gap-2 text-sm font-bold text-blue-100 mb-2">
                                            <Clock size={14} className="text-yellow-400" /> Tempo por Pergunta
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                name="tempo_base"
                                                value={config.tempo_base}
                                                onChange={handleChange}
                                                min={0}
                                                max={300}
                                                placeholder="0"
                                                className="w-24 px-3 py-2 border border-blue-500/50 bg-blue-900/50 text-white rounded-lg text-center font-bold text-lg focus:border-yellow-400 outline-none"
                                            />
                                            <span className="text-sm text-blue-200">segundos <span className="text-xs opacity-70">(0 = sem tempo)</span></span>
                                        </div>
                                        {config.tempo_base > 0 && (
                                            <div className="mt-3">
                                                <label className="text-xs font-bold text-blue-300 uppercase mb-1 block">Modo do Tempo</label>
                                                <select
                                                    name="modo_tempo"
                                                    value={config.modo_tempo}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-blue-500/50 bg-blue-900/50 rounded-lg text-sm focus:border-yellow-400 text-white outline-none"
                                                >
                                                    <option value="fixo">⏱️ Fixo (mesmo tempo sempre)</option>
                                                    <option value="regressivo">🔥 Regressivo (menos tempo em níveis altos)</option>
                                                    <option value="progressivo">🧊 Progressivo (mais tempo em níveis altos)</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Visual / Ranking */}
                                    <div className="bg-[#000c24]/60 p-4 rounded-xl border border-blue-500/30 shadow-sm space-y-3">
                                        <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-colors">
                                            <input type="checkbox" name="esconder_nivel_visual" checked={config.esconder_nivel_visual} onChange={handleChange} className="h-5 w-5 rounded border-blue-500 text-yellow-500 focus:ring-yellow-500" />
                                            <div className="flex items-center gap-2">
                                                {config.esconder_nivel_visual ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-yellow-400" />}
                                                <span className="text-sm font-bold">Esconder nível da pergunta</span>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-colors">
                                            <input type="checkbox" name="exibir_ranking" checked={config.exibir_ranking} onChange={handleChange} className="h-5 w-5 rounded border-blue-500 text-yellow-500 focus:ring-yellow-500" />
                                            <div className="flex items-center gap-2">
                                                <Trophy size={14} className={config.exibir_ranking ? "text-yellow-400" : "text-gray-500"} />
                                                <span className="text-sm font-bold">Ativar Ranking (Leaderboard)</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-between pt-4 gap-4">
                        <button
                            onClick={handleSave}
                            disabled={!!message}
                            className="px-6 py-3 bg-blue-900 border border-blue-500 text-yellow-400 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg active:scale-95 disabled:opacity-50 text-sm"
                        >
                            {message || 'Salvar Alterações'}
                        </button>
                        <button
                            onClick={handleCreateRoom}
                            className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-blue-950 text-lg font-black py-3 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:shadow-[0_0_20px_rgba(255,215,0,0.6)] transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wider"
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