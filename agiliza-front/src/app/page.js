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
                    {/* Corrigido o erro de digitação 'claasName' para 'className' */}
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
                    <Link href="/explorar" className={styles.navLink}>Explorar Lojas</Link>
                    <Link href="/login" className={styles.btnNavLogin}>Entrar</Link>
                    <Link href="/register" className={styles.btnNavRegister}>Criar Conta</Link>
                </nav>
            </header>

            <main className={styles.hero}>
                <h1>Sua vitrine digital na <span>velocidade da luz</span></h1>
                <p>Encontre as melhores lojas de Magé ou crie a sua própria máquina de vendas em minutos.</p>
                
                <div className={styles.ctaActions}>
                    <Link href="/explorar" className={styles.btnExplorar}>
                        🔍 Procurar Lojas
                    </Link>
                    
                    <form onSubmit={verExemplo} className={styles.formTest}>
                        <input
                            type="text"
                            placeholder="Nome da sua futura loja..."
                            value={nomeDigitado}
                            onChange={(e) => setNomeDigitado(e.target.value)}
                            className={styles.inputTeste}
                        />
                        <button type="submit" className={styles.btnPrincipal}>
                            Simular Vitrine
                        </button>
                    </form>
                </div>
            </main>

            <section className={styles.features}>
                <div className={styles.featureCard}>
                    <span>📱</span>
                    <h3>PWA Instalável</h3>
                    <p>Seu cliente instala seu app sem burocracia de lojas oficiais.</p>
                </div>
                <div className={styles.featureCard}>
                    <span>📦</span>
                    <h3>Gestão Ágil</h3>
                    <p>Controle total de estoque e produtos em um só lugar.</p>
                </div>
                <div className={styles.featureCard}>
                    <span>💬</span>
                    <h3>Pedidos Organizados</h3>
                    <p>Receba tudo mastigadinho direto no seu WhatsApp.</p>
                </div>
            </section>

            {/* Ajustamos a seção de planos para focar na adesão ao sistema */}
            <section id="planos" className={styles.planos}>
                <h2>Comece a vender hoje mesmo</h2>
                <div className={styles.gridPlanos}>
                    <div className={styles.planoCard}>
                        <h3>Plano Iniciante</h3>
                        <p className={styles.preco}>R$ 49,90<span>/mês</span></p>
                        <ul>
                            <li>Painel Administrativo</li>
                            <li>Link Personalizado</li>
                            <li>Suporte via WhatsApp</li>
                        </ul>
                        <Link href="/register" className={styles.btnPlano}>
                            Começar Agora
                        </Link>
                    </div>
                    
                    <div className={`${styles.planoCard} ${styles.planoDestaque}`}>
                        <span className={styles.badge}>Mais Popular</span>
                        <h3>Plano Pro</h3>
                        <p className={styles.preco}>R$ 89,90<span>/mês</span></p>
                        <ul>
                            <li>Produtos Ilimitados</li>
                            <li>Relatórios de Vendas</li>
                            <li>Destaque no Marketplace</li>
                        </ul>
                        <Link href="/register" className={styles.btnPlano}>
                            Começar Agora
                        </Link>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>© 2026 Agiliza. Um produto da AS Automações.</p>
            </footer>
        </div>
    );
}