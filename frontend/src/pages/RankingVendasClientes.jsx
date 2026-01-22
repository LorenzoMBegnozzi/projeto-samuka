import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Award, Users, DollarSign, ShoppingCart, Percent } from 'lucide-react';
import api from '../services/api';
import '../styles/ranking-vendas.css';
import '../styles/relatorios.css';

export default function RankingVendasClientes() {
  // Função para pegar data atual no formato yyyy-mm-dd
  function getHojeISO() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
  const [dataInicio, setDataInicio] = useState(getHojeISO());
  const [dataFim, setDataFim] = useState(getHojeISO());
  const [ordenacao, setOrdenacao] = useState('valor');
  const [filtroMinimo, setFiltroMinimo] = useState('');
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHome = () => {
    navigate('/home');
  };

  // Removido useEffect para não sobrescrever datas iniciais

  const totalGeral = useMemo(() => {
    return ranking.reduce((acc, item) => acc + (Number(item.total_compras) || 0), 0);
  }, [ranking]);

  const totalVendas = useMemo(() => {
    return ranking.reduce((acc, item) => acc + (Number(item.qtd_vendas) || 0), 0);
  }, [ranking]);

  const ticketMedioGeral = totalVendas > 0 ? totalGeral / totalVendas : 0;

  const rankingFiltrado = useMemo(() => {
    let dados = [...ranking];

    // Filtrar por data exata se dataInicio === dataFim
    if (dataInicio && dataFim && dataInicio === dataFim) {
      // Converter para dd/mm/yyyy
      const [ano, mes, dia] = dataInicio.split('-');
      const dataFiltro = `${dia}/${mes}/${ano}`;
      dados = dados.filter(item => {
        // item.data pode ser dd/mm/yyyy ou yyyy-mm-dd, então normalizar
        if (!item.data) return true;
        let dataItem = item.data;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dataItem)) {
          const [a, m, d] = dataItem.split('-');
          dataItem = `${d}/${m}/${a}`;
        }
        return dataItem === dataFiltro;
      });
    }

    if (filtroMinimo) {
      const minimo = Number(filtroMinimo);
      dados = dados.filter(item => Number(item.total_compras) >= minimo);
    }

    dados.sort((a, b) => {
      if (ordenacao === 'valor') {
        return Number(b.total_compras) - Number(a.total_compras);
      } else if (ordenacao === 'quantidade') {
        return Number(b.qtd_vendas) - Number(a.qtd_vendas);
      } else if (ordenacao === 'ticket') {
        return Number(b.ticket_medio) - Number(a.ticket_medio);
      }
      return 0;
    });

    return dados;
  }, [ranking, ordenacao, filtroMinimo, dataInicio, dataFim]);

  const getMedalhaClasse = (posicao) => {
    if (posicao === 1) return 'gold';
    if (posicao === 2) return 'silver';
    if (posicao === 3) return 'bronze';
    return '';
  };

  const getBarraProgresso = (valor, total) => {
    const percentual = total > 0 ? (valor / total) * 100 : 0;
    return Math.min(percentual, 100);
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
      // Converter datas para dd/mm/yyyy
      const formatarParaDDMMYYYY = (dataStr) => {
        if (!dataStr) return '';
        const [ano, mes, dia] = dataStr.split('-');
        if (!ano || !mes || !dia) return dataStr;
        return `${dia}/${mes}/${ano}`;
      };
      const dataInicioFmt = formatarParaDDMMYYYY(dataInicio);
      const dataFimFmt = formatarParaDDMMYYYY(dataFim);

      const res = await api.get('/relatorios/ranking-clientes', {
        params: {
          data_inicio: dataInicioFmt,
          data_fim: dataFimFmt,
        },
      });

      if (
        !Array.isArray(res.data) ||
        res.data.some(
          (item) =>
            typeof item.cliente_nome === 'undefined' ||
            typeof item.qtd_vendas === 'undefined' ||
            typeof item.total_compras === 'undefined'
        )
      ) {
        setErro('O retorno da API não possui os campos esperados.');
        return;
      }

      const dadosComTicket = res.data.map(item => ({
        ...item,
        ticket_medio:
          Number(item.qtd_vendas) > 0
            ? Number(item.total_compras) / Number(item.qtd_vendas)
            : 0,
      }));

      setRanking(dadosComTicket);
    } catch (e) {
      setErro(e.response?.data?.message || 'Erro ao gerar ranking de clientes.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <h2>Relatórios</h2>
            <small className="header-subtitle">Ranking de Vendas</small>
          </div>
          <div className="header-right">
            <span className="user-pill">
              <span className="user-dot" />
              Olá, <strong>{usuario?.nome}</strong>
            </span>
            <button className="btn btn-ghost" onClick={handleHome}>
              Home
            </button>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </div>
      <div className="container">

        {/* Cards de Resumo */}
        <div className="ranking-stats-grid">
          <div className="ranking-stat-card blue">
            <div className="ranking-stat-content">
              <div>
                <p className="ranking-stat-label">Total em Vendas</p>
                <p className="ranking-stat-value">
                  R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="ranking-stat-icon blue" />
            </div>
          </div>

          <div className="ranking-stat-card green">
            <div className="ranking-stat-content">
              <div>
                <p className="ranking-stat-label">Clientes Ativos</p>
                <p className="ranking-stat-value">{rankingFiltrado.length}</p>
              </div>
              <Users className="ranking-stat-icon green" />
            </div>
          </div>

          <div className="ranking-stat-card purple">
            <div className="ranking-stat-content">
              <div>
                <p className="ranking-stat-label">Total de Vendas</p>
                <p className="ranking-stat-value">{totalVendas}</p>
              </div>
              <ShoppingCart className="ranking-stat-icon purple" />
            </div>
          </div>

          <div className="ranking-stat-card orange">
            <div className="ranking-stat-content">
              <div>
                <p className="ranking-stat-label">Ticket Médio</p>
                <p className="ranking-stat-value">
                  R$ {ticketMedioGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Percent className="ranking-stat-icon orange" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="ranking-filters-card">
          <h3 className="ranking-filters-title">Filtros e Ordenação</h3>
          <div className="ranking-filters-grid">
            <div className="ranking-form-group">
                <label className="ranking-form-label">Data Inicial</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="ranking-input"
                />
            </div>

            <div className="ranking-form-group">
                <label className="ranking-form-label">Data Final</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="ranking-input"
                />
            </div>

            <div className="ranking-form-group">
              <label className="ranking-form-label">Ordenar Por</label>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="ranking-select"
              >
                <option value="valor">Maior Valor</option>
                <option value="quantidade">Maior Quantidade</option>
                <option value="ticket">Maior Ticket Médio</option>
              </select>
            </div>

            <div className="ranking-form-group">
              <label className="ranking-form-label">Valor Mínimo</label>
              <input
                type="number"
                placeholder="Ex: 5000"
                value={filtroMinimo}
                onChange={(e) => setFiltroMinimo(e.target.value)}
                className="ranking-input"
              />
            </div>
          </div>

          <button
            onClick={gerarRanking}
            disabled={carregando}
            className="ranking-btn"
          >
            {carregando ? 'Gerando...' : 'Gerar ranking'}
          </button>

          {erro && <div className="ranking-error">{erro}</div>}
        </div>

        {/* Tabela */}
        <div className="ranking-table-card">
          <div className="ranking-table-header">
          </div>
          <div className="ranking-table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Cliente</th>
                  <th className="text-right">Qtd. Vendas</th>
                  <th className="text-right">Total Compras</th>
                  <th className="text-right">Ticket Médio</th>
                  <th className="text-right">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {rankingFiltrado.map((cliente, idx) => {
                  const total = Number(cliente.total_compras) || 0;
                  const percentual = totalGeral > 0 ? (total / totalGeral) * 100 : 0;
                  const barraWidth = getBarraProgresso(total, totalGeral);

                  return (
                    <tr key={cliente.id ?? idx}>
                      <td>
                        <div className="ranking-position">
                          {idx < 3 && (
                            <Award className={`ranking-medal ${getMedalhaClasse(idx + 1)}`} />
                          )}
                          <span className="ranking-position-number">{idx + 1}º</span>
                        </div>
                      </td>
                      <td>
                        <div className="ranking-cliente-nome">{cliente.cliente_nome}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="ranking-badge purple">{cliente.qtd_vendas}</span>
                      </td>
                      <td>
                        <div className="ranking-valor">
                          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td>
                        <div className="ranking-ticket">
                          R${' '}
                          {Number(cliente.ticket_medio).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="ranking-badge blue">{percentual.toFixed(1)}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="ranking-total-label">
                    TOTAL GERAL
                  </td>
                  <td className="ranking-total-vendas">{totalVendas}</td>
                  <td className="ranking-total-valor">
                    R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="ranking-total-ticket">
                    R$ {ticketMedioGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="ranking-total-percent">100%</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Insights */}
        {rankingFiltrado.length > 0 && (
          <div className="ranking-insights-grid">
            <div className="ranking-insight-card yellow">
              <div className="ranking-insight-content">
                <Award className="ranking-insight-icon yellow" />
                <div>
                  <h4 className="ranking-insight-title">Top Cliente</h4>
                  <p className="ranking-insight-text">
                    {rankingFiltrado[0]?.cliente_nome} lidera com R${' '}
                    {Number(rankingFiltrado[0]?.total_compras).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="ranking-insight-card green">
              <div className="ranking-insight-content">
                <TrendingUp className="ranking-insight-icon green" />
                <div>
                  <h4 className="ranking-insight-title">Maior Ticket Médio</h4>
                  <p className="ranking-insight-text">
                    {[...rankingFiltrado].sort((a, b) => b.ticket_medio - a.ticket_medio)[0]?.cliente_nome} - R${' '}
                    {Number(
                      [...rankingFiltrado].sort((a, b) => b.ticket_medio - a.ticket_medio)[0]?.ticket_medio
                    ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="ranking-insight-card purple">
              <div className="ranking-insight-content">
                <ShoppingCart className="ranking-insight-icon purple" />
                <div>
                  <h4 className="ranking-insight-title">Mais Compras</h4>
                  <p className="ranking-insight-text">
                    {[...rankingFiltrado].sort((a, b) => b.qtd_vendas - a.qtd_vendas)[0]?.cliente_nome} -{' '}
                    {[...rankingFiltrado].sort((a, b) => b.qtd_vendas - a.qtd_vendas)[0]?.qtd_vendas} vendas
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}