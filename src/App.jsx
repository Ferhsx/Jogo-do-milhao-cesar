// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home'; // A nova tela de entrada (Lobby)
import Game from './pages/Game'; // A nova tela de jogo (Gameplay)

// ... Mantenha os componentes ProtectedRoute e LoginRoute iguais ...
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

const LoginRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (token) return <Navigate to="/dashboard" />;
    return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Inicial (Lobby estilo Kahoot) */}
        <Route path="/" element={<Home />} />
        
        {/* Rota do Jogo (Ação) */}
        <Route path="/play" element={<Game />} />

        {/* Rotas Administrativas */}
        <Route path="/login" element={<LoginRoute><Login /></LoginRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;