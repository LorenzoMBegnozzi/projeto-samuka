import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Home from './pages/home';
import VendaOnline from './pages/VendaOnline';
import RelatorioVendasPeriodo from './pages/RelatoriosVendasPeriodo';
import RankingVendasClientes from './pages/RankingVendasClientes';

function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return usuario ? children : <Navigate to="/" />;
}

function RootRoute() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return usuario ? <Navigate to="/home" replace /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/venda"
            element={
              <PrivateRoute>
                <VendaOnline />
              </PrivateRoute>
            }
          />
          <Route
            path="/relatorios/vendas-por-periodo"
            element={
              <PrivateRoute>
                <RelatorioVendasPeriodo />
              </PrivateRoute>
            }
          />
          <Route
            path="/relatorios/ranking-clientes"
            element={
              <PrivateRoute>
                <RankingVendasClientes />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;