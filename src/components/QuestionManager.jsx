import React, { useState, useEffect } from 'react';
import { api } from '../service/api';
import Modal from './Modal';
import QuestionForm from './QuestionForm';

function QuestionManager() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- ESTADOS PARA CONTROLAR O MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Guarda a questão que está sendo editada. Se for `null`, significa que estamos criando uma nova.
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await api.getQuestions();
            if (response.success) {
                setQuestions(response.data);
            } else {
                setError('Falha ao buscar as questões.');
            }
        } catch (err) {
            setError('Ocorreu um erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    // Busca os dados iniciais
    useEffect(() => {
        fetchQuestions();
    }, []);

    // --- FUNÇÕES PARA MANIPULAR O MODAL E O FORMULÁRIO ---

    const handleOpenModalForCreate = () => {
        setEditingQuestion(null); // Limpa qualquer edição anterior
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (question) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleSaveQuestion = async (formData) => {
        let response;
        if (editingQuestion) {
            // Lógica de ATUALIZAÇÃO
            response = await api.updateQuestion(editingQuestion._id, formData);
        } else {
            // Lógica de CRIAÇÃO
            response = await api.createQuestion(formData);
        }

        if (response.success) {
            handleCloseModal();
            fetchQuestions(); // Re-busca as questões para atualizar a lista
        } else {
            alert(response.message || "Falha ao salvar a questão.");
        }
    };

    // (Ainda não vamos implementar o delete, mas a função já está aqui)
    const handleDeleteQuestion = async (id) => {
        if (window.confirm("Tem certeza que deseja deletar esta questão?")) {
            const response = await api.deleteQuestion(id);
            if (response.success) {
                fetchQuestions();
            } else {
                alert(response.message || "Falha ao deletar a questão.");
            }
        }
    }

    // --- IMPORTAÇÃO ---
    const handleImportClick = () => {
        document.getElementById('importInput').click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            if (!text) return;

            setLoading(true);
            const response = await api.importQuestions(text);
            if (response.success) {
                alert(response.data.message);
                fetchQuestions();
            } else {
                alert("Erro na importação: " + response.message);
            }
            setLoading(false);
        };
        reader.readAsText(file);
        // Limpa o input para permitir selecionar o mesmo arquivo novamente se falhar
        event.target.value = '';
    };


    return (
        <> {/* Usa um Fragment para renderizar o Modal fora do layout principal */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Gerenciamento de Questões</h2>
                    <div className="flex gap-2">
                        {/* Input Invisível */}
                        <input
                            id="importInput"
                            type="file"
                            accept=".txt"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={() => setIsHelpModalOpen(true)}
                            className="text-gray-500 hover:text-gray-700 font-bold px-2 py-2 rounded border border-gray-300 hover:bg-gray-100"
                            title="Como formatar o arquivo?"
                        >
                            ?
                        </button>
                        <button
                            onClick={handleImportClick}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                        >
                            📥 Importar .TXT
                        </button>
                        
                        <button
                            onClick={handleOpenModalForCreate}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            + Nova Questão
                        </button>
                    </div>
                </div>

                {/* Tabela de questões (com os botões agora funcionais) */}
                <div className="overflow-x-auto">
                    {loading && <p className="text-center text-gray-500">Carregando questões...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && !error && (
                        <table className="min-w-full bg-white">
                            {/* ... thead ... */}
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">Enunciado</th>
                                    <th className="py-2 px-4 border-b text-left">Tema</th>
                                    <th className="py-2 px-4 border-b text-left">Dificuldade</th>
                                    <th className="py-2 px-4 border-b text-left">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.length > 0 ? (
                                    questions.map((question) => (
                                        <tr key={question._id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border-b w-1/2">{question.enunciado}</td>
                                            <td className="py-2 px-4 border-b">{question.tema}</td>
                                            <td className="py-2 px-4 border-b">{question.dificuldade}</td>
                                            <td className="py-2 px-4 border-b">
                                                <button
                                                    onClick={() => handleOpenModalForEdit(question)}
                                                    className="text-sm bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuestion(question._id)}
                                                    className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                >
                                                    Deletar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-4 px-4 border-b text-center">
                                            Nenhuma questão encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* O MODAL EM SI */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingQuestion ? "Editar Questão" : "Adicionar Nova Questão"}
            >
                <QuestionForm
                    initialData={editingQuestion}
                    onSubmit={handleSaveQuestion}
                    onCancel={handleCloseModal}
                />
            </Modal>

            {/* MODAL DE AJUDA IMPORTAÇÃO */}
            <Modal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                title="Como formatar o arquivo .TXT"
            >
                <div>
                    <p className="mb-4">O arquivo deve seguir o seguinte padrão para cada questão:</p>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto border border-gray-300">
                        {`::Tema da Questão:: Enunciado da pergunta vai aqui? {
=Alternativa Correta
~Alternativa Incorreta 1
~Alternativa Incorreta 2
~Alternativa Incorreta 3
} [facil]`}
                    </pre>
                    <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-gray-700">
                        <li><strong>::Tema::</strong> no início da linha.</li>
                        <li><strong>Enunciado</strong> logo após o tema.</li>
                        <li><strong>Abra chaves {'{'}</strong> para as alternativas.</li>
                        <li>Use <strong>=</strong> para a resposta correta.</li>
                        <li>Use <strong>~</strong> para as incorretas.</li>
                        <li><strong>[dificuldade]</strong> no final (opcional). Valores: <em>muito_facil, facil, medio, dificil, muito_dificil</em>.</li>
                    </ul>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setIsHelpModalOpen(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default QuestionManager;