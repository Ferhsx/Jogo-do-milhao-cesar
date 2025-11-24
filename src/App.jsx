import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

const LoginRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (token) {
        return <Navigate to="/dashboard" />;
    }
    return children;
}


function App() {
  return (
    <Router>
      <Routes>
        {/* Rota de Login */}
        <Route 
            path="/login" 
            element={
                <LoginRoute>
                    <Login />
                </LoginRoute>
            } 
        />
        
        {/* Rota do Dashboard (Protegida) */}
        <Route 
            path="/dashboard" 
            element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } 
        />
        
        {/* Rota Padrão: Redireciona para o dashboard (que redirecionará para login se necessário) */}
        <Route 
            path="*" 
            element={<Navigate to="/dashboard" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;