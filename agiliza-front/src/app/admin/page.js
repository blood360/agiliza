'use client'
import { useState, useEffect, useCallback, useRef } from 'react'; // 👈 useRef adicionado
import Image from 'next/image';
import styles from './admin.module.css';
import Link from 'next/link';
import API_URL from '@/config/api'; 
import { useNotify } from '@/context/ToastContext';

export default function DashboardAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loja, setLoja] = useState(null); 
  const [lojaAberta, setLojaAberta] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('Pendente');
  const [carregando, setCarregando] = useState(true);
  const notify = useNotify();
  const audioRef = useRef(null); // 👈 Referência para o som não duplicar

  // 🛡️ 1. FUNÇÃO MESTRA: BUSCA DADOS E CONTROLA O SOM
  const carregarTudo = useCallback(async () => {
    try {
      const userJson = localStorage.getItem('@Agiliza:Usuario');
      if (!userJson) {
          window.location.href = '/login';
          return;
      }
      
      const usuario = JSON.parse(userJson);
      const lojaId = usuario.lojaId;

      if (!lojaId || lojaId === "null") {
        setCarregando(false);
        return;
      }

      // A. Busca dados da Loja
      const resLoja = await fetch(`${API_URL}/api/assinantes/${lojaId}`);
      if (resLoja.ok) {
        const dadosLoja = await resLoja.json();
        setLoja(dadosLoja);
        // Ajustado para bater com o campo 'status' do seu backend
        setLojaAberta(dadosLoja.status !== 'fechada');
      }

      // B. Busca Pedidos da Loja
      const resPedidos = await fetch(`${API_URL}/api/pedidos?lojaId=${lojaId}`);
      if (resPedidos.ok) {
        const novosPedidos = await resPedidos.json();
        if (Array.isArray(novosPedidos)) {
          setPedidos(novosPedidos);

          // 🔔 LÓGICA DO SOM INSISTENTE
          const temPendente = novosPedidos.some(p => p.status === 'Pendente');

          if (temPendente) {
            if (!audioRef.current) {
              audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audioRef.current.loop = true; // 👈 Fica repetindo
            }
            if (audioRef.current.paused) {
              audioRef.current.play().catch(() => {});
            }
          } else {
            // Se não tem pendente, silêncio total
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setCarregando(false);
    }
  }, []); // Fecha carregarTudo

  // 🔄 2. MONITOR: ATUALIZA A CADA 10 SEGUNDOS
  useEffect(() => {
    carregarTudo();
    const intervalo = setInterval(() => {
      carregarTudo();
    }, 10000); 

    return () => {
      clearInterval(intervalo);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [carregarTudo]);

  // 🛑 3. PAUSAR/ABRIR VENDAS (Sincronizado com o Backend)
  const toggleLoja = async () => {
    if (!loja?._id) return;
    const novoStatus = lojaAberta ? 'fechada' : 'Ativo';
    try {
      const res = await fetch(`${API_URL}/api/assinantes/${loja._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }) // Envia como 'status'
      });
      if (res.ok) {
        setLojaAberta(!lojaAberta);
        notify(lojaAberta ? "Loja Fechada! 🔒" : "Loja Aberta! 🚀", "success");
      }
    } catch (err) {
      notify("Erro ao mudar status", "error");
    }
  };

  // ✅ 4. MUDAR STATUS DO PEDIDO (Aceitar/Concluir)
  const mudarStatus = async (id, novoStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/pedidos/${id}`, {
        method: 'PUT', // Se seu backend usa router.put('/:id'...)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      if (res.ok) {
        setPedidos(prev => prev.map(p => p._id === id ? { ...p, status: novoStatus } : p));
        notify(`Pedido ${novoStatus === 'Preparando' ? 'Aceito' : 'Concluído'}!`, "success");
      }
    } catch (err) {
      notify("Erro ao atualizar pedido", "error");
    }
  };

  const totalVendas = pedidos.filter(p => p.status === 'Entregue').reduce((acc, p) => acc + (p.total || 0), 0);
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
          <Image src="/logoAS.png" alt="Logo AS" width={100} height={35} priority className={styles.logoSidebar}/>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
          <div className={styles.welcomeText}>
            <h1>{loja?.loja || 'Painel do Lojista'} 🏪</h1>
            <p>Seja bem-vindo, {loja?.dono || 'Lojista'}.</p>
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
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pedidos Hoje</span>
            <h3 className={styles.statValue}>{pedidos.length}</h3>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Novos Pendentes</span>
            <h3 className={`${styles.statValue} ${styles.alert}`}>{novosPedidosCount}</h3>
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
                    <span>{new Date(pedido.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className={styles.orderBody}>
                    <p className={styles.phone}>{pedido.cliente?.whatsapp || pedido.cliente?.telefone}</p>
                    <p className={styles.address}>{pedido.cliente?.endereco}</p>
                    <div className={styles.itemsList}>
                      {pedido.itens?.map((it, i) => <span key={i}>{it.qtd}x {it.nome}</span>)}
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