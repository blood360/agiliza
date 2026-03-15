'use client'
import { useState, useEffect } from 'react';
import styles from './perfil-admin.module.css';
import Link from 'next/link';
import Image from 'next/image'; 
import { useNotify } from '@/context/ToastContext';
import API_URL from '@/config/api';

export default function ConfigurarLoja() {
  const notify = useNotify();
  const [carregando, setCarregando] = useState(true);
  const [lojaIdReal, setLojaIdReal] = useState(null); 
  
  // 📝 ESTADO ATUALIZADO (Com Identidade Visual e Localização)
  const [config, setConfig] = useState({
    loja: '',
    whatsapp: '',
    slug: '',
    valorMinimo: 0,
    taxaEntrega: 0,
    logo: '',  
    banner: '',
    cidade: '', // 👈 Campo novo
    estado: ''  // 👈 Campo novo
  });

  useEffect(() => {
    const carregarDados = async () => {
      const userJson = localStorage.getItem('@Agiliza:Usuario');
      let idEncontrado = null;

      if (userJson) {
        const usuario = JSON.parse(userJson);
        idEncontrado = usuario.lojaId;
        setLojaIdReal(idEncontrado);
      }

      try {
        if (idEncontrado && idEncontrado !== "null") {
          const resLoja = await fetch(`${API_URL}/api/assinantes/${idEncontrado}`);
          if (resLoja.ok) {
            const d = await resLoja.json();
            setConfig({
              loja: d.loja || '',
              whatsapp: d.whatsapp || '',
              slug: d.slug || '',
              valorMinimo: d.valorMinimo || 0,
              taxaEntrega: d.taxaEntrega || 0,
              logo: d.logo || 'https://via.placeholder.com/150', 
              banner: d.banner || 'https://via.placeholder.com/800x200',
              cidade: d.cidade || '', // 📥 Busca do banco
              estado: d.estado || ''   // 📥 Busca do banco
            });
          }
        } else {
            notify("Macho, faz o login de novo!", "warning");
        }
      } catch (err) {
        notify("Vixe! Erro ao carregar as configurações.", "error");
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, []);

  const salvarConfiguracoes = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('agiliza_token');

    if (!lojaIdReal || lojaIdReal === "null") {
        return notify("Vixe! Saia e entre de novo pra eu saber quem é você.", "error");
    }
    
    try {
      const res = await fetch(`${API_URL}/api/assinantes/${lojaIdReal}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...config,
          slug: config.slug || config.loja.toLowerCase().replace(/ /g, '-'),
          valorMinimo: Number(config.valorMinimo),
          taxaEntrega: Number(config.taxaEntrega),
          estado: config.estado.toUpperCase() // Garante que o estado seja sempre sigla (RJ, PI...)
        })
      });

      if (res.ok) {
        notify("Loja atualizada com sucesso, patrão! ✨", "success");
      } else {
        notify("Erro ao salvar no servidor.", "error");
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
        
        {/* 🖼️ SEÇÃO: IDENTIDADE VISUAL */}
        <section className={styles.secao}>
          <h2>Identidade Visual 🖼️</h2>
          <div className={styles.cardPreviewImage}>
             <label>Sua Logo (Ícone)</label>
             <div className={styles.boxLogoPreview}>
                <img src={config.logo} alt="Sua Logo" className={styles.imgLogo} />
                <input 
                    type="text" 
                    value={config.logo}
                    onChange={(e) => setConfig({...config, logo: e.target.value})}
                    placeholder="Link da sua logo"
                    required
                />
             </div>
          </div>
          <div className={styles.cardPreviewImage} style={{marginTop: '20px'}}>
             <label>Seu Banner (Topo da Loja)</label>
             <div className={styles.boxBannerPreview}>
                <img src={config.banner} alt="Seu Banner" className={styles.imgBanner} />
                <input 
                    type="text" 
                    value={config.banner}
                    onChange={(e) => setConfig({...config, banner: e.target.value})}
                    placeholder="Link do seu banner"
                    required
                />
             </div>
          </div>
        </section>

        {/* 📍 SEÇÃO: LOCALIZAÇÃO (Filtro de Região) */}
        <section className={styles.secao}>
          <h2>Onde sua Loja Fica? 📍</h2>
          <div className={styles.gridConfig}>
            <div className={styles.campo}>
              <label>Cidade</label>
              <input 
                type="text" 
                value={config.cidade}
                onChange={(e) => setConfig({...config, cidade: e.target.value})}
                placeholder="Ex: Magé, Teresina..."
                required
              />
            </div>
            <div className={styles.campo}>
              <label>Estado (Sigla)</label>
              <input 
                type="text" 
                value={config.estado}
                maxLength="2"
                onChange={(e) => setConfig({...config, estado: e.target.value})}
                placeholder="Ex: RJ, PI"
                required
              />
            </div>
          </div>
        </section>

        {/* 🏷️ SEÇÃO: IDENTIDADE E LINK */}
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

        {/* 💰 SEÇÃO: REGRAS DE ENTREGA */}
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