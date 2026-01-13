import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import VendaOnline from './pages/VendaOnline';

function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return usuario ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/venda"
            element={
              <PrivateRoute>
                <VendaOnline />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;