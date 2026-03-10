'use client'
import { useState } from "react";
import { useAgiliza } from "@/context/AgilizaContext";
import { useNotify } from '@/context/ToastContext';
import styles from '@/app/page.module.css';
import API_URL from "@/config/api";

export default function Checkout({ aoFechar }) {
  // Pegando os dados REAIS do contexto global
  const { carrinho, usuario, setCarrinho } = useAgiliza();
  const [salvando, setSalvando] = useState(false);
  const notify = useNotify();

  const total = carrinho.reduce((acc, item) => acc + item.preco, 0);

  const finalizarTudo = async () => {
    if (carrinho.length === 0) return notify("Carrinho vazio, macho!", "warning");
    if (!usuario.endereco) return notify("Cadastre seu endereço no Perfil primeiro!", "error");

    setSalvando(true);
    const token = localStorage.getItem('agiliza_token');

    try {
      // 1. SALVANDO NO BANCO DE DADOS (MONGODB)
      const res = await fetch(`${API_URL}/api/pedidos/novo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lojaId: "679d67efec75f5605f63be74", // Substitua pelo ID real da sua loja no banco
          itens: carrinho,
          total: total,
          cliente: {
            nome: usuario.nome,
            whatsapp: usuario.telefone,
            endereco: usuario.endereco
          }
        })
      });

      if (res.ok) {
        // 2. MONTA A MENSAGEM PRO WHATSAPP
        const itensMsg = carrinho.map(i => `- ${i.nome} (R$ ${i.preco.toFixed(2)})`).join('%0A');
        const mensagem = `*Novo Pedido - Agiliza*%0A%0A` +
          `*Cliente:* ${usuario.nome}%0A` +
          `*Endereço:* ${usuario.endereco}%0A` +
          `*Pagamento:* ${usuario.pagamento || 'Pix'}%0A%0A` +
          `*Itens:*%0A${itensMsg}%0A%0A` +
          `*Total: R$ ${total.toFixed(2)}*`;

        // 3. LIMPA O CARRINHO E ABRE O ZAP
        setCarrinho([]);
        window.open(`https://wa.me/5521980867488?text=${mensagem}`);
        notify("Pedido enviado com sucesso! 🚀", "success");
        aoFechar();
      } else {
        notify("Erro ao registrar pedido no servidor.", "error");
      }
    } catch (err) {
      notify("Erro de conexão com a AS Automações.", "error");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className={styles.modalCheckout}>
      <div className={styles.conteudoCheckout}>
        <header className={styles.headerCheckout}>
          <h2>Confirmar Entrega 📍</h2>
          <button onClick={aoFechar} className={styles.btnFechar}>X</button>
        </header>

        <section className={styles.sessaoCheckout}>
          <p><strong>Enviar para:</strong> {usuario.endereco || "Endereço não cadastrado"}</p>
          <p><small>Ref: {usuario.referencia || "Sem referência"}</small></p>
        </section>

        <section className={styles.sessaoCheckout}>
          <h3>Seu Carrinho ({carrinho.length} itens)</h3>
          <div className={styles.scrollItens}>
            {carrinho.map((item, index) => (
              <div key={index} className={styles.itemLinha}>
                <span>{item.nome}</span>
                <span>R$ {item.preco.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.footerCheckout}>
          <div className={styles.totalFinal}>
            <span>Total a pagar:</span>
            <strong>R$ {total.toFixed(2)}</strong>
          </div>
          <button 
            className={styles.btnFinalizar} 
            onClick={finalizarTudo}
            disabled={salvando}
          >
            {salvando ? "Processando..." : "Confirmar e Enviar Zap ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}