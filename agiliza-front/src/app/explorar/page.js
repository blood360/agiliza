'use client'
import { useState, useEffect } from 'react';
import styles from './explorar.module.css';
import { useNotify } from '@/context/ToastContext';

export default function ExplorarPage() {
  const [busca, setBusca] = useState('');
  const [lojas, setLojas] = useState([]);
  const notify = useNotify();

  // Busca todas as lojas ativas no início
  useEffect(() => {
    const carregarLojas = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/assinantes');
        const data = await res.json();
        setLojas(data);
      } catch (err) {
        notify("Erro ao carregar vitrines.", "error");
      }
    };
    carregarLojas();
  }, []);

  // Filtra as lojas pela lupa
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
        {lojasFiltradas.length > 0 ? (
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
          <p className={styles.vazio}>Vixe, macho! Achei essa loja não. 🌵</p>
        )}
      </main>
    </div>
  );
}