'use client'
import { useState, useEffect } from 'react';
import styles from './clientes.module.css';
import Link from 'next/link';
import API_URL from '@/config/api';
import { useNotify } from '@/context/ToastContext';

export default function GestaoClientes() {
  const notify = useNotify();
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarCRM = async () => {
      try {
        const userJson = localStorage.getItem('@Agiliza:Usuario');
        const usuario = JSON.parse(userJson);
        const res = await fetch(`${API_URL}/api/clientes?lojaId=${usuario.lojaId}`);
        const dados = await res.json();
        setClientes(dados);
      } catch (err) {
        notify("Vixe! Deu erro no CRM.", "error");
      } finally {
        setCarregando(false);
      }
    };
    buscarCRM();
  }, []);

  if (carregando) return <p style={{padding: '40px'}}>Analisando quem é fiel... 🌵</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.btnVoltar}>← Painel</Link>
        <h1>👑 Gestão de Clientes (CRM)</h1>
      </header>

      <section className={styles.cardLista}>
        <h2>Seus Melhores Clientes</h2>
        <p>Quem gasta mais, aparece primeiro no topo! 💸</p>
        
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>WhatsApp</th>
              <th>Pedidos</th>
              <th>Total Gasto</th>
              <th>Última Vez</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c, index) => (
              <tr key={c._id}>
                <td>
                  {index === 0 && "🥇 "}
                  {index === 1 && "🥈 "}
                  {index === 2 && "🥉 "}
                  <strong>{c.nome || 'Cliente Misterioso'}</strong>
                </td>
                <td>{c._id}</td>
                <td>{c.qtdPedidos}</td>
                <td className={styles.valor}>R$ {c.totalGasto.toFixed(2)}</td>
                <td>{new Date(c.ultimoPedido).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}