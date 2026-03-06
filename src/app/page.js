'use client'
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
                    
                    {/* SVG do Motoboy - Agora sem atropelamento! */}
                    <svg 
                        width="45" 
                        height="45" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.8" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className={styles.iconMotoboy}
                    >
                        {/* Rodas (Mais juntas para parecer uma moto real) */}
                        <circle cx="8" cy="19" r="2.5" />
                        <circle cx="17" cy="19" r="2.5" />
                        
                        {/* Corpo da Moto/Scooter (Conectando as partes) */}
                        <path d="M8 18h9" /> {/* Base */}
                        <path d="M17 18l1.5-6h-3.5" /> {/* Frente/Guidão */}
                        <path d="M10 18l1-7h4" /> {/* Assento */}

                        {/* O Baú de entrega (Bem encaixado atrás) */}
                        <rect x="4" y="10" width="5" height="5" rx="1" />
                        
                        {/* O Piloto (Inclinado de forma natural) */}
                        <path d="M11 11l2-4h3" /> {/* Tronco e braço no guidão */}
                        
                        {/* Capacete (Agora grudado no corpo) */}
                        <circle cx="15" cy="4.5" r="2" /> 
                        <path d="M14.5 5h1.5" /> {/* Detalhe da viseira */}

                        {/* Linhas de Velocidade (Saindo de trás do baú) */}
                        <line x1="1" y1="11" x2="3" y2="11" />
                        <line x1="0" y1="14" x2="2" y2="14" />
                    </svg>
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