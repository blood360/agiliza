'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';
import ListaProdutosGrid from '@/components/ListaProdutosGrid';
import MenuInferior from '@/components/MenuInferior';
import BotaoCompartilhar from '@/components/BotaoCompartilhar';
import { useAgiliza } from "@/context/AgilizaContext";
import { useNotify } from '@/context/ToastContext';
import Checkout from '@/components/Checkout';
import API_URL from '@/config/api'; // IMPORTANTE: Para usar a URL do Render

export default function HomeLoja() {
  // 1. Pegando TUDO do contexto global (Carrinho unificado)
  const { carrinho, adicionarAoCarrinho, usuario } = useAgiliza();
  
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const notify = useNotify();
  
  const [configsLocal, setConfigsLocal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lojaEstaAberta, setLojaEstaAberta] = useState(true);
  const [carregando, setCarregando] = useState(true);

  // 🛡️ 2. SEGURANÇA AS AUTOMAÇÕES: Busca dados da Loja no Backend
  useEffect(() => {
    const verificarAcessoELoja = async () => {
      if (!slug) return;

      try {
        // Usando o API_URL correto para funcionar na Vercel/Render
        const resposta = await fetch(`${API_URL}/api/assinantes/loja/${slug}`);
        
        if (resposta.status === 404) {
          notify("Vixe! Loja não encontrada. 🗺️", "error");
          router.push('/');
          return;
        }

        const dadosDaLoja = await resposta.json();

        if (dadosDaLoja.status === 'Bloqueado') {
          router.push('/suspenso');
          return;
        }

        setConfigsLocal(dadosDaLoja);
        
        const statusLocal = localStorage.getItem(`agiliza_aberta_${slug}`);
        setLojaEstaAberta(statusLocal !== 'false');

      } catch (err) {
        notify("Macho, erro de conexão com a AS Automações!", "error");
      } finally {
        setTimeout(() => setCarregando(false), 800);
      }
    };

    verificarAcessoELoja();
  }, [slug, router, notify]);

  // 3. CÁLCULO DO TOTAL (Sempre baseado no carrinho do contexto)
  const totalPedido = carrinho.reduce((acc, item) => acc + item.preco, 0);

  const abrirCheckout = () => {
    if (!lojaEstaAberta) return notify("Vixe, macho! A loja está fechada. 🚫", "warning");
    if (carrinho.length === 0) return notify("Adicione um produto antes de finalizar! 🛒", "warning");
    setIsModalOpen(true);
  };

  // Itens fixos (Depois você puxa configsLocal.produtos se tiver)
  const produtos = [
    { id: 1, nome: "Combo Frango e Arroz", preco: 7.90 },
    { id: 2, nome: "Suco de Frutas Frescas", preco: 7.90 },
    { id: 3, nome: "Burger AS Premium", preco: 12.50 }
  ];

  // 🔄 LOADER DA MOTINHA GIRANDO
  if (carregando) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinnerWrapper}>
          <img src="/motoagiliza.png" alt="Moto Agiliza" className={styles.loaderImage} />
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loaderText}>aguarde, estamos buscando os dados da loja</p>
      </div>
    );
  }

  const nomeExibicao = configsLocal?.loja || "Carregando...";

  return (
    <main className={styles.containerLoja}>
      {configsLocal?.status === 'Teste' && (
        <div className={styles.bannerTesteReal}>
          <span>🧪 MODO DEGUSTAÇÃO: Vitrine de demonstração AS Automações.</span>
        </div>
      )}

      <div className={lojaEstaAberta ? styles.bannerAviso : styles.bannerFechado}>
        <span>{lojaEstaAberta ? `⚠️ Bem-vindo à ${nomeExibicao}` : "🚫 ESTAMOS FECHADOS"}</span>
      </div>

      <header className={styles.headerLoja}>
        <div style={{width: '100%'}}>
          <h1 className={styles.nomeLojaPrimcipal}>{nomeExibicao}</h1>
        </div>
        <BotaoCompartilhar />
      </header>

      {/* Usando a função onAdd que vem do Contexto agora */}
      <ListaProdutosGrid produtos={produtos} onAdd={adicionarAoCarrinho} />

      {carrinho.length > 0 && (
        <button onClick={abrirCheckout} className={styles.btnFlutuanteCarrinho}>
          🛒 Ver Carrinho (R$ {totalPedido.toFixed(2)})
        </button>
      )}

      {/* MODAL DE CHECKOUT PROFISSIONAL */}
      {isModalOpen && (
        <Checkout aoFechar={() => setIsModalOpen(false)} />
      )}

      <MenuInferior />
    </main>
  );
}