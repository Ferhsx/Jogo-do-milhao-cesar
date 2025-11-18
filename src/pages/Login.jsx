import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importe o useNavigate para navegação
import { api } from '../service/mockApi'; // Verifique se o caminho está correto

function Login() {
    // Vamos usar um único estado para o formulário, fica mais organizado
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(''); // Estado para guardar mensagens de erro

    // 2. Inicialize o hook de navegação
    const navigate = useNavigate();

    // Função para atualizar o estado do formulário
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    
    const handleLogin = async (e) => {
        e.preventDefault(); // Previne o recarregamento da página
        setError(''); // Limpa erros anteriores
        
        if (!formData.username || !formData.password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        const response = await api.login(formData.username, formData.password);
        if (response.success) {
            localStorage.setItem('token', response.token);
            navigate('/dashboard'); // 3. Navega para o dashboard de forma programática
        } else {
            setError(response.message); // Exibe o erro na tela
        }
    };
    
    const handleRegister = async () => { // Removido o 'e' que não era usado
        setError('');
        
        if (!formData.username || !formData.password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        const response = await api.register(formData.username, formData.password);
        if (response.success) {
            localStorage.setItem('token', response.token);
            navigate('/dashboard');
        } else {
            setError(response.message);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-6">Painel do Professor</h1>
                {/* 4. Conectando os inputs ao estado com 'value' e 'onChange' */}
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <input 
                        type="text" 
                        name="username" // O 'name' deve corresponder à chave no estado
                        placeholder="Usuário" 
                        value={formData.username}
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
                    
                    {/* Exibe a mensagem de erro, se houver */}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    {/* 5. Simplificando os botões */}
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        Entrar
                    </button>
                    <button type="button" onClick={handleRegister} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;