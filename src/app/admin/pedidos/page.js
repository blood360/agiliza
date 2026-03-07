'use client'
import { useState, useEffect } from 'react';
import styles from './monitor.module.css';
import Link from 'next/link';

export default function MonitorPedidos() {
  const [lojaAberta, setLojaAberta] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('Pendente');

  useEffect(() => {
    // 1. Carrega o status da loja (Aberto/Fechado)
    const statusSalvo = localStorage.getItem('agiliza_loja_aberta');
    setLojaAberta(statusSalvo !== 'false');

    const carregarEChecar = () => {
      const atuais = JSON.parse(localStorage.getItem('agiliza_pedidos') || '[]');
      
      // 2. Lógica do "Ding!" se houver pedido novo enquanto a página está aberta
      if (atuais.length > pedidos.length && atuais.some(p => p.status === 'Pendente')) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {
          console.log("Macho, clica na tela pro som funcionar!");
        });
      }
      setPedidos(atuais);
    };

    carregarEChecar();
    const intervalo = setInterval(carregarEChecar, 5000); // Pooling de 5 segundos
    return () => clearInterval(intervalo);
  }, [pedidos.length]);

  // Função para abrir e fechar a loja
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

  const pedidosFiltrados = pedidos.filter(p => p.status === abaAtiva);

  return (
    <div className={styles.gestorContainer}>
      {/* Sidebar de Navegação - Estilo iFood */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <h2>AS</h2>
          <span>Agiliza</span>
        </div>
        <nav className={styles.navLinks}>
          <Link href="/admin" className={styles.navItem}>📊 Resumo</Link>
          <Link href="/admin/pedidos" className={`${styles.navItem} ${styles.active}`}>🛒 Pedidos</Link>
          <Link href="/admin/produtos" className={styles.navItem}>🍔 Cardápio</Link>
          <Link href="/admin/perfil" className={styles.navItem}>⚙️ Configuração</Link>
        </nav>
      </aside>

      <main className={styles.conteudoPrincipal}>
        <header className={styles.topoGestor}>
          <div className={styles.infoLoja}>
            <h1>Gestor de Pedidos</h1>
            <div className={styles.statusLive}>
              <span className={lojaAberta ? styles.badgeOnline : styles.badgeOffline}>
                ● {lojaAberta ? 'LOJA ABERTA' : 'LOJA FECHADA'}
              </span>
            </div>
          </div>

          {/* Botão de Controle de Funcionamento (O disjuntor!) */}
          <div className={styles.controleAbertura}>
            <button 
              onClick={toggleLoja} 
              className={lojaAberta ? styles.btnPausar : styles.btnAbrir}
            >
              {lojaAberta ? '⏸️ Pausar Vendas' : '▶️ Abrir Loja'}
            </button>
          </div>
        </header>

        {/* Abas de Navegação de Status */}
        <div className={styles.abasStatus}>
          <button onClick={() => setAbaAtiva('Pendente')} className={abaAtiva === 'Pendente' ? styles.abaAtiva : ''}>
            Novos ({pedidos.filter(p => p.status === 'Pendente').length})
          </button>
          <button onClick={() => setAbaAtiva('Preparando')} className={abaAtiva === 'Preparando' ? styles.abaAtiva : ''}>
            Em Preparo ({pedidos.filter(p => p.status === 'Preparando').length})
          </button>
          <button onClick={() => setAbaAtiva('Entregue')} className={abaAtiva === 'Entregue' ? styles.abaAtiva : ''}>
            Concluídos ({pedidos.filter(p => p.status === 'Entregue').length})
          </button>
        </div>

        <div className={styles.listaPedidos}>
          {pedidosFiltrados.length > 0 ? pedidosFiltrados.map((pedido) => (
            <div key={pedido.id} className={styles.cardiFood}>
              <div className={styles.cardEsquerda}>
                <span className={styles.horaPedido}>
                  {new Date(pedido.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <span className={styles.idPedido}>#{pedido.id.toString().slice(-4)}</span>
              </div>
              
              <div className={styles.cardMeio}>
                <h3>{pedido.cliente.telefone}</h3>
                <p className={styles.enderecoResumo}>{pedido.cliente.endereco}</p>
                <div className={styles.itensResumo}>
                  {pedido.itens.map((it, i) => (
                    <span key={i}>{it.nome}{i < pedido.itens.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              </div>

              <div className={styles.cardDireita}>
                <span className={styles.valorPedido}>R$ {pedido.total.toFixed(2)}</span>
                <span className={styles.metodoPagamento}>{pedido.cliente.pagamento}</span>
                
                <div className={styles.botoesAcao}>
                  {pedido.status === 'Pendente' && (
                    <button onClick={() => mudarStatus(pedido.id, 'Preparando')} className={styles.btnAceitar}>
                      ACEITAR
                    </button>
                  )}
                  {pedido.status === 'Preparando' && (
                    <button onClick={() => mudarStatus(pedido.id, 'Entregue')} className={styles.btnDespachar}>
                      DESPACHAR
                    </button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className={styles.vazioEstado}>
              <p>Nenhum pedido na aba <strong>{abaAtiva}</strong></p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}