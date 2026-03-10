'use client'
import { useState, useEffect } from 'react';
import styles from './perfil-admin.module.css';
import Link from 'next/link';

export default function ConfigurarLoja() {
  const [config, setConfig] = useState({
    nomeLoja: 'Depósito do Adriano',
    whatsapp: '5521980867488',
    slug: 'deposito-adriano'
  });

  const [logoPreview, setLogoPreview] = useState(null);

  // 1. CARREGA OS DADOS SALVOS ASSIM QUE ENTRA NA PÁGINA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dadosSalvos = localStorage.getItem('agiliza_config_loja');
      if (dadosSalvos) {
        const parsed = JSON.parse(dadosSalvos);
        setConfig({
          nomeLoja: parsed.nomeLoja,
          whatsapp: parsed.whatsapp,
          slug: parsed.slug
        });
        if (parsed.logo) setLogoPreview(parsed.logo);
      }
    }
  }, []);

  // 2. FUNÇÃO PARA LER A IMAGEM E GERAR A PRÉVIA
  const handleLogoChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onloadend = () => {
        setLogoPreview(leitor.result);
      };
      leitor.readAsDataURL(arquivo);
    }
  };

  // 3. SALVA TUDO NO LOCALSTORAGE
  const salvarConfiguracoes = (e) => {
    e.preventDefault();
    const dadosDaLoja = {
      ...config,
      logo: logoPreview
    };
    localStorage.setItem('agiliza_config_loja', JSON.stringify(dadosDaLoja));
    alert("Loja atualizada com sucesso, meu patrão! 🚀");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.btnVoltar}>← Voltar pro Painel</Link>
        <h1>Configurações da Loja</h1>
      </header>

      {/* FORMULÁRIO ÚNICO (Sem ninho de cobra agora!) */}
      <form onSubmit={salvarConfiguracoes} className={styles.form}>
        
        <section className={styles.secao}>
          <h2>Identidade Visual</h2>
          
          <div className={styles.uploadArea}> {/* Corrigido o erro de digitação 'uplpoadArea' */}
            <label>Logo da Loja</label>
            <div className={styles.logoCircle}>
              {logoPreview ? (
                <img src={logoPreview} alt="Preview da Logo"/>
              ) : (
                <span>Sua Logo</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              id="upload-logo"
              hidden
            />
            <label htmlFor='upload-logo' className={styles.btnUpload}>
              Escolher imagem 📷
            </label>
          </div>

          <div className={styles.campo}>
            <label>Nome da Loja</label>
            <input 
              type="text" 
              value={config.nomeLoja}
              onChange={(e) => setConfig({...config, nomeLoja: e.target.value})}
              required
            />
          </div>

          <div className={styles.campo}>
            <label>Link da Loja (slug)</label>
            <div className={styles.inputSlug}>
              <span>agiliza.vercel.app/</span>
              <input 
                type="text" 
                value={config.slug}
                onChange={(e) => setConfig({...config, slug: e.target.value})}
                required
              />
            </div>
          </div>
        </section>

        <section className={styles.secao}>
          <h2>Contato de Vendas</h2>
          <div className={styles.campo}>
            <label>WhatsApp (com DDD)</label>
            <input 
              type="text" 
              value={config.whatsapp}
              onChange={(e) => setConfig({...config, whatsapp: e.target.value})}
              placeholder="Ex: 5521999999999"
              required
            />
            <small>Os pedidos chegarão direto nesse número.</small>
          </div>
        </section>

        <button type="submit" className={styles.btnSalvar}>
          Atualizar Minha Loja 💾
        </button>
      </form>
    </div>
  );
}