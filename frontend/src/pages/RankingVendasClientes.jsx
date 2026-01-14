import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/relatorios.css';

export default function RankingVendasClientes() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [ranking, setRanking] = useState([]);

  const totalGeral = useMemo(() => {
    return ranking.reduce((acc, item) => acc + (Number(item.total_compras) || 0), 0);
  }, [ranking]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const validarDatas = () => {
    if (!dataInicio || !dataFim) return 'Selecione data inicial e data final.';
    if (dataFim < dataInicio) return 'A data final não pode ser menor que a data inicial.';
    return '';
  };

  const gerarRanking = async () => {
    const msg = validarDatas();
    if (msg) {
      setErro(msg);
      return;
    }

    setCarregando(true);
    setErro('');
    setRanking([]);

    try {
      // 🔧 Ajuste o endpoint conforme seu backend
      // Exemplo de retorno:
      // [{ cliente_id: 3, cliente_nome: "João", qtd_vendas: 7, total_compras: 980.10 }]
      const res = await api.get('/relatorios/ranking-clientes', {
        params: { data_inicio: dataInicio, data_fim: dataFim },
      });

      setRanking(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErro(e.response?.data?.message || 'Erro ao gerar ranking de clientes.');
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
            <small className="rep-subtitle">Ranking de vendas por clientes</small>
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
            <span className="rep-badge rep-badge-warning">Ranking</span>
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
              onClick={gerarRanking}
              disabled={carregando}
              type="button"
            >
              {carregando ? 'Gerando...' : 'Gerar ranking'}
            </button>
          </div>

          {erro && <div className="rep-alert rep-alert-error">{erro}</div>}

          {ranking.length > 0 && (
            <>
              <div className="rep-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente</th>
                      <th>Qtd. Vendas</th>
                      <th>Total Compras (R$)</th>
                      <th>% do total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((row, idx) => {
                      const total = Number(row.total_compras) || 0;
                      const perc = totalGeral > 0 ? (total / totalGeral) * 100 : 0;

                      return (
                        <tr key={row.cliente_id ?? idx}>
                          <td className="rep-strong">{idx + 1}</td>
                          <td className="rep-strong">{row.cliente_nome ?? '-'}</td>
                          <td>{row.qtd_vendas ?? 0}</td>
                          <td className="rep-strong">R$ {total.toFixed(2)}</td>
                          <td>{perc.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="rep-total">
                <span>Total (somado do ranking)</span>
                <strong>R$ {totalGeral.toFixed(2)}</strong>
              </div>
            </>
          )}

          {!carregando && !erro && ranking.length === 0 && (
            <div className="rep-empty">
              Selecione um período e clique em <strong>Gerar ranking</strong>.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}