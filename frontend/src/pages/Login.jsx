import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await login(usuario, senha);
      navigate('/venda');
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px', color: '#333' }}>
          Sistema de Vendas
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuário</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Digite seu usuário"
              required
              disabled={carregando}
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
              disabled={carregando}
            />
          </div>

          {erro && <div className="error">{erro}</div>}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '16px' }}
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
          <small style={{ color: '#666' }}>
            <strong>Usuário de teste:</strong><br />
            Usuário: admin<br />
            Senha: admin123
          </small>
        </div>
      </div>
    </div>
  );
}