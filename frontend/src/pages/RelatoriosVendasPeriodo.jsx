import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/relatorios.css';

export default function RelatorioVendasPeriodo() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [dados, setDados] = useState([]);

  const totalPeriodo = useMemo(() => {
    return dados.reduce((acc, item) => acc + (Number(item.total_vendas) || 0), 0);
  }, [dados]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const validarDatas = () => {
    if (!dataInicio || !dataFim) return 'Selecione data inicial e data final.';
    if (dataFim < dataInicio) return 'A data final não pode ser menor que a data inicial.';
    return '';
  };

  const gerarRelatorio = async () => {
    const msg = validarDatas();
    if (msg) {
      setErro(msg);
      return;
    }

    setCarregando(true);
    setErro('');
    setDados([]);

    try {
      // 🔧 Ajuste o endpoint conforme seu backend
      // Esperado: lista agregada (ex: por dia ou por vendedor)
      // Exemplo de retorno:
      // [{ referencia: "2026-01-10", quantidade_vendas: 12, total_vendas: 1530.50 }]
      const res = await api.get('/relatorios/vendas-por-periodo', {
        params: { data_inicio: dataInicio, data_fim: dataFim },
      });

      setDados(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErro(e.response?.data?.message || 'Erro ao gerar relatório de vendas.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="rep-shell">
      <header className="rep-header">
        <div className="rep-header-content">
          <div className="rep-header-left">
            <h2>Relatórios</h2>
            <small className="rep-subtitle">Vendas por período</small>
          </div>

          <div className="rep-header-right">
            <span className="rep-user-pill">
              <span className="rep-user-dot" />
              Olá, <strong>{usuario?.nome}</strong>
            </span>

            <button className="rep-btn rep-btn-ghost" onClick={() => navigate('/home')}>
              Home
            </button>

            <button className="rep-btn rep-btn-ghost" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="rep-container">
        <div className="rep-card rep-highlight">
          <div className="rep-card-title">
            <h3>Filtro</h3>
            <span className="rep-badge rep-badge-primary">Período</span>
          </div>

          <div className="rep-grid-3">
            <div className="rep-form-group">
              <label>Data inicial</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                disabled={carregando}
              />
            </div>

            <div className="rep-form-group">
              <label>Data final</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                disabled={carregando}
              />
            </div>

            <button
              className="rep-btn rep-btn-primary rep-btn-lg"
              onClick={gerarRelatorio}
              disabled={carregando}
              type="button"
            >
              {carregando ? 'Gerando...' : 'Gerar relatório'}
            </button>
          </div>

          {erro && <div className="rep-alert rep-alert-error">{erro}</div>}

          {dados.length > 0 && (
            <>
              <div className="rep-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Referência</th>
                      <th>Qtd. Vendas</th>
                      <th>Total (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.map((row, idx) => (
                      <tr key={idx}>
                        <td className="rep-strong">{row.referencia ?? '-'}</td>
                        <td>{row.quantidade_vendas ?? 0}</td>
                        <td className="rep-strong">R$ {(Number(row.total_vendas) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rep-total">
                <span>Total do período</span>
                <strong>R$ {totalPeriodo.toFixed(2)}</strong>
              </div>
            </>
          )}

          {!carregando && !erro && dados.length === 0 && (
            <div className="rep-empty">
              Selecione um período e clique em <strong>Gerar relatório</strong>.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}