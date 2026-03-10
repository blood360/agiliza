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
      if (!token) return router.push('/login');

      try {
        const res = await fetch(`${API_URL}/api/pedidos/meus-pedidos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setPedidos(data);
      } catch (err) {
        notify("Erro ao buscar seus pedidos.", "error");
      } finally {
        setCarregando(false);
      }
    };
    carregarPedidos();
  }, [router, notify]);

  if (carregando) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinnerWrapper}>
          <img src="/motoagiliza.png" alt="Moto Agiliza" className={styles.loaderImage} />
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loaderText}>aguarde, estou consultando seus pedidos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Meus Pedidos</h1>
      </header>
      <main className={styles.lista}>
        {pedidos.length > 0 ? (
          pedidos.map(p => (
            <div key={p._id} className={styles.cardPedido}>
              <p><strong>{p.nomeLoja}</strong></p>
              <p>Total: R$ {p.total.toFixed(2)}</p>
              <span className={styles.status}>{p.status}</span>
            </div>
          ))
        ) : (
          <p className={styles.vazio}>Nenhum pedido encontrado.</p>
        )}
      </main>
      <MenuInferior />
    </div>
  );
}