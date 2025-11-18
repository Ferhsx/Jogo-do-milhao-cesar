import React from 'react';

// O Modal recebe:
// - isOpen: um booleano que controla sua visibilidade
// - onClose: uma função para fechá-lo
// - title: o título a ser exibido no cabeçalho
// - children: o conteúdo que será renderizado dentro do modal (nosso formulário)
function Modais({ isOpen, onClose, title, children }) {
    // Se não estiver aberto, não renderiza nada
    if (!isOpen) return null;

    return (
        // Overlay (fundo escuro)
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            {/* Conteúdo do Modal */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                {/* Cabeçalho do Modal */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-800 text-2xl"
                    >
                        &times; {/* Isso é um 'X' para fechar */}
                    </button>
                </div>
                {/* Corpo do Modal (onde o formulário vai entrar) */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modais;