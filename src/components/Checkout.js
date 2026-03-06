'use client'
import { useAgiliza } from "@/context/AgilizaContext";
import styles from '@/app/page.module.css';
import { useRouter } from "next/navigation";

export default function Checkout({ aoFechar }) {
    // Puxamos também o atualizarPagamento que idealizamos
    const { carrinho, usuario, removerDoCarrinho, salvarPedido, atualizarPagamento } = useAgiliza();
    const router = useRouter();
    
    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);

    const enviarWhatsapp = () => {
        if (carrinho.length === 0) return alert("O carrinho esta vazio, macho!");

        const dataAtual = new Date().toLocaleString('pt-BR');

        // 1. Salva no histórico do celular
        salvarPedido({
            data: dataAtual,
            itens: [...carrinho],
            total: total
        });

        // 2. Monta a mensagem pro Zap (Com Telefone e Pagamento corrigido)
        const itensMsg = carrinho.map(i => `- ${i.nome} (R$ ${i.preco.toFixed(2)})`).join('%0A');
        
        const mensagem = `*Novo Pedido - Agiliza*%0A%0A` +
            `*Loja:* Varejo São Jorge%0A` + 
            `*Cliente:* ${usuario.nome}%0A` +
            `*Contato:* ${usuario.telefone}%0A` + // O número do cliente pro entregador
            `*Endereço:* ${usuario.endereco}%0A` +
            `*Ref:* ${usuario.referencia}%0A` +
            `*Pagamento:* ${usuario.pagamento || 'Pix'}%0A%0A` + // Garante um valor padrão
            `*Itens:*%0A${itensMsg}%0A%0A` +
            `*Total: R$ ${total.toFixed(2)}*`;
        
        // 3. Abre o Zap e fecha o modal (Número do Varejo São Jorge)
        window.open(`https://wa.me/5521980867488?text=${mensagem}`);
        aoFechar();
    };

    return (
        <div className={styles.modalCheckout}>
            <div className={styles.conteudoCheckout}>
                <header className={styles.headerCheckout}>
                    <h2>Seu Pedido</h2>
                    <button onClick={aoFechar} className={styles.btnFechar}>X</button>
                </header>

                <section className={styles.sessaoCheckout}>
                    <h3>📍 Entregar em:</h3>
                    <p>{usuario.endereco || "Endereço não informado"} <br/> 
                       <small>({usuario.referencia || "Sem ponto de referência"})</small>
                    </p>
                    <button 
                        className={styles.btnAlterar} 
                        onClick={() => { router.push('/perfil'); aoFechar(); }}
                    >
                        Alterar endereço
                    </button>
                </section>

                <section className={styles.sessaoCheckout}>
                    <h3>🛒 Itens no carrinho:</h3>
                    <div className={styles.listaItensCheckout}>
                        {carrinho.map(item => (
                            <div key={item.idUnico} className={styles.itemCheckout}>
                                <span>{item.nome}</span>
                                <span>R$ {item.preco.toFixed(2)}</span>
                                <button onClick={() => removerDoCarrinho(item.idUnico)}>🗑️</button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.sessaoCheckout}>
                    <h3>💳 Pagamento:</h3>
                    <select 
                        className={styles.selectPagamento}
                        value={usuario.pagamento}
                        onChange={(e) => atualizarPagamento(e.target.value)} // SALVA O MÉTODO AQUI!
                    >
                        <option value="Pix">Pix</option>
                        <option value="Cartão (Entregador)">Cartão (Entregador)</option>
                        <option value="Dinheiro">Dinheiro</option>
                    </select>
                </section>

                <div className={styles.footerCheckout}>
                    <div className={styles.totalContainer}>
                        <span>Total:</span>
                        <strong>R$ {total.toFixed(2)}</strong>
                    </div>
                    <button className={styles.btnFinalizar} onClick={enviarWhatsapp}>
                        Finalizar Pedido
                    </button>
                </div>
            </div>
        </div>
    );
}