'use client'
import styles from './ListaProdutos.module.css';

export default function ListaProdutosGrid({ produtos }) {
  return (
    <div className={styles.gridContainer}>
      {produtos.map((produto) => (
        <div key={produto.id} className={styles.produtoCard}>
          <div className={styles.imagePlaceholder}>
             {/* Aqui entra a tag <img src={produto.img} /> quando tiver as fotos */}
             <span className={styles.emojiImg}>🍲</span> 
          </div>
          <div className={styles.info}>
            <h3 className={styles.produtoNome}>{produto.nome}</h3>
            <p className={styles.produtoPreco}>R$ {produto.preco.toFixed(2)}</p>
            <button className={styles.btnAdd}>Adicionar ao Pedido</button>
          </div>
        </div>
      ))}
    </div>
  );
}