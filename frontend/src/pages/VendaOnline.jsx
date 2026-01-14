import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/venda.css';

export default function VendaOnline() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [vendedores, setVendedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [vendedorSelecionado, setVendedorSelecionado] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [dividaCliente, setDividaCliente] = useState(0);

  const [itens, setItens] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [desconto, setDesconto] = useState(0);

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [vendRes, cliRes, prodRes] = await Promise.all([
        api.get('/vendedores'),
        api.get('/clientes'),
        api.get('/produtos'),
      ]);

      setVendedores(vendRes.data);
      setClientes(cliRes.data);
      setProdutos(prodRes.data);
    } catch (error) {
      setErro('Erro ao carregar dados');
    }
  };

  // Buscar dívida ao selecionar cliente
  const handleClienteChange = async (clienteId) => {
    setClienteSelecionado(clienteId);
    setDividaCliente(0);

    if (clienteId) {
      try {
        const response = await api.get(`/clientes/${clienteId}/divida`);
        setDividaCliente(response.data.divida);
      } catch (error) {
        console.error('Erro ao buscar dívida:', error);
      }
    }
  };

  const produtoAtual = useMemo(() => {
    return produtos.find((p) => p.id === parseInt(produtoSelecionado));
  }, [produtos, produtoSelecionado]);

  // Adicionar item à lista
  const adicionarItem = () => {
    if (!produtoSelecionado || quantidade <= 0) {
      setErro('Selecione um produto e informe a quantidade');
      return;
    }

    const produto = produtos.find((p) => p.id === parseInt(produtoSelecionado));
    if (!produto) return;

    // Validar desconto
    if (desconto > 0 && !produto.permite_desconto) {
      setErro('Este produto não permite desconto');
      return;
    }

    // (Opcional, mas recomendado) Não deixar desconto maior que o preço
    if (desconto > produto.preco_venda) {
      setErro('Desconto não pode ser maior que o preço do produto');
      return;
    }

    const novoItem = {
      produto_id: produto.id,
      produto_nome: produto.nome,
      quantidade: quantidade,
      preco_unitario: produto.preco_venda,
      desconto: desconto,
      permite_desconto: produto.permite_desconto,
      subtotal: (produto.preco_venda - desconto) * quantidade,
    };

    setItens([...itens, novoItem]);
    setProdutoSelecionado('');
    setQuantidade(1);
    setDesconto(0);
    setErro('');
  };

  // Remover item
  const removerItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  // Calcular total
  const calcularTotal = () => {
    return itens.reduce((total, item) => total + item.subtotal, 0);
  };

  // Lançar venda
  const lancarVenda = async () => {
    if (!vendedorSelecionado || !clienteSelecionado) {
      setErro('Selecione vendedor e cliente');
      return;
    }

    if (itens.length === 0) {
      setErro('Adicione ao menos um produto');
      return;
    }

    setCarregando(true);
    setErro('');
    setMensagem('');

    try {
      const payload = {
        vendedor_id: parseInt(vendedorSelecionado),
        cliente_id: parseInt(clienteSelecionado),
        itens: itens.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          desconto: item.desconto || 0,
        })),
      };

      await api.post('/venda-online', payload);

      setMensagem('Venda registrada com sucesso!');

      // Limpar formulário
      setTimeout(() => {
        setVendedorSelecionado('');
        setClienteSelecionado('');
        setDividaCliente(0);
        setItens([]);
        setMensagem('');
      }, 1500);
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao registrar venda');
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <h2>Sistema de Vendas Online</h2>
            <small className="header-subtitle">Registre vendas, controle itens e descontos</small>
          </div>

          <div className="header-right">
            <span className="user-pill">
              <span className="user-dot" />
              Olá, <strong>{usuario?.nome}</strong>
            </span>

            <button className="btn btn-ghost" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Topo - Vendedor e Cliente em grid */}
        <div className="grid-2">
          {/* Seção Vendedor */}
          <div className="card">
            <div className="card-title">
              <h3>Vendedor</h3>
              <span className="badge badge-info">Obrigatório</span>
            </div>

            <div className="form-group">
              <label>Selecione o vendedor</label>
              <select value={vendedorSelecionado} onChange={(e) => setVendedorSelecionado(e.target.value)}>
                <option value="">Selecione...</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seção Cliente */}
          <div className="card">
            <div className="card-title">
              <h3>Cliente</h3>
              <span className="badge badge-info">Obrigatório</span>
            </div>

            <div className="form-group">
              <label>Selecione o cliente</label>

              <div className="row-inline">
                <select value={clienteSelecionado} onChange={(e) => handleClienteChange(e.target.value)}>
                  <option value="">Selecione...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>

                {clienteSelecionado && (
                  <span className="divida-badge">
                    Dívida: <strong>R$ {dividaCliente.toFixed(2)}</strong>
                  </span>
                )}
              </div>
              
            </div>
          </div>
        </div>

        {/* Seção Produtos */}
        <div className="card highlight">
          <div className="card-title">
            <h3>Adicionar Produtos</h3>
            <span className="badge badge-primary">Itens</span>
          </div>

          <div className="produtos-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Produto</label>
              <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)}>
                <option value="">Selecione...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — R$ {p.preco_venda.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Quantidade</label>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Desconto (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={desconto}
                onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                disabled={!produtoAtual?.permite_desconto}
                title={!produtoAtual?.permite_desconto ? 'Este produto não permite desconto' : ''}
              />
            </div>

            <button className="btn btn-secondary" onClick={adicionarItem}>
              + Adicionar
            </button>
          </div>

          {produtoAtual && (
            <div className="produto-info">
              <div className="produto-info-item">
                <span className="muted">Preço</span>
                <strong>R$ {produtoAtual.preco_venda.toFixed(2)}</strong>
              </div>
              <div className="produto-info-item">
                <span className="muted">Estoque</span>
                <strong>{produtoAtual.estoque}</strong>
              </div>
              <div className="produto-info-item">
                <span className="muted">Permite desconto</span>
                <strong>{produtoAtual.permite_desconto ? 'Sim' : 'Não'}</strong>
              </div>
            </div>
          )}

          {/* Lista de Itens */}
          {itens.length > 0 && (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Qtd</th>
                      <th>Preço Unit.</th>
                      <th>Desconto</th>
                      <th>Subtotal</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((item, index) => (
                      <tr key={index}>
                        <td className="td-strong">{item.produto_nome}</td>
                        <td>{item.quantidade}</td>
                        <td>R$ {item.preco_unitario.toFixed(2)}</td>
                        <td>R$ {item.desconto.toFixed(2)}</td>
                        <td className="td-strong">R$ {item.subtotal.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-danger btn-sm" onClick={() => removerItem(index)}>
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="total-area">
                <span>Total</span>
                <strong>R$ {calcularTotal().toFixed(2)}</strong>
              </div>
            </>
          )}
        </div>

        {/* Mensagens */}
        {erro && <div className="alert alert-error">{erro}</div>}
        {mensagem && <div className="alert alert-success">{mensagem}</div>}

        {/* Botão Lançar */}
        <div className="footer-action">
          <button className="btn btn-primary btn-lg" onClick={lancarVenda} disabled={carregando}>
            {carregando ? 'Lançando...' : 'Lançar Venda'}
          </button>
        </div>
      </div>
    </div>
  );
}