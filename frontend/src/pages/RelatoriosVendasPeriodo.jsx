import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/relatorios.css';

export default function RelatorioVendasPeriodo() {
    // Função utilitária para formatar data yyyy-mm-dd para dd/mm/aaaa
    function formatarData(dataStr) {
      if (!dataStr) return '';
      const [ano, mes, dia] = dataStr.split('-');
      if (!ano || !mes || !dia) return dataStr;
      return `${dia}/${mes}/${ano}`;
    }
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

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

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [dados, setDados] = useState([]);
  const [mostrarTabela, setMostrarTabela] = useState(false);

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
    setMostrarTabela(false);

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

      const res = await api.get('/relatorios/vendas-por-periodo', {
        params: { data_inicio: dataInicioFmt, data_fim: dataFimFmt },
      });

      setDados(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErro(e.response?.data?.message || 'Erro ao gerar relatório de vendas.');
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
            <small className="header-subtitle">Vendas por período</small>
          </div>
          <div className="header-right">
            <span className="user-pill">
              <span className="user-dot" />
              Olá, <strong>{usuario?.nome}</strong>
            </span>
            <button className="btn btn-ghost" onClick={() => navigate('/home')}>
              Home
            </button>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </div>
      <main className="container">
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

          {dados.length > 0 && !mostrarTabela && (
            <div style={{textAlign: 'center', marginTop: 24}}>
              <button className="rep-btn rep-btn-primary" onClick={() => setMostrarTabela(true)}>
                Ver relatório
              </button>
            </div>
          )}

          {dados.length > 0 && mostrarTabela && (
            <div className="rep-table-wrap relatorio-horizontal">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th style={{textAlign: 'right'}}>Venda</th>
                    <th style={{textAlign: 'right'}}>Reserva</th>
                    <th style={{textAlign: 'right'}}>Custo</th>
                    <th style={{textAlign: 'right'}}>Financeiro</th>
                    <th style={{textAlign: 'right'}}>Total</th>
                    <th style={{textAlign: 'right'}}>%S/F</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((row, idx) => (
                    <tr key={idx}>
                      <td className="rep-strong">{row.data ? formatarData(row.data) : '-'}</td>
                      <td style={{textAlign: 'right'}}>
                        {(Number(row.venda) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        {(Number(row.reserva) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        {(Number(row.custo) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        {(Number(row.financeiro) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td style={{textAlign: 'right'}} className="rep-strong">
                        {(Number(row.total) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        {(Number(row.percentual_sf) || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{fontWeight: 'bold', borderTop: '2px solid #ddd'}}>
                    <td>Total</td>
                    <td style={{textAlign: 'right'}}>
                      {dados.reduce((acc, item) => acc + (Number(item.venda) || 0), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      {dados.reduce((acc, item) => acc + (Number(item.reserva) || 0), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      {dados.reduce((acc, item) => acc + (Number(item.custo) || 0), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      {dados.reduce((acc, item) => acc + (Number(item.financeiro) || 0), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      {dados.reduce((acc, item) => acc + (Number(item.total) || 0), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      {dados.length > 0 ? (dados.reduce((acc, item) => acc + (Number(item.percentual_sf) || 0), 0) / dados.length).toFixed(2) : '0.00'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
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