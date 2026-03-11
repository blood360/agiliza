'use client'
import { useState, useEffect } from 'react';
import styles from './produtos.module.css';
import Link from 'next/link';
import API_URL from '@/config/api'; // 👈 Vital!
import { useNotify } from '@/context/ToastContext';

export default function ListaProdutosAdmin() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const notify = useNotify();

  // 1. Lógica para carregar os produtos REAIS da Loja
  const carregarProdutos = async () => {
    try {
      // Pega o DNA da loja que logou
      const userJson = localStorage.getItem('@Agiliza:Usuario');
      if (!userJson) return window.location.href = '/login';
      
      const usuario = JSON.parse(userJson);
      const lojaId = usuario.lojaId;

      const resposta = await fetch(`${API_URL}/api/produtos?lojaId=${lojaId}`);
      const dados = await resposta.json();

      if (Array.isArray(dados)) {
        setProdutos(dados);
      }
    } catch (err) {
      notify("Vixe, erro ao carregar seus produtos!", "error");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // 2. Função de Excluir no Banco de Dados
  const excluirProduto = async (id) => {
    if(confirm("Tem certeza que quer apagar esse produto, macho? Ele vai sumir da vitrine! 🗑️")) {
      try {
        const res = await fetch(`${API_URL}/api/produtos/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          // Remove da tela na hora sem precisar dar F5
          setProdutos(produtos.filter(p => p._id !== id));
          notify("Produto excluído com sucesso!", "success");
        } else {
          notify("Erro ao tentar excluir no banco.", "error");
        }
      } catch (err) {
        notify("Erro de conexão ao excluir.", "error");
      }
    }
  };

  if (carregando) return <div className={styles.vazio}>Arrochando os itens do estoque... 📦</div>;

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
                <tr key={p._id}> {/* No MongoDB usamos _id */}
                  <td><strong>{p.nome}</strong></td>
                  <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
                  <td><span className={styles.badge}>{p.categoria}</span></td>
                  <td className={styles.acoes}>
                    {/* Aqui futuramente tu faz a página de editar */}
                    <button className={styles.btnEditar}>✏️</button>
                    <button 
                      className={styles.btnExcluir} 
                      onClick={() => excluirProduto(p._id)}
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
            <p>Você não tem nenhum produto cadastrado no banco, macho! 🌵</p>
            <Link href="/admin/produtos/novo" className={styles.btnNovo} style={{display: 'inline-block', marginTop: '10px'}}>
               Cadastrar meu Primeiro Item
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}