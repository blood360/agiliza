'use client'
import Image from 'next/image';
import Link from 'next/link';
import styles from './landing.module.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Landing() {
    const [nomeDigitado, setNomeDigitado] = useState('');
    const router = useRouter();

    const verExemplo = (e) => {
        e.preventDefault();
        if(!nomeDigitado) return alert("Digite o nome da sua loja!");
        
        const slug = nomeDigitado
            .toLowerCase()
            .trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") 
            .replace(/\s+/g, '-');

        router.push(`/${slug}`);
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoContainer}>
                    <h1 className={styles.logo}>Agiliza</h1>
                    <div className={styles.motoWrapper}>
                        <Image 
                            src="/motoagiliza.png"
                            alt="Moto Agiliza"
                            width={50}
                            height={50} 
                            className={styles.imgMoto}
                            priority
                        />
                    </div>
                </div>

                <nav className={styles.nav}>
                    {/* VOLTANDO OS NOMES ORIGINAIS AQUI */}
                    <Link href="/login" className={styles.navLink}>Login</Link>
                    <Link href="https://wa.me/5521980867488" className={styles.btnNav}>Quero meu Agiliza</Link>
                </nav>
            </header>

            <main className={styles.hero}>
                <h1>Transforme seu WhatsApp em uma <span>Máquina de vendas</span></h1>
                <p>Crie seu cardápio digital em minutos, gerencie o estoque e receba pedidos organizados direto no seu WhatsApp.</p>
                
                <div className={styles.ctaActions}>
                    <form onSubmit={verExemplo} className={styles.formTest}>
                        <input
                            type="text"
                            placeholder="Digite o nome da sua loja."
                            value={nomeDigitado}
                            onChange={(e) => setNomeDigitado(e.target.value)}
                            className={styles.inputTeste}
                        />
                        <button type="submit" className={styles.btnPrincipal}>
                            Ver loja 
                        </button>
                    </form>
                    
                    {/* BOTÃO DISCRETO PARA O MARKETPLACE */}
                    <Link href="/explorar" className={styles.linkExplorar}>
                        🔍 Ou procurar lojas em Magé
                    </Link>
                </div>
            </main>

            {/* SEÇÃO DE PLANOS (VOLTANDO AO QUE ESTAVA) */}
            <section id="planos" className={styles.planos}>
                <h2>Planos que cabem no seu bolso</h2>
                <div className={styles.gridPlanos}>
                    <div className={styles.planoCard}>
                        <h3>Plano iniciante</h3>
                        <p className={styles.preco}>R$ 49,90<span>/mês</span></p>
                        <Link href="/register" className={styles.btnPlano}>Assinar Agora</Link>
                    </div>
                    <div className={`${styles.planoCard} ${styles.planoDestaque}`}>
                        <span className={styles.badge}>Mais Popular</span>
                        <h3>Plano Pro</h3>
                        <p className={styles.preco}>R$ 89,90<span>/mês</span></p>
                        <Link href="/register" className={styles.btnPlano}>Assinar Agora</Link>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>© 2026 Agiliza SaaS. Criado por AS automações.</p>
            </footer>
        </div>
    );
}