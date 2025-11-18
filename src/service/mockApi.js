const mockQuestoes = [
    {
        id: 'q1',
        tema: 'Física 1',
        dificuldade: 'muito_facil',
        enunciado: "Qual dessas mede a velocidade?",
        alternativa_correta: 'm/s',
        alternativas_incorretas: ['kg', 'J', 'W'],
        alternativas_para_eliminar: ['kg', 'J']
    },
    {
        id: 'q2',
        tema: 'Física 2',
        dificuldade: 'facil',
        enunciado: "O que é energia?",
        alternativa_correta: 'É a capacidade de realizar trabalho ou provocar mudanças',
        alternativas_incorretas: ['É um tipo especifico de materia que explode', 'É o termo usado para medir a quantidade de calor', 'É a forma que a luz se propaga'],
        alternativas_para_eliminar: ['É o termo usado para medir a quantidade de calor', 'É a forma que a luz se propaga']
    },
    {
        id: 'q3',
        tema: 'Física 2',
        dificuldade: 'medio',
        enunciado: "O empuxo exercido sobre um corpo imerso em um líquido depende:",
        alternativa_correta: 'do volume e da densidade do líquido deslocado.',
        alternativas_incorretas: ['do volume do líquido deslocado e da densidade do corpo', 'da densidade e do volume do corpo', 'somente do volume do líquido deslocado'],
        alternativas_para_eliminar: ['do volume do líquido deslocado e da densidade do corpo', 'da densidade e do volume do corpo']
    },
    {
        id: 'q4',
        tema: 'Física 5',
        dificuldade: 'dificil',
        enunciado: "Pela secção reta de um condutor de eletricidade passam 12,0 C a cada minuto. Nesse condutor, a intensidade da corrente elétrica, em ampères, é igual a:",
        alternativa_correta: '0,20',
        alternativas_incorretas: ['0,08', '5,00', '7,20'],
        alternativas_para_eliminar: ['0,08', '5,00']
    },
    {
        id: 'q5',
        tema: 'Física 3',
        dificuldade: 'muito_dificil',
        enunciado: "Em um manual de instruções de uma geladeira, constam as seguintes recomendações: Mantenha a porta de seu refrigerador aberta apenas o tempo necessário; É importante não obstruir a circulação do ar com a má distribuição dos alimentos nas prateleiras; Deixe um espaço de, no mínimo, 5 cm entre a parte traseira do produto (dissipador serpentinado) e a parede. Com base nos princípios da termodinâmica, as justificativas para essas recomendações são, respectivamente:",
        alternativa_correta: ' Reduzir o fluxo de calor do ambiente para a parte interna do refrigerador, garantir a convecção do ar interno e permitir a troca de calor entre o dissipador e o ambiente.',
        alternativas_incorretas: ['Reduzir a saída de frio do refrigerador para o ambiente, garantir a transmissão do frio entre os alimentos na prateleira e permitir a troca de calor entre o dissipador de calor e o ambiente.', 'Reduzir o fluxo de calor do ambiente para a parte interna do refrigerador, garantir a transmissão do frio entre os alimentos na prateleira e permitir a troca de calor entre o dissipador e o ambiente.', 'Reduzir o fluxo de calor do ambiente para a parte interna do refrigerador, garantir a convecção do ar interno e garantir o isolamento térmico entre as partes interna e externa.'],
        alternativas_para_eliminar: ['Reduzir a saída de frio do refrigerador para o ambiente, garantir a transmissão do frio entre os alimentos na prateleira e permitir a troca de calor entre o dissipador de calor e o ambiente.', 'Reduzir o fluxo de calor do ambiente para a parte interna do refrigerador, garantir a transmissão do frio entre os alimentos na prateleira e permitir a troca de calor entre o dissipador e o ambiente.'],
    }
]

let mockConfig = {
    temas_ativos: ['Física 1', 'Física 2'],
    modo_de_jogo: 'classico',
    permitir_repeticao: false
};

// --- MOCK DE USUÁRIOS ---
let mockUsers = [
    { username: 'prof', password: '123' }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    // --- FUNÇÕES DE AUTENTICAÇÃO ---
    register: async (username, password) => {
        await delay(500);
        if (mockUsers.find(u => u.username === username)) {
            return { success: false, message: 'Este nome de usuário já existe.' };
        }
        mockUsers.push({ username, password });
        console.log('Usuários mockados:', mockUsers);
        return { success: true, token: 'fake-jwt-token-for-' + username };
    },

    login: async (username, password) => {
        await delay(500);
        const user = mockUsers.find(u => u.username === username && u.password === password);
        if (user) {
            return { success: true, token: 'fake-jwt-token-for-' + username };
        }
        return { success: false, message: 'Usuário ou senha inválidos' };
    },
    
    // --- FUNÇÕES DE GERENCIAMENTO DE QUESTÕES (CRUD) ---
    getQuestions: async () => {
        await delay(500);
        // AJUSTE: A resposta agora usa a chave 'data'
        return { success: true, data: mockQuestoes };
    },

    createQuestion: async (questionData) => {
        await delay(300);
        const newQuestion = {
            ...questionData,
            id: `q${Math.random() * 1000}` // Gera um ID simples
        };
        mockQuestoes.push(newQuestion);
        return { success: true, data: newQuestion };
    },

    updateQuestion: async (id, questionData) => {
        await delay(300);
        mockQuestoes = mockQuestoes.map(q => q.id === id ? { ...q, ...questionData } : q);
        const updatedQuestion = mockQuestoes.find(q => q.id === id);
        return { success: true, data: updatedQuestion };
    },
    
    deleteQuestion: async (id) => {
        await delay(300);
        mockQuestoes = mockQuestoes.filter(q => q.id !== id);
        return { success: true };
    },

    // --- FUNÇÕES DE CONFIGURAÇÃO DO JOGO ---
    getConfig: async () => {
        await delay(200);
        // AJUSTE: A resposta agora usa a chave 'data'
        return { success: true, data: mockConfig };
    },

    saveConfig: async (config) => {
        await delay(400);
        mockConfig = config;
        // AJUSTE: A resposta agora usa a chave 'data'
        return { success: true, data: mockConfig };
    },

    getAllThemes: async () => {
        await delay(100);
        const themes = mockQuestoes.map(q => q.tema);
        const uniqueThemes = [...new Set(themes)]; // Pega apenas os temas únicos
        return { success: true, data: uniqueThemes };
    },

    resetHistory: async () => {
        await delay(500);
        // Em um backend real, isso limparia um campo no DB. Aqui, só confirmamos.
        console.log("Histórico dos jogadores foi resetado.");
        return { success: true };
    },

    // --- FUNÇÕES PARA O GAMEPLAY DO JOGADOR (usaremos no futuro) ---
    getNextQuestion: async (nivelAtual) => {
        await delay(300);
        const dificuldades = ['muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'];
        const proximaQuestao = mockQuestoes.find(q => q.dificuldade === dificuldades[nivelAtual - 1]);
        return { success: true, questao: proximaQuestao };
    },

    sendAnswer: async (idQuestao, resposta) => {
        await delay(400);
        const questao = mockQuestoes.find(q => q.id === idQuestao);
        const isCorrect = questao.alternativa_correta === resposta;
        return { success: true, isCorrect: isCorrect, pontuacao_atualizada: isCorrect ? 100 : 0 };
    },

    useHelp: async (tipoAjuda, idQuestao) => {
        await delay(600);
        if (tipoAjuda === 'eliminar') {
            const questao = mockQuestoes.find(q => q.id === idQuestao);
            return { success: true, alternativas_eliminadas: questao.alternativas_para_eliminar };
        }
        if (tipoAjuda === 'plateia') {
            return { success: true, plateia: { 'm/s': 75, 'kg': 10, 'J': 10, 'W': 5 } };
        }
        if (tipoAjuda === 'chat') {
            return { success: true, chat_response: '(Simulação) A resposta é m/s.' };
        }
    },
};