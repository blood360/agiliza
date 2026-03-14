'use client'
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAgiliza } from "@/context/AgilizaContext"; 
import { useNotify } from '@/context/ToastContext';
import styles from '@/app/page.module.css';
import API_URL from "@/config/api";

export default function Checkout({ aoFechar }) {
  const { carrinho, perfilCliente, setCarrinho, loja } = useAgiliza(); 
  const [salvando, setSalvando] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [formaPagamento, setFormaPagamento] = useState(""); // Pix, Dinheiro, Cartão
  const [trocoPara, setTrocoPara] = useState("");
  const notify = useNotify();
  const router = useRouter();

  // 1. AGRUPAMENTO DE ITENS (Para o lojista não se perder)
  const itensAgrupados = carrinho.reduce((acc, item) => {
    const encontrado = acc.find(i => i._id === item._id);
    if (encontrado) {
      encontrado.quantidade += 1;
    } else {
      acc.push({ ...item, quantidade: 1 });
    }
    return acc;
  }, []);

  const subtotal = carrinho.reduce((acc, item) => acc + item.preco, 0);
  const taxaEntrega = loja?.taxaEntrega || 0;
  const totalGeral = subtotal + taxaEntrega;
  const valorMinimo = loja?.valorMinimo || 0;

  const finalizarTudo = async () => {
    if (carrinho.length === 0) return notify("Carrinho vazio, macho!", "warning");
    if (!perfilCliente.endereco) return notify("Cadastre seu endereço no Perfil!", "error");
    if (!formaPagamento) return notify("Escolha como vai pagar, abençoado!", "warning");
    if (subtotal < valorMinimo) return notify(`O mínimo é R$ ${valorMinimo.toFixed(2)}`, "error");

    setSalvando(true);
    const token = localStorage.getItem('agiliza_token');

    try {
      const res = await fetch(`${API_URL}/api/pedidos/novo`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          lojaId: loja._id, 
          itens: itensAgrupados, // Enviando já organizado
          total: totalGeral,
          observacao,
          pagamento: {
            metodo: formaPagamento,
            trocoPara: formaPagamento === "Dinheiro" ? trocoPara : null
          },
          cliente: {
            nome: perfilCliente.nome,
            whatsapp: perfilCliente.telefone,
            endereco: perfilCliente.endereco,
            referencia: perfilCliente.referencia
          }
        })
      });

      if (res.ok) {
        // MENSAGEM WHATSAPP TURBINADA
        const itensMsg = itensAgrupados.map(i => `*${i.quantidade}x* ${i.nome}`).join('%0A');
        const trocoMsg = trocoPara ? `%0A*Troco para:* R$ ${trocoPara}` : "";
        
        const mensagem = `*Novo Pedido - ${loja.loja}*%0A%0A` +
          `*Cliente:* ${perfilCliente.nome}%0A` +
          `*Endereço:* ${perfilCliente.endereco}%0A` +
          `*Pagamento:* ${formaPagamento}${trocoMsg}%0A` +
          `*Obs:* ${observacao || 'Nenhuma'}%0A%0A` +
          `*Itens:*%0A${itensMsg}%0A%0A` +
          `*Total Geral: R$ ${totalGeral.toFixed(2)}*`;

        setCarrinho([]);
        window.open(`https://wa.me/55${loja.whatsapp || loja.telefone}?text=${mensagem}`);
        notify("Pedido enviado! 🚀", "success");
        aoFechar();
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
          <h2>Finalizar Pedido 🏁</h2>
          <button onClick={aoFechar} className={styles.btnFechar}>X</button>
        </header>

        {/* ENDEREÇO COM BOTÃO DE EDITAR */}
        <section className={styles.sessaoCheckout}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <strong>Entrega em:</strong>
             <button onClick={() => router.push('/perfil')} className={styles.btnPequeno}>Editar</button>
          </div>
          <p>{perfilCliente.endereco || "Não cadastrado"}</p>
          <small>Ref: {perfilCliente.referencia || "Sem referência"}</small>
        </section>

        {/* OBSERVAÇÃO */}
        <section className={styles.sessaoCheckout}>
          <label>Algum recado para a loja? (Opcional)</label>
          <textarea 
            placeholder="Ex: Tirar cebola, campainha estragada..."
            className={styles.inputObs}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </section>

        {/* PAGAMENTO */}
        <section className={styles.sessaoCheckout}>
          <h3>Forma de Pagamento</h3>
          <div className={styles.gradePagamento}>
            <button className={formaPagamento === 'Pix' ? styles.btnAtivo : styles.btnRadio} onClick={() => setFormaPagamento('Pix')}>Pix</button>
            <button className={formaPagamento === 'Dinheiro' ? styles.btnAtivo : styles.btnRadio} onClick={() => setFormaPagamento('Dinheiro')}>Dinheiro</button>
            <button className={formaPagamento === 'Cartão' ? styles.btnAtivo : styles.btnRadio} onClick={() => setFormaPagamento('Cartão')}>Cartão</button>
          </div>
          
          {formaPagamento === 'Dinheiro' && (
            <input 
              type="number" 
              placeholder="Troco para quanto?" 
              className={styles.inputTroco}
              value={trocoPara}
              onChange={(e) => setTrocoPara(e.target.value)}
            />
          )}
        </section>

        {/* ITENS AGRUPADOS */}
        <section className={styles.sessaoCheckout}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <h3>Resumo</h3>
            <button onClick={aoFechar} className={styles.btnPequeno}>+ Itens</button>
          </div>
          <div className={styles.scrollItens}>
            {itensAgrupados.map((item, index) => (
              <div key={index} className={styles.itemLinha}>
                <span><strong>{item.quantidade}x</strong> {item.nome}</span>
                <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.footerCheckout}>
          <div className={styles.totalFinal}>
            <span>Total:</span>
            <strong>R$ {totalGeral.toFixed(2)}</strong>
          </div>

          <button className={styles.btnFinalizar} onClick={finalizarTudo} disabled={salvando}>
            {salvando ? "Processando..." : "Confirmar e Enviar ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}