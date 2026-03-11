'use client'
import { useState, useEffect } from 'react';
import styles from './perfil-admin.module.css';
import Link from 'next/link';
import { useNotify } from '@/context/ToastContext'; // Usando seu Toast
import API_URL from '@/config/api';

export default function ConfigurarLoja() {
  const notify = useNotify();
  const [carregando, setCarregando] = useState(true);
  
  const [config, setConfig] = useState({
    loja: '',
    whatsapp: '',
    slug: '',
    valorMinimo: 0, // 💰 Novo campo!
    taxaEntrega: 0  // 🚚 Novo campo!
  });

  const [logoPreview, setLogoPreview] = useState(null);

  // 1. BUSCA OS DADOS REAIS DO BANCO AO ENTRAR
  useEffect(() => {
    const carregarDados = async () => {
      const token = localStorage.getItem('agiliza_token');
      try {
        // Buscamos o perfil do usuário logado que contém o lojaId
        const resUser = await fetch(`${API_URL}/api/usuarios/perfil`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await resUser.json();

        if (user.lojaId) {
          const resLoja = await fetch(`${API_URL}/api/assinantes/loja-id/${user.lojaId}`);
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

  // 2. FUNÇÃO PARA SALVAR NO BANCO DE DADOS (PUT)
  const salvarConfiguracoes = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('agiliza_token');
    
    try {
      // Pegamos o ID do usuário para saber qual loja atualizar
      const resUser = await fetch(`${API_URL}/api/usuarios/perfil`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const user = await resUser.json();

      const res = await fetch(`${API_URL}/api/assinantes/${user.lojaId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...config,
          // Garante que salve como número para os cálculos funcionarem
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