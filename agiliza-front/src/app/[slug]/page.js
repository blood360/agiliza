'use client'
import { useState, useEffect, useCallback } from 'react'; 
import { useParams, useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';
import ListaProdutosGrid from '@/components/ListaProdutosGrid';
import MenuInferior from '@/components/MenuInferior';
import BotaoCompartilhar from '@/components/BotaoCompartilhar';
import { useAgiliza } from "@/context/AgilizaContext";
import { useNotify } from '@/context/ToastContext';
import Checkout from '@/components/Checkout';
import API_URL from '@/config/api';

export default function HomeLoja() {
  const { carrinho, adicionarAoCarrinho } = useAgiliza();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const notify = useNotify();
  
  const [configsLocal, setConfigsLocal] = useState(null);
  const [produtosReais, setProdutosReais] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lojaEstaAberta, setLojaEstaAberta] = useState(true);
  const [carregando, setCarregando] = useState(true);

  // 🛡️ 1. FUNÇÃO MESTRA: Busca dados da Loja e Produtos
  const carregarDadosDaLoja = useCallback(async () => {
    if (!slug) return;

    try {
      // A. Busca os dados da Loja pelo Slug
      const resLoja = await fetch(`${API_URL}/api/assinantes/loja/${slug}`);
      
      if (resLoja.status === 404) {
        notify("Vixe! Loja não encontrada. 🗺️", "error");
        router.push('/');
        return;
      }

      const dadosDaLoja = await resLoja.json();

      if (dadosDaLoja.status === 'Bloqueado') {
        router.push('/suspenso');
        return;
      }

      setConfigsLocal(dadosDaLoja);
      setLojaEstaAberta(dadosDaLoja.status_loja !== 'fechada');

      // B. Busca os produtos reais dessa loja específica
      const resProdutos = await fetch(`${API_URL}/api/produtos?lojaId=${dadosDaLoja._id}`);
      const listaProdutos = await resProdutos.json();
      
      if (Array.isArray(listaProdutos)) {
        // 🔍 DEDO-DURO: Log para ver se a imagem está vindo no console
        console.log("Produtos carregados:", listaProdutos);
        setProdutosReais(listaProdutos);
      }

    } catch (err) {
      console.error("Erro na vitrine:", err);
      notify("Macho, erro ao carregar a vitrine!", "error");
    } finally {
      setCarregando(false);
    }
  }, [slug, router, notify]);

  // 🔄 2. EFEITO DE ENTRADA
  useEffect(() => {
    carregarDadosDaLoja();
  }, [carregarDadosDaLoja]);

  const totalPedido = carrinho.reduce((acc, item) => acc + item.preco, 0);

  const abrirCheckout = () => {
    if (!lojaEstaAberta) return notify("Vixe, macho! A loja está fechada agora. 🚫", "warning");
    if (carrinho.length === 0) return notify("Adicione um produto antes de finalizar! 🛒", "warning");
    setIsModalOpen(true);
  };

  if (carregando) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinnerWrapper}>
          <img src="/motoagiliza.png" alt="Moto Agiliza" className={styles.loaderImage} />
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loaderText}>Buscando os produtos do {configsLocal?.loja || 'Depósito'}... 🌵</p>
      </div>
    );
  }

  const nomeExibicao = configsLocal?.loja || "Agiliza";

  return (
    <main className={styles.containerLoja}>
      {/* Banner de Status */}
      <div className={lojaEstaAberta ? styles.bannerAviso : styles.bannerFechado}>
        <span>{lojaEstaAberta ? `✅ Aberto agora: ${nomeExibicao}` : "🚫 ESTAMOS FECHADOS NO MOMENTO"}</span>
      </div>

      <header className={styles.headerLoja}>
        <div style={{width: '100%'}}>
          <h1 className={styles.nomeLojaPrimcipal}>{nomeExibicao}</h1>
          <p className={styles.subtituloLoja}>{configsLocal?.descricao || 'Os melhores produtos para você!'}</p>
        </div>
        <BotaoCompartilhar />
      </header>

      {/* 🚀 LISTAGEM DE PRODUTOS COM TRATAMENTO DE IMAGEM */}
      {produtosReais.length > 0 ? (
        <ListaProdutosGrid 
          produtos={produtosReais.map(p => ({
            ...p,
            // Garante que a imagem é tratada corretamente, seja URL ou Base64
            imagem: p.imagem || '/placeholder.png' 
          }))} 
          onAdd={adicionarAoCarrinho} 
        />
      ) : (
        <div className={styles.semProdutos}>
          <p>Essa loja ainda não cadastrou produtos. 📦</p>
        </div>
      )}

      {/* Botão Flutuante do Carrinho */}
      {carrinho.length > 0 && !isModalOpen && (
        <button onClick={abrirCheckout} className={styles.btnFlutuanteCarrinho}>
          🛒 Ver Carrinho (R$ {totalPedido.toFixed(2)})
        </button>
      )}

      {/* Modal de Finalização */}
      {isModalOpen && (
        <Checkout 
          aoFechar={() => setIsModalOpen(false)} 
          lojaId={configsLocal?._id} 
        />
      )}

      <MenuInferior />
    </main>
  );
}