'use client'
import { useState, useEffect } from 'react';
import styles from './perfil-admin.module.css';
import Link from 'next/link';
import { useNotify } from '@/context/ToastContext';
import API_URL from '@/config/api';

export default function ConfigurarLoja() {
  const notify = useNotify();
  const [carregando, setCarregando] = useState(true);
  const [lojaIdReal, setLojaIdReal] = useState(null); // 👈 Guardamos o ID aqui
  
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
      try {
        const resUser = await fetch(`${API_URL}/api/usuarios/perfil`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await resUser.json();

        if (user.lojaId) {
          setLojaIdReal(user.lojaId); // 👈 Salvamos pra usar depois
          
          // 🛡️ CONFIRME SE A ROTA É ESSA MESMO OU APENAS /api/assinantes/${user.lojaId}
          const resLoja = await fetch(`${API_URL}/api/assinantes/${user.lojaId}`);
          const dadosLoja = await resLoja.json();
          
          setConfig({
            loja: dadosLoja.loja,
            whatsapp: dadosLoja.whatsapp,
            slug: dadosLoja.slug,
            valorMinimo: dadosLoja.valorMinimo || 0,
            taxaEntrega: dadosLoja.taxaEntrega || 0
          });
        }
      } catch (err) {
        notify("Vixe, erro ao carregar seus dados!", "error");
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, []);

  const salvarConfiguracoes = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('agiliza_token');
    
    try {
      // Agora usamos o lojaIdReal que já temos guardado
      const res = await fetch(`${API_URL}/api/assinantes/${lojaIdReal}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...config,
          valorMinimo: Number(config.valorMinimo),
          taxaEntrega: Number(config.taxaEntrega)
        })
      });

      if (res.ok) {
        notify("Loja atualizada no banco de dados, patrão! 🚀", "success");
      } else {
        notify("Erro ao salvar no servidor.", "error");
      }
    } catch (err) {
      notify("Macho, deu erro na conexão!", "error");
    }
  };

  if (carregando) return <p style={{padding: '20px'}}>Carregando as configurações, aguarde um tiquinho...</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.btnVoltar}>← Voltar pro Painel</Link>
        <h1>Configurações da Loja</h1>
      </header>

      <form onSubmit={salvarConfiguracoes} className={styles.form}>
        
        {/* SEÇÃO 1: IDENTIDADE */}
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
            <label>WhatsApp de Vendas</label>
            <input 
              type="text" 
              value={config.whatsapp}
              onChange={(e) => setConfig({...config, whatsapp: e.target.value})}
              required
            />
          </div>
        </section>

        {/* SEÇÃO 2: REGRAS DE NEGÓCIO (O QUE TU PEDIU!) */}
        <section className={styles.secao}>
          <h2>Regras de Entrega e Venda 💰</h2>
          
          <div className={styles.gridConfig}>
            <div className={styles.campo}>
              <label>Valor Mínimo do Pedido (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={config.valorMinimo}
                onChange={(e) => setConfig({...config, valorMinimo: e.target.value})}
                placeholder="Ex: 50.00"
                required
              />
              <small>O cliente não conseguirá finalizar se o carrinho for menor que isso.</small>
            </div>

            <div className={styles.campo}>
              <label>Taxa de Entrega Fixa (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={config.taxaEntrega}
                onChange={(e) => setConfig({...config, taxaEntrega: e.target.value})}
                placeholder="Ex: 7.00"
                required
              />
              <small>Esse valor será somado ao total no carrinho.</small>
            </div>
          </div>
        </section>

        <button type="submit" className={styles.btnSalvar}>
          Salvar Configurações no Banco 💾
        </button>
      </form>
    </div>
  );
}