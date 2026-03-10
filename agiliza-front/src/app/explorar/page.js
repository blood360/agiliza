'use client'
import { useState, useEffect } from 'react';
import styles from './explorar.module.css';
import { useNotify } from '@/context/ToastContext';
import API_URL from '@/config/api';
import MenuInferior from '@/components/MenuInferior';

export default function ExplorarPage() {
  const [busca, setBusca] = useState('');
  const [lojas, setLojas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const notify = useNotify();

  useEffect(() => {
    const carregarLojas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/assinantes`);
        
        if (!res.ok) throw new Error("Erro ao buscar dados");
        
        const data = await res.json();
        setLojas(data);
      } catch (err) {
        console.error(err);
        notify("Desculpe! Não consegui carregar as vitrines.", "error");
      } finally {
        setCarregando(false);
      }
    };
    carregarLojas();
  }, [notify]);

  const lojasFiltradas = lojas.filter(loja => 
    loja.loja.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Agiliza <span>Marketplace</span></h1>
        <div className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="O que você procura hoje? (Pizza, Bebidas...)" 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <span className={styles.iconLupa}>🔍</span>
        </div>
      </header>

      <main className={styles.gridLojas}>
        {carregando ? (
          <p className={styles.vazio}>Procurando as melhores lojas... 📦</p>
        ) : lojasFiltradas.length > 0 ? (
          lojasFiltradas.map(loja => (
            <a href={`/${loja.slug}`} key={loja._id} className={styles.cardLoja}>
              <div className={styles.infoLoja}>
                <h3>{loja.loja}</h3>
                <p>📍 {loja.cidade || 'Magé, RJ'}</p>
                <span className={styles.statusOpen}>Aberta agora</span>
              </div>
              <button className={styles.btnVisitar}>Visitar Loja</button>
            </a>
          ))
        ) : (
          <p className={styles.vazio}>Desculpe não encontrei essa loja!</p>
        )}
      </main>

      <MenuInferior /> 
    </div>
  );
}