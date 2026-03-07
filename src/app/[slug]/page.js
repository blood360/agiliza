'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from '@/app/page.module.css';
import ListaProdutosGrid from '@/components/ListaProdutosGrid';
import MenuInferior from '@/components/MenuInferior';
import BotaoCompartilhar from '@/components/BotaoCompartilhar';

export default function HomeLoja() {
  const params = useParams();
  const slug = params?.slug;
  
  // Estados do sistema
  const [configsLocal, setConfigsLocal] = useState(null);
  const [clientePerfil, setClientePerfil] = useState({ endereco: '', telefone: '', pagamento: 'PIX' });
  const [carrinho, setCarrinho] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoEndereco, setEditandoEndereco] = useState(false);

  // 1. Carrega as configurações e o perfil do cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lojaSalva = localStorage.getItem('agiliza_config_loja');
      const perfilSalvo = localStorage.getItem('agiliza_cliente_perfil'); // Perfil de quem compra
      
      if (lojaSalva) setConfigsLocal(JSON.parse(lojaSalva));
      if (perfilSalvo) setClientePerfil(JSON.parse(perfilSalvo));
    }
  }, []);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho([...carrinho, produto]);
  };

  const totalPedido = carrinho.reduce((acc, item) => acc + item.preco, 0);

  // 2. Função que abre o modal pra conferência
  const abrirCheckout = () => {
    if (carrinho.length === 0) return alert("Adicione um produto antes de finalizar, macho!");
    setIsModalOpen(true);
  };

  // 3. O "Tiro de Misericórdia": Envia pro WhatsApp
  const confirmarVenda = () => {
    if (!clientePerfil.endereco) return alert("Macho, coloca o endereço de entrega!");

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
      <div className={styles.bannerAviso}>
        <span>⚠️ Esta loja é um exemplo! Teste o fechamento do pedido.</span>
      </div>

      <header className={styles.headerLoja}>
        <div className={styles.branding}>
          {configsLocal?.logo ? (
            <img src={configsLocal.logo} alt="Logo" className={styles.logoExibicao} />
          ) : (
            <h1 className={styles.nomeLojaPrincipal}>{nomeExibicao}</h1>
          )}
        </div>
        <BotaoCompartilhar />
      </header>

      <section className={styles.welcomeSection}>
        <h2>Bem-vindo ao {nomeExibicao}!</h2>
        <p>Delivery na sua porta.</p>
      </section>

      <ListaProdutosGrid produtos={produtos} onAdd={adicionarAoCarrinho} />

      {carrinho.length > 0 && (
        <button onClick={abrirCheckout} className={styles.btnFlutuanteCarrinho}>
          🛒 Finalizar Pedido (R$ {totalPedido.toFixed(2)})
        </button>
      )}

      {/* 🏁 MODAL DE CHECKOUT (O que tu pediu!) */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confira seus dados da entrega</h3>
            
            <div className={styles.infoCheckout}>
              <p><strong>Total do Pedido:</strong> R$ {totalPedido.toFixed(2)}</p>
              
              <div className={styles.campoModal}>
                <label>Endereço de Entrega:</label>
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
              
              <div className={styles.campoModal}>
                <label>Forma de Pagamento:</label>
                <select 
                  value={clientePerfil.pagamento} 
                  onChange={(e) => setClientePerfil({...clientePerfil, pagamento: e.target.value})}
                >
                  <option value="PIX">PIX</option>
                  <option value="Cartão">Cartão (Maquininha)</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>

            <div className={styles.modalBotoes}>
              <button onClick={confirmarVenda} className={styles.btnConfirmar}>Confirmar e Enviar Pedido ✅</button>
              <button onClick={() => setEditandoEndereco(true)} className={styles.btnAlterar}>Alterar Endereço 🏠</button>
              <button onClick={() => setIsModalOpen(false)} className={styles.btnAdicionarMais}>+ Adicionar mais produtos 🍔</button>
            </div>
          </div>
        </div>
      )}

      <MenuInferior />
    </main>
  );
}