'use client'
import styles from './ListaProdutos.module.css';

export default function ListaProdutosGrid({ produtos, onAdd }) {
  return (
    <div className={styles.gridContainer}>
      {produtos.map((produto) => (
        <div key={produto.id} className={styles.produtoCard}>
          <div className={styles.imagePlaceholder}>🍲</div>
          <div className={styles.info}>
            <h3 className={styles.produtoNome}>{produto.nome}</h3>
            <p className={styles.produtoPreco}>R$ {produto.preco.toFixed(2)}</p>
            {/* Agora o botão funciona, macho! */}
            <button 
              className={styles.btnAdd} 
              onClick={() => onAdd(produto)}
            >
              Adicionar ao Pedido
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}