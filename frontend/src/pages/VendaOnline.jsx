import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

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

  // Adicionar item à lista
  const adicionarItem = () => {
    if (!produtoSelecionado || quantidade <= 0) {
      setErro('Selecione um produto e informe a quantidade');
      return;
    }

    const produto = produtos.find(p => p.id === parseInt(produtoSelecionado));
    
    if (!produto) return;

    // Validar desconto
    if (desconto > 0 && !produto.permite_desconto) {
      setErro('Este produto não permite desconto');
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
        itens: itens.map(item => ({
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
      }, 2000);
      
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

  const produtoAtual = produtos.find(p => p.id === parseInt(produtoSelecionado));

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h2>Sistema de Vendas Online</h2>
          <div>
            <span style={{ marginRight: '16px' }}>Olá, {usuario?.nome}</span>
            <button className="btn-danger" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Seção Vendedor */}
        <div className="card">
          <h3>Vendedor</h3>
          <div className="form-group">
            <label>Selecione o vendedor</label>
            <select 
              value={vendedorSelecionado}
              onChange={(e) => setVendedorSelecionado(e.target.value)}
            >
              <option value="">Selecione...</option>
              {vendedores.map(v => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Seção Cliente */}
        <div className="card">
          <h3>Cliente</h3>
          <div className="form-group">
            <label>Selecione o cliente</label>
            <select 
              value={clienteSelecionado}
              onChange={(e) => handleClienteChange(e.target.value)}
            >
              <option value="">Selecione...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            
            {clienteSelecionado && (
              <span className="divida-badge">
                Dívida: R$ {dividaCliente.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Seção Produtos */}
        <div className="card">
          <h3>Adicionar Produtos</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Produto</label>
              <select 
                value={produtoSelecionado}
                onChange={(e) => setProdutoSelecionado(e.target.value)}
              >
                <option value="">Selecione...</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome} - R$ {p.preco_venda.toFixed(2)}
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

            <button className="btn-secondary" onClick={adicionarItem}>
              Adicionar
            </button>
          </div>

          {produtoAtual && (
            <div style={{ marginTop: '12px', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
              <small>
                Preço: R$ {produtoAtual.preco_venda.toFixed(2)} | 
                Estoque: {produtoAtual.estoque} | 
                Permite desconto: {produtoAtual.permite_desconto ? 'Sim' : 'Não'}
              </small>
            </div>
          )}

          {/* Lista de Itens */}
          {itens.length > 0 && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Preço Unit.</th>
                    <th>Desconto</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, index) => (
                    <tr key={index}>
                      <td>{item.produto_nome}</td>
                      <td>{item.quantidade}</td>
                      <td>R$ {item.preco_unitario.toFixed(2)}</td>
                      <td>R$ {item.desconto.toFixed(2)}</td>
                      <td>R$ {item.subtotal.toFixed(2)}</td>
                      <td>
                        <button 
                          className="btn-danger" 
                          onClick={() => removerItem(index)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="total-venda">
                Total: R$ {calcularTotal().toFixed(2)}
              </div>
            </>
          )}
        </div>

        {/* Mensagens */}
        {erro && <div className="card" style={{ background: '#fee', color: '#c33' }}>{erro}</div>}
        {mensagem && <div className="card" style={{ background: '#efe', color: '#3c3' }}>{mensagem}</div>}

        {/* Botão Lançar */}
        <div style={{ textAlign: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={lancarVenda}
            disabled={carregando}
            style={{ padding: '16px 48px', fontSize: '18px' }}
          >
            {carregando ? 'Lançando...' : 'Lançar Venda'}
          </button>
        </div>
      </div>
    </div>
  );
}