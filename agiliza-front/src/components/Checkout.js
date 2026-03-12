'use client'
import { useState } from "react";
import { useAgiliza } from "@/context/AgilizaContext"; // Usando o contexto novo
import { useNotify } from '@/context/ToastContext';
import styles from '@/app/page.module.css';
import API_URL from "@/config/api";

export default function Checkout({ aoFechar }) {
  // 🛡️ 1. Pegando os dados certos do contexto novo
  const { carrinho, perfilCliente, setCarrinho, loja } = useAgiliza(); 
  const [salvando, setSalvando] = useState(false);
  const notify = useNotify();

  // 2. CÁLCULOS MATEMÁTICOS
  const subtotal = carrinho.reduce((acc, item) => acc + item.preco, 0);
  const taxaEntrega = loja?.taxaEntrega || 0;
  const totalGeral = subtotal + taxaEntrega;
  const valorMinimo = loja?.valorMinimo || 0;

  const finalizarTudo = async () => {
    // Validações básicas
    if (carrinho.length === 0) return notify("Carrinho vazio, macho!", "warning");
    if (!perfilCliente.endereco) return notify("Cadastre seu endereço no Perfil primeiro!", "error");
    if (!loja?._id) return notify("Erro: ID da loja não encontrado.", "error");

    // 3. TRAVA DO VALOR MÍNIMO
    if (subtotal < valorMinimo) {
      return notify(`Vixe! O valor mínimo para pedido é de R$ ${valorMinimo.toFixed(2)}`, "error");
    }

    setSalvando(true);
    const token = localStorage.getItem('agiliza_token');

    try { //mensagem para identificar o id da loja que recebe o pedido
      console.log("Enviando pedido para a loja ID:", loja?._id);
      console.log("Dados do pedido:", {total: totalGeral, itens: carrinho.length});
      const res = await fetch(`${API_URL}/api/pedidos/novo`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lojaId: loja._id, 
          itens: carrinho,
          subtotal: subtotal,
          taxaEntrega: taxaEntrega,
          total: totalGeral,
          cliente: {
            nome: perfilCliente.nome,
            whatsapp: perfilCliente.telefone,
            endereco: perfilCliente.endereco,
            referencia: perfilCliente.referencia
          },
          pagamento: perfilCliente.pagamento
        })
      });

      if (res.ok) {
        // 5. MENSAGEM WHATSAPP (Pegando o número da Loja)
        const itensMsg = carrinho.map(i => `- ${i.nome} (R$ ${i.preco.toFixed(2)})`).join('%0A');
        
        const mensagem = `*Novo Pedido - ${loja.loja}*%0A%0A` +
          `*Cliente:* ${perfilCliente.nome}%0A` +
          `*Endereço:* ${perfilCliente.endereco}%0A` +
          `*Pagamento:* ${perfilCliente.pagamento || 'Pix'}%0A%0A` +
          `*Itens:*%0A${itensMsg}%0A%0A` +
          `*Subtotal:* R$ ${subtotal.toFixed(2)}%0A` +
          `*Taxa de Entrega:* R$ ${taxaEntrega.toFixed(2)}%0A` +
          `*Total Geral: R$ ${totalGeral.toFixed(2)}*`;

        setCarrinho([]);
        
        // Abre o zap da loja (ajustado para aceitar o campo whatsapp da loja)
        const foneLoja = loja.whatsapp || loja.telefone;
        window.open(`https://wa.me/55${foneLoja}?text=${mensagem}`);
        
        notify("Pedido enviado com sucesso! 🚀", "success");
        aoFechar();
      } else {
        const erroData = await res.json();
        notify(erroData.erro || "Erro ao registrar pedido no servidor.", "error");
      }
    } catch (err) {
      console.error("Erro no Checkout:", err);
      notify("Vixe, deu erro na conexão! Verifique se o servidor está online.", "error");
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
          <p><strong>Enviar para:</strong> {perfilCliente.endereco || "Endereço não cadastrado"}</p>
          <p><small>Ref: {perfilCliente.referencia || "Sem referência"}</small></p>
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
          <div className={styles.resumoValores}>
            <div className={styles.linhaFinanceira}>
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.linhaFinanceira}>
              <span>Taxa de Entrega:</span>
              <span>R$ {taxaEntrega.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.totalFinal}>
            <span>Total a pagar:</span>
            <strong>R$ {totalGeral.toFixed(2)}</strong>
          </div>

          <button 
            className={styles.btnFinalizar} 
            onClick={finalizarTudo}
            disabled={salvando}
          >
            {salvando ? "Processando..." : "Confirmar e Enviar ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}