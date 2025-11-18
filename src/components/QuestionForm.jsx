import React, { useState, useEffect } from 'react';

// O formulário recebe:
// - initialData: os dados de uma questão para edição (ou null se for para criar)
// - onSubmit: a função a ser executada ao salvar (seja criar ou atualizar)
// - onCancel: a função para fechar o formulário/modal
function QuestionForm({ initialData, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        enunciado: '',
        tema: '',
        dificuldade: 'facil',
        alternativa_correta: '',
        alternativas_incorretas: ['', '', ''], // Começa com 3 campos para incorretas
    });

    // Se recebermos `initialData`, preenchemos o formulário para edição
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                // Garante que o campo exista mesmo que os dados iniciais não o tenham
                alternativas_incorretas: initialData.alternativas_incorretas || ['', '', '']
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleIncorrectChange = (index, value) => {
        const newIncorrect = [...formData.alternativas_incorretas];
        newIncorrect[index] = value;
        setFormData(prev => ({ ...prev, alternativas_incorretas: newIncorrect }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de validação básica (pode ser melhorada)
        if (!formData.enunciado || !formData.alternativa_correta || formData.alternativas_incorretas.some(alt => !alt)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Enunciado</label>
                <textarea name="enunciado" value={formData.enunciado} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tema</label>
                    <input type="text" name="tema" value={formData.tema} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dificuldade</label>
                    <select name="dificuldade" value={formData.dificuldade} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                        <option value="muito_facil">Muito Fácil</option>
                        <option value="facil">Fácil</option>
                        <option value="medio">Médio</option>
                        <option value="dificil">Difícil</option>
                        <option value="muito_dificil">Muito Difícil</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-green-700">Alternativa Correta</label>
                <input type="text" name="alternativa_correta" value={formData.alternativa_correta} onChange={handleChange} required className="mt-1 block w-full border border-green-400 rounded-md p-2" />
            </div>

            <div>
                <label className="block text-sm font-medium text-red-700">Alternativas Incorretas</label>
                {formData.alternativas_incorretas.map((alt, index) => (
                    <input
                        key={index}
                        type="text"
                        value={alt}
                        onChange={(e) => handleIncorrectChange(index, e.target.value)}
                        required
                        className="mt-1 block w-full border border-red-400 rounded-md p-2 mb-2"
                    />
                ))}
            </div>

            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Cancelar
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Salvar Questão
                </button>
            </div>
        </form>
    );
}

export default QuestionForm;