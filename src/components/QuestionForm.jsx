import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

function QuestionForm({ initialData, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        enunciado: '',
        tema: '',
        dificuldade: 'facil',
        alternativa_correta: '',
        alternativas_incorretas: ['', '', ''],
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
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
        if (!formData.enunciado || !formData.alternativa_correta || formData.alternativas_incorretas.some(alt => !alt)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Enunciado da Questão</label>
                    <textarea
                        name="enunciado"
                        value={formData.enunciado}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-gray-300"
                        placeholder="Digite aqui a pergunta..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tema</label>
                        <input
                            type="text"
                            name="tema"
                            value={formData.tema}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Ex: História, Ciências..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dificuldade</label>
                        <select
                            name="dificuldade"
                            value={formData.dificuldade}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        >
                            <option value="muito_facil">Muito Fácil</option>
                            <option value="facil">Fácil</option>
                            <option value="medio">Médio</option>
                            <option value="dificil">Difícil</option>
                            <option value="muito_dificil">Muito Difícil</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Alternativa Correta</label>
                    <input
                        type="text"
                        name="alternativa_correta"
                        value={formData.alternativa_correta}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                        placeholder="A resposta certa"
                    />
                </div>

                <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3">
                    <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Alternativas Incorretas</label>
                    {formData.alternativas_incorretas.map((alt, index) => (
                        <input
                            key={index}
                            type="text"
                            value={alt}
                            onChange={(e) => handleIncorrectChange(index, e.target.value)}
                            required
                            className="w-full p-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white text-sm"
                            placeholder={`Opção incorreta ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                >
                    <X size={18} /> Cancelar
                </button>
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-bold shadow-lg shadow-purple-500/20 transition-transform active:scale-95"
                >
                    <Save size={18} /> Salvar
                </button>
            </div>
        </form>
    );
}

export default QuestionForm;