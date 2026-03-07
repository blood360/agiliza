'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from '@/app/page.module.css';
import ListaProdutosGrid from '@/components/ListaProdutosGrid';
import MenuInferior from '@/components/MenuInferior';
import BotaoCompartilhar from '@/components/BotaoCompartilhar';
import { useAgiliza } from "@/context/AgilizaContext";

export default function HomeLoja() {
  const { usuario } = useAgiliza(); // Puxa os dados globais do cabra
  const params = useParams();
  const slug = params?.slug;
  
  // Estados do sistema
  const [configsLocal, setConfigsLocal] = useState(null);
  const [clientePerfil, setClientePerfil] = useState({ endereco: '', telefone: '', pagamento: 'PIX' });
  const [carrinho, setCarrinho] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoEndereco, setEditandoEndereco] = useState(false);
  const [lojaEstaAberta, setLojaEstaAberta] = useState(true);

  // 1. Carrega as configurações da loja e o status de abertura
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lojaSalva = localStorage.getItem('agiliza_config_loja');
      const statusLoja = localStorage.getItem('agiliza_loja_aberta');
      
      if (lojaSalva) setConfigsLocal(JSON.parse(lojaSalva));
      setLojaEstaAberta(statusLoja !== 'false');
    }
  }, []);

  // 2. SINCRONIA TOTAL: Escuta o Perfil e atualiza o checkout na hora
  useEffect(() => {
    if (usuario && usuario.endereco) {
      setClientePerfil(prev => ({
        ...prev,
        endereco: usuario.endereco,
        telefone: usuario.telefone
      }));
    } else if (typeof window !== 'undefined') {
      // Fallback: Se o contexto falhar, tenta o localStorage direto
      const perfilSalvo = localStorage.getItem('agiliza_cliente_perfil');
      if (perfilSalvo) setClientePerfil(JSON.parse(perfilSalvo));
    }
  }, [usuario]);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho([...carrinho, produto]);
  };

  const totalPedido = carrinho.reduce((acc, item) => acc + item.preco, 0);

  const abrirCheckout = () => {
    if (!lojaEstaAberta) {
      return alert("Vixe, macho! A loja fechou agora pouco. Tente amanhã!");
    }
    if (carrinho.length === 0) return alert("Adicione um produto antes de finalizar, macho!");
    setIsModalOpen(true);
  };

  const confirmarVenda = () => {
    if (!clientePerfil.endereco) return alert("Macho, coloca o endereço de entrega!");

    const novoPedido = {
      id: Date.now(),
      data: new Date().toISOString(),
      cliente: clientePerfil,
      itens: carrinho,
      total: totalPedido,
      status: 'Pendente'
    };

    const pedidosExistentes = JSON.parse(localStorage.getItem('agiliza_pedidos') || '[]');
    localStorage.setItem('agiliza_pedidos', JSON.stringify([novoPedido, ...pedidosExistentes]));

    let mensagem = `*Novo Pedido - ${configsLocal?.nomeLoja || 'Loja'}*\n\n`;
    mensagem += `*Cliente:* ${clientePerfil.telefone}\n`;
    mensagem += `*Entrega:* ${clientePerfil.endereco}\n`;
    mensagem += `*Pagamento:* ${clientePerfil.pagamento}\n\n`;
    mensagem += `*Itens:*\n`;
    
    carrinho.forEach(item => {
      mensagem += `- ${item.nome}: R$ ${item.preco.toFixed(2)}\n`;
    });
    
    mensagem += `\n*Total: R$ ${totalPedido.toFixed(2)}*`;

    const fone = configsLocal?.whatsapp || "5521980867488";
    const url = `https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`;
    
    setIsModalOpen(false);
    window.location.href = url;
  };

  const nomeExibicao = configsLocal?.nomeLoja || slug?.replace(/-/g, ' ').toUpperCase();

  const produtos = [
    { id: 1, nome: "Combo Frango e Arroz", preco: 7.90 },
    { id: 2, nome: "Suco de Frutas Frescas", preco: 7.90 },
    { id: 3, nome: "Chá Gelado de Pêssego", preco: 2.50 },
    { id: 4, nome: "Combo Hambúrguer", preco: 7.90 },
  ];

  return (
    <main className={styles.containerLoja}>
      <div className={lojaEstaAberta ? styles.bannerAviso : styles.bannerFechado}>
        <span>
          {lojaEstaAberta 
            ? "⚠️ Esta loja é um exemplo! Teste o fechamento do pedido." 
            : "🚫 ESTAMOS FECHADOS NO MOMENTO. VOLTE LOGO!"}
        </span>
      </div>

      <header className={styles.headerLoja}>
        <div className={styles.branding}>
          {configsLocal?.logo ? (
            <img src={configsLocal.logo} alt="Logo" className={styles.logoExibicao} />
          ) : (
            <h1 className={styles.nomeLojaPrincipal}>{nomeExibicao}</h1>
          )}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="1.8">
            <circle cx="8" cy="18" r="2.5" /><circle cx="17" cy="18" r="2.5" />
            <path d="M8 18h9M17 18l1.5-6h-3.5M10 18l1-7h4" />
            <rect x="4" y="10" width="5" height="5" rx="1" />
            <path d="M11 11l2-4h3" /><circle cx="15" cy="4.5" r="2" />
          </svg>
        </div>
        <BotaoCompartilhar />
      </header>

      <section className={styles.welcomeSection}>
        <h2>Bem-vindo ao {nomeExibicao}!</h2>
        <p>Delivery na sua porta.</p>
      </section>

      <ListaProdutosGrid produtos={produtos} onAdd={adicionarAoCarrinho} />

      {carrinho.length > 0 && (
        <button 
          onClick={abrirCheckout} 
          className={lojaEstaAberta ? styles.btnFlutuanteCarrinho : styles.btnLojaFechada}
          disabled={!lojaEstaAberta}
        >
          {lojaEstaAberta 
            ? `🛒 Finalizar Pedido (R$ ${totalPedido.toFixed(2)})` 
            : '🚫 LOJA FECHADA'}
        </button>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confira seus dados da entrega</h3>
            <div className={styles.infoCheckout}>
              <p><strong>Total:</strong> R$ {totalPedido.toFixed(2)}</p>
              <div className={styles.campoModal}>
                <label>Endereço:</label>
                {editandoEndereco ? (
                  <input 
                    type="text" 
                    value={clientePerfil.endereco} 
                    onChange={(e) => setClientePerfil({...clientePerfil, endereco: e.target.value})}
                    onBlur={() => setEditandoEndereco(false)}
                    autoFocus
                  />
                ) : (
                  <p>{clientePerfil.endereco || 'Endereço não cadastrado'}</p>
                )}
              </div>
              <p><strong>Telefone:</strong> {clientePerfil.telefone || '(00) 00000-0000'}</p>
            </div>
            <div className={styles.modalBotoes}>
              <button onClick={confirmarVenda} className={styles.btnConfirmar}>Confirmar Pedido ✅</button>
              <button onClick={() => setEditandoEndereco(true)} className={styles.btnAlterar}>Alterar Endereço 🏠</button>
              <button onClick={() => setIsModalOpen(false)} className={styles.btnAdicionarMais}>+ Itens 🍔</button>
            </div>
          </div>
        </div>
      )}
      <MenuInferior />
    </main>
  );
}