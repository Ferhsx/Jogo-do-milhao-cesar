import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../service/api';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
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
        
        // CORREÇÃO: Usar formData.email em vez de username
        if (!formData.email || !formData.password) {
            setError('Por favor, preencha email e senha.');
            return;
        }

        const response = await api.login(formData.email, formData.password);
        if (response.success) {
            localStorage.setItem('token', response.token);
            navigate('/dashboard');
        } else {
            setError(response.message);
        }
    };
    
    const handleRegister = async () => { 
        setError('');
        
        if (!formData.email || !formData.password || !formData.name) {
            setError('Por favor, preencha todos os campos para cadastro.');
            return;
        }

        const response = await api.register(formData.name, formData.email, formData.password);
        if (response.success) {
            alert("Cadastro realizado! Faça login.");
            // Opcional: fazer login automático ou limpar form
        } else {
            setError(response.message);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-6">Painel do Professor</h1>
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <input 
                        type="email" 
                        name="email"
                        placeholder="Email" 
                        value={formData.email}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <input 
                        type="password" 
                        name="password"
                        placeholder="Senha" 
                        value={formData.password}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <input 
                        type="text" 
                        name="name"
                        placeholder="Nome (Apenas para Cadastro)"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        Entrar
                    </button>
                    <button type="button" onClick={handleRegister} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                        Cadastrar Novo Admin
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;