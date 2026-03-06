'use client'
import styles from '@/app/page.module.css';
import ListaProdutos from '@/components/ListaProdutos';
import MenuInferior from '@/components/MenuInferior';
import { useParams } from 'next/navigation';
import BotaoCompatilhar from '@/components/BotaoCompartilhar'

export default function Home() {
  // 1. Usamos apenas o useParams() pra pegar o slug da URL
  const params = useParams();
  const slug = params?.slug;

  // 2. Proteção: se o slug ainda não carregou, a gente não deixa o código quebrar
  if (!slug) {
    return (
      <main className={styles.main}>
        <p>Carregando loja, aguarde um tiquinho...</p>
      </main>
    );
  }

  // 3. Agora sim a gente formata o nome da loja
  const nomeDaLoja = slug.replace(/-/g, ' ').toUpperCase();

  const produtos = [
    { id: 1, nome: "Catuaba Selvagem 1L", preco: 18.00, img: "/catuaba-selvagem.jpg" },
    { id: 2, nome: "Catuaba Açaí 1L", preco: 18.00, img: "/catuaba-acai.jpg" },
    { id: 3, nome: "Cigarro de Lucky Striky", preco: 13.00, img: "/cigarro.jpg" },
  ];

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.logoAgiliza}>Agiliza</h1>
        <p className={styles.nomeAssinante}>{nomeDaLoja}</p>
        <BotaoCompartilhar />
      </header>

      <ListaProdutos produtos={produtos} />
      <MenuInferior />
    </main>
  );
}