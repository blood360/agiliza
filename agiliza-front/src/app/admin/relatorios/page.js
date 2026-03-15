'use client'
import { useState, useEffect } from 'react';
import styles from './relatorios.module.css';
import Link from 'next/link';
import API_URL from '@/config/api';
import { useNotify } from '@/context/ToastContext';

export default function RelatoriosVendas() {
  const notify = useNotify();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const userJson = localStorage.getItem('@Agiliza:Usuario');
        const usuario = JSON.parse(userJson);
        const res = await fetch(`${API_URL}/api/relatorios/geral?lojaId=${usuario.lojaId}`);
        const d = await res.json();
        setDados(d);
      } catch (err) {
        notify("Vixe! Deu erro ao buscar o relatório.", "error");
      } finally {
        setCarregando(false);
      }
    };
    buscarDados();
  }, []);

  if (carregando) return <p className={styles.aviso}>Calculando o lucro... 🌵💰</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.btnVoltar}>← Painel</Link>
        <h1>📈 Relatórios de Vendas</h1>
      </header>

      {/* Cards de Resumo */}
      <div className={styles.gridCards}>
        <div className={styles.card}>
          <h3>Faturamento Total</h3>
          <p className={styles.valorPrincipal}>R$ {dados.faturamento.toFixed(2)}</p>
        </div>
        <div className={styles.card}>
          <h3>Total de Pedidos</h3>
          <p className={styles.valor}>{dados.pedidos}</p>
        </div>
        <div className={styles.card}>
          <h3>Ticket Médio</h3>
          <p className={styles.valor}>R$ {dados.ticketMedio}</p>
        </div>
      </div>

      {/* Ranking de Produtos */}
      <section className={styles.sessaoTop}>
        <h2>🏆 Top 5 Produtos Mais Vendidos</h2>
        <div className={styles.listaTop}>
          {dados.topProdutos.map((p, i) => (
            <div key={i} className={styles.itemTop}>
              <span className={styles.rank}>{i + 1}º</span>
              <span className={styles.nomeProd}>{p._id}</span>
              <span className={styles.qtdProd}>{p.quantidade} vendas</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}