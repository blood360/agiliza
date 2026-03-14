'use client'
import { useState, useEffect } from 'react';
import styles from './produtos.module.css';
import Link from 'next/link';
import API_URL from '@/config/api'; 
import { useNotify } from '@/context/ToastContext';

export default function ListaProdutosAdmin() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // 📝 ESTADOS PARA EDIÇÃO
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const notify = useNotify();

  const carregarProdutos = async () => {
    try {
      const userJson = localStorage.getItem('@Agiliza:Usuario');
      if (!userJson) return window.location.href = '/login';
      const usuario = JSON.parse(userJson);
      const res = await fetch(`${API_URL}/api/produtos?lojaId=${usuario.lojaId}`);
      const dados = await res.json();
      if (Array.isArray(dados)) setProdutos(dados);
    } catch (err) {
      notify("Erro ao carregar produtos!", "error");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarProdutos(); }, []);

  // 🖊️ ABRE O MODAL COM OS DADOS DO PRODUTO
  const abrirEdicao = (produto) => {
    setProdutoEditando({ ...produto });
    setIsModalOpen(true);
  };

  // 💾 SALVA A ALTERAÇÃO NO BACKEND
  const salvarEdicao = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await fetch(`${API_URL}/api/produtos/${produtoEditando._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produtoEditando)
      });

      if (res.ok) {
        notify("Produto atualizado com sucesso! ✨", "success");
        setIsModalOpen(false);
        carregarProdutos(); // Recarrega a lista
      } else {
        notify("Erro ao salvar alteração.", "error");
      }
    } catch (err) {
      notify("Erro de conexão.", "error");
    } finally {
      setSalvando(false);
    }
  };

  const excluirProduto = async (id) => {
    if(confirm("Vai apagar mesmo, macho? 🗑️")) {
      try {
        const res = await fetch(`${API_URL}/api/produtos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setProdutos(produtos.filter(p => p._id !== id));
          notify("Já era! Excluído.", "success");
        }
      } catch (err) { notify("Erro ao excluir.", "error"); }
    }
  };

  if (carregando) return <div className={styles.vazio}>Arrochando o estoque... 📦</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <Link href="/admin" className={styles.btnVoltar}>← Painel</Link>
          <h1>Meus Produtos</h1>
        </div>
        <Link href="/admin/produtos/novo" className={styles.btnNovo}>➕ Novo</Link>
      </header>

      <div className={styles.tabelaWrapper}>
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
              <tr key={p._id}>
                <td><strong>{p.nome}</strong></td>
                <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
                <td><span className={styles.badge}>{p.categoria}</span></td>
                <td className={styles.acoes}>
                  {/* AGORA O BOTÃO FUNCIONA! */}
                  <button className={styles.btnEditar} onClick={() => abrirEdicao(p)}>✏️</button>
                  <button className={styles.btnExcluir} onClick={() => excluirProduto(p._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🖼️ MODAL DE EDIÇÃO (O PRESTÍGIO DA AS) */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Editar Produto ✏️</h3>
            <form onSubmit={salvarEdicao}>
              <label>Nome do Produto</label>
              <input 
                type="text" 
                value={produtoEditando.nome} 
                onChange={e => setProdutoEditando({...produtoEditando, nome: e.target.value})}
                required 
              />
              
              <label>Preço (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                value={produtoEditando.preco} 
                onChange={e => setProdutoEditando({...produtoEditando, preco: e.target.value})}
                required 
              />

              <label>Categoria</label>
              <select 
                value={produtoEditando.categoria}
                onChange={e => setProdutoEditando({...produtoEditando, categoria: e.target.value})}
              >
                <option value="Lanches">Lanches</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Sobremesas">Sobremesas</option>
                <option value="Combos">Combos</option>
              </select>

              <div className={styles.modalBotoes}>
                <button type="submit" className={styles.btnSalvar} disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar Alterações"}
                </button>
                <button type="button" className={styles.btnCancelar} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}