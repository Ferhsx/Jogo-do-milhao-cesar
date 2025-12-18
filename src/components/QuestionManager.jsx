import React, { useState, useEffect } from 'react';
import { api } from '../service/api';
import Modal from './Modal';
import QuestionForm from './QuestionForm';
import { Plus, Upload, Trash2, Edit2, HelpCircle, FileText, Search } from 'lucide-react';
import { motion } from 'framer-motion';

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
    // Removido handleImportClick pois usaremos label htmlFor

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
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative w-full md:w-auto flex-1 max-w-md hidden md:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar questão..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto justify-end">
                        <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all font-medium">
                            <Upload size={18} />
                            <span className="hidden leading-none sm:inline">Importar .TXT</span>
                            <input
                                type="file"
                                accept=".txt"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>

                        <button
                            onClick={() => setIsHelpModalOpen(true)}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 p-2 rounded-lg shadow-sm"
                            title="Ajuda Importação"
                        >
                            <HelpCircle size={20} />
                        </button>

                        <button
                            onClick={handleOpenModalForCreate}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md shadow-purple-500/20 flex items-center gap-2 font-medium transition-transform active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Nova Questão</span>
                        </button>
                    </div>
                </div>

                {/* Tabela de questões */}
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                    {loading && (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            Carregando questões...
                        </div>
                    )}
                    {error && <p className="p-8 text-center text-red-500">{error}</p>}

                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm md:text-base">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs font-semibold">
                                    <tr>
                                        <th className="py-4 px-6 md:w-1/2">Enunciado</th>
                                        <th className="py-4 px-6">Tema</th>
                                        <th className="py-4 px-6">Dificuldade</th>
                                        <th className="py-4 px-6 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {questions.length > 0 ? (
                                        questions.map((question) => (
                                            <tr key={question._id} className="hover:bg-purple-50/50 transition-colors group">
                                                <td className="py-4 px-6 font-medium text-gray-800 line-clamp-2">
                                                    <div className="flex items-start gap-3">
                                                        <FileText size={16} className="text-gray-400 mt-1 shrink-0" />
                                                        {question.enunciado}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-600">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">{question.tema}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                        ${question.dificuldade === 'facil' ? 'bg-green-100 text-green-700' :
                                                            question.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'}`}>
                                                        {question.dificuldade.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenModalForEdit(question)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuestion(question._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                                                        <HelpCircle size={32} className="text-gray-400" />
                                                    </div>
                                                    <p>Nenhuma questão encontrada.</p>
                                                    <button onClick={handleOpenModalForCreate} className="text-purple-600 font-bold mt-2 hover:underline">
                                                        Criar a primeira questão
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                title="Formatação do Arquivo .TXT"
            >
                <div className="text-sm">
                    <p className="mb-4 text-gray-600">Copie o formato abaixo para criar suas questões em lote:</p>
                    <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-gray-700 shadow-inner">
                        <span className="text-purple-400">::Tema da Questão::</span> <span className="text-white">Enunciado da pergunta vai aqui?</span> {'{'}<br />
                        <span className="text-green-400">=Alternativa Correta</span><br />
                        <span className="text-red-400">~Alternativa Incorreta 1</span><br />
                        <span className="text-red-400">~Alternativa Incorreta 2</span><br />
                        <span className="text-red-400">~Alternativa Incorreta 3</span><br />
                        {'}'} <span className="text-blue-400">[facil]</span>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setIsHelpModalOpen(false)}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 font-medium"
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