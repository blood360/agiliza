'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './admin.module.css';
import Link from 'next/link';

export default function DashboardAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [lojaAberta, setLojaAberta] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('Pendente');

  // 1. Lógica de Carregamento e Polling (Vindo do antigo monitor)
  useEffect(() => {
    const statusSalvo = localStorage.getItem('agiliza_loja_aberta');
    setLojaAberta(statusSalvo !== 'false');

    const carregarEChecar = () => {
      const atuais = JSON.parse(localStorage.getItem('agiliza_pedidos') || '[]');
      
      // Alerta sonoro para novos pedidos
      if (atuais.length > pedidos.length && atuais.some(p => p.status === 'Pendente')) {
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
      }
      setPedidos(atuais);
    };

    carregarEChecar();
    const intervalo = setInterval(carregarEChecar, 5000);
    return () => clearInterval(intervalo);
  }, [pedidos.length]);

  // 2. Funções de Controle
  const toggleLoja = () => {
    const novoStatus = !lojaAberta;
    setLojaAberta(novoStatus);
    localStorage.setItem('agiliza_loja_aberta', novoStatus.toString());
  };

  const mudarStatus = (id, novoStatus) => {
    const atualizados = pedidos.map(p => p.id === id ? { ...p, status: novoStatus } : p);
    setPedidos(atualizados);
    localStorage.setItem('agiliza_pedidos', JSON.stringify(atualizados));
  };

  // 3. Métricas para preencher o Dashboard (Estilo Bento Grid)
  const totalVendas = pedidos.filter(p => p.status === 'Entregue').reduce((acc, p) => acc + p.total, 0);
  const totalProdutos = 12; // Aqui depois tu puxa do teu banco de produtos
  const novosPedidosCount = pedidos.filter(p => p.status === 'Pendente').length;

  return (
    <div className={styles.dashboardWrapper}>
      {/* Sidebar Profissional */}
      <aside className={styles.sidebar}>
        <div className={styles.brandArea}>
          <h2>AS <span>Agiliza</span></h2>
        </div>
        <nav className={styles.navMenu}>
          <Link href="/admin" className={`${styles.navItem} ${styles.active}`}>📊 Dashboard</Link>
          <Link href="/admin/produtos" className={styles.navItem}>🍔 Meu Cardápio</Link>
          <Link href="/admin/pedidos" className={styles.navItem}>🛒 Pedidos</Link>
          <Link href="/admin/perfil" className={styles.navItem}>⚙️ Configurações</Link>
        </nav>
        <div className={styles.upgradeBox}>
          <Image
            src="/logoAS.png"
            alt="Logo AS Automações"
            width={100}
            height={35}
            className={styles.logoSidebar}
            priority
        />
        </div>
      </aside>

      <main className={styles.mainContent}>
        {/* Header de Status */}
        <header className={styles.mainHeader}>
          <div className={styles.welcomeText}>
            <h1>Painel do Lojista 🏪</h1>
            <p>Seja bem-vindo, Adriano. Veja o resumo da sua Loja.</p>
          </div>
          <div className={styles.lojaStatusCard}>
            <span className={lojaAberta ? styles.txtAberto : styles.txtFechado}>
              ● {lojaAberta ? 'LOJA ABERTA' : 'LOJA FECHADA'}
            </span>
            <button onClick={toggleLoja} className={styles.btnToggle}>
              {lojaAberta ? 'Pausar Vendas' : 'Abrir Loja'}
            </button>
          </div>
        </header>

        {/* Grid de Estatísticas (Inspirado na imagem transferir.jfif) */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Vendas Concluídas</span>
            <h3 className={styles.statValue}>R$ {totalVendas.toFixed(2)}</h3>
            <span className={styles.statSub}>Total acumulado</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pedidos Hoje</span>
            <h3 className={styles.statValue}>{pedidos.length}</h3>
            <span className={styles.statSub}>Volume total de transações</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Novos Pendentes</span>
            <h3 className={`${styles.statValue} ${styles.alert}`}>{novosPedidosCount}</h3>
            <span className={styles.statSub}>Aguardando sua ação</span>
          </div>
        </section>

        {/* Gestor de Pedidos Integrado */}
        <section className={styles.ordersSection}>
          <div className={styles.ordersHeader}>
            <h2>Gestor de Pedidos</h2>
            <div className={styles.tabs}>
              {['Pendente', 'Preparando', 'Entregue'].map(status => (
                <button 
                  key={status}
                  onClick={() => setAbaAtiva(status)}
                  className={abaAtiva === status ? styles.tabActive : ''}
                >
                  {status === 'Pendente' ? 'Novos' : status}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.ordersContainer}>
            {pedidos.filter(p => p.status === abaAtiva).length > 0 ? (
              pedidos.filter(p => p.status === abaAtiva).map((pedido) => (
                <div key={pedido.id} className={styles.orderCard}>
                  <div className={styles.orderHead}>
                    <strong>#{pedido.id.toString().slice(-4)}</strong>
                    <span>{new Date(pedido.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={styles.orderBody}>
                    <p className={styles.phone}>{pedido.cliente.telefone}</p>
                    <p className={styles.address}>{pedido.cliente.endereco}</p>
                    <div className={styles.itemsList}>
                      {pedido.itens.map((it, i) => <span key={i}>{it.nome}</span>)}
                    </div>
                  </div>
                  <div className={styles.orderFooter}>
                    <span className={styles.totalValue}>R$ {pedido.total.toFixed(2)}</span>
                    <div className={styles.actions}>
                      {pedido.status === 'Pendente' && (
                        <button onClick={() => mudarStatus(pedido.id, 'Preparando')} className={styles.btnAceitar}>ACEITAR</button>
                      )}
                      {pedido.status === 'Preparando' && (
                        <button onClick={() => mudarStatus(pedido.id, 'Entregue')} className={styles.btnDespachar}>CONCLUIR</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Nenhum pedido na aba <strong>{abaAtiva}</strong></p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}