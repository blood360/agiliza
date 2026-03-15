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
  const { 
    carrinho, 
    adicionarAoCarrinho, 
    setLoja, 
    perfilCliente 
  } = useAgiliza();

  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const notify = useNotify();
  
  const [configsLocal, setConfigsLocal] = useState(null);
  const [produtosReais, setProdutosReais] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lojaEstaAberta, setLojaEstaAberta] = useState(true);
  const [carregando, setCarregando] = useState(true);

  // 🔥 ESTADO DA VENDA SUGERIDA (O Prestígio!)
  const [sugestaoAtiva, setSugestaoAtiva] = useState(null);

  const carregarDadosDaLoja = useCallback(async () => {
    if (!slug) return;

    try {
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
      setLoja(dadosDaLoja); 
      setLojaEstaAberta(dadosDaLoja.status_loja !== 'fechada');

      const resProdutos = await fetch(`${API_URL}/api/produtos?lojaId=${dadosDaLoja._id}`);
      const listaProdutos = await resProdutos.json();
      
      if (Array.isArray(listaProdutos)) {
        setProdutosReais(listaProdutos);
      }

    } catch (err) {
      console.error("Erro na vitrine:", err);
      notify("Macho, erro ao carregar a vitrine!", "error");
    } finally {
      setCarregando(false);
    }
  }, [slug, router, notify, setLoja]);

  useEffect(() => {
    carregarDadosDaLoja();
  }, [carregarDadosDaLoja]);

  // 🍟 FUNÇÃO: Adicionar com Inteligência (Upselling)
  const handleAdicionarComSugestao = (produto) => {
    adicionarAoCarrinho(produto);

    // Se o produto tem um parceiro de venda sugerida...
    if (produto.sugestaoId) {
      const sugerido = produtosReais.find(p => p._id === produto.sugestaoId);
      if (sugerido) {
        setSugestaoAtiva({
          ...sugerido,
          mensagem: produto.sugestaoMensagem || "Macho, aproveite e leve também:"
        });
      }
    } else {
      notify(`${produto.nome} no carrinho! 🛒`, "success");
    }
  };

  const totalPedido = carrinho.reduce((acc, item) => acc + item.preco, 0);

  const abrirCheckout = () => {
    if (!lojaEstaAberta) return notify("A loja está fechada agora. 🚫", "warning");
    if (carrinho.length === 0) return notify("Adicione um produto antes de finalizar! 🛒", "warning");
    if (!perfilCliente.endereco) return notify("Adicione seu endereço no Perfil! 📍", "warning");
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

      {/* Header com Identidade Visual */}
      <header className={styles.headerLoja}>
        <div style={{width: '100%'}}>
          <h1 className={styles.nomeLojaPrimcipal}>{nomeExibicao}</h1>
          <p className={styles.subtituloLoja}>{configsLocal?.descricao || 'Os melhores produtos para você!'}</p>
        </div>
        <BotaoCompartilhar />
      </header>

      {/* Grid de Produtos com Lógica de Sugestão */}
      {produtosReais.length > 0 ? (
        <ListaProdutosGrid 
          produtos={produtosReais.map(p => {
            let imagemTratada = '/placeholder.png';
            if (p.imagem) {
              imagemTratada = (p.imagem.startsWith('data:') || p.imagem.startsWith('http')) 
                ? p.imagem 
                : `data:image/jpeg;base64,${p.imagem}`;
            }
            return { ...p, imagem: imagemTratada };
          })} 
          onAdd={handleAdicionarComSugestao} 
        />
      ) : (
        <div className={styles.semProdutos}>
          <p>Essa loja ainda não cadastrou produtos. 📦</p>
        </div>
      )}

      {/* 🍟 MODAL DE VENDA SUGERIDA (O Pulo do Gato) */}
      {sugestaoAtiva && (
        <div className={styles.overlaySugestao}>
          <div className={styles.modalSugestao}>
            <button className={styles.btnFecharSugestao} onClick={() => setSugestaoAtiva(null)}>✕</button>
            <div className={styles.conteudoSugestao}>
              <span className={styles.emojiSugestao}>✨</span>
              <h3>{sugestaoAtiva.mensagem}</h3>
              <div className={styles.cardSugerido}>
                <img src={sugestaoAtiva.imagem || '/placeholder.png'} alt={sugestaoAtiva.nome} />
                <div className={styles.detalhesSugerido}>
                  <strong>{sugestaoAtiva.nome}</strong>
                  <span>R$ {sugestaoAtiva.preco.toFixed(2)}</span>
                </div>
              </div>
              <button 
                className={styles.btnAceitarSugestao}
                onClick={() => {
                  adicionarAoCarrinho(sugestaoAtiva);
                  setSugestaoAtiva(null);
                  notify("Combo garantido! 🚀", "success");
                }}
              >
                Adicionar ao Pedido +
              </button>
              <button className={styles.btnNegarSugestao} onClick={() => setSugestaoAtiva(null)}>
                Agora não, obrigado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante */}
      {carrinho.length > 0 && !isModalOpen && (
        <button onClick={abrirCheckout} className={styles.btnFlutuanteCarrinho}>
          🛒 Ver Carrinho (R$ {totalPedido.toFixed(2)})
        </button>
      )}

      {/* Modais do Sistema */}
      {isModalOpen && <Checkout aoFechar={() => setIsModalOpen(false)} />}
      <MenuInferior />
    </main>
  );
}