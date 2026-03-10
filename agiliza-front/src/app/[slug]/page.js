'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';
import ListaProdutosGrid from '@/components/ListaProdutosGrid';
import MenuInferior from '@/components/MenuInferior';
import BotaoCompartilhar from '@/components/BotaoCompartilhar';
import { useAgiliza } from "@/context/AgilizaContext";
import { useNotify } from '@/context/ToastContext';

export default function HomeLoja() {
  const { usuario } = useAgiliza(); 
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const notify = useNotify();
  
  const [configsLocal, setConfigsLocal] = useState(null);
  const [clientePerfil, setClientePerfil] = useState({ endereco: '', telefone: '', pagamento: 'PIX' });
  const [carrinho, setCarrinho] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lojaEstaAberta, setLojaEstaAberta] = useState(true);
  const [carregando, setCarregando] = useState(true); // Estado para evitar flash de conteúdo

  // 🛡️ 1. SEGURANÇA AS AUTOMAÇÕES: Consulta ao Banco de Dados
  useEffect(() => {
    const verificarAcessoELoja = async () => {
      if (!slug) return;

      try {
        console.log("Macho, tô procurando a loja:", slug); // Adicione isso pra testar
        const resposta = await fetch(`http://localhost:5000/api/assinantes/loja/${slug}`);
        
        if (resposta.status === 404) {
          notify("Vixe! Loja não encontrada no nosso sistema. 🗺️", "error");
          router.push('/');
          return;
        }

        const dadosDaLoja = await resposta.json();

        // TRAVA DE BLOQUEIO: Se o status no MongoDB for 'Bloqueado', expulsa!
        if (dadosDaLoja.status === 'Bloqueado') {
          router.push('/suspenso');
          return;
        }

        // Se chegou aqui, a loja existe e está ativa
        setConfigsLocal(dadosDaLoja);
        
        // Sincroniza o status de aberta/fechada (por enquanto via localStorage ou campo do banco)
        const statusLocal = localStorage.getItem(`agiliza_aberta_${slug}`);
        setLojaEstaAberta(statusLocal !== 'false');

      } catch (err) {
        notify("Macho, não consegui conectar com o servidor da AS!", "error");
      } finally {
        // Dá um pequeno delay só pro loader não sumir rápido demais (opcional)
        setTimeout(() => setCarregando(false), 800);
      }
    };

    verificarAcessoELoja();
  }, [slug, router]);

  // 2. SINCRONIA COM PERFIL DO CLIENTE
  useEffect(() => {
    if (usuario && usuario.endereco) {
      setClientePerfil(prev => ({
        ...prev,
        endereco: usuario.endereco,
        telefone: usuario.telefone
      }));
    }
  }, [usuario]);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho([...carrinho, produto]);
  };

  const totalPedido = carrinho.reduce((acc, item) => acc + item.preco, 0);

  const abrirCheckout = () => {
    if (!lojaEstaAberta) return notify("Vixe, macho! A loja fechou agora pouco. 🚫", "warning");
    if (carrinho.length === 0) return notify("Adicione um produto antes de finalizar! 🛒", "warning");
    setIsModalOpen(true);
  };

  const confirmarVenda = () => {
    if (!clientePerfil.endereco) return notify("Macho, coloca o endereço de entrega! 📍", "error");

    const novoPedido = {
      id: Date.now(),
      lojaId: configsLocal?._id, // Usa o ID real do MongoDB
      cliente: clientePerfil,
      itens: carrinho,
      total: totalPedido,
      status: 'Pendente'
    };

    // Salva no histórico local do cliente (opcional)
    const pedidosExistentes = JSON.parse(localStorage.getItem('agiliza_pedidos') || '[]');
    localStorage.setItem('agiliza_pedidos', JSON.stringify([novoPedido, ...pedidosExistentes]));

    // Gera mensagem para o WhatsApp do Lojista (cadastrado no banco)
    let mensagem = `*Novo Pedido - ${configsLocal?.loja}*\n`;
    mensagem += `*Cliente:* ${clientePerfil.telefone}\n`;
    mensagem += `*Total: R$ ${totalPedido.toFixed(2)}*`;

    const fone = configsLocal?.whatsapp || "5521980867488"; // Pega o ZAP do banco
    window.location.href = `https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`;
  };

  // Itens fixos (No futuro tu puxa do banco também!)
  const produtos = [
    { id: 1, nome: "Combo Frango e Arroz", preco: 7.90 },
    { id: 2, nome: "Suco de Frutas Frescas", preco: 7.90 },
    { id: 3, nome: "Burger AS Premium", preco: 12.50 }
  ];

  // 🔄 LOADER DOIDO NA TELA INTEIRA
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

  // Nome exibido na vitrine (vem do banco)
  const nomeExibicao = configsLocal?.loja;

  return (
    <main className={styles.containerLoja}>
      {/* BANNER DE TESTE */}
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

      <ListaProdutosGrid produtos={produtos} onAdd={adicionarAoCarrinho} />

      {carrinho.length > 0 && (
        <button onClick={abrirCheckout} className={styles.btnFlutuanteCarrinho}>
          🛒 Ver Carrinho (R$ {totalPedido.toFixed(2)})
        </button>
      )}

      {/* MODAL DE CHECKOUT */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Finalizar Pedido</h3>
            <p><strong>Total:</strong> R$ {totalPedido.toFixed(2)}</p>
            <button onClick={confirmarVenda} className={styles.btnConfirmar}>Confirmar e Enviar Zap ✅</button>
            <button onClick={() => setIsModalOpen(false)} className={styles.btnAdicionarMais}>Voltar</button>
          </div>
        </div>
      )}
      <MenuInferior />
    </main>
  );
}