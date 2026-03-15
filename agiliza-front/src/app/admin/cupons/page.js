'use client'
import { useState, useEffect } from 'react';
import styles from './cupons.module.css';
import Link from 'next/link';
import API_URL from '@/config/api';
import { useNotify } from '@/context/ToastContext';

export default function GerenciarCupons() {
  const notify = useNotify();
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [novoCupom, setNovoCupom] = useState({
    codigo: '',
    tipo: 'fixo',
    valor: '',
    vencimento: '',
    usoMinimo: 0
  });

  const carregarCupons = async () => {
    try {
      const userJson = localStorage.getItem('@Agiliza:Usuario');
      const usuario = JSON.parse(userJson);
      const res = await fetch(`${API_URL}/api/cupons?lojaId=${usuario.lojaId}`);
      const dados = await res.json();
      if (Array.isArray(dados)) setCupons(dados);
    } catch (err) {
      notify("Erro ao carregar seus cupons, macho!", "error");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarCupons(); }, []);

  const salvarCupom = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const userJson = localStorage.getItem('@Agiliza:Usuario');
      const usuario = JSON.parse(userJson);
      const res = await fetch(`${API_URL}/api/cupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...novoCupom, lojaId: usuario.lojaId })
      });
      if (res.ok) {
        notify("Cupom criado com sucesso! 🎫", "success");
        setNovoCupom({ codigo: '', tipo: 'fixo', valor: '', vencimento: '', usoMinimo: 0 });
        carregarCupons();
      }
    } catch (err) { notify("Erro ao salvar cupom.", "error"); } 
    finally { setEnviando(false); }
  };

  const excluirCupom = async (id) => {
    if (!confirm("Vai apagar esse desconto mesmo? 🗑️")) return;
    try {
      await fetch(`${API_URL}/api/cupons/${id}`, { method: 'DELETE' });
      setCupons(cupons.filter(c => c._id !== id));
      notify("Cupom removido!", "success");
    } catch (err) { notify("Erro ao excluir.", "error"); }
  };

  if (carregando) return <p className={styles.vazio}>Arrochando os vales... 🌵</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.btnVoltar}>← Painel</Link>
        <h1>🎫 Cupons de Desconto</h1>
      </header>

      <div className={styles.grid}>
        <section className={styles.cardForm}>
          <h2>Criar Novo Cupom</h2>
          <form onSubmit={salvarCupom}>
            <div className={styles.campo}>
              <label>Código do Cupom</label>
              <input 
                type="text" 
                placeholder="Ex: AGILIZA10"
                value={novoCupom.codigo}
                onChange={e => setNovoCupom({...novoCupom, codigo: e.target.value.toUpperCase()})}
                required 
              />
            </div>

            <div className={styles.row}>
              <div className={styles.campo}>
                <label>Tipo</label>
                <select value={novoCupom.tipo} onChange={e => setNovoCupom({...novoCupom, tipo: e.target.value})}>
                  <option value="fixo">R$</option>
                  <option value="porcentagem">%</option>
                </select>
              </div>
              <div className={styles.campo}>
                <label>Valor</label>
                <input 
                  type="number" 
                  value={novoCupom.valor}
                  onChange={e => setNovoCupom({...novoCupom, valor: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className={styles.campo}>
              <label>Vencimento</label>
              <input 
                type="date" 
                value={novoCupom.vencimento}
                onChange={e => setNovoCupom({...novoCupom, vencimento: e.target.value})}
                required 
              />
            </div>

            <div className={styles.campo}>
              <label>Pedido Mínimo (R$)</label>
              <input 
                type="number" 
                value={novoCupom.usoMinimo}
                onChange={e => setNovoCupom({...novoCupom, usoMinimo: e.target.value})}
              />
            </div>

            <button type="submit" className={styles.btnSalvar} disabled={enviando}>
              {enviando ? "Arrochando..." : "Criar Cupom ✅"}
            </button>
          </form>
        </section>

        <section className={styles.cardLista}>
          <h2>Meus Cupons</h2>
          {cupons.length > 0 ? (
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Valor</th>
                  <th>Expira</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cupons.map(c => (
                  <tr key={c._id}>
                    <td><strong>{c.codigo}</strong></td>
                    <td>{c.tipo === 'fixo' ? `R$ ${c.valor}` : `${c.valor}%`}</td>
                    <td>{new Date(c.vencimento).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => excluirCupom(c._id)} className={styles.btnExcluir}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nenhum cupom ativo. 👈</p>
          )}
        </section>
      </div>
    </div>
  );
}