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
            response = await api.updateQuestion(editingQuestion.id, formData);
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


    return (
        <> {/* Usa um Fragment para renderizar o Modal fora do layout principal */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Gerenciamento de Questões</h2>
                    <button 
                        onClick={handleOpenModalForCreate} 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        + Adicionar Nova Questão
                    </button>
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
                                        <tr key={question.id} className="hover:bg-gray-50">
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
                                                    onClick={() => handleDeleteQuestion(question.id)}
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
        </>
    );
}

export default QuestionManager;