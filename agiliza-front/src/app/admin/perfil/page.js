'use client'
import { useState, useEffect } from 'react';
import styles from './perfil-admin.module.css';
import Link from 'next/link';
import { useNotify } from '@/context/ToastContext';
import API_URL from '@/config/api';

export default function ConfigurarLoja() {
  const notify = useNotify();
  const [carregando, setCarregando] = useState(true);
  const [lojaIdReal, setLojaIdReal] = useState(null); 
  
  const [config, setConfig] = useState({
    loja: '',
    whatsapp: '',
    slug: '',
    valorMinimo: 0,
    taxaEntrega: 0
  });

  useEffect(() => {
    const carregarDados = async () => {
      const token = localStorage.getItem('agiliza_token');
      const userJson = localStorage.getItem('@Agiliza:Usuario');
      
      let idEncontrado = null;

      // 🛡️ 1. Tenta pegar o ID direto do LocalStorage (Mais rápido e garantido)
      if (userJson) {
        const usuario = JSON.parse(userJson);
        idEncontrado = usuario.lojaId;
        setLojaIdReal(idEncontrado);
      }

      try {
        // 🛡️ 2. Busca os dados da loja apenas se tivermos o ID
        if (idEncontrado && idEncontrado !== "null") {
          const resLoja = await fetch(`${API_URL}/api/assinantes/${idEncontrado}`);
          if (resLoja.ok) {
            const dadosLoja = await resLoja.json();
            setConfig({
              loja: dadosLoja.loja || '',
              whatsapp: dadosLoja.whatsapp || '',
              slug: dadosLoja.slug || '',
              valorMinimo: dadosLoja.valorMinimo || 0,
              taxaEntrega: dadosLoja.taxaEntrega || 0
            });
          }
        } else {
           notify("Macho, faz o login de novo pra atualizar sua loja!", "warning");
        }
      } catch (err) {
        console.error("Erro ao carregar loja:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, []);

  const salvarConfiguracoes = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('agiliza_token');

    // 🛡️ TRAVA DE SEGURANÇA: Se o ID for null, a gente nem tenta mandar
    if (!lojaIdReal || lojaIdReal === "null") {
        return notify("Vixe! Não identifiquei sua loja. Saia e entre de novo.", "error");
    }
    
    try {
      // 🚀 Agora a URL vai certinha, sem o "null"
      const res = await fetch(`${API_URL}/api/assinantes/${lojaIdReal}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...config,
          // 🔥 Pequeno truque: Se o slug estiver vazio, cria um básico
          slug: config.slug || config.loja.toLowerCase().replace(/ /g, '-'),
          valorMinimo: Number(config.valorMinimo),
          taxaEntrega: Number(config.taxaEntrega)
        })
      });

      if (res.ok) {
        notify("Loja atualizada com sucesso, patrão! 🚀", "success");
      } else {
        const erro = await res.json();
        notify(erro.erro || "Erro ao salvar no servidor.", "error");
      }
    } catch (err) {
      notify("Macho, deu erro na conexão!", "error");
    }
  };

  if (carregando) return <p style={{padding: '20px'}}>Buscando as configurações no banco... 🌵</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.btnVoltar}>← Voltar pro Painel</Link>
        <h1>Configurações da Loja</h1>
      </header>

      <form onSubmit={salvarConfiguracoes} className={styles.form}>
        <section className={styles.secao}>
          <h2>Identidade e Link</h2>
          <div className={styles.campo}>
            <label>Nome da Loja</label>
            <input 
              type="text" 
              value={config.loja}
              onChange={(e) => setConfig({...config, loja: e.target.value})}
              required
            />
          </div>
          <div className={styles.campo}>
            <label>Link da Loja (Slug)</label>
            <input 
              type="text" 
              value={config.slug}
              onChange={(e) => setConfig({...config, slug: e.target.value})}
              placeholder="ex: hamburgueria-sua-loja"
            />
          </div>
          <div className={styles.campo}>
            <label>WhatsApp de Vendas</label>
            <input 
              type="text" 
              value={config.whatsapp}
              onChange={(e) => setConfig({...config, whatsapp: e.target.value})}
              required
            />
          </div>
        </section>

        <section className={styles.secao}>
          <h2>Regras de Entrega e Venda 💰</h2>
          <div className={styles.gridConfig}>
            <div className={styles.campo}>
              <label>Valor Mínimo (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={config.valorMinimo}
                onChange={(e) => setConfig({...config, valorMinimo: e.target.value})}
                required
              />
            </div>
            <div className={styles.campo}>
              <label>Taxa de Entrega (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={config.taxaEntrega}
                onChange={(e) => setConfig({...config, taxaEntrega: e.target.value})}
                required
              />
            </div>
          </div>
        </section>

        <button type="submit" className={styles.btnSalvar}>
          Salvar Configurações ✅
        </button>
      </form>
    </div>
  );
}