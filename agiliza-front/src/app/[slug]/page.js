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
import API_URL from '@/config/api';

export default function HomeLoja() {
  const { carrinho, adicionarAoCarrinho } = useAgiliza();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const notify = useNotify();
  
  const [configsLocal, setConfigsLocal] = useState(null);
  const [produtosReais, setProdutosReais] = useState([]); // 👈 ESTADO PARA PRODUTOS REAIS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lojaEstaAberta, setLojaEstaAberta] = useState(true);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDadosCompletos = async () => {
      if (!slug) return;

      try {
        // 1. Busca os dados da Loja pelo Slug
        const resLoja = await fetch(`${API_URL}/api/assinantes/loja/${slug}`);
        
        if (resLoja.status === 404) {
          notify("Desculpe, Loja não encontrada. 🗺️", "error");
          router.push('/');
          return;
        }

        const dadosDaLoja = await resLoja.json();

        if (dadosDaLoja.status === 'Bloqueado') {
          router.push('/suspenso');
          return;
        }

        setConfigsLocal(dadosDaLoja);
        
        // 2. Define se a loja está aberta baseado no BANCO, não no localStorage
        setLojaEstaAberta(dadosDaLoja.status_loja !== 'fechada');

        // 3. BUSCA OS PRODUTOS REAIS DA LOJA NO BACKEND
        const resProdutos = await fetch(`${API_URL}/api/produtos?lojaId=${dadosDaLoja._id}`);
        const listaProdutos = await resProdutos.json();
        
        if (Array.isArray(listaProdutos)) {
          setProdutosReais(listaProdutos);
        }

      } catch (err) {
        console.error("Erro de conexão:", err);
        notify("Macho, erro ao carregar a vitrine!", "error");
      } finally {
        // Um tempinho pra motinha girar e dar o charme
        setTimeout(() => setCarregando(false), 1000);
      }
    };

    carregarTudo();
  }, [slug, router]);

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
      {/* Banner de Status da Loja */}
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

      {/* 🚀 MUDANÇA AQUI: Agora passa os produtosReais que vieram do Banco! */}
      {produtosReais.length > 0 ? (
        <ListaProdutosGrid produtos={produtosReais} onAdd={adicionarAoCarrinho} />
      ) : (
        <div className={styles.semProdutos}>
          <p>Essa loja ainda não cadastrou produtos. 📦</p>
        </div>
      )}

      {carrinho.length > 0 && !isModalOpen && (
        <button onClick={abrirCheckout} className={styles.btnFlutuanteCarrinho}>
          🛒 Ver Carrinho (R$ {totalPedido.toFixed(2)})
        </button>
      )}

      {isModalOpen && (
        <Checkout 
          aoFechar={() => setIsModalOpen(false)} 
          lojaId={configsLocal?._id} // Passa o ID da loja pro Checkout salvar o pedido certo
        />
      )}

      <MenuInferior />
    </main>
  );
}