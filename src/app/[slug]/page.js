'use client'
import styles from '@/app/page.module.css';
import ListaProdutosGrid from '@/components/ListaProdutosGrid';
import MenuInferior from '@/components/MenuInferior';
import { useParams } from 'next/navigation';
import BotaoCompartilhar from '@/components/BotaoCompartilhar';

export default function HomeLoja() {
  const params = useParams();
  const slug = params?.slug;

  if (!slug) return <div className={styles.loading}>Carregando loja...</div>;

  // Formata o nome da loja para o cabeçalho
  const nomeDaLoja = slug.replace(/-/g, ' ').toUpperCase();

  const produtos = [
    { id: 1, nome: "Combo Frango e Arroz", preco: 7.90, img: "/combo-frango.jpg" },
    { id: 2, nome: "Suco de Frutas Frescas", preco: 7.90, img: "/suco.jpg" },
    { id: 3, nome: "Chá Gelado de Pêssego", preco: 2.50, img: "/cha.jpg" },
    { id: 4, nome: "Combo Hambúrguer", preco: 7.90, img: "/hamburguer.jpg" },
  ];

  return (
    <main className={styles.containerLoja}>
      {/* Cabeçalho com o Nome da Loja e o Motoboy */}
      <header className={styles.headerLoja}>
        <div className={styles.branding}>
          <h1 className={styles.nomeLojaPrincipal}>{nomeDaLoja}</h1>
          {/* O Motoboy do Agiliza dando o grau */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="1.8" className={styles.iconMotoboy}>
            <circle cx="8" cy="18" r="2.5" /><circle cx="17" cy="18" r="2.5" />
            <path d="M8 18h9M17 18l1.5-6h-3.5M10 18l1-7h4" />
            <rect x="4" y="10" width="5" height="5" rx="1" />
            <path d="M11 11l2-4h3" /><circle cx="15" cy="4.5" r="2" />
          </svg>
        </div>
        <BotaoCompartilhar />
      </header>

      {/* Seção de Boas-vindas */}
      <section className={styles.welcomeSection}>
        <h2>Bem-vindo ao {nomeDaLoja}!</h2>
        <p>Delivery na sua porta.</p>
      </section>

      {/* Grid de Produtos (2 colunas) */}
      <ListaProdutosGrid produtos={produtos} />

      <MenuInferior />
    </main>
  );
}