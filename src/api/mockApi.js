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

const mockConfig = {
    temas_ativos: ['Física 1'],
    modo_de_jogo: 'classico',
    permitir_repeticao: false
};

// Funções Falsas (simulando a API)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    // Simula o login do professor
    login: async (username, password) => {
        await delay(500);
        if (username === 'prof' && password === '123') {
            return { success: true, token: 'fake-jwt-token' };
        }
        return { success: false, message: 'Usuário ou senha inválidos' };
    },

    // Simula a busca da próxima questão
    getNextQuestion: async (nivelAtual) => {
        await delay(300);
        // Lógica simples para pegar uma questão do nível certo
        const dificuldades = ['muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'];
        const proximaQuestao = mockQuestoes.find(q => q.dificuldade === dificuldades[nivelAtual - 1]);
        return { success: true, questao: proximaQuestao };
    },

    // Simula o envio da resposta
    sendAnswer: async (idQuestao, resposta) => {
        await delay(400);
        const questao = mockQuestoes.find(q => q.id === idQuestao);
        const isCorrect = questao.alternativa_correta === resposta;
        return { success: true, isCorrect: isCorrect, pontuacao_atualizada: isCorrect ? 100 : 0 };
    },

    // Simula o uso da ajuda
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
    
    getQuestoes: async () => {
        await delay(300);
        return { success: true, questoes: mockQuestoes };
    },
    createQuestao: async (questao) => {
        await delay(300);
        mockQuestoes.push(questao);
        return { success: true, questao: questao };
    },
    getConfig: async () => {
        await delay(300);
        return { success: true, config: mockConfig };
    },
    updateConfig: async (config) => {
        await delay(300);
        mockConfig = config;
        return { success: true, config: config };
    },
};