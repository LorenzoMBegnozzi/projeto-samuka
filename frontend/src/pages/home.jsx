import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';
import '../styles/home.css';

export default function Home() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const atalhos = [
    {
      titulo: 'Vendas Online',
      descricao: 'Registrar vendas e itens',
      rota: '/venda',
      icon: <HiOutlineShoppingCart />,
      tipo: 'primary',
    },
    // {
    //   titulo: 'Clientes',
    //   descricao: 'Cadastro e consulta',
    //   rota: '/clientes',
    //   icon: <HiOutlineUsers />,
    //   tipo: 'info',
    // },
    // {
    //   titulo: 'Produtos',
    //   descricao: 'Estoque e preços',
    //   rota: '/produtos',
    //   icon: <HiOutlineCube />,
    //   tipo: 'info',
    // },
    // {
    //   titulo: 'Vendedores',
    //   descricao: 'Gestão de vendedores',
    //   rota: '/vendedores',
    //   icon: <HiOutlineUserGroup />,
    //   tipo: 'info',
    // },
    {
      titulo: 'Vendas por período',
      descricao: 'Relatório de vendas no intervalo',
      rota: '/relatorios/vendas-por-periodo',
      icon: <HiOutlineChartBar />,
      tipo: 'warning',
    },
    {
      titulo: 'Ranking de clientes',
      descricao: 'Quem mais comprou no período',
      rota: '/relatorios/ranking-clientes',
      icon: <HiOutlineUsers />,
      tipo: 'warning',
    },
    // {
    //   titulo: 'Configurações',
    //   descricao: 'Preferências do sistema',
    //   rota: '/configuracoes',
    //   icon: <HiOutlineCog6Tooth />,
    //   tipo: 'muted',
    // },
  ];

  return (
    <div className="home-shell">
      <header className="home-header">
        <div className="home-header-content">
          <div className="home-header-left">
            <h2>Dashboard</h2>
            <small className="home-subtitle">Atalhos rápidos do sistema</small>
          </div>

          <div className="home-header-right">
            <span className="home-user-pill">
              <span className="home-user-dot" />
              Olá, <strong>{usuario?.nome}</strong>
            </span>

            <button className="home-btn home-btn-ghost" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="home-container">
        <div className="home-topbar">
          <div>
            <h1 className="home-title">Bem-vindo</h1>
            <p className="home-muted">
              Selecione um módulo para acessar.
            </p>
          </div>
        </div>

        <section className="home-grid">
          {atalhos.map((item) => (
            <button
              key={item.rota}
              className={`home-tile home-tile-${item.tipo}`}
              onClick={() => navigate(item.rota)}
              type="button"
            >
              <div className="home-tile-icon" aria-hidden="true">
                {item.icon}
              </div>

              <div className="home-tile-text">
                <div className="home-tile-title">{item.titulo}</div>
                <div className="home-tile-desc">{item.descricao}</div>
              </div>

              <div className="home-tile-arrow" aria-hidden="true">→</div>
            </button>
          ))}
        </section>

        <footer className="home-footer">
          <span className="home-muted">
            Sistema de Vendas • Painel inicial
          </span>
        </footer>
      </main>
    </div>
  );
}