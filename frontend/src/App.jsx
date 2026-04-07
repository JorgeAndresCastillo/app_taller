import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClientDashboard from './pages/ClientDashboard';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.rol === 'cliente') {
    return <Navigate to="/cliente" replace />;
  }
  
  return <Dashboard />;
};

const ClienteDashboard = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.rol !== 'cliente') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <ClientDashboard />;
};

const ProtectedRoute = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/cliente" element={
            <ProtectedRoute>
              <ClienteDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
