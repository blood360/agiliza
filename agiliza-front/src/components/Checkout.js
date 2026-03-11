'use client'
import { useState } from "react";
import { useAgiliza } from "@/context/AgilizaContext";
import { useNotify } from '@/context/ToastContext';
import styles from '@/app/page.module.css';
import API_URL from "@/config/api";

export default function Checkout({ aoFechar }) {
  // 1. Pegando 'loja' do contexto (dados que o lojista cadastrou)
  const { carrinho, usuario, setCarrinho, loja } = useAgiliza(); 
  const [salvando, setSalvando] = useState(false);
  const notify = useNotify();

  // 2. CÁLCULOS MATEMÁTICOS NO GRAU
  const subtotal = carrinho.reduce((acc, item) => acc + item.preco, 0);
  const taxaEntrega = loja?.taxaEntrega || 0;
  const totalGeral = subtotal + taxaEntrega;
  const valorMinimo = loja?.valorMinimo || 0;

  const finalizarTudo = async () => {
    if (carrinho.length === 0) return notify("Carrinho vazio, macho!", "warning");
    if (!usuario.endereco) return notify("Cadastre seu endereço no Perfil primeiro!", "error");

    // 3. TRAVA DO VALOR MÍNIMO (Regra de ouro!)
    if (subtotal < valorMinimo) {
      return notify(`Vixe! O valor mínimo para pedido é de R$ ${valorMinimo.toFixed(2)}`, "error");
    }

    setSalvando(true);
    const token = localStorage.getItem('agiliza_token');

    try {
      // 4. SALVANDO NO BANCO DE DADOS (Agora com ID Real)
      const res = await fetch(`${API_URL}/api/pedidos/novo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lojaId: loja._id, // Dinâmico!
          itens: carrinho,
          subtotal: subtotal,
          taxaEntrega: taxaEntrega,
          total: totalGeral,
          cliente: {
            nome: usuario.nome,
            whatsapp: usuario.telefone,
            endereco: usuario.endereco
          }
        })
      });

      if (res.ok) {
        // 5. MONTA A MENSAGEM PRO WHATSAPP (Com o Zap da Loja!)
        const itensMsg = carrinho.map(i => `- ${i.nome} (R$ ${i.preco.toFixed(2)})`).join('%0A');
        
        const mensagem = `*Novo Pedido - ${loja.loja}*%0A%0A` +
          `*Cliente:* ${usuario.nome}%0A` +
          `*Endereço:* ${usuario.endereco}%0A` +
          `*Pagamento:* ${usuario.pagamento || 'Pix'}%0A%0A` +
          `*Itens:*%0A${itensMsg}%0A%0A` +
          `*Subtotal:* R$ ${subtotal.toFixed(2)}%0A` +
          `*Taxa de Entrega:* R$ ${taxaEntrega.toFixed(2)}%0A` +
          `*Total Geral: R$ ${totalGeral.toFixed(2)}*`;

        setCarrinho([]);
        
        // Abre o zap da LOJA específica (usando o DDD que ela cadastrou)
        window.open(`https://wa.me/55${loja.whatsapp}?text=${mensagem}`);
        
        notify("Pedido enviado com sucesso! 🚀", "success");
        aoFechar();
      } else {
        notify("Erro ao registrar pedido no servidor.", "error");
      }
    } catch (err) {
      notify("Vixe, deu erro na conexão!", "error");
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
          {/* 6. DESCRIÇÃO DETALHADA DOS VALORES */}
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