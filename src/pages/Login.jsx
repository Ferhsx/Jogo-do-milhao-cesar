import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../service/api';
import { motion } from 'framer-motion';
import { Lock, Mail, User, ArrowRight, LayoutDashboard } from 'lucide-react';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError('Por favor, preencha email e senha.');
            setLoading(false);
            return;
        }

        const response = await api.login(formData.email, formData.password);
        if (response.success) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            navigate('/dashboard');
        } else {
            setError(response.message);
        }
        setLoading(false);
    };

    const handleRegister = async () => {
        setError('');
        setLoading(true);

        if (!formData.email || !formData.password || !formData.name) {
            setError('Por favor, preencha todos os campos para cadastro.');
            setLoading(false);
            return;
        }

        const response = await api.register(formData.name, formData.email, formData.password);
        if (response.success) {
            alert("Cadastro realizado! Faça login.");
        } else {
            setError(response.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-show-radial">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 md:p-10 rounded-[40px] w-full max-w-md relative overflow-hidden"
            >
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 rounded-full flex items-center justify-center mb-4 border-4 border-yellow-200 shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                        <LayoutDashboard className="text-blue-950" size={36} />
                    </div>
                    <h1 className="text-3xl font-black text-white drop-shadow-md">Acesso Professor</h1>
                    <p className="text-yellow-400 mt-2 text-sm font-bold uppercase tracking-widest">Gerencie seus jogos e questões</p>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="text-blue-300 group-focus-within:text-yellow-400 transition-colors" size={20} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-[#000c24]/80 text-white rounded-full border-2 border-blue-500/50 focus:border-yellow-400 focus:bg-black/90 focus:outline-none transition-all font-bold placeholder-blue-300/50 shadow-inner"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="text-blue-300 group-focus-within:text-yellow-400 transition-colors" size={20} />
                        </div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Senha"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-[#000c24]/80 text-white rounded-full border-2 border-blue-500/50 focus:border-yellow-400 focus:bg-black/90 focus:outline-none transition-all font-bold placeholder-blue-300/50 shadow-inner"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="text-blue-300 group-focus-within:text-yellow-400 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nome (Apenas para Cadastro)"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-[#000c24]/80 text-white rounded-full border-2 border-blue-500/50 focus:border-yellow-400 focus:bg-black/90 focus:outline-none transition-all font-bold placeholder-blue-300/50 shadow-inner"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/20 text-red-100 text-sm flex items-center gap-2 border border-red-500/30">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-950 font-black text-lg rounded-full shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:shadow-[0_0_25px_rgba(255,215,0,0.8)] border border-yellow-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98] uppercase tracking-widest"
                    >
                        {loading ? 'Entrando...' : (
                            <>Entrar <ArrowRight size={20} /></>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full py-3 bg-blue-900/50 text-yellow-300 font-bold rounded-full hover:bg-blue-800 transition-all text-sm border border-blue-500/30"
                    >
                        Cadastrar Novo Admin
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-blue-300 hover:text-white text-xs text-center mt-2 underline"
                    >
                        Voltar para o Jogo
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default Login;