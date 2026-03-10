'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/config/api';
import MenuInferior from '@/components/MenuInferior';
import styles from './pedidos.module.css';
import { useNotify } from '@/context/ToastContext';

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();
  const notify = useNotify();

  useEffect(() => {
    const carregarPedidos = async () => {
      const token = localStorage.getItem('agiliza_token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Buscando os pedidos reais do cliente logado
        const res = await fetch(`${API_URL}/api/pedidos/meus-pedidos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setPedidos(data);
        } else {
          notify("Não consegui carregar seu histórico.", "error");
        }
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarPedidos();
  }, [router, notify]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Meus Pedidos 📋</h1>
      </header>

      <main className={styles.lista}>
        {carregando ? (
          <p className={styles.aviso}>Buscando seus pedidos... ⏳</p>
        ) : pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <div key={pedido._id} className={styles.cardPedido}>
              <div className={styles.info}>
                <h3>Pedido #{pedido._id.slice(-6)}</h3>
                <p className={styles.data}>{new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</p>
                <p><strong>Loja:</strong> {pedido.nomeLoja}</p>
                <p><strong>Total:</strong> R$ {pedido.total.toFixed(2)}</p>
              </div>
              <div className={`${styles.status} ${styles[pedido.status]}`}>
                {pedido.status.toUpperCase()}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.vazio}>
            <p>Você ainda não fez nenhum pedido em Magé. 🌵</p>
            <button onClick={() => router.push('/explorar')} className={styles.btnBora}>
              Bora pedir uma pizza? 🍕
            </button>
          </div>
        )}
      </main>

      <MenuInferior />
    </div>
  );
}