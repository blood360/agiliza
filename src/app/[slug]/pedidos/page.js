'use client'
import { useAgiliza } from "@/context/AgilizaContext";
import MenuInferior from "@/components/MenuInferior";
import styles from '@/app/page.module.css';

export default function Pedidos() {
    const { pedidos = [] } = useAgiliza();

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1>Meus Pedidos</h1>
                <p>Histórico de compras no Agiliza</p>
            </header>

            <div className={styles.containerPedidos}>
                {pedidos.length === 0 ? (
                    <div className={styles.vazio}>
                        <span>🛒</span>
                        <p>Você não possui nenhum pedido!</p>
                    </div>
                ) : (
                    pedidos.map((pedido, index) => (
                        <div key={index} className={styles.cardPedido}>
                            <div className={styles.topoPedido}>
                                <strong>Pedido #{pedidos.length - index}</strong>
                                <span>{pedido.data}</span>
                            </div>
                            <div className={styles.itensPedido}>
                                {pedido.itens.map((item, i) => (
                                    <p key={i}>{item.nome}</p>
                                ))}
                            </div>
                            <div className={styles.totalPedido}>
                                <span>Total:</span>
                                <strong>R$ {pedido.total.toFixed(2)}</strong>
                            </div>
                            <div className={styles.statusPedido}>
                                🟢 Enviado para o WhatsApp
                            </div>
                        </div>
                    ))
                )}
            </div>

            <MenuInferior />
        </main>
    );
}