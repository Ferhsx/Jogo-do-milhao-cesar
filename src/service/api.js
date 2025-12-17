const API_URL = `http://${window.location.hostname}:3000/api`;

// Função auxiliar para lidar com as respostas
const handleResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        // Se der erro de autenticação (401), desloga o usuário
        if (response.status === 401) {
            localStorage.removeItem('token');
            // Redireciona para o login e recarrega para limpar estados
            window.location.href = '/login';
            return;
        }

        // Se der erro (400, 500), lança exceção para ser pega no catch
        const errorMsg = (data && data.message) || response.statusText;
        throw new Error(errorMsg);
    }

    // Padroniza o retorno para o formato que nossos componentes já esperam: { success: true, data: ... }
    return { success: true, data: data };
};

// Função para pegar o token salvo
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    };
};

export const api = {
    // --- AUTENTICAÇÃO ---

    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Backend espera "email", frontend pode estar enviando username, vamos garantir
                body: JSON.stringify({ email, password }),
            });
            const result = await handleResponse(response);

            // O backend retorna { token, user: {...} } direto em data
            // Ajustamos para retornar no formato que o Login.jsx espera
            return {
                success: true,
                token: result.data.token,
                user: result.data.user
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    register: async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            await handleResponse(response);
            return { success: true, message: 'Cadastro realizado com sucesso!' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // --- QUESTÕES (ADMIN) ---

    getQuestions: async () => {
        try {
            const response = await fetch(`${API_URL}/questions`, {
                headers: getAuthHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    createQuestion: async (questionData) => {
        try {
            const response = await fetch(`${API_URL}/questions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(questionData)
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    updateQuestion: async (id, questionData) => {
        try {
            const response = await fetch(`${API_URL}/questions/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(questionData)
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    importQuestions: async (text) => {
        try {
            const response = await fetch(`${API_URL}/questions/import`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ text })
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    deleteQuestion: async (id) => {
        try {
            const response = await fetch(`${API_URL}/questions/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (response.ok) return { success: true };
            throw new Error('Erro ao deletar');
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    getAllThemes: async () => {
        try {
            const response = await fetch(`${API_URL}/themes`, {
                headers: getAuthHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            // Fallback se falhar
            return { success: true, data: [] };
        }
    },

    // --- CONFIGURAÇÃO (ADMIN) ---

    getConfig: async () => {
        try {
            const response = await fetch(`${API_URL}/config`, { headers: getAuthHeaders() });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    saveConfig: async (configData) => {
        try {
            const response = await fetch(`${API_URL}/config`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(configData)
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    resetHistory: async () => {
        try {
            const response = await fetch(`${API_URL}/admin/reset`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    createRoom: async (configData) => {
        try {
            const response = await fetch(`${API_URL}/rooms`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(configData)
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // --- JOGO (JOGADOR) ---

    startGame: async (pin, nickname) => {
        try {
            const response = await fetch(`${API_URL}/game/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin, nickname })
            });
            const result = await handleResponse(response);
            return {
                success: true,
                sessionId: result.data.sessionStr,
                question: result.data.question
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Novo método para criar sala
    createRoom: async (configData) => {
        try {
            const response = await fetch(`${API_URL}/rooms`, { // Nova rota no backend
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ config: configData })
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    sendAnswer: async (sessionId, questionId, answer) => {
        try {
            const response = await fetch(`${API_URL}/game/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, questionId, answer })
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    useHelp: async (sessionId, type, questionId) => {
        try {
            const response = await fetch(`${API_URL}/game/help`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, type, questionId })
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};