'use client'
import { useSearchParams } from 'next/navigation';
import styles from './checkout.module.css';
import Link from 'next/link';

export default function CheckoutAssinatura() {
    const searchParams = useSearchParams();
    const plano = searchParams.get('plano') || 'Iniciante';
    const preco = plano === 'pro' ? '89,90' : '49,90';
    const finalizarAssinatura = () => {
        const mensagem = `Olá Adriano! Quero assinar o Agiliza no *Plano ${plano}*.`;
        const url = `https://wa.me/5521980867488?text=${encodeURIComponent(mensagem)}`;
        window.location.href = url;
    };

    return (
        <div classname={styles.container}>
            <header className={styles.header}>
                <h1>Finalizar Assinatura</h1>
            </header>

            <main className={stiles.card}>
                <h2>Você escolheu o <span>Plano {plano}</span></h2>
                <p className={styles.preco}>R$ {preco}<span>Mês</span></p>
                <ul>
                    <li>✅ Acesso imediato ao painel</li>
                    <li>✅Suporte Prioritário</li>
                    <li>✅ {plano === 'Pro' ? 'Produtos Ilimitados' : 'Até 50 produtos'}</li>
                </ul>

                <button onClick={finalizarAssinatura} classname={styles.btnFinalizar}>
                    Confirmar e Pagar
                </button>

                <Link href="/" classname={styles.btnVoltar}>Voltar e trocar plano</Link>
            </main>
        </div>
    );
}