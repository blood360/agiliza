'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './admin.module.css';
import Link from 'next/link';
import API_URL from '@/config/api'; // 👈 Importante!
import { useNotify } from '@/context/ToastContext';

export default function DashboardAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loja, setLoja] = useState(null); // Para o nome da loja real
  const [lojaAberta, setLojaAberta] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('Pendente');
  const [carregando, setCarregando] = useState(true);
  const notify = useNotify();

  // 1. Lógica de Carregamento Real (API)
  useEffect(() => {
    const carregarTudo = async () => {
      try {
        const userJson = localStorage.getItem('@Agiliza:Usuario');
        if (!userJson) return window.location.href = '/login';
        
        const usuario = JSON.parse(userJson);
        const lojaId = usuario.lojaId;

        // A. Busca dados da Loja (Status e Nome)
        const resLoja = await fetch(`${API_URL}/api/assinantes/${lojaId}`);
        const dadosLoja = await resLoja.json();
        setLoja(dadosLoja);
        setLojaAberta(dadosLoja.status_loja !== 'fechada');

        // B. Busca Pedidos da Loja
        const resPedidos = await fetch(`${API_URL}/api/pedidos?lojaId=${lojaId}`);
        const novosPedidos = await resPedidos.json();
        
        // Alerta sonoro se chegar pedido novo no banco
        if (novosPedidos.length > pedidos.length && novosPedidos.some(p => p.status === 'Pendente')) {
          new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
        }

        setPedidos(Array.isArray(novosPedidos) ? novosPedidos : []);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarTudo();
    const intervalo = setInterval(carregarTudo, 10000); // Polling de 10s pra não fritar o Render
    return () => clearInterval(intervalo);
  }, [pedidos.length]);

  // 2. Funções de Controle (Agora salvam no Banco!)
  const toggleLoja = async () => {
    const novoStatus = lojaAberta ? 'fechada' : 'aberta';
    try {
      const res = await fetch(`${API_URL}/api/assinantes/${loja._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_loja: novoStatus })
      });
      if (res.ok) {
        setLojaAberta(!lojaAberta);
        notify(lojaAberta ? "Loja Fechada! 🔒" : "Loja Aberta! 🚀", "success");
      }
    } catch (err) {
      notify("Erro ao mudar status da loja", "error");
    }
  };

  const mudarStatus = async (id, novoStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      if (res.ok) {
        setPedidos(pedidos.map(p => p._id === id ? { ...p, status: novoStatus } : p));
        notify(`Pedido movido para ${novoStatus}!`, "success");
      }
    } catch (err) {
      notify("Erro ao atualizar pedido", "error");
    }
  };

  // 3. Métricas Reais
  const totalVendas = pedidos.filter(p => p.status === 'Entregue').reduce((acc, p) => acc + p.total, 0);
  const novosPedidosCount = pedidos.filter(p => p.status === 'Pendente').length;

  if (carregando) return <div className={styles.loader}>Arrochando os dados... 🌵</div>;

  return (
    <div className={styles.dashboardWrapper}>
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
          <Image src="/logoAS.png" alt="Logo AS" width={100} height={35} priority />
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
          <div className={styles.welcomeText}>
            {/* 🎯 AQUI: Agora mostra o nome da loja real do banco! */}
            <h1>{loja?.loja || 'Painel do Lojista'} 🏪</h1>
            <p>Seja bem-vindo, {loja?.dono || 'Adriano'}. Veja o resumo da sua Loja.</p>
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
                <div key={pedido._id} className={styles.orderCard}>
                  <div className={styles.orderHead}>
                    <strong>#{pedido._id.slice(-4)}</strong>
                    <span>{new Date(pedido.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={styles.orderBody}>
                    <p className={styles.phone}>{pedido.telefone || pedido.cliente?.telefone}</p>
                    <p className={styles.address}>{pedido.endereco || pedido.cliente?.endereco}</p>
                    <div className={styles.itemsList}>
                      {pedido.itens.map((it, i) => <span key={i}>{it.qtd}x {it.nome}</span>)}
                    </div>
                  </div>
                  <div className={styles.orderFooter}>
                    <span className={styles.totalValue}>R$ {pedido.total.toFixed(2)}</span>
                    <div className={styles.actions}>
                      {pedido.status === 'Pendente' && (
                        <button onClick={() => mudarStatus(pedido._id, 'Preparando')} className={styles.btnAceitar}>ACEITAR</button>
                      )}
                      {pedido.status === 'Preparando' && (
                        <button onClick={() => mudarStatus(pedido._id, 'Entregue')} className={styles.btnDespachar}>CONCLUIR</button>
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