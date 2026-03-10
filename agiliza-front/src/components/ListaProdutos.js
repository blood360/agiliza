'use client'

import { useState } from 'react';
import { useAgiliza } from '@/context/AgilizaContext';
import styles from '@/app/page.module.css';
import Checkout from './Checkout'; // Importa a tela que a gente criou

export default function ListaProdutos({ produtos }) {
  const { carrinho, adicionarAoCarrinho } = useAgiliza();
  const [carrinhoAberto, setCarrinhoAberto] = useState(false); // O "interruptor"

  const total = carrinho.reduce((acc, item) => acc + item.preco, 0);

  return (
    <>
      <section className={styles.catalogo}>
        {produtos.map(produto => (
          <div key={produto.id} className={styles.card}>
            <img src={produto.img} alt={produto.nome} />
            <div className={styles.info}>
              <h3>{produto.nome}</h3>
              <p>R$ {produto.preco.toFixed(2)}</p>
              <button 
                className={styles.btnAdicionar}
                onClick={() => adicionarAoCarrinho(produto)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Barra que aparece quando tem item no carrinho */}
      {carrinho.length > 0 && (
        <div className={styles.barraCarrinho}>
          <p>{carrinho.length} itens no balaio</p>
          <button onClick={() => setCarrinhoAberto(true)}>
            Ver Carrinho (R$ {total.toFixed(2)})
          </button>
        </div>
      )}

      {/* Se o interruptor for true, mostra o Checkout */}
      {carrinhoAberto && (
        <Checkout aoFechar={() => setCarrinhoAberto(false)} />
      )}
    </>
  );
}