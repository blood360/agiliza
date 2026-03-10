'use client'
import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function HistoricoPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const carregar = () => {
      const atuais = JSON.parse(localStorage.getItem('agiliza_pedidos') || '[]');
      setPedidos(atuais);
    };
    carregar();
  }, []);

  // 📥 Função para exportar o relatório
  const exportarRelatorio = () => {
    const cabecalho = "ID,Data,Cliente,Total,Status\n";
    const dados = pedidos.map(p => 
      `${p.id},${new Date(p.id).toLocaleDateString()},${p.cliente.telefone},${p.total},${p.status}`
    ).join("\n");
    
    const blob = new Blob([cabecalho + dados], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_agiliza_${new Date().toLocaleDateString()}.csv`;
    a.click();
    alert("Relatório gerado com sucesso, meu patrão!");
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
          {/* BOTÃO DE EXPORTAR VOLTOU! */}
          <button onClick={exportarRelatorio} className={styles.btnExportar}>
            📥 Exportar Relatório (CSV)
          </button>
        </header>

        {/* BOTÕES DE FILTRO VOLTARAM! */}
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
                <tr key={p.id}>
                  <td><strong>#{p.id.toString().slice(-4)}</strong></td>
                  <td>{new Date(p.id).toLocaleDateString()}</td>
                  <td>{p.cliente.telefone}</td>
                  <td className={styles.txtPreco}>R$ {p.total.toFixed(2)}</td>
                  <td><span className={`${styles.badgeStatus} ${styles[p.status.toLowerCase()]}`}>{p.status}</span></td>
                  <td>
                    <button onClick={() => abrirDetalhes(p)} className={styles.btnVerMais}>
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className={styles.tdVazio}>Nenhum pedido encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        {/* MODAL DE DETALHES */}
        {isModalOpen && pedidoSelecionado && (
          <div className={styles.modalOverlay} onClick={fecharModal}>
            <div className={styles.modalDetalhes} onClick={e => e.stopPropagation()}>
              <header className={styles.modalHeader}>
                <h2>Detalhes #{pedidoSelecionado.id.toString().slice(-4)}</h2>
                <button onClick={fecharModal} className={styles.btnClose}>&times;</button>
              </header>
              <div className={styles.modalBody}>
                <section className={styles.infoBloco}>
                  <h3>📍 Entrega</h3>
                  <p><strong>Cliente:</strong> {pedidoSelecionado.cliente.telefone}</p>
                  <p><strong>Endereço:</strong> {pedidoSelecionado.cliente.endereco}</p>
                  <p><strong>Pagamento:</strong> {pedidoSelecionado.cliente.pagamento}</p>
                </section>
                <section className={styles.infoBloco}>
                  <h3>🍔 Itens</h3>
                  <div className={styles.listaItensModal}>
                    {pedidoSelecionado.itens.map((item, index) => (
                      <div key={index} className={styles.itemLinha}>
                        <span>1x {item.nome}</span>
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
                <button onClick={() => window.print()} className={styles.btnImprimir}>🖨️ Imprimir</button>
                <button onClick={fecharModal} className={styles.btnFecharModal}>Fechar</button>
              </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}