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
        if(!nomeDigitado) return alert("Digite o nome da sua loja, macho!");
        
        const slug = nomeDigitado
            .toLowerCase()
            .trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Tira acentos
            .replace(/\s+/g, '-'); // Troca espaços por traços

        // CORREÇÃO AQUI: Mandando direto pro slug, sem o "/loja"
        router.push(`/${slug}`);
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoContainer}>
                    <h1 className={styles.logo}>Agiliza</h1>
                    <div claasName={styles.motoWrapper}>
                        <Image 
                            src="/motoagiliza.png"
                            alt="Moto Agiliza"
                            width={60}
                            height={60} 
                            className={styles.imgMoto}
                            priority
                        />
                    </div>
                </div>

                <nav className={styles.nav}>
                    <Link href="#planos" className={styles.navLink}>Planos</Link>
                    <Link href="https://wa.me/5521980867488" className={styles.btnNav}>Quero meu Agiliza</Link>
                </nav>
            </header>

            <main className={styles.hero}>
                <h1>Transforme seu WhatsApp em uma <span>Máquina de vendas</span></h1>
                <p>Crie seu cardápio digital em minutos, gerencie o estoque e receba pedidos organizados direto no seu WhatsApp.</p>
                
                {/* O formulário agora é a única e principal ação de teste */}
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

                <p className={styles.avisoTeste}>Teste agora mesmo! Digite o nome acima e veja como fica.</p>
            </main>

            <section className={styles.features}>
                <div className={styles.featureCard}>
                    <span>📱</span>
                    <h3>PWA instalável</h3>
                    <p>Seu cliente instala seu aplicativo sem precisar da Play Store ou App Store.</p>
                </div>
                <div className={styles.featureCard}>
                    <span>📦</span>
                    <h3>Gerenciamento de estoque</h3>
                    <p>Controle o estoque de seus produtos diretamente no Agiliza.</p>
                </div>
                <div className={styles.featureCard}>
                    <span>💬</span>
                    <h3>Pedidos no WhatsApp</h3>
                    <p>Chega de bagunça! Receba seus pedidos formatado com endereço e pagamento.</p>
                </div>
            </section>

            <section id="planos" className={styles.planos}>
                <h2>Planos que cabem no seu bolso</h2>
                <div className={styles.gridPlanos}>
                    <div className={styles.planoCard}>
                        <h3>Plano iniciante</h3>
                        <p className={styles.preco}>R$ 49,90<span>/mês</span></p>
                        <ul>
                            <li>Até 50 produtos</li>
                            <li>Pedidos via WhatsApp</li>
                            <li>Suporte via chat</li>
                        </ul>
                        <Link
                            href="/checkout-assinatura?plano=Iniciante"
                            className={styles.btnPlano}
                        >
                            Assinar Agora
                        </Link>
                    </div>
                    <div className={`${styles.planoCard} ${styles.planoDestaque}`}>
                        <span className={styles.badge}>Mais Popular</span>
                        <h3>Plano Pro</h3>
                        <p className={styles.preco}>R$ 89,90<span>/mês</span></p>
                        <ul>
                            <li>Produtos ilimitados</li>
                            <li>Gestão de estoque avançada</li>
                            <li>Relatórios de vendas</li>
                            <li>Suporte prioritário</li>
                        </ul>
                        <Link
                            href="/checkout-assinatura?plano=Pro"
                            className={styles.btnPlano}
                        >
                            Assinar Agora
                        </Link>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>© 2026 Agiliza SaaS. Criado por Adriano Santos.</p>
            </footer>
        </div>
    );
}