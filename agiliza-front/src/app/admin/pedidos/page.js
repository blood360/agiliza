'use client'
import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import Link from 'next/link';
import Image from 'next/image';
import API_URL from '@/config/api'; // 👈 Vital para o banco real
import { useNotify } from '@/context/ToastContext';

export default function HistoricoPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const notify = useNotify();

  // 🛡️ 1. BUSCA PEDIDOS REAIS DO BANCO
  useEffect(() => {
    const carregarPedidosReais = async () => {
      try {
        const userJson = localStorage.getItem('@Agiliza:Usuario');
        if (!userJson) return window.location.href = '/login';
        
        const usuario = JSON.parse(userJson);
        const lojaId = usuario.lojaId;

        if (!lojaId || lojaId === "null") return;

        const res = await fetch(`${API_URL}/api/pedidos?lojaId=${lojaId}`);
        const dados = await res.json();

        if (Array.isArray(dados)) {
          setPedidos(dados);
        }
      } catch (err) {
        notify("Vixe, erro ao carregar o histórico!", "error");
      } finally {
        setCarregando(false);
      }
    };

    carregarPedidosReais();
  }, []);

  // 📥 Função para exportar o relatório (Ajustada para os campos do MongoDB)
  const exportarRelatorio = () => {
    const cabecalho = "ID,Data,Cliente,Total,Status\n";
    const dados = pedidos.map(p => 
      `${p._id.slice(-6)},${new Date(p.createdAt).toLocaleDateString()},${p.cliente?.nome || 'Cliente'},${p.total},${p.status}`
    ).join("\n");
    
    const blob = new Blob([cabecalho + dados], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_agiliza_${new Date().toLocaleDateString()}.csv`;
    a.click();
    notify("Relatório gerado com sucesso, meu patrão!", "success");
  };

  const abrirDetalhes = (pedido) => {
    setPedidoSelecionado(pedido);
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setPedidoSelecionado(null);
  };

  const pedidosFiltrados = filtro === 'Todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === filtro);

  if (carregando) return <div className={styles.loader}>Buscando o arquivo morto... 🌵</div>;

  return (
    <div className={styles.dashboardWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.brandArea}>
          <h2>AS <span>Agiliza</span></h2>
        </div>
        <nav className={styles.navMenu}>
          <Link href="/admin" className={styles.navItem}>📊 Dashboard</Link>
          <Link href="/admin/pedidos" className={`${styles.navItem} ${styles.active}`}>🛒 Pedidos</Link>
          <Link href="/admin/produtos" className={styles.navItem}>🍔 Meu Cardápio</Link>
          <Link href="/admin/perfil" className={styles.navItem}>⚙️ Configurações</Link>
        </nav>
        <div className={styles.upgradeBox}>
          <Image src="/logoAS.png" alt="Logo AS" width={100} height={35} className={styles.logoSidebar} priority />
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
          <div className={styles.welcomeText}>
            <h1>Pedidos 🛒</h1>
            <p>Gerencie o histórico e exporte seus resultados.</p>
          </div>
          <button onClick={exportarRelatorio} className={styles.btnExportar}>
            📥 Exportar Relatório (CSV)
          </button>
        </header>

        <section className={styles.filterBar}>
          {['Todos', 'Pendente', 'Preparando', 'Entregue'].map(f => (
            <button 
              key={f} 
              onClick={() => setFiltro(f)}
              className={filtro === f ? styles.filterActive : styles.filterBtn}
            >
              {f}
            </button>
          ))}
        </section>

        <section className={styles.tableSection}>
          <table className={styles.tabelaAgiliza}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length > 0 ? pedidosFiltrados.map((p) => (
                <tr key={p._id}>
                  <td><strong>#{p._id.slice(-4)}</strong></td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>{p.cliente?.nome || p.cliente?.telefone}</td>
                  <td className={styles.txtPreco}>R$ {p.total.toFixed(2)}</td>
                  <td><span className={`${styles.badgeStatus} ${styles[p.status.toLowerCase()]}`}>{p.status}</span></td>
                  <td>
                    <button onClick={() => abrirDetalhes(p)} className={styles.btnVerMais}>
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className={styles.tdVazio}>Nenhum pedido encontrado no banco.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        {/* MODAL DE DETALHES (Sincronizado com o Checkout) */}
        {isModalOpen && pedidoSelecionado && (
          <div className={styles.modalOverlay} onClick={fecharModal}>
            <div className={styles.modalDetalhes} onClick={e => e.stopPropagation()}>
              <header className={styles.modalHeader}>
                <h2>Detalhes #{pedidoSelecionado._id.slice(-4)}</h2>
                <button onClick={fecharModal} className={styles.btnClose}>&times;</button>
              </header>
              <div className={styles.modalBody}>
                <section className={styles.infoBloco}>
                  <h3>📍 Entrega</h3>
                  <p><strong>Cliente:</strong> {pedidoSelecionado.cliente?.nome}</p>
                  <p><strong>WhatsApp:</strong> {pedidoSelecionado.cliente?.whatsapp || pedidoSelecionado.cliente?.telefone}</p>
                  <p><strong>Endereço:</strong> {pedidoSelecionado.cliente?.endereco}</p>
                  <p><strong>Pagamento:</strong> {pedidoSelecionado.pagamento || 'Pix'}</p>
                </section>
                <section className={styles.infoBloco}>
                  <h3>🍔 Itens</h3>
                  <div className={styles.listaItensModal}>
                    {pedidoSelecionado.itens?.map((item, index) => (
                      <div key={index} className={styles.itemLinha}>
                        <span>{item.qtd || 1}x {item.nome}</span>
                        <span>R$ {item.preco.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.totalModal}>
                    <strong>Total:</strong>
                    <strong>R$ {pedidoSelecionado.total.toFixed(2)}</strong>
                  </div>
                </section>
              </div>
              <footer className={styles.modalFooter}>
                <button onClick={() => window.print()} className={styles.btnImprimir}>🖨️ Imprimir Cupom</button>
                <button onClick={fecharModal} className={styles.btnFecharModal}>Fechar</button>
              </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}