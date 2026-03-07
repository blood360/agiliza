'use client'
import Link from "next/link";
import styles from './admin.module.css';

export default function DashboardAdmin() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Painel do Lojista 🏪</h1>
                <p>Gerencie sua loja de um jeito agilizado.</p>
            </header>

            <div classname={styles.gridResumo}>
                <div className={styles.cardInfo}>
                    <h3>Total de Produtos</h3>
                    <p>12</p>
                </div>
                <div className={styles.cardInfo}>
                    <h3>Vendas Hoje</h3>
                    <p>R$ 450,00</p>
                </div>
            </div>

            <section className={styles.acoes}>
                <h2>O que você quer fazer?</h2>
                <div className={styles.menuAcoes}>
                    <Link href={'/admin/produtos/novo'} className={styles.btnAcao}>
                        ➕ Cadastrar Novo Produto
                    </Link>
                    <Link href='/admin/perfil' className={styles.btnAcaoSecundario}>
                        ⚙️ Configurar Loja
                    </Link>
                </div>
            </section>
        </div>
    );
}