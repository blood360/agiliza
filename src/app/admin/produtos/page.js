'use client'
import { useState, useEffect } from 'react';
import styles from './produtos.module.css';
import Link from 'next/link';

export default function ListaProdutosAdmin() {
  const [produtos, setProdutos] = useState([]);

  // Carrega os produtos do LocalStorage
  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem('agiliza_produtos') || '[]');
    setProdutos(salvos);
  }, []);

  const excluirProduto = (id) => {
    if(confirm("Tem certeza que quer apagar esse produto, macho?")) {
      const novaLista = produtos.filter(p => p.id !== id);
      setProdutos(novaLista);
      localStorage.setItem('agiliza_produtos', JSON.stringify(novaLista));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <Link href="/admin" className={styles.btnVoltar}>← Painel Principal</Link>
          <h1>Meus Produtos</h1>
        </div>
        <Link href="/admin/produtos/novo" className={styles.btnNovo}>
          ➕ Novo Produto
        </Link>
      </header>

      <div className={styles.tabelaWrapper}>
        {produtos.length > 0 ? (
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.nome}</strong></td>
                  <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
                  <td><span className={styles.badge}>{p.categoria}</span></td>
                  <td className={styles.acoes}>
                    <button className={styles.btnEditar}>✏️</button>
                    <button 
                      className={styles.btnExcluir} 
                      onClick={() => excluirProduto(p.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.vazio}>
            <p>Você não tem nenhum produto cadastrado, clique no botão para cadastrar.</p>
          </div>
        )}
      </div>
    </div>
  );
}