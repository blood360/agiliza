'use client'
import { useState, useEffect, useRef, useCallback } from 'react'; // 👈 Adicionado com cuidado
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

  // 🛡️ Ref para monitorar mudanças de status sem causar re-renderização infinita
  const statusAnteriorRef = useRef({});

  // 🔄 1. FUNÇÃO MESTRA (Busca os dados e decide se toca o som)
  const carregarPedidos = useCallback(async (isPrimeiraCarga = false) => {
    const token = localStorage.getItem('agiliza_token');
    if (!token) return router.push('/login');

    try {
      const res = await fetch(`${API_URL}/api/pedidos/meus-pedidos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        // 🔔 Lógica de Notificação e Som
        data.forEach(p => {
          const statusAntigo = statusAnteriorRef.current[p._id];
          
          // Só toca o som se o status mudou E não é a primeira vez que abrimos a tela
          if (!isPrimeiraCarga && statusAntigo && statusAntigo !== p.status) {
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
            
            // Notificação personalizada baseada no seu Dashboard (3 status)
            let msg = `O status do seu pedido na ${p.nomeLoja} mudou para: ${p.status}`;
            if (p.status === 'Preparando') msg = `👨‍🍳 A ${p.nomeLoja} começou a preparar seu pedido!`;
            if (p.status === 'Entregue') msg = `✅ Seu pedido da ${p.nomeLoja} foi entregue. Bom apetite!`;
            
            notify(msg, "success");
          }
          // Salva o status atual na memória para a próxima comparação
          statusAnteriorRef.current[p._id] = p.status;
        });

        setPedidos(data);
      }
    } catch (err) {
      console.error("Erro de conexão com o servidor da AS:", err);
    } finally {
      if (isPrimeiraCarga) setCarregando(false);
    }
  }, [router, notify]);

  // 🚀 2. MONITOR (Inicia o polling de 15 segundos)
  useEffect(() => {
    carregarPedidos(true); // Carrega a primeira vez com o loader da moto

    const intervalo = setInterval(() => {
      carregarPedidos(); // Fica vigiando o banco em silêncio
    }, 15000); 

    return () => clearInterval(intervalo); // Limpa o timer ao sair da página
  }, [carregarPedidos]);

  // 🎨 3. FUNÇÃO PARA DEFINIR A COR DO STATUS (Baseado nos seus 3 status)
  const getCorStatus = (status) => {
    if (status === 'Pendente') return '#f1c40f';   // Amarelo
    if (status === 'Preparando') return '#3498db'; // Azul
    if (status === 'Entregue') return '#27ae60';   // Verde
    return '#666'; // Cor padrão
  };

  // --- RENDERIZAÇÃO DO LOADER (Mantido exatamente como o seu) ---
  if (carregando) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinnerWrapper}>
          <img src="/motoagiliza.png" alt="Moto Agiliza" className={styles.loaderImage} />
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loaderText}>Aguarde, estou consultando seus pedidos...</p>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DA PÁGINA ---
  return (
    <div className={styles.container}>
      <header className={styles.header}><h1>Meus Pedidos</h1></header>
      <main>
        {pedidos.length > 0 ? (
          pedidos.map(p => (
            <div key={p._id} className={styles.card}>
              <label>Loja: {p.nomeLoja}</label>
              <p>Total: R$ {p.total.toFixed(2)}</p>
              
              {/* 🌈 STATUS COM COR DINÂMICA */}
              <p>Status: <strong style={{ color: getCorStatus(p.status) }}>{p.status}</strong></p>
            </div>
          ))
        ) : (
          <p className={styles.loaderText}>Nenhum pedido feito ainda. 🌵</p>
        )}
      </main>
      <MenuInferior />
    </div>
  );
}