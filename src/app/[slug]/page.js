'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Importamos o roteador
import styles from '@/app/page.module.css';
import ListaProdutosGrid from '@/components/ListaProdutosGrid';
import MenuInferior from '@/components/MenuInferior';
import BotaoCompartilhar from '@/components/BotaoCompartilhar';
import { useAgiliza } from "@/context/AgilizaContext";

export default function HomeLoja() {
  const { usuario } = useAgiliza(); 
  const params = useParams();
  const router = useRouter(); // Inicializa o router para o bloqueio
  const slug = params?.slug;
  
  const [configsLocal, setConfigsLocal] = useState(null);
  const [clientePerfil, setClientePerfil] = useState({ endereco: '', telefone: '', pagamento: 'PIX' });
  const [carrinho, setCarrinho] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoEndereco, setEditandoEndereco] = useState(false);
  const [lojaEstaAberta, setLojaEstaAberta] = useState(true);

  // 🛡️ 1. TRAVA DE SEGURANÇA AS AUTOMAÇÕES (Bloqueio por Loja)
  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      // Puxa a lista de assinantes que tu gerencia no /as-admin
      const listaAssinantes = JSON.parse(localStorage.getItem('agiliza_lista_assinantes') || '[]');
      
      // Procura se esta loja específica (slug) está na sua lista
      const lojaNoSistema = listaAssinantes.find(a => 
        a.loja.toLowerCase().trim().replace(/\s+/g, '-') === slug
      );

      // Se a loja existir e o status for 'Bloqueado', expulsa pro aviso!
      if (lojaNoSistema && lojaNoSistema.status === 'Bloqueado') {
        router.push('/suspenso');
        return;
      }

      // Se for assinante de 'Teste', a gente pode logar um aviso no console
      if (lojaNoSistema?.status === 'Teste') {
        console.log("🚀 Loja em modo de demonstração liberada!");
      }

      // 2. Carrega as configurações visuais da loja
      const lojaSalva = localStorage.getItem('agiliza_config_loja');
      const statusLoja = localStorage.getItem('agiliza_loja_aberta');
      
      if (lojaSalva) setConfigsLocal(JSON.parse(lojaSalva));
      setLojaEstaAberta(statusLoja !== 'false');
    }
  }, [slug, router]);

  // 3. SINCRONIA COM PERFIL DO CLIENTE
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
    if (!lojaEstaAberta) return alert("Vixe, macho! A loja fechou agora pouco.");
    if (carrinho.length === 0) return alert("Adicione um produto antes de finalizar!");
    setIsModalOpen(true);
  };

  const confirmarVenda = () => {
    if (!clientePerfil.endereco) return alert("Macho, coloca o endereço de entrega!");

    const novoPedido = {
      id: Date.now(),
      cliente: clientePerfil,
      itens: carrinho,
      total: totalPedido,
      status: 'Pendente'
    };

    const pedidosExistentes = JSON.parse(localStorage.getItem('agiliza_pedidos') || '[]');
    localStorage.setItem('agiliza_pedidos', JSON.stringify([novoPedido, ...pedidosExistentes]));

    let mensagem = `*Novo Pedido - ${configsLocal?.nomeLoja || 'Loja'}*\n`;
    mensagem += `*Cliente:* ${clientePerfil.telefone}\n`;
    mensagem += `*Total: R$ ${totalPedido.toFixed(2)}*`;

    const fone = configsLocal?.whatsapp || "5521980867488";
    window.location.href = `https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`;
  };

  // Itens fixos para o exemplo (depois tu puxa do banco)
  const produtos = [
    { id: 1, nome: "Combo Frango e Arroz", preco: 7.90 },
    { id: 2, nome: "Suco de Frutas Frescas", preco: 7.90 },
    { id: 3, nome: "Burger AS Premium", preco: 12.50 }
  ];

  const nomeExibicao = configsLocal?.nomeLoja || slug?.replace(/-/g, ' ').toUpperCase();

  return (
    <main className={styles.containerLoja}>
      {/* BANNER DE TESTE (Só aparece para assinantes status 'Teste') */}
      {typeof window !== 'undefined' && localStorage.getItem('agiliza_assinante_status') === 'Teste' && (
        <div className={styles.bannerTesteReal}>
          <span>🧪 MODO DEGUSTAÇÃO: Loja real para testes da AS Automações.</span>
        </div>
      )}

      <div className={lojaEstaAberta ? styles.bannerAviso : styles.bannerFechado}>
        <span>{lojaEstaAberta ? "⚠️ Loja exemplo da AS Automações" : "🚫 ESTAMOS FECHADOS"}</span>
      </div>

      <header className={styles.headerLoja}>
        <h1 className={styles.nomeLojaPrincipal}>{nomeExibicao}</h1>
        <BotaoCompartilhar />
      </header>

      <ListaProdutosGrid produtos={produtos} onAdd={adicionarAoCarrinho} />

      {carrinho.length > 0 && (
        <button onClick={abrirCheckout} className={styles.btnFlutuanteCarrinho}>
          🛒 Finalizar (R$ {totalPedido.toFixed(2)})
        </button>
      )}

      {/* MODAL DE CHECKOUT */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confira a entrega</h3>
            <p><strong>Total:</strong> R$ {totalPedido.toFixed(2)}</p>
            <button onClick={confirmarVenda} className={styles.btnConfirmar}>Confirmar ✅</button>
            <button onClick={() => setIsModalOpen(false)} className={styles.btnAdicionarMais}>+ Itens</button>
          </div>
        </div>
      )}
      <MenuInferior />
    </main>
  );
}