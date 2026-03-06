'use client'
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // Importamos o Suspense
import styles from './checkout.module.css';
import Link from 'next/link';

// 1. Criamos um componente interno para a lógica do plano
function CheckoutContent() {
  const searchParams = useSearchParams();
  const plano = searchParams.get('plano') || 'Iniciante';
  const preco = plano === 'Pro' ? '89,90' : '49,90';

  const finalizarAssinatura = () => {
    const mensagem = `Olá Adriano! Quero assinar o Agiliza no *Plano ${plano}*. Como faço o pagamento?`;
    const url = `https://wa.me/5521980867488?text=${encodeURIComponent(mensagem)}`;
    window.location.href = url;
  };

  return (
    <main className={styles.card}>
      <h2>Você escolheu o <span>Plano {plano}</span></h2>
      <p className={styles.preco}>R$ {preco}<span>/mês</span></p>
      
      <ul className={styles.lista}>
        <li>✅ Acesso imediato ao painel</li>
        <li>✅ Suporte prioritário</li>
        <li>✅ {plano === 'Pro' ? 'Produtos Ilimitados' : 'Até 50 produtos'}</li>
      </ul>

      <button onClick={finalizarAssinatura} className={styles.btnFinalizar}>
        Confirmar e Pagar via WhatsApp 🚀
      </button>
      
      <Link href="/" className={styles.btnVoltar}>Voltar e trocar plano</Link>
    </main>
  );
}

// 2. O componente principal agora envolve o conteúdo em um Suspense
export default function CheckoutAssinatura() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Finalizar Assinatura</h1>
      </header>

      {/* O Suspense resolve o erro do build da Vercel */}
      <Suspense fallback={<p>Carregando detalhes da sua assinatura...</p>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}