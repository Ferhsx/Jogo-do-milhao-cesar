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
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 md:p-10 rounded-3xl w-full max-w-md border-t border-white/20"
            >
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner">
                        <LayoutDashboard className="text-yellow-400" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white">Acesso Professor</h1>
                    <p className="text-purple-200 mt-2 text-sm">Gerencie seus jogos e questões</p>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="text-purple-300 group-focus-within:text-yellow-400 transition-colors" size={20} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-black/20 text-white rounded-xl border border-purple-500/30 focus:border-yellow-400 focus:bg-black/40 focus:outline-none transition-all placeholder-purple-300/50"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="text-purple-300 group-focus-within:text-yellow-400 transition-colors" size={20} />
                        </div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Senha"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-black/20 text-white rounded-xl border border-purple-500/30 focus:border-yellow-400 focus:bg-black/40 focus:outline-none transition-all placeholder-purple-300/50"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="text-purple-300 group-focus-within:text-yellow-400 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nome (Apenas para Cadastro)"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-black/20 text-white rounded-xl border border-purple-500/30 focus:border-yellow-400 focus:bg-black/40 focus:outline-none transition-all placeholder-purple-300/50"
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
                        className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {loading ? 'Entrando...' : (
                            <>Entrar <ArrowRight size={20} /></>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full py-3 bg-white/10 text-purple-200 font-semibold rounded-xl hover:bg-white/20 hover:text-white transition-all text-sm border border-white/5"
                    >
                        Cadastrar Novo Admin
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-purple-300/60 hover:text-white text-xs text-center mt-2 underline"
                    >
                        Voltar para o Jogo
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default Login;